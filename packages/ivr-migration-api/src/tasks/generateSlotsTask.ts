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
import type { S3ObjectCreatedNotificationEvent } from 'aws-lambda';
import ow from 'ow';
import stringify from 'json-stringify-safe';
import { BaseGeneratorTask, type GenerateIntentInput } from './baseGeneratorTask';
import type { LLMTransformer, TRSXTransformer } from '@ivr-migration-tool/transformer';

export class GenerateSlotsTask extends BaseGeneratorTask<S3ObjectCreatedNotificationEvent, GenerateIntentInput> {
    constructor(
        protected readonly log: Logger<any, boolean>,
        protected readonly botsService: BotsService,
        protected readonly s3Client: S3Client,
        protected readonly transformer: TRSXTransformer,
        private readonly llmTransformer: LLMTransformer
    ) {
        super(log, botsService, s3Client, transformer);
    }

    public async process(event: S3ObjectCreatedNotificationEvent): Promise<GenerateIntentInput> {
        const logger = getLogger(this.log, 'generateSlotsTask', 'process');
        logger.trace(`in: event: ${stringify(event)}`);

        ow(event.detail.bucket?.name, ow.string.nonEmpty);
        ow(event.detail.object?.key, ow.string.nonEmpty);

        const botId = event.detail.object.key.split('/')[1];

        let components: string[] = []

        let taskOutput: GenerateIntentInput = {
            bucket: event.detail.bucket.name,
            key: event.detail.object.key
        };

        try {
            const [trsxProject, dialogAppProject] = await this.getNuanceProjectDefinition({ bucket: event.detail.bucket.name, key: event.detail.object.key });

            const bot = await this.botsService.get(this.securityContext, botId)
            const existingStatusMessages = bot.statusMessages ?? [];

            const createSlotsStatusMessage = `Generating slots and slot types from Nuance Mix Dialog and TRSX specification files.`
            const implicitIntentMessage = `Generating implicit intent(s) from Nuance Mix Dialog specification file.`

            await this.botsService.update(this.securityContext, botId, {
                status: 'in-progress',
                statusMessages: [...existingStatusMessages, { message: createSlotsStatusMessage, status: 'in-progress' }]
            });

            // Create the slot and slot types
            const { slots, slotTypes } = await this.llmTransformer.generateSlots({ trsxProject, dialogAppProject })

            // Create any implicit intents
            for (const projectIntentMapping of dialogAppProject.data?.projectIntentMappings!) {
                if (projectIntentMapping.destination?.componentId) {
                    const intentInOntology = dialogAppProject.data?.ontology?.intents?.find(i => i.id === projectIntentMapping.intentId)
                    if (intentInOntology && trsxProject.ontology?.intents?.find(t => t.name === intentInOntology.name)) {
                        components.push(projectIntentMapping.destination?.componentId)
                    }
                }
            }

            await this.botsService.update(this.securityContext, botId, {
                status: 'in-progress',
                statusMessages: [
                    ...existingStatusMessages,
                    { status: 'success', message: createSlotsStatusMessage },
                    { status: 'in-progress', message: implicitIntentMessage }]
            });

            const intents = await this.llmTransformer.generateNonTRSXIntents({ trsxProject, dialogAppProject, slots, excludedComponents: components })

            await this.botsService.update(this.securityContext, botId, {
                status: 'in-progress',
                statusMessages: [
                    ...existingStatusMessages,
                    { status: 'success', message: createSlotsStatusMessage },
                    { status: 'success', message: implicitIntentMessage }]
            });

            taskOutput = {
                ...taskOutput,
                input: {
                    components,
                    componentsToProcess: components.length
                },
                output: {
                    slots,
                    slotTypes,
                    intents
                }
            }
        } catch (err) {
            status = 'error';
            logger.error(`Could not transform specification file: err: ${stringify(err)}`);
            throw err;
        }


        logger.trace(`out: taskOutput: ${stringify(taskOutput)}`);
        return taskOutput;
    }
}
