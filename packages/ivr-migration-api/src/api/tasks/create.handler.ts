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
import { recommendationTaskCreateRequestExample, recommendationTaskResourceExample } from './examples.js';
import { RecommendationTaskService } from './service.js';
import { badRequestResponse, commonHeaders } from '../../common/schemas.js';
import { atLeastContributor } from '../../common/scopes.js';
import { apiVersion100, type FastifyTypebox } from '../../common/types.js';
import { RecommendationTaskApiSchema } from '@ivr-migration-tool/schemas';

export default function createRecommendationTaskRoute(fastify: FastifyTypebox, _options: unknown, done: () => void): void {
	fastify.route({
		method: 'POST',
		url: '/recommendationTasks',
		schema: {
			description: `Create a recommendation tasks in bulk`,
			headers: commonHeaders,
			tags: ['Recommendation Tasks'],
			body: {
				...Type.Ref(RecommendationTaskApiSchema.taskNew),
				'x-examples': {
					'new recommendation task request': {
						value: recommendationTaskCreateRequestExample,
					},
				},
			},
			response: {
				201: {
					description: 'Success.',
					...Type.Ref(RecommendationTaskApiSchema.taskResource),
					'x-examples': {
						'Execution creation task': {
							summary: 'Existing execution task detail.',
							value: recommendationTaskResourceExample,
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
			const svc: RecommendationTaskService = fastify.diContainer.resolve('recommendationTaskService');
			const saved = await svc.create(request.authz, request.body);
			return reply.header('x-id', saved.id).status(201).send(saved); // nosemgrep
		},
	});

	done();
}
