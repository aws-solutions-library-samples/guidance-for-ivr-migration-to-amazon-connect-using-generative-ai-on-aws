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

import type { FastifyInstance } from "fastify";
import { buildLightApp } from "../app.light";
import type { AwilixContainer } from 'awilix';
import stringify from "json-stringify-safe";

const app: FastifyInstance = await buildLightApp();
const di: AwilixContainer = app.diContainer;

/**
 * Creates a task handler function for AWS Lambda
 * @param taskResolverKey - The dependency injection key to resolve the task implementation
 * @template TInput - The type of input data expected by the task
 * @returns Object containing the handler function for processing Lambda events
 */
export function createTaskHandler<TInput>(
    taskResolverKey: string
) {
    const task = di.resolve(taskResolverKey);
    return {
        async handler(event: { aws: TInput }): Promise<Response> {
            app.log.debug(`${taskResolverKey} > handler > event: ${JSON.stringify(event)}`);

            let response: Response;
            try {
                const result = await task.process(event.aws);
                response = new Response(stringify(result), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } catch (err: any) {
                app.log.error(`${taskResolverKey} > handler > error: ${err}`);
                if (typeof err === 'string') {
                    err = new Error(err);
                    err.name = 'RuntimeError';
                }
                response = new Response(JSON.stringify(err), {
                    status: 500,
                    statusText: 'BunLambdaError',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            return response;
        }
    };
}
