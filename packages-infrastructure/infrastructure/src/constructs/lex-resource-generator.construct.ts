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
import { AnyPrincipal, Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import type { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import type { BunFunFactory } from "./bun-fun.factory";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import sfn, { LogLevel } from 'aws-cdk-lib/aws-stepfunctions';
import { Rule } from 'aws-cdk-lib/aws-events';
import { SfnStateMachine } from "aws-cdk-lib/aws-events-targets";
import { NagSuppressions } from "cdk-nag";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import type { IFunction } from "aws-cdk-lib/aws-lambda";

export interface LexResourceGeneratorProps {
    namePrefix: string;
    foundationModel: string;
    inferenceProfile: string;
    environment: string;
    table: ITable;
    bucket: IBucket;
    lambdaFactory: BunFunFactory;
}

/**
 * LexResourceGenerator is responsible for creating and managing AWS resources needed for Lex bot migration.
 * It sets up:
 * - SQS DLQ for migration processing
 * - IAM roles and policies for Lambda execution
 * - Lambda functions for different migration tasks
 * - Step Functions state machine for orchestration
 * - EventBridge rule to trigger migrations
 */
export class LexResourceGenerator extends Construct {

    public handleErrorTaskFunctionLambda: IFunction;

    constructor(scope: Construct, id: string, props: LexResourceGeneratorProps) {
        super(scope, id)

        const { namePrefix, foundationModel, inferenceProfile, environment, bucket, table, lambdaFactory } = props;

        const lexResourceGeneratorDLQ = new Queue(this, 'LexResourceGeneratorDLQ', { queueName: `${namePrefix}-lex-resource-generator-dlq` });

        lexResourceGeneratorDLQ.addToResourcePolicy(
            new PolicyStatement({
                sid: 'enforce-ssl',
                effect: Effect.DENY,
                principals: [new AnyPrincipal()],
                actions: ['sqs:*'],
                resources: [lexResourceGeneratorDLQ.queueArn],
                conditions: {
                    Bool: {
                        'aws:SecureTransport': 'false',
                    },
                },
            })
        );

        const role = new Role(this, 'TaskLambdaRole', {
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
        table.grantReadWriteData(role);

        const commonProperties = {
            moduleDirName: 'ivr-migration-api',
            environment: environment,
            environmentVariables: {
                NODE_ENV: 'cloud',
                LOG_LEVEL: 'trace',
                BUCKET_NAME: bucket.bucketName,
                TABLE_NAME: table.tableName,
                MODEL_ID: inferenceProfile,
            },
            executionRole: role,
            memorySize: 512,
            timeout: Duration.minutes(5),
        }

        const handleErrorTaskFunction = lambdaFactory.createLambdaFunction({
            ...commonProperties,
            moduleName: 'handle-error-task',
        });

        this.handleErrorTaskFunctionLambda = handleErrorTaskFunction.lambda

        const generateSlotsTaskFunction = lambdaFactory.createLambdaFunction({
            ...commonProperties,
            moduleName: 'generate-slots-task',
            timeout: Duration.minutes(10)
        });

        const generateIntentTaskFunction = lambdaFactory.createLambdaFunction({
            ...commonProperties,
            moduleName: 'generate-intent-task',
        });

        const validateIntentTaskFunction = lambdaFactory.createLambdaFunction({
            ...commonProperties,
            moduleName: 'validate-intent-task',
            timeout: Duration.minutes(15)
        })

        const handleSuccessTaskFunction = lambdaFactory.createLambdaFunction({
            ...commonProperties,
            moduleName: 'handle-success-task',
        });

        const handleErrorTask = new LambdaInvoke(this, 'HandleErrorTask', {
            lambdaFunction: handleErrorTaskFunction.lambda,
            inputPath: '$',
            outputPath: '$.Payload',
        });

        const handleSuccessTask = new LambdaInvoke(this, 'HandleSuccessTask', {
            lambdaFunction: handleSuccessTaskFunction.lambda,
            inputPath: '$',
            outputPath: '$.Payload',
        });

        const generateSlotsTask = new LambdaInvoke(this, 'GenerateSlotsTask', {
            lambdaFunction: generateSlotsTaskFunction.lambda,
            inputPath: '$',
            outputPath: '$.Payload',
        }).addRetry({
            errors: ['ThrottlingException'],
            interval: Duration.seconds(30),
            backoffRate: 1.5,
            maxAttempts: 3
        }).addCatch(handleErrorTask, { resultPath: '$.error' });

        const generateIntentTask = new LambdaInvoke(this, 'GenerateIntentTask', {
            lambdaFunction: generateIntentTaskFunction.lambda,
            inputPath: '$',
            outputPath: '$.Payload',
        }).addRetry({
            errors: ['ThrottlingException'],
            interval: Duration.seconds(30),
            backoffRate: 1.5,
            maxAttempts: 3
        }).addCatch(handleErrorTask, { resultPath: '$.error' });

        const validateIntentTask = new LambdaInvoke(this, 'ValidateIntentTask', {
            lambdaFunction: validateIntentTaskFunction.lambda,
            inputPath: '$',
            outputPath: '$.Payload',
        }).addRetry({
            errors: ['ThrottlingException'],
            interval: Duration.seconds(30),
            backoffRate: 1.5,
            maxAttempts: 3
        }).addCatch(handleErrorTask, { resultPath: '$.error' });

        const lexResourceGeneratorLogGroup = new LogGroup(this, 'LexResourceGeneratorLogGroup', {
            logGroupName: `/aws/vendedlogs/states/${namePrefix}-lex-resource-generator`,
            removalPolicy: RemovalPolicy.DESTROY
        });

        // Add new rule for state machine
        const stateMachine = new sfn.StateMachine(this, 'LexResourceGeneratorStateMachine', {
            stateMachineName: `${namePrefix}-lex-resource-generator`,
            stateMachineType: sfn.StateMachineType.STANDARD,
            tracingEnabled: true,
            logs: { destination: lexResourceGeneratorLogGroup, level: LogLevel.ALL, includeExecutionData: true },
            definition: sfn.Chain.start(generateSlotsTask)
                .next(generateIntentTask)
                .next(new sfn.Choice(this, 'MoreComponentToProcess')
                    .when(sfn.Condition.numberEquals('$.input.componentsToProcess', 0),
                        validateIntentTask.next(new sfn.Choice(this, 'MoreIntentToProcess')
                            .when(sfn.Condition.numberEquals('$.input.intentsToProcess', 0), handleSuccessTask)
                            .otherwise(validateIntentTask)))
                    .otherwise(generateIntentTask))
        });

        new Rule(this, 'SpecificationFileUploaded', {
            eventPattern: {
                source: ['aws.s3'],
                detailType: ['Object Created'],
                detail: {
                    bucket: {
                        name: [bucket.bucketName]
                    },
                    object: {
                        key: [{ suffix: 'botSourceDefinition.zip' }]
                    }
                },
            },
            targets: [new SfnStateMachine(stateMachine, {
                deadLetterQueue: lexResourceGeneratorDLQ,
                maxEventAge: Duration.minutes(5),
                retryAttempts: 2,
            })]
        });

        // Add this after creating the LexResourceGenerator construct
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
            lexResourceGeneratorDLQ,
            [
                {
                    id: 'AwsSolutions-SQS3',
                    reason: 'This is the DLQ.',
                }
            ], true
        );

        // Add this after creating the stateMachine
        NagSuppressions.addResourceSuppressions(
            stateMachine,
            [
                {
                    id: 'AwsSolutions-IAM5',
                    reason: 'State machine needs to invoke Lambda functions with wildcard permissions for task execution',
                    appliesTo: [
                        'Resource::<generateIntentTaskBunFunctionABE723AE.Arn>:*',
                        'Resource::<generateSlotsTaskBunFunctionA242B81E.Arn>:*',
                        'Resource::<handleErrorTaskBunFunctionE3CEA647.Arn>:*',
                        'Resource::<handleSuccessTaskBunFunctionAED4E55F.Arn>:*',
                        'Resource::<validateIntentTaskBunFunctionB37EF0B0.Arn>:*',
                        'Resource::*'
                    ]
                }
            ], true
        );


        NagSuppressions.addResourceSuppressions(role,
            [
                {
                    id: 'AwsSolutions-IAM5',
                    reason: 'Lambda requires access to Bedrock models and S3 for Lex resource generation',
                    appliesTo: [
                        'Action::bedrock:InvokeModel*',
                        `Resource::arn:aws:bedrock:*:*:application-inference-profile/{"Fn::FindInMap":["PREFERREDINFERENCEPROFILEMap",{"Ref":"AWS::Region"},"value"]}`,
                        `Resource::arn:aws:bedrock:*:*:inference-profile/{"Fn::FindInMap":["PREFERREDINFERENCEPROFILEMap",{"Ref":"AWS::Region"},"value"]}`,
                        `Resource::arn:aws:bedrock:*::foundation-model/{"Fn::FindInMap":["PREFERREDBEDROCKMODELMap",{"Ref":"AWS::Region"},"value"]}`,
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


    }

}
