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

import type { Logger } from "pino";
import type { BotsRepository } from "./repository";
import { getLogger } from "../../common/logger";
import stringify from "json-stringify-safe";
import type { SecurityContext } from "../../common/scopes";
import type { ListPaginationOptions, S3Location } from "../../common/schemas";
import { InvalidRequestError, NotFoundError } from "../../common/errors";
import ow from 'ow';
import { CreateBotCommand, CreateBotLocaleCommand, DeleteBotCommand, LexModelsV2Client, waitUntilBotAvailable } from "@aws-sdk/client-lex-models-v2";
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import { BotsApiSchema } from '@ivr-migration-tool/schemas'
import { PutEventsCommand, type EventBridgeClient } from "@aws-sdk/client-eventbridge";

export class BotsService {

    private readonly defaultVersion = 'DRAFT';
    private readonly signedUrlExpiresIn = 5 * 60;

    constructor(
        private readonly log: Logger<any, boolean>,
        private readonly repository: BotsRepository,
        private readonly s3Client: S3Client,
        private readonly bucketName: string,
        private readonly lexModelClient: LexModelsV2Client,
        private readonly lexRoleArn: string,
        private readonly eventBridgeClient: EventBridgeClient,
        private readonly eventBusName: string
    ) {
    }

    public async delete(securityContext: SecurityContext, id: string) {
        const logger = getLogger(this.log, 'BotsService', 'delete')
        logger.debug(`in: [${stringify(id)}]`)
        const bot = await this.repository.get(id);
        if (!bot) {
            throw new NotFoundError(`Bot with id ${id} not found`)
        }

        // Delete bot from both Lex and DynamoDB
        await this.lexModelClient.send(new DeleteBotCommand({ botId: bot.id }));
        await this.repository.delete(id)

        logger.debug(`out: [${stringify(id)}]`)
    }

    public async update(securityContext: SecurityContext, id: string, updateBot: BotsApiSchema.UpdateBot & { botDefinitionRawLocation?: S3Location, botDefinitionLocation?: S3Location }): Promise<BotsApiSchema.Bot> {
        const logger = getLogger(this.log, 'BotsService', 'update')
        logger.debug(`in: [${stringify(updateBot)}]`)

        ow(updateBot.status, ow.string.nonEmpty)

        const bot = await this.repository.get(id);
        if (!bot) {
            throw new NotFoundError(`Bot with id ${id} not found`)
        }

        const updatedBot = await this.repository.update({
            id,
            updatedAt: new Date().toISOString(),
            updatedBy: securityContext.email,
            status: updateBot.status,
            statusMessages: updateBot.statusMessages,
            botDefinitionLocation: updateBot.botDefinitionLocation,
            botDefinitionRawLocation: updateBot.botDefinitionRawLocation
        })

        logger.trace(`out: [${stringify(bot)}]`)
        return updatedBot;
    }

    public async create(securityContext: SecurityContext, createBot: BotsApiSchema.CreateBot): Promise<BotsApiSchema.Bot> {
        const logger = getLogger(this.log, 'BotsService', 'create')
        logger.debug(`in: [${stringify(createBot)}]`)

        ow(createBot.name, ow.string.nonEmpty);
        ow(createBot.locale, ow.string.nonEmpty)

        const response = await this.lexModelClient.send(new CreateBotCommand({
            botName: createBot.name,
            dataPrivacy: {
                childDirected: false,
            },
            description: createBot.description,
            idleSessionTTLInSeconds: 300,
            roleArn: this.lexRoleArn,
            botTags: {
                'ivr:migration:createdBy': securityContext.email
            }
        }));

        // Wait for bot to be available
        await waitUntilBotAvailable(
            {
                client: this.lexModelClient,
                maxWaitTime: 300 // Optional: specify max wait time in seconds
            },
            { botId: response.botId }
        );

        await this.lexModelClient.send(new CreateBotLocaleCommand({
            botId: response.botId!,
            botVersion: this.defaultVersion,
            localeId: createBot.locale,
            nluIntentConfidenceThreshold: 0.4
        }))


        const inputUploadUrl = await this.generateSignedUrl(`input/${response.botId}/botSourceDefinition.zip`, 'put')

        const bot: BotsApiSchema.BotInternal = {
            id: response.botId!,
            ...createBot,
            createdAt: new Date().toISOString(),
            createdBy: securityContext.email,
            status: 'in-progress',
            version: this.defaultVersion,
            statusMessages:
                [{
                    status: 'success',
                    message: `Creating Bot and Bot Locale in Amazon Lex.`
                }],
            inputUploadUrl
        };

        await this.repository.create(bot);

        logger.debug(`out: [${stringify(bot)}]`)
        return bot;
    }


    private async generateSignedUrl(key: string, command: 'put' | 'get', expiresIn = this.signedUrlExpiresIn): Promise<string> {
        const logger = getLogger(this.log, 'BotsService', 'generateSignedUrl')
        logger.trace(`in: [${stringify(key)}]`)
        const input = {
            Bucket: this.bucketName,
            Key: key
        }
        const params: PutObjectCommand = command === 'put' ? new PutObjectCommand(input) : new GetObjectCommand(input);
        const url = await getSignedUrl(this.s3Client, params, { expiresIn });
        logger.trace(`out: [${stringify(url)}]`)
        return url;
    }

    public async get(securityContext: SecurityContext, id: string): Promise<BotsApiSchema.BotInternal> {
        const logger = getLogger(this.log, 'BotsService', 'get')
        logger.debug(`in: [${stringify(id)}]`)
        const bot = await this.repository.get(id)
        if (!bot) {
            throw new NotFoundError(`Bot with id ${id} not found`)
        }

        if (bot.botDefinitionLocation) {
            bot.outputDownloadUrl = await this.generateSignedUrl(bot.botDefinitionLocation.key, 'get')
        }

        if (bot.botDefinitionRawLocation) {
            bot.rawOutputDownloadUrl = await this.generateSignedUrl(bot.botDefinitionRawLocation.key, 'get')
        }

        logger.debug(`out: [${stringify(bot)}]`)
        return bot;
    }

    private async publishBuildBotEvent(bot: BotsApiSchema.BotInternal): Promise<void> {
        const logger = getLogger(this.log, 'BotsService', 'publishBuildBotEvent');
        logger.debug(`Publishing test set created event for test set ${bot.id}`);
        const event = {
            EventBusName: this.eventBusName,
            Entries: [
                {
                    Source: 'bots-service',
                    DetailType: 'BuildBotStarted',
                    Detail: JSON.stringify(bot),
                    EventBusName: this.eventBusName,
                    Time: new Date()
                }
            ]
        };

        try {
            await this.eventBridgeClient.send(new PutEventsCommand(event));

            logger.debug(`Successfully published build started event for bot ${bot.id}`);
        } catch (error) {
            logger.error(`Failed to publish bot build event: ${error}`);
            throw error;
        }
    }

    public async build(securityContext: SecurityContext, id: string): Promise<BotsApiSchema.Bot> {
        const logger = getLogger(this.log, 'BotsService', 'build')
        logger.debug(`in: [${stringify(id)}]`)


        // 1: Validate bot exists and on the right state
        const bot = await this.repository.get(id)
        if (!bot) {
            throw new NotFoundError(`Bot with id ${id} not found`)
        }

        if (!['success', 'built'].includes(bot.status)) {
            throw new InvalidRequestError(`Bot with id ${id} is not in success or built state`)
        }

        // 2: Upate Bot Status
        const updatedBot = await this.repository.update({
            id,
            updatedAt: new Date().toISOString(),
            updatedBy: securityContext.email,
            status: 'in-progress',
            statusMessages: [{ status: 'success', message: 'Starting bot builder process.' }]
        })

        await this.publishBuildBotEvent(updatedBot)

        logger.debug(`out: [${stringify(bot)}]`)
        return updatedBot;
    }

    public async list(securityContext: SecurityContext, options: ListPaginationOptions): Promise<[BotsApiSchema.Bot[], string]> {
        const logger = getLogger(this.log, 'BotsService', 'list');
        logger.debug(`in: `);
        const [bots, nextToken] = await this.repository.list(options);
        logger.debug(`in: [${stringify(bots)}, ${nextToken}]`);
        return [bots, nextToken]
    }

}
