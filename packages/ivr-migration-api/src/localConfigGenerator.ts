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

import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import * as fs from 'fs';

const { ENVIRONMENT, AWS_REGION } = process.env;

if (!ENVIRONMENT || !AWS_REGION) {
	throw new Error(`Environment variable ENVIRONMENT or AWS_REGION is not specified.`);
}

const ssm = new SSMClient({ region: process.env['AWS_REGION'] });

const getValues = async (module: string, mapping: Record<string, string>) => {
	for (const key in mapping) {
		const prefix = `/ivr-migration-tool/${ENVIRONMENT}/${module}/`;
		const name = `${prefix}${mapping[key]}`;
		try {
			const response = await ssm.send(
				new GetParameterCommand({
					Name: name,
					WithDecryption: false,
				})
			);
			if (response) {
				outputFile += `${key}=${response.Parameter?.Value}\r\n`;
			}
		} catch (e) {
			console.log(e);
			throw new Error(`
			*************************************************************************************************************************************************************
				Parameter ${name} not Found!
				This means either the ENVIRONMENT / AWS_REGION is incorrect, or the AWS credentials being used are invalid.
			*************************************************************************************************************************************************************
`);
		}
	}
};

let outputFile = `
NODE_ENV=local
REDIS_ENDPOINT=127.0.0.1
AWS_XRAY_CONTEXT_MISSING=IGNORE_ERROR
`;

await getValues('shared', {
	BUCKET_NAME: 'artifactBucket',
});

await getValues('app', {
	TABLE_NAME: 'tableName',
	MODEL_ID: 'modelId',
	EVENT_BUS_NAME: 'eventBusName',
	EVENT_API_ENDPOINT: 'appSyncUrl',
	LEX_ROLE_ARN: 'lexRoleArn',
	TASK_QUEUE_URL: 'taskQueueUrl',
	EVENT_API_KEY: 'eventApiKey'

});

fs.writeFileSync('.env', outputFile);
