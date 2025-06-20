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
import { recommendationTaskItemResourceList } from './example.js';
import { commonHeaders, countPaginationQS, fromIdPaginationQS } from '../../common/schemas.js';
import { apiVersion100, type FastifyTypebox } from '../../common/types.js';
import { atLeastReader } from '../../common/scopes.js';
import { RecommendationTaskItemsApiSchema } from '@ivr-migration-tool/schemas';

export default function listRecommendationTaskItemsRoute(fastify: FastifyTypebox, _options: unknown, done: () => void): void {
	fastify.route({
		method: 'GET',
		url: '/recommendationTasks/:taskId/taskItems',
		schema: {
			description: `Lists execution task items`,
			tags: ['Task Items'],
			operationId: 'listExecutionTaskItems',
			headers: commonHeaders,
			params: Type.Object({
				taskId: RecommendationTaskItemsApiSchema.taskId,
			}),
			querystring: Type.Object({
				count: countPaginationQS,
				fromDate: fromIdPaginationQS,
			}),
			response: {
				200: {
					description: 'Success.',
					...Type.Ref(RecommendationTaskItemsApiSchema.taskItemList),
					'x-examples': {
						'List of task items': {
							summary: 'Paginated list of execution task items',
							value: recommendationTaskItemResourceList,
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
			const svc = fastify.diContainer.resolve('recommendationTaskItemService');

			// parse request
			const { count, fromDate } = request.query;
			const { taskId } = request.params;

			const [taskItems, lastEvaluatedId] = await svc.list(request.authz, taskId, {
				count,
				token: fromDate,
			});
			const response: RecommendationTaskItemsApiSchema.TaskItemList = { taskItems: taskItems };
			if (count || lastEvaluatedId) {
				response.pagination = {};
				if (count) {
					response.pagination.count = count;
				}
				if (lastEvaluatedId) {
					response.pagination.token = lastEvaluatedId;
				}
			}

			fastify.log.debug(`list.handler> exit:${JSON.stringify(response)}`);
			await reply.status(200).send(response); // nosemgrep
		},
	});

	done();
}
