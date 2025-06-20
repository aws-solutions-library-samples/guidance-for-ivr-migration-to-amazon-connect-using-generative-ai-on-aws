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

import type { IRole } from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib/core';
import * as path from 'path';
import { BunFun } from './bun-fun.construct';
import type { ISecurityGroup, IVpc, SubnetSelection } from 'aws-cdk-lib/aws-ec2';


/**
 * Configuration interface for creating Lambda functions.
 * @interface LambdaFunctionConfig
 * @property {string} moduleDirName - Directory name of the module containing the Lambda function code
 * @property {string} environment - Environment name (e.g. dev, prod) for the Lambda function
 * @property {Object} environmentVariables - Environment variables to set on the Lambda function
 * @property {IRole} executionRole - IAM role to be used as the Lambda execution role
 * @property {string} [moduleName] - Optional module name if different from moduleDirName
 * @property {number} [memorySize] - Optional memory size in MB for the Lambda function
 * @property {cdk.Duration} [timeout] - Optional timeout duration for the Lambda function
 * @property {string} [handlerFilename] - Optional handler filename if different from index.js
 * @property {'packages'|'packages-infrastructure'} [packageRoot] - Optional root directory for packages
 * @property {IVpc} [vpc] - Optional VPC to deploy the Lambda function into
 * @property {SubnetSelection} [vpcSubnets] - Optional subnet selection for VPC deployment
 * @property {ISecurityGroup[]} [securityGroups] - Optional security groups to assign to the Lambda function
 */
interface LambdaFunctionConfig {
	moduleDirName: string;
	environment: string;
	environmentVariables: { [key: string]: string };
	executionRole: IRole;
	moduleName?: string;
	memorySize?: number;
	timeout?: cdk.Duration;
	handlerFilename?: string;
	packageRoot?: 'packages' | 'packages-infrastructure';
	vpc?: IVpc;
	vpcSubnets?: SubnetSelection;
	securityGroups?: ISecurityGroup[];
}

/**
 * Factory class for creating Bun Lambda functions with consistent configuration.
 * Provides utility methods to create and configure Lambda functions using Bun runtime.
 * @class BunFunFactory
 */
export class BunFunFactory {
	private readonly scope: cdk.Stack;
	private readonly bunLayerArn: string;

	constructor(scope: cdk.Stack, bunLayerArn: string) {
		this.scope = scope;
		this.bunLayerArn = bunLayerArn;
	}

	private static toCamelCase(str: string): string {
		return str.replace(/([-_][a-z])/gi, (match) => match.slice(1).toUpperCase());
	}

	private static toSentenceCase(str: string): string {
		return str
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	/**
	 * Creates a new Lambda function using the Bun runtime with the specified configuration.
	 * 
	 * @param {LambdaFunctionConfig} config - Configuration object containing Lambda function settings
	 * @returns {BunFun} A new BunFun Lambda function instance configured according to the provided settings
	 * 
	 * @example
	 * const factory = new BunFunFactory(stack, 'arn:aws:lambda:region:xxxx:layer:bun:1');
	 * const lambda = factory.createLambdaFunction({
	 *   moduleDirName: 'my-function',
	 *   environment: 'dev',
	 *   environmentVariables: { KEY: 'value' },
	 *   executionRole: role
	 * });
	 */
	public createLambdaFunction(config: LambdaFunctionConfig): BunFun {
		const moduleName = config.moduleName ?? config.moduleDirName;
		const distFolder =
			config.moduleName && config.moduleDirName
				? `${config.moduleDirName}/dist/${config.moduleName}`
				: `${config.moduleDirName}/dist`;

		return new BunFun(this.scope, BunFunFactory.toCamelCase(moduleName), {
			functionName: `${moduleName}-${config.environment}`.toLowerCase(),
			description: `Ivr Migration Tool: ${BunFunFactory.toSentenceCase(moduleName)}: ${config.environment}`,
			entrypoint: path.join(
				__dirname,
				'..',
				'..',
				'..',
				'..',
				config.packageRoot ?? 'packages',
				`${distFolder}/index.js`,
			),
			handler: `index.handler`,
			functionsUrl: false,
			functionConfig: {
				memorySize: config.memorySize ?? 256,
				environment: config.environmentVariables,
				timeout: config.timeout ?? cdk.Duration.minutes(2),
				role: config.executionRole,
				vpc: config.vpc,
				securityGroups: config.securityGroups,
				vpcSubnets: config.vpcSubnets
			},
			bunLayer: this.bunLayerArn,
			bunConfig: {
				target: 'bun',
			},
		});
	}
}
