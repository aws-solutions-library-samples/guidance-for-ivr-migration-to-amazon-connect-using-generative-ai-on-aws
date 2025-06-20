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
import { testSetListResourceExample } from './examples.js';
import { TestSetsApiSchema } from '@ivr-migration-tool/schemas';

export default function listTestSetsRoute(fastify: FastifyTypebox, _options: unknown, done: () => void): void {
    fastify.route({
        method: 'GET',
        url: '/testSets',
        schema: {
            summary: 'List all test sets.',
            description: `List all test sets.

Permissions:
- \`readers\` may list all tests.
`,
            tags: ['TestSet'],
            operationId: 'listTestSets',
            headers: commonHeaders,
            querystring: Type.Object({
                count: countPaginationQS,
                token: fromTokenPaginationQS,
            }),
            response: {
                200: {
                    description: 'Success.',
                    ...TestSetsApiSchema.testSetListResource,
                    'x-examples': {
                        'List of test sets': {
                            summary: 'Paginated list of test sets.',
                            value: testSetListResourceExample,
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
            const svc = fastify.diContainer.resolve('testSetsService');

            // parse request
            const { token, count } = request.query;
            const [testSets, nextToken] = await svc.list(request.authz, {
                token,
                count
            });

            const response: TestSetsApiSchema.TestSetList = { testSets: testSets };
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
