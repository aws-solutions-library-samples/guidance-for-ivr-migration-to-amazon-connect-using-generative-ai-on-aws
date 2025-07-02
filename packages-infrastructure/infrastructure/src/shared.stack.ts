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
import { Architecture, Code, LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import type { Construct } from "constructs";
import path from 'node:path';
import { Auth } from "./constructs/auth.construct";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { BlockPublicAccess, Bucket, BucketEncryption, HttpMethods } from "aws-cdk-lib/aws-s3";
import { NagSuppressions } from "cdk-nag";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { CfnAccount } from "aws-cdk-lib/aws-apigateway";

const dir = path.join(__dirname, '../');

export type SharedStackProps = StackProps & {
	readonly environment: string;
	readonly administratorEmail: string;
}

export const bunLayerVersionArnParameter = (environment: string) => `/ivr-migration-tool/${environment}/shared/bunLayerVersionArn`;

export const bucketNameParameter = (environment: string) => `/ivr-migration-tool/${environment}/shared/artifactBucket`;

/**
 * SharedStack is responsible for creating and managing shared AWS resources across the application.
 *
 * This stack creates and manages:
 * - A Bun runtime Lambda layer
 * - An S3 bucket for storing artifacts with appropriate security configurations
 * - Authentication module setup
 * - SSM parameters for cross-stack resource sharing
 *
 * @extends {Stack}
 */
export class SharedStack extends Stack {

	constructor(scope: Construct, id: string, props: SharedStackProps) {
		super(scope, id, props)

		const { administratorEmail, environment } = props;

		const bunLayer = new LayerVersion(this, 'BunFunLayer', {
			description: 'A custom Lambda layer for Bun.',
			removalPolicy: RemovalPolicy.DESTROY,
			code: Code.fromAsset(path.join(dir, '..', 'bun-lambda', 'bun-lambda-layer.zip')),
			compatibleArchitectures: [Architecture.X86_64, Architecture.ARM_64],
			compatibleRuntimes: [Runtime.PROVIDED_AL2],
			layerVersionName: 'bun',
		});

		bunLayer.addPermission('BunFunLayerPermission', {
			accountId: Stack.of(this).account,
		});

		new StringParameter(this, 'BunLayerVersionArnParameter', {
			parameterName: bunLayerVersionArnParameter(environment),
			stringValue: bunLayer.layerVersionArn,
		});

		// amazonq-ignore-next-line
		const bucket = new Bucket(this, 'ArtifactBucket', {
			bucketName: `ivr-migration-tool-${Stack.of(this).account}-${Stack.of(this).region}`,
			encryption: BucketEncryption.S3_MANAGED,
			intelligentTieringConfigurations: [
				{
					name: 'archive',
					archiveAccessTierTime: Duration.days(90),
					deepArchiveAccessTierTime: Duration.days(180),
				},
			],
			blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
			enforceSSL: true,
			autoDeleteObjects: true,
			versioned: true,
			serverAccessLogsPrefix: 'access-logs/',
			removalPolicy: RemovalPolicy.DESTROY,
			eventBridgeEnabled: true,
		})

		bucket.addCorsRule({
			allowedHeaders: ['*'],
			allowedMethods: [HttpMethods.PUT, HttpMethods.GET, HttpMethods.HEAD],
			allowedOrigins: ['*'],
			exposedHeaders: ['ETag'],
			maxAge: 3000,
		})

		new StringParameter(this, 'ArtifactBucketParameter', {
			parameterName: bucketNameParameter(environment),
			stringValue: bucket.bucketName,
		});

		new Auth(this, 'AuthModule', { environment, administratorEmail });

		// Create the IAM role for API Gateway CloudWatch logging
		const apiGatewayCloudWatchRole = new Role(this, 'ApiGatewayCloudWatchRole', {
			assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
			managedPolicies: [ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonAPIGatewayPushToCloudWatchLogs')],
		});

		// Update the account settings to use this role
		new CfnAccount(this, 'ApiGatewayAccount', {
			cloudWatchRoleArn: apiGatewayCloudWatchRole.roleArn,
		});

		NagSuppressions.addResourceSuppressions(
			apiGatewayCloudWatchRole,
			[
				{
					id: 'AwsSolutions-IAM4',
					reason: 'API Gateway requires AWS managed policy to push logs to CloudWatch',
					appliesTo: ['Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs'],
				},
			],
			true
		);
		NagSuppressions.addResourceSuppressionsByPath(
			this,
			[`/SharedStack-${props.environment}/BucketNotificationsHandler050a0587b7544547bf325f094a3db834/Role/Resource`],
			[
				{
					id: 'AwsSolutions-IAM4',
					appliesTo: ['Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'],
					reason: 'This policy attached to the role is generated by CDK.',
				},
				{
					id: 'AwsSolutions-IAM5',
					appliesTo: ['Resource::*'],
					reason: 'This policy attached to the role is generated by CDK.',
				},
			],
			true
		);


	}
}


