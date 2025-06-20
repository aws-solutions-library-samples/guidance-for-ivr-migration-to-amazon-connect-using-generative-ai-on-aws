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
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import type { BunFunFactory } from "./bun-fun.factory";
import { Duration } from "aws-cdk-lib";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { StartingPosition } from "aws-cdk-lib/aws-lambda";
import { NagSuppressions } from "cdk-nag";
import { AppSyncAuthorizationType, EventApi, type AppSyncAuthProvider } from "aws-cdk-lib/aws-appsync";
import type { IUserPool } from "aws-cdk-lib/aws-cognito";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export const eventApiKeyParameter = (environment: string) => `/ivr-migration-tool/${environment}/app/eventApiKey`;

/**
 * Properties for the Notification construct
 * @interface NotificationProps
 * @property {string} environment - The environment name (e.g. dev, prod)
 * @property {string} namePrefix - Prefix to use for naming resources
 * @property {ITable} table - DynamoDB table to stream events from
 * @property {BunFunFactory} lambdaFactory - Factory for creating Lambda functions
 * @property {IUserPool} userPool - Cognito User Pool for authentication
 */
export interface NotificationProps {
    environment: string;
    namePrefix: string;
    table: ITable;
    lambdaFactory: BunFunFactory;
    userPool: IUserPool;
}

export const ivrMigrationAppSyncUrlParameter = (environment: string) => `/ivr-migration-tool/${environment}/app/appSyncUrl`;

/**
 * Notification construct that sets up real-time event notifications using AppSync
 * Creates an EventApi for handling real-time events and a Lambda function to process DynamoDB streams
 * Configures authentication using Cognito User Pool and API Key
 */
export class Notification extends Construct {

    constructor(scope: Construct, id: string, props: NotificationProps) {
        super(scope, id)

        const { environment, namePrefix, table, lambdaFactory, userPool } = props

        const role = new Role(this, 'NotificationLambdaRole', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
            description: 'Execution Role for Lambda functions',
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
            ],
        });

        const apiKeyProvider: AppSyncAuthProvider = {
            authorizationType: AppSyncAuthorizationType.API_KEY,
        };

        const eventApi = new EventApi(this, 'api', {
            apiName: `${namePrefix}-events-api`,
            authorizationConfig: {
                // set auth providers
                authProviders: [
                    {
                        authorizationType: AppSyncAuthorizationType.USER_POOL,
                        cognitoConfig: {
                            userPool
                        }
                    },
                    apiKeyProvider
                ],
            }
        });

        eventApi.addChannelNamespace('bots');
        eventApi.addChannelNamespace('testSets');
        eventApi.addChannelNamespace('testExecutions');
        eventApi.addChannelNamespace('recommendationTasks');
        eventApi.addChannelNamespace('recommendationTaskItems');

        new StringParameter(this, 'IvrMigrationAppSyncUrlParameter', {
            parameterName: ivrMigrationAppSyncUrlParameter(props.environment),
            stringValue: `https://${eventApi.httpDns}/event`,
        });

        const streamProcessorFunction = lambdaFactory.createLambdaFunction({
            moduleDirName: 'ivr-migration-api',
            environment: environment,
            environmentVariables: {
                NODE_ENV: 'cloud',
                LOG_LEVEL: 'info',
                TABLE_NAME: table.tableName,
                EVENT_API_ENDPOINT: eventApi.httpDns,
                EVENT_API_KEY: Object.values(eventApi.apiKeys)[0].attrApiKey
            },
            executionRole: role,
            memorySize: 512,
            timeout: Duration.minutes(5),
            moduleName: 'stream-processor',
        });

        new StringParameter(this, 'EventApiKeyParameter', {
            parameterName: eventApiKeyParameter(props.environment),
            stringValue: Object.values(eventApi.apiKeys)[0].attrApiKey,
        });

        NagSuppressions.addResourceSuppressions(
            role,
            [
                {
                    id: 'AwsSolutions-IAM4',
                    reason: 'Lambda requires basic execution role for CloudWatch logs access',
                    appliesTo: ['Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole']
                },
                {
                    id: 'AwsSolutions-IAM5',
                    reason: 'Lambda requires basic execution role for CloudWatch logs access',
                    appliesTo: ['Resource::*']
                }
            ], true
        );

        streamProcessorFunction.lambda.addEventSource(new DynamoEventSource(table, { startingPosition: StartingPosition.LATEST }))
    }

}