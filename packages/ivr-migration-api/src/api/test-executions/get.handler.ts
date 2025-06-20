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

import { Type } from '@sinclair/typebox';
import { testExecutionResourceExample } from './examples';
import { apiVersion100, type FastifyTypebox } from '../../common/types';
import { forbiddenResponse, notFoundResponse } from '../../common/schemas';
import { atLeastReader } from '../../common/scopes';
import { TestExecutionsService } from './service';
import { BotsApiSchema, TestExecutionsApiSchema } from '@ivr-migration-tool/schemas';

export default function getTestExecutionRoute(fastify: FastifyTypebox, _options: unknown, done: () => void): void {
	fastify.route({
		method: 'GET',
		url: '/bots/:botId/testExecutions/:id',

		schema: {
			description: `Retrieve details of an existing test execution`,
			tags: ['TestExecution'],
			params: Type.Object({
				botId: BotsApiSchema.botId,
				id: TestExecutionsApiSchema.id
			}),
			response: {
				200: {
					description: 'Success.',
					...Type.Ref(TestExecutionsApiSchema.testExecutionResource),
					'x-examples': {
						'Existing Test Execution': {
							summary: 'Existing Test Execution.',
							value: testExecutionResourceExample,
						},
					},
				},
				403: forbiddenResponse,
				404: notFoundResponse,
			},
			'x-security-scopes': atLeastReader,
		},
		constraints: {
			version: apiVersion100,
		},

		handler: async (request, reply) => {
			const svc: TestExecutionsService = fastify.diContainer.resolve('testExecutionsService');
			const { id, botId } = request.params;
			const saved = await svc.get(request.authz, botId, id);
			return reply.status(200).send(saved); // nosemgrep
		},
	});

	done();
}
