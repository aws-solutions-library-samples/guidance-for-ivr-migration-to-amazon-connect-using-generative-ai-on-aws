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

import { Duration } from "aws-cdk-lib";
import { Effect, ManagedPolicy, Policy, PolicyStatement, Role, ServicePrincipal, type IRole } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { BunFunFactory } from './bun-fun.factory';
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { AccessLogFormat, AuthorizationType, CfnMethod, CognitoUserPoolsAuthorizer, Cors, EndpointType, LambdaRestApi, LogGroupLogDestination, MethodLoggingLevel } from "aws-cdk-lib/aws-apigateway";
import * as cdk from 'aws-cdk-lib/core';
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { type IUserPool } from "aws-cdk-lib/aws-cognito";
import { type ITable } from "aws-cdk-lib/aws-dynamodb";
import { type IBucket } from "aws-cdk-lib/aws-s3";
import { type IEventBus } from "aws-cdk-lib/aws-events";
import { type IQueue } from "aws-cdk-lib/aws-sqs";
import { EventApi } from "aws-cdk-lib/aws-appsync";
import { NagSuppressions } from "cdk-nag";

/**
 * Properties for the IvrMigrationApi construct
 * @interface IvrMigrationApiProps
 * @property {string} environment - The deployment environment (e.g. dev, prod)
 * @property {BunFunFactory} lambdaFactory - Factory for creating Lambda functions
 * @property {IUserPool} userPool - Cognito user pool for API authorization
 * @property {string} administratorEmail - Email address of the administrator
 * @property {string} bucketName - Name of the S3 bucket for storing IVR files
 * @property {string} foundationModel - Name of the Bedrock foundation model to use
 * @property {string} inferenceProfile - Name of the Bedrock inference profile
 * @property {ITable} table - DynamoDB table for storing IVR data
 * @property {IEventBus} eventBus - EventBridge bus for publishing events
 * @property {IRole} lexRole - IAM role for Lex bot operations
 * @property {IBucket} bucket - S3 bucket reference for IVR file storage
 * @property {IQueue} taskQueue - SQS queue for processing IVR migration tasks
 */
export interface IvrMigrationApiProps {
    readonly environment: string;
    readonly lambdaFactory: BunFunFactory;
    readonly userPool: IUserPool;
    readonly administratorEmail: string;
    readonly bucketName: string;
    readonly foundationModel: string;
    readonly inferenceProfile: string;
    readonly table: ITable;
    readonly eventBus: IEventBus;
    readonly lexRole: IRole;
    readonly bucket: IBucket;
    readonly taskQueue: IQueue;
}

export const ivrMigrationApiUrlParameter = (environment: string) => `/ivr-migration-tool/${environment}/app/apiUrl`;
export const ivrMigrationApiIdParameter = (environment: string) => `/ivr-migration-tool/${environment}/app/apiId`;

/**
 * IvrMigrationApi construct creates an API Gateway with Lambda integration for IVR migration.
 * It sets up necessary IAM roles and policies, configures Cognito authorizer, and creates
 * required infrastructure for handling IVR migration requests including:
 * - Lambda function with execution role
 * - API Gateway with Cognito auth
 * - Lex permissions
 * - Bedrock model access
 * - DynamoDB table access
 * - S3 bucket access
 * - EventBridge integration
 * - CloudWatch logging
 */
export class IvrMigrationApi extends Construct {

    constructor(scope: Construct, id: string, props: IvrMigrationApiProps) {
        super(scope, id)

        const { table, eventBus, bucket, lexRole, taskQueue } = props;

        const role = new Role(this, 'LambdaRole', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            description: 'Execution Role for Lambda functions',
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
            ],
        });

        const lexPolicy = new Policy(this, 'LexAdminPolicy', {
            statements: [
                new PolicyStatement({
                    actions: [
                        'lex:*',
                        'lex:CreateBot',
                        'lex:DeleteBot',
                        'lex:UpdateBot',
                        'lex:CreateBotVersion',
                        'lex:CreateIntent',
                        'lex:DeleteIntent',
                        'lex:UpdateIntent',
                        'lex:DeleteTestSet',
                        'lex:CreateSlotType',
                        'lex:DeleteSlotType',
                        'lex:UpdateSlotType',
                        'lex:GetBot',
                        'lex:GetBots',
                        'lex:GetIntent',
                        'lex:GetIntents',
                        'lex:GetSlotType',
                        'lex:GetSlotTypes',
                        'lex:DescribeTestExecution',
                        'lex:StartTestExecution',
                    ],
                    resources: ['*']
                })
            ]
        });

        role.attachInlinePolicy(lexPolicy);

        role.addToPolicy(
            new PolicyStatement({
                sid: 'AllowModelInvocationForOrchestration',
                effect: Effect.ALLOW,
                actions: ['bedrock:InvokeModel*', 'bedrock:CreateInferenceProfile'],
                resources: [
                    `arn:aws:bedrock:*::foundation-model/${props.foundationModel}`,
                    `arn:aws:bedrock:*:*:inference-profile/${props.inferenceProfile}`,
                    `arn:aws:bedrock:*:*:application-inference-profile/${props.inferenceProfile}`,
                ],
            }),
        );

        const ivrMigrationApiFunction = props.lambdaFactory.createLambdaFunction({
            moduleDirName: 'ivr-migration-api',
            moduleName: 'ivr-migration-api',
            environment: props.environment,
            environmentVariables: {
                NODE_ENV: 'cloud',
                LOG_LEVEL: 'info',
                TABLE_NAME: table.tableName,
                BUCKET_NAME: bucket.bucketName,
                LEX_ROLE_ARN: lexRole.roleArn,
                EVENT_BUS_NAME: eventBus.eventBusName,
                TASK_QUEUE_URL: taskQueue.queueUrl
            },
            executionRole: role,
            memorySize: 512,
            timeout: Duration.minutes(5),
        });

        taskQueue.grantSendMessages(role)
        lexRole.grantPassRole(role)

        bucket.grantReadWrite(ivrMigrationApiFunction.lambda.role!)
        table.grantReadWriteData(ivrMigrationApiFunction.lambda.role!)
        eventBus.grantPutEventsTo(role)

        const logGroup = new LogGroup(this, 'IvrMigrationApiLogs');

        const authorizer = new CognitoUserPoolsAuthorizer(this, 'Authorizer', {
            cognitoUserPools: [props.userPool],
        });

        const apigw = new LambdaRestApi(this, 'IvrMigrationApiGateway', {
            restApiName: `ivr-migration-api-${props.environment}`,
            description: `IVR Migration API: ${props.environment}`,
            handler: ivrMigrationApiFunction.lambda!,
            proxy: true,
            deployOptions: {
                stageName: 'prod',
                accessLogDestination: new LogGroupLogDestination(logGroup),
                accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
                loggingLevel: MethodLoggingLevel.INFO,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowHeaders: [
                    'Content-Type',
                    'X-Amz-Date',
                    'Authorization',
                    'X-Api-Key',
                    'X-Amz-Security-Token',
                    'X-Amz-User-Agent',
                    'Accept-Version',
                ],
            },
            endpointTypes: [EndpointType.REGIONAL],
            defaultMethodOptions: {
                authorizationType: AuthorizationType.COGNITO,
                authorizer: authorizer,
            },
        });

        new StringParameter(this, 'IvrMigrationApiIdParameter', {
            parameterName: ivrMigrationApiIdParameter(props.environment),
            stringValue: apigw.restApiId,
        });
        new StringParameter(this, 'IvrMigrationApiUrlParameter', {
            parameterName: ivrMigrationApiUrlParameter(props.environment),
            stringValue: apigw.url,
        });

        cdk.Aspects.of(apigw).add({
            visit(node) {
                if (node instanceof CfnMethod && node.httpMethod === 'OPTIONS') {
                    node.addPropertyOverride('AuthorizationType', 'NONE');
                }
            },
        });

        apigw.node.addDependency(ivrMigrationApiFunction);

        // Add this after creating the lexPolicy
        NagSuppressions.addResourceSuppressions(
            lexPolicy,
            [
                {
                    id: 'AwsSolutions-IAM5',
                    reason: 'Admin policy requires full access to Lex resources for bot management and test execution',
                    appliesTo: [
                        'Action::lex:*',
                        'Resource::*'
                    ]
                }
            ],
            true
        );

        NagSuppressions.addResourceSuppressions(
            [apigw],
            [
                {
                    id: 'AwsSolutions-APIG2',
                    reason: 'Request validation is being done by the Fastify module.',
                },
                {
                    id: 'AwsSolutions-IAM4',
                    appliesTo: ['Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs'],
                    reason: 'API GW needs this policy to push logs to cloudwatch.',
                },
                {
                    id: 'AwsSolutions-APIG4',
                    reason: 'OPTIONS has no auth.',
                },
                {
                    id: 'AwsSolutions-COG4',
                    reason: 'OPTIONS does not use Cognito auth.',
                },
            ],
            true
        );


        NagSuppressions.addResourceSuppressions(role,
            [
                {
                    id: 'AwsSolutions-IAM4',
                    reason: 'Lambda requires basic execution role for CloudWatch logs access',
                    appliesTo: ['Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole']
                }
            ], true
        );

        NagSuppressions.addResourceSuppressions(role,
            [
                {
                    id: 'AwsSolutions-IAM5',
                    reason: 'Lambda requires access to Bedrock models and S3 for IVR migration processing',
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


