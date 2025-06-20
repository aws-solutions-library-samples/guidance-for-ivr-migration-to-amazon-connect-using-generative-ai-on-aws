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
import { AssumeRoleCommand, STSClient } from '@aws-sdk/client-sts';
import * as fs from 'fs';

const { ENVIRONMENT, AWS_REGION } = process.env;

if (!ENVIRONMENT || !AWS_REGION) {
	throw new Error(`Environment Variable ENVIRONMENT or AWS_REGION is not being specified`);
}

console.log(`ENVIRONMENT: ${ENVIRONMENT}\r\nREGION: ${AWS_REGION}`);

const stsClient = new STSClient({ region: AWS_REGION });

let credentials: { accessKeyId: string; secretAccessKey: string; sessionToken: string } | undefined;

if (process.env['AWS_CREDS_TARGET_ROLE']) {
	const results = await stsClient.send(
		new AssumeRoleCommand({
			RoleArn: process.env['AWS_CREDS_TARGET_ROLE'],
			RoleSessionName: 'generateConfigSession',
			DurationSeconds: 900,
		})
	);
	credentials = {
		accessKeyId: results.Credentials!.AccessKeyId!,
		secretAccessKey: results.Credentials!.SecretAccessKey!,
		sessionToken: results.Credentials!.SessionToken!,
	};
}

const ssmClient = new SSMClient({ region: AWS_REGION, credentials });

const sentrixConfiguration: Record<string, string> = {
	NODE_ENV: 'local',
	VITE_COGNITO_USER_POOL_REGION: AWS_REGION,
	VITE_REGION: AWS_REGION,
};

const getValues = async (module: string, mapping: Record<string, string>) => {
	for (const key in mapping) {
		const prefix = `/ivr-migration-tool/${ENVIRONMENT}/${module}/`;
		const name = `${prefix}${mapping[key]}`;
		try {
			const response = await ssmClient.send(
				new GetParameterCommand({
					Name: name,
					WithDecryption: false,
				})
			);
			sentrixConfiguration[key] = response!.Parameter!.Value!;
		} catch (e) {
			throw new Error(`Parameter ${name} NOT Found !!!, error: ${e}`);
		}
	}
};

await Promise.all([
	getValues('shared', {
		VITE_COGNITO_USER_POOL_ID: 'cognitoUserPoolId',
		VITE_COGNITO_USER_POOL_CLIENT_ID: 'cognitoUserPoolClientId',
	}),
	getValues('app', {
		VITE_API_ENDPOINT: 'apiUrl',
		VITE_APPSYNC_ENDPOINT: 'appSyncUrl'
	})
]);

fs.writeFileSync(
	'./public/aws-exports.json',
	JSON.stringify({
		"region": sentrixConfiguration['VITE_REGION'],
		"Auth": {
			"Cognito": {
				"userPoolId": sentrixConfiguration['VITE_COGNITO_USER_POOL_ID'],
				"userPoolClientId": sentrixConfiguration['VITE_COGNITO_USER_POOL_CLIENT_ID'],
			}
		},
		"API": {
			"REST": {
				"RestApi": {
					"endpoint": sentrixConfiguration['VITE_API_ENDPOINT']
				}
			},
			"Events": {
				"endpoint": sentrixConfiguration['VITE_APPSYNC_ENDPOINT'],
				"region": sentrixConfiguration['VITE_REGION'],
				"defaultAuthMode": "userPool"
			},
		}
	}
	)
);
