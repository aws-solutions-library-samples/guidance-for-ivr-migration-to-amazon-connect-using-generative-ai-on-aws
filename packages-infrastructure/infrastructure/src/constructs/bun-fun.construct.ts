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

import { CfnOutput } from 'aws-cdk-lib';
import { AnyPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { FunctionOptions, FunctionUrlAuthType } from 'aws-cdk-lib/aws-lambda';
import { Architecture, Code, Function, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import * as Bun from 'bun';
import { Construct } from 'constructs';
import path from 'node:path';

/**
 * Base interface for BunFun Lambda function properties
 * @interface BunFunPropsBase
 * @property {string} entrypoint - Path to the entry point file for the Lambda function
 * @property {string} handler - Handler function name in the format "file.handler"
 * @property {string} functionName - Name of the Lambda function
 * @property {string} description - Description of the Lambda function
 * @property {string} bunLayer - ARN of the Bun runtime layer
 * @property {FunctionOptions} [functionConfig] - Optional Lambda function configuration options
 * @property {Object} [bunConfig] - Optional Bun build configuration
 */
export interface BunFunPropsBase {
	entrypoint: string;
	handler: string;
	functionName: string;
	description: string;
	bunLayer: string; // in case you bring your own layer
	functionConfig?: FunctionOptions;
	bunConfig?: Omit<Bun.BuildConfig, 'entrypoints' | 'target'> & {
		target: Bun.Target;
	};
}

export interface BunFunPropsWithFunctionUrl extends BunFunPropsBase {
	functionsUrl: true;
	functionUrlAuthType: FunctionUrlAuthType;
}

export interface BunFunPropsWithoutFunctionUrl extends BunFunPropsBase {
	functionsUrl?: false;
}

type BunFunProps = BunFunPropsWithFunctionUrl | BunFunPropsWithoutFunctionUrl;

/**
 * BunFun is a CDK construct that creates a Lambda function using the Bun runtime.
 * It supports both standard Lambda functions and function URLs, and configures the necessary
 * IAM permissions and layers for running Bun in Lambda.
 * 
 * The construct requires a Bun layer ARN to be provided and supports custom function 
 * configurations through the props parameter.
 */
export class BunFun extends Construct {
	public readonly lambda: Function;

	constructor(scope: Construct, id: string, props: BunFunProps) {
		super(scope, id);

		const bunPath = path.dirname(props.entrypoint);
		const layer = LayerVersion.fromLayerVersionArn(this, 'imported-BunFunLayerVersion', props.bunLayer);

		this.lambda = new Function(this, 'BunFunction', {
			functionName: props.functionName,
			description: props.description,
			code: Code.fromAsset(bunPath),
			handler: props.handler,
			runtime: Runtime.PROVIDED_AL2,
			layers: [layer],
			architecture: Architecture.ARM_64,
			...props.functionConfig,
		});

		this.lambda.addToRolePolicy(
			new PolicyStatement({
				actions: ['lambda:GetLayerVersion'],
				resources: [props.bunLayer],
			}),
		);

		if (props.functionsUrl) {
			this.lambda.addPermission('InvokeFunctionsUrl', {
				principal: new AnyPrincipal(),
				action: 'lambda:InvokeFunctionUrl',
				functionUrlAuthType: props.functionUrlAuthType,
			});

			const fnUrl = this.lambda.addFunctionUrl({
				authType: props.functionUrlAuthType,
			});

			new CfnOutput(this, `${props.handler}Url`, {
				value: fnUrl.url,
			});
		}
	}
}
