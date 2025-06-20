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
import { Queue } from "aws-cdk-lib/aws-sqs";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import type { BunFunFactory } from "./bun-fun.factory";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import sfn, { LogLevel, Succeed } from 'aws-cdk-lib/aws-stepfunctions';
import { Rule, type IEventBus } from "aws-cdk-lib/aws-events";
import { SfnStateMachine } from "aws-cdk-lib/aws-events-targets";
import type { IFunction } from "aws-cdk-lib/aws-lambda";
import { NagSuppressions } from "cdk-nag";
import { LogGroup } from "aws-cdk-lib/aws-logs";

export interface BotBuilderWorkflowProps {
    namePrefix: string;
    foundationModel: string;
    inferenceProfile: string;
    environment: string;
    table: ITable;
    bucket: IBucket;
    lexRole: IRole;
    lambdaFactory: BunFunFactory;
    eventBus: IEventBus;
    handleErrorTaskFunction: IFunction;
}

export class BotBuilderWorkflow extends Construct {

    constructor(scope: Construct, id: string, props: BotBuilderWorkflowProps) {
        super(scope, id)

        const { lambdaFactory, namePrefix, foundationModel, inferenceProfile, table, bucket, lexRole, environment, eventBus, handleErrorTaskFunction } = props;

        const botBuilderDLQ = new Queue(this, 'BotBuilderDLQ', { queueName: `${namePrefix}-bot-builder-dlq` });

        botBuilderDLQ.addToResourcePolicy(
            new PolicyStatement({
                sid: 'enforce-ssl',
                effect: Effect.DENY,
                principals: [new AnyPrincipal()],
                actions: ['sqs:*'],
                resources: [botBuilderDLQ.queueArn],
                conditions: {
                    Bool: {
                        'aws:SecureTransport': 'false',
                    },
                },
            })
        );

        const role = new Role(this, 'BotBuilderLambdaRole', {
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

        const handleErrorTask = new LambdaInvoke(this, 'HandleBuildErrorTask', {
            lambdaFunction: handleErrorTaskFunction,
            inputPath: '$',
            outputPath: '$.Payload',
        });

        const parameterCollectorTaskFunction = lambdaFactory.createLambdaFunction({
            ...commonProperties,
            moduleName: 'parameter-collector-task',
            timeout: Duration.minutes(10)
        });

        const parameterCollectorTask = new LambdaInvoke(this, 'ParameterCollectorTask', {
            lambdaFunction: parameterCollectorTaskFunction.lambda,
            inputPath: '$',
            outputPath: '$.Payload',
        }).addRetry({
            errors: ['ConflictException'],
            interval: Duration.seconds(2),
            backoffRate: 1.5,
            maxAttempts: 3
        }).addCatch(handleErrorTask, { resultPath: '$.error' });

        const createSlotTypeTaskFunction = lambdaFactory.createLambdaFunction({
            ...commonProperties,
            moduleName: 'create-slot-type-task',
            timeout: Duration.minutes(10)
        });

        const createSlotTypeTask = new LambdaInvoke(this, 'CreateSlotTypeTask', {
            lambdaFunction: createSlotTypeTaskFunction.lambda,
            inputPath: '$',
            outputPath: '$.Payload',
        }).addCatch(handleErrorTask, { resultPath: '$.error' });

        const createIntentTaskFunction = lambdaFactory.createLambdaFunction({
            ...commonProperties,
            moduleName: 'create-intent-task',
            timeout: Duration.minutes(10)
        });

        const createIntentTask = new LambdaInvoke(this, 'CreateIntentTask', {
            lambdaFunction: createIntentTaskFunction.lambda,
            inputPath: '$',
            outputPath: '$.Payload',
        }).addCatch(handleErrorTask, { resultPath: '$.error' });

        const buildBotTaskFunction = lambdaFactory.createLambdaFunction({
            ...commonProperties,
            moduleName: 'build-bot-task',
            timeout: Duration.minutes(15)
        });

        const buildBotTask = new LambdaInvoke(this, 'buildBotTaskFunction', {
            lambdaFunction: buildBotTaskFunction.lambda,
            inputPath: '$',
            outputPath: '$.Payload',
        }).addCatch(handleErrorTask, { resultPath: '$.error' });

        const fixBotTaskFunction = lambdaFactory.createLambdaFunction({
            ...commonProperties,
            moduleName: 'fix-bot-task',
            timeout: Duration.minutes(10)
        });

        const fixBotTask = new LambdaInvoke(this, 'fixBotTaskFunction', {
            lambdaFunction: fixBotTaskFunction.lambda,
            inputPath: '$',
            outputPath: '$.Payload',
        }).addCatch(handleErrorTask, { resultPath: '$.error' });

        const fixBotChoice = new sfn.Choice(this, 'MoreBotResourceToFix')
            .when(sfn.Condition.numberEquals('$.failureReasonsToFix', 0),
                buildBotTask)
            .otherwise(fixBotTask)

        const builtBotChoice = new sfn.Choice(this, 'IsBotBuiltSuccessFully')
            .when(sfn.Condition.numberEquals('$.failureReasonsToFix', 0),
                new Succeed(this, 'BotBuiltSuccess'))
            .otherwise(fixBotTask.next(fixBotChoice))

        const createIntentChoice = new sfn.Choice(this, 'MoreIntentToCreate')
            .when(sfn.Condition.numberEquals('$.input.intentsToProcess', 0),
                buildBotTask.next(builtBotChoice))
            .otherwise(createIntentTask)

        const createSlotTypesChoice = new sfn.Choice(this, 'MoreSlotTypesToCreate')
            .when(sfn.Condition.numberEquals('$.input.slotTypesToProcess', 0),
                createIntentTask.next(createIntentChoice))
            .otherwise(createSlotTypeTask)


        const botBuilderLogGroup = new LogGroup(this, 'BotBuilderStateMachineLogGroup', {
            logGroupName: `/aws/vendedlogs/states/${namePrefix}-bot-builder`,
            removalPolicy: RemovalPolicy.DESTROY
        });

        const stateMachine = new sfn.StateMachine(this, 'BotBuilderStateMachine', {
            stateMachineName: `${namePrefix}-bot-builder`,
            stateMachineType: sfn.StateMachineType.STANDARD,
            tracingEnabled: true,
            logs: { destination: botBuilderLogGroup, level: LogLevel.ALL, includeExecutionData: true },
            definition: sfn.Chain.start(parameterCollectorTask)
                .next(createSlotTypeTask)
                .next(createSlotTypesChoice)
        });

        new Rule(this, 'BuildBotStartesRule', {
            eventBus: eventBus,
            eventPattern: {
                source: ['bots-service'],
                detailType: ['BuildBotStarted'],
            },
            targets: [
                new SfnStateMachine(stateMachine, {
                    deadLetterQueue: botBuilderDLQ,
                    maxEventAge: Duration.minutes(5),
                    retryAttempts: 2,
                })]
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
            botBuilderDLQ,
            [
                {
                    id: 'AwsSolutions-SQS3',
                    reason: 'This is the DLQ',
                }
            ], true
        );

        NagSuppressions.addResourceSuppressions(
            role,
            [
                {
                    id: 'AwsSolutions-IAM5',
                    reason: 'Lambda requires broad permissions to create and manage Lex bots and access Bedrock models',
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

        NagSuppressions.addResourceSuppressions(
            stateMachine,
            [
                {
                    id: 'AwsSolutions-IAM5',
                    reason: 'State machine needs to invoke Lambda functions with wildcard permissions for bot building workflow',
                    appliesTo: [
                        'Resource::<buildBotTaskBunFunctionD4937478.Arn>:*',
                        'Resource::<createIntentTaskBunFunction171C9390.Arn>:*',
                        'Resource::<createSlotTypeTaskBunFunctionBB9BD775.Arn>:*',
                        'Resource::<fixBotTaskBunFunctionCC2BB190.Arn>:*',
                        'Resource::<handleErrorTaskBunFunctionE3CEA647.Arn>:*',
                        'Resource::<parameterCollectorTaskBunFunction78CC4411.Arn>:*',
                        'Resource::*'
                    ]
                }
            ], true
        );

    }

}
