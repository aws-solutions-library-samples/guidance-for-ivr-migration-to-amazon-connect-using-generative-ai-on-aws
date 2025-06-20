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
import { BaseGeneratorTask, type GenerateIntentOutput, type ValidateIntentInput, type ValidateIntentOutput } from './baseGeneratorTask';
import type { LLMTransformer, TRSXTransformer } from '@ivr-migration-tool/transformer';

export class ValidateIntentTask extends BaseGeneratorTask<ValidateIntentInput, ValidateIntentInput> {
    constructor(
        protected readonly log: Logger<any, boolean>,
        protected readonly botsService: BotsService,
        protected readonly s3Client: S3Client,
        protected readonly transformer: TRSXTransformer,
        private readonly llmTransformer: LLMTransformer
    ) {
        super(log, botsService, s3Client, transformer);
    }

    public async process(event: ValidateIntentInput): Promise<ValidateIntentOutput> {
        const logger = getLogger(this.log, 'validateIntentTask', 'process');
        logger.trace(`in: event: ${stringify(event)}`);

        ow(event.input?.intents, ow.array.nonEmpty);
        ow(event.key, ow.string.nonEmpty);

        const { intents } = event.input

        const intentName = intents!.pop()!;

        const botId = event.key.split('/')[1];

        const bot = await this.botsService.get(this.securityContext, botId)

        const statusMessage = `Validating intent '${intentName}' against best practices.`

        await this.botsService.update(this.securityContext, botId, {
            status: 'in-progress',
            statusMessages: [...bot.statusMessages, { status: 'in-progress', message: statusMessage }]
        });

        let intent = event.output!.intents![intentName], slots = {}, slotTypes = {}

        if (intent && intent.parentIntentSignature === undefined) {
            const transformedIntentOutput = await this.llmTransformer.validateIntentOutput(
                {
                    intentToValidateName: intentName,
                    transformedResponseTaskOutput: event.output!
                });

            intent = {
                ...transformedIntentOutput.intent,
                intentName: intent.intentName
            };
            slotTypes = transformedIntentOutput.slotTypes
            slots = transformedIntentOutput.slots;

            // Check if the intent is modified to use built in intents. Remove the slots and slottypes
            if (intent.parentIntentSignature !== undefined) {
                slotTypes = {};
                slots = {};
                intent.sampleUtterances = [];
            }
        }

        await this.botsService.update(this.securityContext, botId, {
            status: 'in-progress',
            statusMessages: [...bot.statusMessages, { status: 'success', message: statusMessage }]
        });

        const taskOutput: GenerateIntentOutput = {
            output: {
                slots: {
                    ...event.output?.slots,
                    ...slots,
                },
                slotTypes: {
                    ...event.output?.slotTypes,
                    ...slotTypes
                },
                intents: {
                    ...event.output?.intents,
                    [intent.intentName]: {
                        ...intent,
                        slots
                    }
                }
            },
            input: {
                intents,
                intentsToProcess: intents?.length
            },
            bucket: event.bucket,
            key: event.key
        }

        logger.trace(`out: taskOutput: ${stringify(taskOutput)}`)

        return taskOutput;
    }
}
