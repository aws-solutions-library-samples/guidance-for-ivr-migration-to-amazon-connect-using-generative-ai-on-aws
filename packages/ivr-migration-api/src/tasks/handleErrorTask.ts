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
import stringify from 'json-stringify-safe';
import { BaseGeneratorTask, type GenerateIntentInput } from './baseGeneratorTask';
import type { TRSXTransformer } from '@ivr-migration-tool/transformer';
import type { EventBridgeEvent, S3ObjectCreatedNotificationEvent } from 'aws-lambda';
import type { BotsApiSchema } from '@ivr-migration-tool/schemas';

export type StepFunctionTaskError = { error: { Error: string, Cause: string } }

export type CreateIntentInputError = GenerateIntentInput & StepFunctionTaskError;

export type S3ObjectCreatedNotificationEventError = S3ObjectCreatedNotificationEvent & StepFunctionTaskError;

export type BuildBotError = { bot: BotsApiSchema.Bot } & StepFunctionTaskError

export class HandleErrorTask extends BaseGeneratorTask<CreateIntentInputError | S3ObjectCreatedNotificationEvent | BuildBotError | EventBridgeEvent<'BuildBotStarted', BotsApiSchema.Bot>, void> {
    constructor(
        protected readonly log: Logger<any, boolean>,
        protected readonly botsService: BotsService,
        protected readonly s3Client: S3Client,
        protected readonly transformer: TRSXTransformer,
    ) {
        super(log, botsService, s3Client, transformer);
    }

    /**
     * Extracts the bot ID from various event types.
     * @param event - The event object which can be one of:
     *               - CreateIntentInputError
     *               - S3ObjectCreatedNotificationEvent  
     *               - BuildBotError
     *               - EventBridgeEvent<'BuildBotStarted', BotsApiSchema.Bot>
     * @returns The extracted bot ID as a string
     * @throws Error if bot ID cannot be extracted from the event
     */
    private getBotId(event: CreateIntentInputError | S3ObjectCreatedNotificationEvent | BuildBotError | EventBridgeEvent<'BuildBotStarted', BotsApiSchema.Bot>): string {        // Extract bot id from CreateIntentInputError or S3ObjectCreatedNotificationEvent
        if ('key' in event || 'detail' in event && 'object' in event.detail) {
            const fileKey = 'key' in event ? event.key : event.detail.object?.key;
            return fileKey.split('/')[1];
        }

        // Extract bot id from BuildBotError
        if ('bot' in event) {
            return event.bot.id;
        }

        // Extract bot id from EventBridgeEvent
        if ('detail' in event && 'id' in event.detail) {
            return event.detail.id;
        }

        throw new Error('Could not extract bot id from event');
    }

    public async process(event: CreateIntentInputError | S3ObjectCreatedNotificationEvent): Promise<void> {
        const logger = getLogger(this.log, 'handleErrorTask', 'process');

        const botId = this.getBotId(event);

        // This will throw error if bot does not exist
        const bot = await this.botsService.get(this.securityContext, botId);

        const statusMessages = bot.statusMessages;
        const lastMessage = statusMessages.pop();

        await this.botsService.update(this.securityContext, botId,
            {
                status: 'error',
                statusMessages: [...statusMessages,
                {
                    status: 'error',
                    message: `${lastMessage}. Error: ${(event as StepFunctionTaskError).error.Error}. Cause: ${(event as StepFunctionTaskError).error.Cause}`
                }]
            });

        logger.trace(`in: event: ${stringify(event)}`);
    }
}
