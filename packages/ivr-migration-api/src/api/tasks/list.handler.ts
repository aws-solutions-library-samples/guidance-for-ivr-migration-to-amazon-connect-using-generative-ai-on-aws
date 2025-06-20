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
import { recommendationTaskResourceListExample } from './examples.js';
import { RecommendationTaskService } from './service.js';
import { RecommendationTaskApiSchema, TestExecutionsApiSchema } from '@ivr-migration-tool/schemas';
import { countPaginationQS, fromTokenPaginationQS } from '../../common/schemas.js';
import { apiVersion100, type FastifyTypebox } from '../../common/types.js';
import { atLeastReader } from '../../common/scopes.js';

export default function listRecommendationTasksRoute(fastify: FastifyTypebox, _options: unknown, done: () => void): void {
	fastify.route({
		method: 'GET',
		url: '/testExecutions/:testExecutionId/recommendationTasks',
		schema: {
			description: `Lists Execution Tasks`,
			tags: ['Execution Tasks'],
			querystring: Type.Object({
				count: countPaginationQS,
				fromTaskId: fromTokenPaginationQS,
			}),
			params: Type.Object({
				testExecutionId: TestExecutionsApiSchema.id
			}),
			response: {
				200: {
					description: 'Success.',
					...Type.Ref(RecommendationTaskApiSchema.taskList),
					'x-examples': {
						'List of Execution Tasks': {
							summary: 'Paginated list of executionTasks',
							value: recommendationTaskResourceListExample,
						},
					},
				},
			},
			'x-security-scopes': atLeastReader,
		},
		constraints: {
			version: apiVersion100,
		},

		handler: async (request, reply) => {
			const svc: RecommendationTaskService = fastify.diContainer.resolve('recommendationTaskService');

			// parse request
			const { count, fromTaskId: fromToken } = request.query;

			const { testExecutionId } = request.params;

			const [tasks, lastEvaluatedToken] = await svc.list(request.authz, testExecutionId, {
				count,
				token: fromToken,
			});

			const response: RecommendationTaskApiSchema.TaskList = { tasks };

			if (count || lastEvaluatedToken) {
				response.pagination = {};
				if (lastEvaluatedToken) {
					response.pagination.lastEvaluated = lastEvaluatedToken;
				}
			}

			fastify.log.debug(`list.handler> exit:${JSON.stringify(response)}`);
			await reply.status(200).send(response); // nosemgrep
		},
	});

	done();
}
