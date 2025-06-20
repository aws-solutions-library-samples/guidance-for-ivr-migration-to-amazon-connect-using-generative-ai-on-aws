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

import { Duration, RemovalPolicy, Stack, type StackProps } from "aws-cdk-lib";
import { IvrMigrationApi } from "./constructs/api.construct";
import type { Construct } from "constructs";
import { BunFunFactory } from "./constructs/bun-fun.factory";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import { bucketNameParameter, bunLayerVersionArnParameter } from "./shared.stack";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { userPoolIdParameter } from "./constructs/auth.construct";
import { FactNames } from "@ivr-migration-tool/cdk-common";
import { EventBus } from "aws-cdk-lib/aws-events";
import { AttributeType, BillingMode, StreamViewType, Table, TableEncryption } from "aws-cdk-lib/aws-dynamodb";
import { AnyPrincipal, Effect, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { NagSuppressions } from "cdk-nag";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { LexResourceGenerator } from "./constructs/lex-resource-generator.construct";
import { BotBuilderWorkflow } from "./constructs/bot-builder-workflow.construct";
import { TestGenerationWorkflow } from "./constructs/test-generation-workflow.construct";
import { Notification } from './constructs/notification.construct';


export type ApiStackProps = StackProps & {
    readonly environment: string;
    readonly administratorEmail: string;
}

export const tableNameParameter = (environment: string) => `/ivr-migration-tool/${environment}/app/tableName`;

export const modelIdParameter = (environment: string) => `/ivr-migration-tool/${environment}/app/modelId`;

export const lexRoleArnParameter = (environment: string) => `/ivr-migration-tool/${environment}/app/lexRoleArn`;

export const eventBusNameParameter = (environment: string) => `/ivr-migration-tool/${environment}/app/eventBusName`;

export const taskQueueUrlParameter = (environment: string) => `/ivr-migration-tool/${environment}/app/taskQueueUrl`;

/**
 * ApiStack is responsible for creating and managing the infrastructure resources for the IVR Migration Tool.
 * This stack includes:
 * - DynamoDB table for data storage
 * - EventBus for event-driven communication
 * - SQS queues for task processing
 * - Lex roles and permissions
 * - API endpoints and Lambda functions
 * - Bot builder and test generation workflows
 * - Notification system
 */
export class ApiStack extends Stack {

    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props)

        const bunLayerArn = StringParameter.fromStringParameterAttributes(this, 'bunLayerArn', {
            parameterName: bunLayerVersionArnParameter(props.environment),
            simpleName: false,
        }).stringValue;

        const userPoolId = StringParameter.fromStringParameterAttributes(this, 'userPoolId', {
            parameterName: userPoolIdParameter(props.environment),
            simpleName: false,
        }).stringValue;

        const bucketName = StringParameter.fromStringParameterAttributes(this, 'bucketName', {
            parameterName: bucketNameParameter(props.environment),
            simpleName: false,
        }).stringValue;

        const userPool = UserPool.fromUserPoolId(this, 'UserPool', userPoolId)

        const foundationModel = this.regionalFact(
            FactNames.PREFERRED_BEDROCK_MODEL,
            'anthropic.claude-3-5-sonnet-20240620-v1:0',
        );

        const inferenceProfile = this.regionalFact(FactNames.PREFERRED_INFERENCE_PROFILE);

        const namePrefix = `ivr-migration-${props.environment}`

        const eventBus = new EventBus(this, 'IvrMigrationEventBus')

        const table = new Table(this, 'IvrMigrationTable', {
            partitionKey: {
                name: 'pk',
                type: AttributeType.STRING,
            },
            sortKey: {
                name: 'sk',
                type: AttributeType.STRING,
            },
            tableName: `ivr-migration-tool-${props.environment}`,
            billingMode: BillingMode.PAY_PER_REQUEST,
            encryption: TableEncryption.AWS_MANAGED,
            pointInTimeRecovery: true,
            removalPolicy: RemovalPolicy.DESTROY,
            stream: StreamViewType.NEW_AND_OLD_IMAGES
        })

        new StringParameter(this, 'TableNameParameter', {
            parameterName: tableNameParameter(props.environment),
            stringValue: table.tableName,
        });

        new StringParameter(this, 'ModelIdParameter', {
            parameterName: modelIdParameter(props.environment),
            stringValue: inferenceProfile,
        });

        new StringParameter(this, 'EventBusNameParameter', {
            parameterName: eventBusNameParameter(props.environment),
            stringValue: inferenceProfile,
        });

        const lexRole = new Role(this, 'LexRole', {
            assumedBy: new ServicePrincipal('lexv2.amazonaws.com'),
            description: 'Service role for LexV2Bots',
        });

        lexRole.addToPolicy(new PolicyStatement({
            sid: 'AllowBotToRunTest',
            effect: Effect.ALLOW,
            actions: ['lex:*',
                'lex:RecognizeText',
                'lex:RecognizeUtterance',
                'lex:PutSession'
            ],
            resources: ['*'],
        }),)

        new StringParameter(this, 'LexRoleArnParameter', {
            parameterName: lexRoleArnParameter(props.environment),
            stringValue: lexRole.roleArn,
        });

        // Add this after creating the lexRole in your ApiStack constructor
        NagSuppressions.addResourceSuppressions(
            lexRole,
            [
                {
                    id: 'AwsSolutions-IAM5',
                    reason: 'Lex service role requires broad permissions to manage Lex resources and access S3 artifacts',
                    appliesTo: [
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
            ],
            true
        );


        const bucket = Bucket.fromBucketName(this, 'ArtifactBucket', bucketName);

        bucket.grantReadWrite(lexRole)

        const taskDLQ = new Queue(this, 'TaskDLQ', { queueName: `${namePrefix}-task-dlq` });

        taskDLQ.addToResourcePolicy(
            new PolicyStatement({
                sid: 'enforce-ssl',
                effect: Effect.DENY,
                principals: [new AnyPrincipal()],
                actions: ['sqs:*'],
                resources: [taskDLQ.queueArn],
                conditions: {
                    Bool: {
                        'aws:SecureTransport': 'false',
                    },
                },
            })
        );

        const taskQueue = new Queue(this, 'TaskQueue', {
            queueName: `${namePrefix}-recommendation-queue`, visibilityTimeout: Duration.minutes(5), deadLetterQueue: {
                queue: taskDLQ,
                maxReceiveCount: 2
            }
        });

        new StringParameter(this, 'TaskQueueUrlParameter', {
            parameterName: taskQueueUrlParameter(props.environment),
            stringValue: taskQueue.queueUrl,
        });

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

        const lambdaFactory = new BunFunFactory(this, bunLayerArn);

        new IvrMigrationApi(this, 'ivr-migration-api', {
            ...props,
            lambdaFactory,
            userPool,
            bucketName,
            foundationModel,
            inferenceProfile,
            table,
            eventBus,
            lexRole,
            bucket,
            taskQueue
        })

        new Notification(this, 'Notification', {
            ...props,
            lambdaFactory,
            table,
            namePrefix,
            userPool
        })

        const lexResourceGenerator = new LexResourceGenerator(this, 'LexResourceGenerator', {
            ...props,
            lambdaFactory,
            bucket,
            foundationModel,
            inferenceProfile,
            table,
            namePrefix,
        })

        new BotBuilderWorkflow(this, 'BotBuilderWorkflow', {
            ...props,
            lambdaFactory,
            bucket,
            foundationModel,
            inferenceProfile,
            table,
            namePrefix,
            handleErrorTaskFunction: lexResourceGenerator.handleErrorTaskFunctionLambda,
            lexRole,
            eventBus
        });

        new TestGenerationWorkflow(this, 'TestGenerationWorkflow', {
            ...props,
            lambdaFactory,
            bucket,
            foundationModel,
            inferenceProfile,
            table,
            namePrefix,
            lexRole,
            eventBus,
            taskQueue
        });


    }
}
