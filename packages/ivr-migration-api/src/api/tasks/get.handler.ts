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
import { recommendationTaskResourceExample } from './examples.js';
import { RecommendationTaskService } from './service.js';
import { apiVersion100, type FastifyTypebox } from '../../common/types.js';
import { forbiddenResponse, notFoundResponse } from '../../common/schemas.js';
import { atLeastReader } from '../../common/scopes.js';
import { RecommendationTaskApiSchema, TestExecutionsApiSchema } from '@ivr-migration-tool/schemas';

export default function getRecommendationTaskRoute(fastify: FastifyTypebox, _options: unknown, done: () => void): void {
	fastify.route({
		method: 'GET',
		url: '/testExecutions/:testExecutionId/recommendationTasks/:id',

		schema: {
			description: `Retrieve details of an existing execution task`,
			tags: ['Execution Tasks'],
			params: Type.Object({
				id: RecommendationTaskApiSchema.id,
				testExecutionId: TestExecutionsApiSchema.id
			}),
			response: {
				200: {
					description: 'Success.',
					...Type.Ref(RecommendationTaskApiSchema.taskResource),
					'x-examples': {
						'Existing Execution Task': {
							summary: 'Existing Execution Task details.',
							value: recommendationTaskResourceExample,
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
			const svc: RecommendationTaskService = fastify.diContainer.resolve('recommendationTaskService');
			const { testExecutionId, id } = request.params;
			const saved = await svc.get(request.authz, testExecutionId, id);
			return reply.status(200).send(saved); // nosemgrep
		},
	});

	done();
}
