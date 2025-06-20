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

import { type S3Client } from '@aws-sdk/client-s3';
import type { BotsService } from '../api/bots/service';
import { type Logger } from 'pino';
import { getLogger } from '../common/logger';
import ow from 'ow';
import stringify from 'json-stringify-safe';
import { BaseGeneratorTask, type GenerateIntentInput, type GenerateIntentOutput } from './baseGeneratorTask';
import type { LLMTransformer, TRSXTransformer } from '@ivr-migration-tool/transformer';
export class GenerateIntentTask extends BaseGeneratorTask<GenerateIntentInput, GenerateIntentOutput> {
    constructor(
        protected readonly log: Logger<any, boolean>,
        protected readonly botsService: BotsService,
        protected readonly s3Client: S3Client,
        protected readonly transformer: TRSXTransformer,
        private readonly llmTransformer: LLMTransformer,
    ) {
        super(log, botsService, s3Client, transformer);
    }

    public async process(event: GenerateIntentInput): Promise<GenerateIntentOutput> {
        const logger = getLogger(this.log, 'generateIntentTask', 'process');
        logger.trace(`in: event: ${stringify(event)}`);

        ow(event.bucket, ow.string.nonEmpty);
        ow(event.key, ow.string.nonEmpty);
        ow(event.input?.components, ow.array.nonEmpty);

        const { components } = event.input

        const componentId = components.pop();

        const [trsxProject, dialogAppProject] = await this.getNuanceProjectDefinition({ bucket: event.bucket, key: event.key });

        const component = dialogAppProject.data!.components!.find(o => o.id === componentId)!;

        const botId = event.key.split('/')[1];

        const bot = await this.botsService.get(this.securityContext, botId)

        const statusMessage = `Generating intent '${component?.name}'.`

        await this.botsService.update(this.securityContext, botId, {
            status: 'in-progress',
            statusMessages: [...bot.statusMessages, { message: statusMessage, status: 'in-progress' }]
        });

        const { intent, slots: slotUsed } = await this.llmTransformer.generateIntent(
            {
                trsxProject,
                component,
                intentName: component?.name!,
                slots: event.output?.slots!
            });

        const taskOutput: GenerateIntentOutput = {
            output: {
                slots: event.output?.slots,
                slotTypes: event.output?.slotTypes,
                intents: {
                    ...event.output?.intents,
                    [intent.intentName]: {
                        ...intent, slots: slotUsed
                    }
                }
            },
            input: {
                components,
                componentsToProcess: components.length
            },
            bucket: event.bucket,
            key: event.key
        }

        await this.botsService.update(this.securityContext, botId, {
            status: 'in-progress',
            statusMessages: [...bot.statusMessages, { message: statusMessage, status: 'success' }]
        });

        if (components.length == 0) {
            taskOutput.input!.intents = Object.keys(taskOutput.output?.intents!)
            taskOutput.input!.intentsToProcess = taskOutput.input!.intents!.length
        }

        logger.trace(`out: taskOutput: ${stringify(taskOutput)}`)

        return taskOutput;
    }
}
