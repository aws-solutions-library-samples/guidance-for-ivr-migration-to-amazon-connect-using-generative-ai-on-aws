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

import { Architecture } from 'aws-cdk-lib/aws-lambda';

export interface RegionMapping {
	[region: string]: string;
}

export interface FactMappings {
	[factName: string]: RegionMapping;
}

// Fact names
export const FactNames = {
	PREFERRED_LAMBDA_ARCHITECTURE: 'PREFERRED_LAMBDA_ARCHITECTURE',
	PREFERRED_BEDROCK_MODEL: 'PREFERRED_BEDROCK_MODEL',
	PREFERRED_INFERENCE_PROFILE: 'PREFERRED_INFERENCE_PROFILE',
};

// Fact mappings
// https://aws.amazon.com/lambda/pricing/
export const preferredLambdaArchitectures: RegionMapping = {
	'us-east-1': Architecture.ARM_64.name, //	US East (N. Virginia)
	'us-east-2': Architecture.ARM_64.name, //	US East (Ohio)
	'us-west-1': Architecture.ARM_64.name, //	US West (Northern California)
	'us-west-2': Architecture.ARM_64.name, //	US West (Oregon)
	'af-south-1': Architecture.ARM_64.name, //	Africa (Cape Town)
	'ap-east-1': Architecture.ARM_64.name, //	Asia Pacific (Hong Kong)
	'ap-south-2': Architecture.ARM_64.name, //	Asia Pacific (Hyderabad)
	'ap-southeast-3': Architecture.ARM_64.name, //	Asia Pacific (Jakarta)
	'ap-southeast-4': Architecture.ARM_64.name, //	Asia Pacific (Melbourne)
	'ap-south-1': Architecture.ARM_64.name, //	Asia Pacific (Mumbai)
	'ap-northeast-3': Architecture.ARM_64.name, //	Asia Pacific (Osaka)
	'ap-northeast-2': Architecture.ARM_64.name, //	Asia Pacific (Seoul)
	'ap-southeast-1': Architecture.ARM_64.name, //	Asia Pacific (Singapore)
	'ap-southeast-2': Architecture.ARM_64.name, //	Asia Pacific (Sydney)
	'ap-northeast-1': Architecture.ARM_64.name, //	Asia Pacific (Tokyo)
	'ca-central-1': Architecture.ARM_64.name, //	Canada (Central)
	'eu-central-1': Architecture.ARM_64.name, //	Europe (Frankfurt)
	'eu-west-1': Architecture.ARM_64.name, //	Europe (Ireland)
	'eu-west-2': Architecture.ARM_64.name, //	Europe (London)
	'eu-south-1': Architecture.ARM_64.name, //	Europe (Milan)
	'eu-west-3': Architecture.ARM_64.name, //	Europe (Paris)
	'eu-south-2': Architecture.X86_64.name, //	Europe (Spain)
	'eu-north-1': Architecture.ARM_64.name, //	Europe (Stockholm)
	'eu-central-2': Architecture.X86_64.name, //	Europe (Zurich)
	'me-south-1': Architecture.ARM_64.name, //	Middle East (Bahrain)
	'me-central-1': Architecture.X86_64.name, //	Middle East (UAE)
	'sa-east-1': Architecture.ARM_64.name, //	South America (Sao Paulo)
	'us-gov-east-1': Architecture.X86_64.name, //	AWS GovCloud (US-East)
	'us-gov-west-1': Architecture.X86_64.name, //	AWS GovCloud (US-West)
};

export const preferredBedrockModels: RegionMapping = {
	'us-east-1': 'anthropic.claude-3-5-sonnet-20241022-v2:0', //	US East (N. Virginia)
	'us-east-2': 'anthropic.claude-3-5-sonnet-20241022-v2:0', //	US East (Ohio)
	'us-west-1': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	US West (Northern California)
	'us-west-2': 'anthropic.claude-3-5-sonnet-20241022-v2:0', //	US West (Oregon)
	'af-south-1': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Africa (Cape Town)
	'ap-east-1': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Asia Pacific (Hong Kong)
	'ap-south-2': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Asia Pacific (Hyderabad)
	'ap-southeast-3': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Asia Pacific (Jakarta)
	'ap-southeast-4': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Asia Pacific (Melbourne)
	'ap-south-1': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Asia Pacific (Mumbai)
	'ap-northeast-3': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Asia Pacific (Osaka)
	'ap-northeast-2': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Asia Pacific (Seoul)
	'ap-southeast-1': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Asia Pacific (Singapore)
	'ap-southeast-2': 'anthropic.claude-3-5-sonnet-20241022-v2:0', //	Asia Pacific (Sydney)
	'ap-northeast-1': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Asia Pacific (Tokyo)
	'ca-central-1': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Canada (Central)
	'eu-central-1': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Europe (Frankfurt)
	'eu-west-1': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Europe (Ireland)
	'eu-west-2': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Europe (London)
	'eu-south-1': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Europe (Milan)
	'eu-west-3': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Europe (Paris)
	'eu-south-2': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Europe (Spain)
	'eu-north-1': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Europe (Stockholm)
	'eu-central-2': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Europe (Zurich)
	'me-south-1': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Middle East (Bahrain)
	'me-central-1': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	Middle East (UAE)
	'sa-east-1': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	South America (Sao Paulo)
	'us-gov-east-1': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	AWS GovCloud (US-East)
	'us-gov-west-1': 'anthropic.claude-3-5-sonnet-20240620-v1:0', //	AWS GovCloud (US-West)
};

export const preferredInferenceProfiles: RegionMapping = {
	'us-east-1': 'us.anthropic.claude-3-5-sonnet-20241022-v2:0', //	US East (N. Virginia)
	'us-east-2': 'us.anthropic.claude-3-5-sonnet-20241022-v2:0', //	US East (Ohio)
	'us-west-2': 'us.anthropic.claude-3-5-sonnet-20241022-v2:0', //	US West (Oregon)
	'ap-northeast-1': 'apac.anthropic.claude-3-5-sonnet-20241022-v2:0', //	Asia Pacific (Tokyo)
	'ap-northeast-2': 'apac.anthropic.claude-3-5-sonnet-20241022-v2:0', //	Asia Pacific (Seoul)
	'ap-south-1': 'apac.anthropic.claude-3-5-sonnet-20241022-v2:0', //	Asia Pacific (Mumbai)
	'ap-southeast-1': 'apac.anthropic.claude-3-5-sonnet-20241022-v2:0', //	Asia Pacific (Singapore)
	'ap-southeast-2': 'apac.anthropic.claude-3-5-sonnet-20241022-v2:0', //	Asia Pacific (Sydney)
	'eu-central-1': 'eu.anthropic.claude-3-5-sonnet-20240620-v1:0', //	Europe (Frankfurt)
	'eu-west-1': 'eu.anthropic.claude-3-5-sonnet-20240620-v1:0', //	Europe (Ireland)
	'eu-west-3': 'eu.anthropic.claude-3-5-sonnet-20240620-v1:0', //	Europe (Paris)
};

export const factMappings: FactMappings = {
	[FactNames.PREFERRED_LAMBDA_ARCHITECTURE]: preferredLambdaArchitectures,
	[FactNames.PREFERRED_BEDROCK_MODEL]: preferredBedrockModels,
	[FactNames.PREFERRED_INFERENCE_PROFILE]: preferredInferenceProfiles,
};
