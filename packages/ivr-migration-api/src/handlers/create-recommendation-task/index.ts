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
import type { SQSBatchItemFailure, SQSEvent } from "aws-lambda";
import stringify from "json-stringify-safe";
import { buildLightApp } from "../../app.light";
import type { FastifyInstance } from "fastify";
import type { AwilixContainer } from 'awilix';
import type { CreateRecommendationInput, CreateRecommendationTask } from "../../tasks/createRecommendationTask";

const app: FastifyInstance = await buildLightApp();
const di: AwilixContainer = app.diContainer;
const task = di.resolve<CreateRecommendationTask>('createRecommendationTask');

export default {
    async handler(request: { aws: SQSEvent }): Promise<Response> {
        app.log.debug(`in: request: ${stringify(request)}`);
        const batchItemFailures: SQSBatchItemFailure[] = [];
        for (const record of request.aws.Records) {
            const message: CreateRecommendationInput = JSON.parse(record.body);
            try {
                await task.process(message);
            } catch (err) {
                if (err instanceof Error && err.name !== 'ConditionalCheckFailedException') {
                    app.log.error(`${err.name}: ${err.message}`, err);
                    batchItemFailures.push({ itemIdentifier: record.messageId });
                }
            }
        }
        app.log.debug(`exit`);
        return new Response(stringify({ batchItemFailures: batchItemFailures }));
    },
};
