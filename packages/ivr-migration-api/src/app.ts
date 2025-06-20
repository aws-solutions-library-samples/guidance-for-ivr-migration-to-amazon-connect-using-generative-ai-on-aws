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

import cors from '@fastify/cors';
import fastifySensible from '@fastify/sensible';
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import type { FastifyInstance } from 'fastify';
import { fastify } from 'fastify';
import { handleError } from './common/errors.js';
import { authzPlugin } from './plugins/authz.js';
import config from './plugins/config.js';
import moduleAwilix from './plugins/module.awilix.js';
import swagger from './plugins/swagger.js';
import listBotsRoute from './api/bots/list.handler.js';
import createBotRoute from './api/bots/create.handler.js';
import deleteBotRoute from './api/bots/delete.handler.js';
import listTestSetsRoute from './api/test-sets/list.handler.js';
import getTestSetRoute from './api/test-sets/get.handler.js';
import createTestSetRoute from './api/test-sets/create.handler.js';
import deleteTestSetRoute from './api/test-sets/delete.handler.js';
import getBotRoute from './api/bots/get.handler.js';
import buildBotRoute from './api/bots/build.handler.js';
import { BotsApiSchema, RecommendationTaskApiSchema, TestExecutionsApiSchema, TestSetsApiSchema } from '@ivr-migration-tool/schemas';
import createTestExecutionRoute from './api/test-executions/create.handler.js';
import getTestExecutionRoute from './api/test-executions/get.handler.js';
import listTestExecutionsRoute from './api/test-executions/list.handler.js';
import createTestSetUploadUrlRoute from './api/test-sets/createUploadUrl.handler.js';
import createRecommendationTaskRoute from './api/tasks/create.handler.js';
import listRecommendationTasksRoute from './api/tasks/list.handler.js';
import getRecommendationTaskRoute from './api/tasks/get.handler.js';
import listRecommendationTaskItemsRoute from './api/taskItems/list.handler.js';
import getRecommendationTaskItemRoute from './api/taskItems/get.handler.js';
import { taskItemList, taskItemResource } from '../../ivr-migration-schemas/src/models/task-items/schemas.js';

export const buildApp = async (): Promise<FastifyInstance> => {
    const node_env = process.env['NODE_ENV'] as string;
    const logLevel = process.env['LOG_LEVEL'] as string;
    const envToLogger: Record<string, any> = {
        local: {
            level: logLevel ?? 'debug',
            // transport: {
            //     target: 'pino-pretty',
            //     options: {
            //         translateTime: 'HH:MM:ss Z',
            //         ignore: 'pid,hostname',
            //     },
            // },
        },
        cloud: {
            level: logLevel ?? 'warn',
        },
    };

    const app = fastify({
        logger: envToLogger[node_env] ?? {
            level: logLevel ?? 'info',
        },
        ajv: {
            customOptions: {
                strict: 'log',
                keywords: ['kind', 'modifier'],
            },
            plugins: [
                // eslint-disable-next-line @typescript-eslint/typedef
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                function (ajv: any) {
                    ajv.addKeyword({ keyword: 'x-examples' });
                },
            ],
        },
    }).withTypeProvider<TypeBoxTypeProvider>();

    app.setErrorHandler(handleError);

    // register all plugins
    await app.register(config);
    await app.register(swagger);
    await app.register(cors, { methods: ['GET', 'HEAD', 'POST', 'DELETE'] });
    await app.register(authzPlugin);
    await app.register(moduleAwilix);
    await app.register(fastifySensible);

    // Add reference to Bot
    app.addSchema(BotsApiSchema.botResource);
    app.addSchema(BotsApiSchema.botListResource);
    app.addSchema(BotsApiSchema.createBotResource);
    await app.register(listBotsRoute);
    await app.register(createBotRoute);
    await app.register(deleteBotRoute);
    await app.register(getBotRoute);
    await app.register(buildBotRoute);

    // Add reference to Test Set
    app.addSchema(TestSetsApiSchema.testSetResource);
    app.addSchema(TestSetsApiSchema.testSetListResource);
    app.addSchema(TestSetsApiSchema.createTestSetResource);
    app.addSchema(TestSetsApiSchema.testSetUploadUrlResource);
    await app.register(listTestSetsRoute);
    await app.register(getTestSetRoute);
    await app.register(createTestSetRoute);
    await app.register(deleteTestSetRoute);
    await app.register(createTestSetUploadUrlRoute);

    // Add reference to Test Execution  
    app.addSchema(TestExecutionsApiSchema.testExecutionResource);
    app.addSchema(TestExecutionsApiSchema.testExecutionListResource);
    app.addSchema(TestExecutionsApiSchema.createTestExecutionResource);
    await app.register(createTestExecutionRoute);
    await app.register(getTestExecutionRoute);
    await app.register(listTestExecutionsRoute);

    app.addSchema(RecommendationTaskApiSchema.taskNew)
    app.addSchema(RecommendationTaskApiSchema.taskResource);
    app.addSchema(RecommendationTaskApiSchema.taskList);
    await app.register(createRecommendationTaskRoute);
    await app.register(listRecommendationTasksRoute);
    await app.register(getRecommendationTaskRoute);

    app.addSchema(taskItemResource);
    app.addSchema(taskItemList);
    await app.register(listRecommendationTaskItemsRoute);
    await app.register(getRecommendationTaskItemRoute);

    return app as unknown as FastifyInstance;
};
