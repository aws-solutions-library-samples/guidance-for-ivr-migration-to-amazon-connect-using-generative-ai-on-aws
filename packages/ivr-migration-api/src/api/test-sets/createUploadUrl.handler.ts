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
import { testSetUploadUrlExampe } from './examples';
import { apiVersion100, type FastifyTypebox } from '../../common/types';
import { forbiddenResponse, notFoundResponse } from '../../common/schemas';
import { atLeastReader } from '../../common/scopes';
import type { TestSetsService } from './service';
import { TestSetsApiSchema } from '@ivr-migration-tool/schemas';

export default function createTestSetUploadUrlRoute(fastify: FastifyTypebox, _options: unknown, done: () => void): void {
    fastify.route({
        method: 'POST',
        url: '/testSets/:id/uploadUrl',
        schema: {
            description: `Create a signed url to upload the test set file`,
            tags: ['TestSet'],
            params: Type.Object({
                id: TestSetsApiSchema.testSetId,
            }),
            response: {
                200: {
                    description: 'Success.',
                    ...Type.Ref(TestSetsApiSchema.testSetUploadUrlResource),
                    'x-examples': {
                        'Test Set Upload Url': {
                            summary: 'Url for user to upload an updated test set.',
                            value: testSetUploadUrlExampe,
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
            const svc: TestSetsService = fastify.diContainer.resolve('testSetsService');
            const { id } = request.params;
            const saved = await svc.createUploadUrl(request.authz, id);
            return reply.status(200).send(saved); // nosemgrep
        },
    });

    done();
}
