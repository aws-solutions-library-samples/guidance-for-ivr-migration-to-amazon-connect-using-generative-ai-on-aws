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
import { commonHeaders, countPaginationQS, fromTokenPaginationQS, } from '../../common/schemas.js';
import { type FastifyTypebox, apiVersion100 } from '../../common/types.js';
import { atLeastReader } from '../../common/scopes.js';
import { testExecutionResourceListExample } from './examples.js';
import { BotsApiSchema, TestExecutionsApiSchema } from '@ivr-migration-tool/schemas';

export default function listTestExecutionsRoute(fastify: FastifyTypebox, _options: unknown, done: () => void): void {
    fastify.route({
        method: 'GET',
        url: '/bots/:botId/testExecutions',

        schema: {
            summary: 'List all test executions.',
            description: `List all test executions.

Permissions:
- \`readers\` may list test executions.
`,
            tags: ['TestExecution'],
            operationId: 'listTestExecutions',
            headers: commonHeaders,
            querystring: Type.Object({
                count: countPaginationQS,
                token: fromTokenPaginationQS,
            }),
            params: Type.Object({
                botId: BotsApiSchema.botId,
            }),
            response: {
                200: {
                    description: 'Success.',
                    ...TestExecutionsApiSchema.testExecutionListResource,
                    'x-examples': {
                        'List of bots': {
                            summary: 'Paginated list of test execution.',
                            value: testExecutionResourceListExample,
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
            const svc = fastify.diContainer.resolve('testExecutionsService');

            // parse request
            const { token, count } = request.query;
            const { botId } = request.params;
            const [testExecutions, nextToken] = await svc.list(request.authz, botId, {
                token,
                count
            });

            const response: TestExecutionsApiSchema.TestExecutionListResource = { testExecutions };
            if (nextToken) {
                response.pagination = {
                    count,
                    token: nextToken,
                };
            }

            fastify.log.debug(`list.handler> exit:${JSON.stringify(response)}`);
            await reply.status(200).send(response); // nosemgrep
        },
    });

    done();
}
