/*
 * MIT No Attribution
 *
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import type { ITable } from "aws-cdk-lib/aws-dynamodb";
import { AnyPrincipal, Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal, type IRole } from "aws-cdk-lib/aws-iam";
import type { IBucket } from "aws-cdk-lib/aws-s3";
import { Queue, type IQueue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import type { BunFunFactory } from "./bun-fun.factory";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import sfn, { LogLevel } from 'aws-cdk-lib/aws-stepfunctions';
import { Rule, type IEventBus } from "aws-cdk-lib/aws-events";
import { LambdaFunction, SfnStateMachine } from "aws-cdk-lib/aws-events-targets";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NagSuppressions } from "cdk-nag";
import { LogGroup } from "aws-cdk-lib/aws-logs";


/**
 * Properties for configuring the TestGenerationWorkflow construct
 * @property namePrefix - Prefix to be used for naming AWS resources
 * @property foundationModel - The Bedrock foundation model identifier
 * @property inferenceProfile - The Bedrock inference profile identifier
 * @property environment - The deployment environment (e.g. dev, prod)
 * @property table - DynamoDB table for storing workflow data
 * @property bucket - S3 bucket for storing test files
 * @property lexRole - IAM role for Lex bot operations
 * @property lambdaFactory - Factory for creating Lambda functions
 * @property eventBus - EventBridge bus for workflow events
 * @property taskQueue - SQS queue for processing tasks
 */
export interface TestGenerationWorkflowProps {
    namePrefix: string;
    foundationModel: string;
    inferenceProfile: string;
    environment: string;
    table: ITable;
    bucket: IBucket;
    lexRole: IRole;
    lambdaFactory: BunFunFactory;
    eventBus: IEventBus;
    taskQueue: IQueue;
}

/**
 * TestGenerationWorkflow class manages the AWS infrastructure for test generation and processing
 * Key components include:
 * - SQS queues for task processing and DLQs
 * - Lambda functions for test set creation, import and recommendations
 * - Step Functions state machine for test generation workflow
 * - EventBridge rules for triggering test processing
 * - IAM roles and policies for service permissions
 */
export class TestGenerationWorkflow extends Construct {

    public recommendationTaskQueue: IQueue;

    constructor(scope: Construct, id: string, props: TestGenerationWorkflowProps) {
        super(scope, id)

        const { namePrefix, foundationModel, inferenceProfile, environment, bucket, table, lambdaFactory, lexRole, eventBus, taskQueue } = props;

        const testSetProcessingDLQ = new Queue(this, 'TestSetProcessingDLQ', { queueName: `${namePrefix}-testset-processing-dlq` });

        testSetProcessingDLQ.addToResourcePolicy(
            new PolicyStatement({
                sid: 'enforce-ssl',
                effect: Effect.DENY,
                principals: [new AnyPrincipal()],
                actions: ['sqs:*'],
                resources: [testSetProcessingDLQ.queueArn],
                conditions: {
                    Bool: {
                        'aws:SecureTransport': 'false',
                    },
                },
            })
        );

        const role = new Role(this, 'TestSetLambdaRole', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            description: 'Execution Role for Lambda functions',
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
            ],
        });

        role.addToPolicy(
            new PolicyStatement({
                sid: 'AllowModelInvocationForOrchestration',
                effect: Effect.ALLOW,
                actions: ['bedrock:InvokeModel*', 'bedrock:CreateInferenceProfile'],
                resources: [
                    `arn:aws:bedrock:*::foundation-model/${foundationModel}`,
                    `arn:aws:bedrock:*:*:inference-profile/${inferenceProfile}`,
                    `arn:aws:bedrock:*:*:application-inference-profile/${inferenceProfile}`,
                ],
            }),
        );

        role.addToPolicy(new PolicyStatement({
            sid: 'AllowTaskToPerformLexAction',
            effect: Effect.ALLOW,
            actions: ['lex:*',
                'lex:CreateBot',
                'lex:DeleteBot',
                'lex:UpdateBot',
                'lex:CreateBotVersion',
                'lex:CreateIntent',
                'lex:DeleteIntent',
                'lex:UpdateIntent',
                'lex:CreateSlotType',
                'lex:DeleteSlotType',
                'lex:UpdateSlotType',
                'lex:GetBot',
                'lex:GetBots',
                'lex:GetIntent',
                'lex:GetIntents',
                'lex:GetSlotType',
                'lex:GetSlotTypes'],
            resources: ['*'],
        }),)

        role.addToPolicy(
            new PolicyStatement({
                sid: 'AllowInferenceProfileAccess',
                effect: Effect.ALLOW,
                actions: [
                    'bedrock:GetInferenceProfile',
                    'bedrock:ListInferenceProfiles',
                    'bedrock:DeleteInferenceProfile',
                    'bedrock:TagResource',
                    'bedrock:UntagResource',
                    'bedrock:ListTagsForResource',
                ],
                resources: [
                    `arn:aws:bedrock:*:*:inference-profile/${inferenceProfile}`,
                    `arn:aws:bedrock:*:*:application-inference-profile/${inferenceProfile}`,
                ],
            }),
        );

        bucket.grantReadWrite(role);
        table.grantReadWriteData(role)

        const commonProperties = {
            moduleDirName: 'ivr-migration-api',
            environment: environment,
            environmentVariables: {
                NODE_ENV: 'cloud',
                LOG_LEVEL: 'info',
                BUCKET_NAME: bucket.bucketName,
                TABLE_NAME: table.tableName,
                MODEL_ID: inferenceProfile,
                LEX_ROLE_ARN: lexRole.roleArn,
            },
            executionRole: role,
            memorySize: 512,
            timeout: Duration.minutes(5),
        }

        lexRole.grantPassRole(role)

        const createTestSetsFunction = lambdaFactory.createLambdaFunction({
            ...commonProperties,
            moduleName: 'create-test-sets-task',
            timeout: Duration.minutes(10)
        });

        const importTestSetsFunction = lambdaFactory.createLambdaFunction({
            ...commonProperties,
            moduleName: 'import-test-sets-task',
            timeout: Duration.minutes(10)
        });

        const createTestSetsTask = new LambdaInvoke(this, 'CreateTestSetsTask', {
            lambdaFunction: createTestSetsFunction.lambda,
            inputPath: '$',
            outputPath: '$.Payload',
        }).addRetry({
            errors: ['ThrottlingException'],
            interval: Duration.seconds(5),
            backoffRate: 1.5,
            maxAttempts: 3
        });

        const generateTestSetsStateMachineLogGroup = new LogGroup(this, 'GenerateTestSetsStateMachineLogGroup', {
            logGroupName: `/aws/vendedlogs/states/${namePrefix}-generate-test-sets`,
            removalPolicy: RemovalPolicy.DESTROY
        });

        const stateMachine = new sfn.StateMachine(this, 'GenerateTestSetsStateMachine', {
            stateMachineName: `${namePrefix}-generate-test-sets`,
            stateMachineType: sfn.StateMachineType.STANDARD,
            tracingEnabled: true,
            logs: { destination: generateTestSetsStateMachineLogGroup, level: LogLevel.ALL, includeExecutionData: true },
            definition: sfn.Chain.start(createTestSetsTask)
        });

        new Rule(this, 'TestSetsCreationRule', {
            eventBus: eventBus,
            eventPattern: {
                source: ['test-sets-service'],
                detailType: ['TestSetCreated'],
            },
            targets: [
                new SfnStateMachine(stateMachine, {
                    deadLetterQueue: testSetProcessingDLQ,
                    maxEventAge: Duration.minutes(5),
                    retryAttempts: 2,
                })]
        });

        const testSetsModificationDlQ = new Queue(this, 'TestSetsModificationDLQ', { queueName: `${namePrefix}-testset-modification-dlq` });

        testSetsModificationDlQ.addToResourcePolicy(
            new PolicyStatement({
                sid: 'enforce-ssl',
                effect: Effect.DENY,
                principals: [new AnyPrincipal()],
                actions: ['sqs:*'],
                resources: [testSetsModificationDlQ.queueArn],
                conditions: {
                    Bool: {
                        'aws:SecureTransport': 'false',
                    },
                },
            })
        );

        new Rule(this, 'TestSetsModificationRule', {
            eventPattern: {
                source: ['aws.s3'],
                detailType: ['Object Created'],
                detail: {
                    bucket: {
                        name: [bucket.bucketName]
                    },
                    object: {
                        key: [{ suffix: 'test.csv' }]
                    }
                },
            },
            targets: [new LambdaFunction(importTestSetsFunction.lambda, { deadLetterQueue: testSetsModificationDlQ })]
        });


        this.recommendationTaskQueue = taskQueue;

        taskQueue.addToResourcePolicy(
            new PolicyStatement({
                sid: 'enforce-ssl',
                effect: Effect.DENY,
                principals: [new AnyPrincipal()],
                actions: ['sqs:*'],
                resources: [taskQueue.queueArn],
                conditions: {
                    Bool: {
                        'aws:SecureTransport': 'false',
                    },
                },
            })
        );

        const createRecommendationFunction = props.lambdaFactory.createLambdaFunction({
            moduleDirName: 'ivr-migration-api',
            moduleName: 'create-recommendation-task',
            environment: props.environment,
            environmentVariables: {
                NODE_ENV: 'cloud',
                LOG_LEVEL: 'info',
                TABLE_NAME: table.tableName,
                BUCKET_NAME: bucket.bucketName,
                LEX_ROLE_ARN: lexRole.roleArn,
                MODEL_ID: props.inferenceProfile
            },
            executionRole: role,
            memorySize: 512,
            timeout: Duration.minutes(5),
        });

        createRecommendationFunction.lambda?.addEventSource(
            new SqsEventSource(taskQueue, {
                batchSize: 2,
                enabled: true,
                reportBatchItemFailures: true,
            }),
        );

        const checkTestExecutionFunction = props.lambdaFactory.createLambdaFunction({
            moduleDirName: 'ivr-migration-api',
            moduleName: 'check-test-execution-task',
            environment: props.environment,
            environmentVariables: {
                NODE_ENV: 'cloud',
                LOG_LEVEL: 'info',
                TABLE_NAME: table.tableName,
                BUCKET_NAME: bucket.bucketName,
                LEX_ROLE_ARN: lexRole.roleArn,
                MODEL_ID: props.inferenceProfile
            },
            executionRole: role,
            memorySize: 512,
            timeout: Duration.minutes(5),
        });

        new Rule(this, 'TestExecutionCreatedRule',
            {
                eventBus,
                eventPattern: {
                    source: ['test-executions-service'],
                    detailType: ['TestExecutionCreated'],
                },
                targets: [new LambdaFunction(checkTestExecutionFunction.lambda)]
            });

        NagSuppressions.addResourceSuppressions(
            role,
            [
                {
                    id: 'AwsSolutions-IAM4',
                    reason: 'Lambda requires basic execution role for CloudWatch logs access',
                    appliesTo: ['Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole']
                }
            ], true
        );

        NagSuppressions.addResourceSuppressions(
            role,
            [
                {
                    id: 'AwsSolutions-IAM5',
                    reason: 'Lambda requires access to Bedrock models and Lex resources for test generation',
                    appliesTo: [
                        'Action::bedrock:InvokeModel*',
                        `Resource::arn:aws:bedrock:*:*:application-inference-profile/{"Fn::FindInMap":["PREFERREDINFERENCEPROFILEMap",{"Ref":"AWS::Region"},"value"]}`,
                        `Resource::arn:aws:bedrock:*:*:inference-profile/{"Fn::FindInMap":["PREFERREDINFERENCEPROFILEMap",{"Ref":"AWS::Region"},"value"]}`,
                        `Resource::arn:aws:bedrock:*::foundation-model/{"Fn::FindInMap":["PREFERREDBEDROCKMODELMap",{"Ref":"AWS::Region"},"value"]}`,
                        'Action::lex:*',
                        'Resource::*',
                        'Action::s3:Abort*',
                        'Action::s3:DeleteObject*',
                        'Action::s3:GetBucket*',
                        'Action::s3:GetObject*',
                        'Action::s3:List*',
                        'Resource::arn:<AWS::Partition>:s3:::<bucketNameParameter>/*'
                    ]
                }
            ], true
        );

        // Add these suppressions after the existing NagSuppressions
        NagSuppressions.addResourceSuppressions(
            [testSetProcessingDLQ, testSetsModificationDlQ],
            [
                {
                    id: 'AwsSolutions-SQS3',
                    reason: 'This is a DLQ itself and does not need its own DLQ'
                }
            ],
            true
        );

        NagSuppressions.addResourceSuppressions(
            stateMachine,
            [
                {
                    id: 'AwsSolutions-IAM5',
                    reason: 'State machine needs to invoke Lambda functions with wildcard permissions for test generation workflow',
                    appliesTo: [
                        'Resource::<createTestSetsTaskBunFunctionC3756B81.Arn>:*',
                        'Resource::*'
                    ]
                }
            ], true
        );



    }

}
