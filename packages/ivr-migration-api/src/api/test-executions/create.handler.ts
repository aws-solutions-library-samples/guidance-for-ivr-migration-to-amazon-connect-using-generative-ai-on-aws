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
import { createTestExecutionExample, testExecutionResourceExample } from './examples.js';
import { apiVersion100, type FastifyTypebox } from '../../common/types.js';
import { badRequestResponse, commonHeaders } from '../../common/schemas.js';
import { atLeastContributor } from '../../common/scopes.js';
import type { TestExecutionsService } from './service.js';
import { BotsApiSchema, TestExecutionsApiSchema } from '@ivr-migration-tool/schemas';

export default function createTestExecutionRoute(fastify: FastifyTypebox, _options: unknown, done: () => void): void {
	fastify.route({
		method: 'POST',
		url: '/bots/:botId/testExecutions',
		schema: {
			description: `Create a test execution`,
			headers: commonHeaders,
			tags: ['TestExecution'],
			params: Type.Object({
				botId: BotsApiSchema.botId,
			}),
			body: {
				...Type.Ref(TestExecutionsApiSchema.createTestExecutionResource),
				'x-examples': {
					'new test execution request': {
						value: createTestExecutionExample,
					},
				},
			},
			response: {
				201: {
					description: 'Success.',
					...Type.Ref(TestExecutionsApiSchema.testExecutionResource),
					'x-examples': {
						'Bot': {
							summary: 'Existing Test Execution.',
							value: testExecutionResourceExample,
						},
					},
				},
				400: badRequestResponse,
			},
			'x-security-scopes': atLeastContributor,
		},
		constraints: {
			version: apiVersion100,
		},

		handler: async (request, reply) => {
			const svc: TestExecutionsService = fastify.diContainer.resolve('testExecutionsService');
			const { botId } = request.params;
			const saved = await svc.create(request.authz, botId, request.body);
			return reply.header('x-id', saved.id).status(201).send(saved); // nosemgrep
		},
	});

	done();
}
