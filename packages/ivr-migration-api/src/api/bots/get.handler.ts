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
import { botResourceExample } from './examples';
import { apiVersion100, type FastifyTypebox } from '../../common/types';
import { forbiddenResponse, notFoundResponse } from '../../common/schemas';
import { atLeastReader } from '../../common/scopes';
import type { BotsService } from './service';
import { BotsApiSchema } from '@ivr-migration-tool/schemas';

export default function getBotRoute(fastify: FastifyTypebox, _options: unknown, done: () => void): void {
	fastify.route({
		method: 'GET',
		url: '/bots/:id',

		schema: {
			description: `Retrieve details of an existing bot`,
			tags: ['Bot'],
			params: Type.Object({
				id: BotsApiSchema.botId,
			}),
			response: {
				200: {
					description: 'Success.',
					...Type.Ref(BotsApiSchema.botResource),
					'x-examples': {
						'Existing Execution Task': {
							summary: 'Existing Execution Task details.',
							value: botResourceExample,
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
			const svc: BotsService = fastify.diContainer.resolve('botsService');
			const { id } = request.params;
			const saved = await svc.get(request.authz, id);
			return reply.status(200).send(saved); // nosemgrep
		},
	});

	done();
}
