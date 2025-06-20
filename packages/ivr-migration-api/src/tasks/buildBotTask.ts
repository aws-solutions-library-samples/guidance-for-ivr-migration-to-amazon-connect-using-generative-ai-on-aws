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
import { BuildBotLocaleCommand, CreateExportCommand, DescribeExportCommand, ListIntentsCommand, ListSlotsCommand, ListSlotTypesCommand, waitUntilBotExportCompleted, waitUntilBotLocaleBuilt, type LexModelsV2Client } from "@aws-sdk/client-lex-models-v2";
import type { Logger } from "pino";
import { getLogger } from "../common/logger";
import type { BotsApiSchema } from "@ivr-migration-tool/schemas";
import ow from 'ow';
import stringify from "json-stringify-safe";
import type { BotsService } from "../api/bots/service";
import { SecurityScope, type SecurityContext } from "../common/scopes";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { BuildBotInput, BuildBotOutput } from "./baseValidatorTask";
import type { LexResourcesContext } from "@ivr-migration-tool/transformer";
import type { S3Location } from "../common/schemas";

export class BuildBotTask {
    protected securityContext: SecurityContext;
    constructor(
        protected readonly log: Logger<any, boolean>,
        private readonly lexClient: LexModelsV2Client,
        protected readonly botsService: BotsService,
        private readonly s3Client: S3Client
    ) {
        this.securityContext = {
            email: 'transformTask',
            role: SecurityScope.contributor,
            sub: 'transformTask',
        };
    }

    /**
     * Assembles a context object containing all resources (slot types and intents) for a given bot
     * @param bot The bot to assemble resources for
     * @returns Promise containing LexResourcesContext with intents and slot types
     */
    private async assembleAllResourcesContext(bot: BotsApiSchema.Bot): Promise<LexResourcesContext> {
        const logger = getLogger(this.log, 'buildBotTask', 'assembleAllResourcesContext');
        logger.trace(`in: bot: ${stringify(bot)}`)

        const slotTypeNames: string[] = [];
        const commonParameters = {
            botId: bot.id,
            botVersion: bot.version,
            localeId: bot.locale,
        }


        let slotTypeNextToken: string | undefined;
        do {
            const response = await this.lexClient.send(new ListSlotTypesCommand({
                ...commonParameters,
                nextToken: slotTypeNextToken
            }));

            response.slotTypeSummaries?.forEach(slotType => {
                if (slotType.slotTypeName) {
                    slotTypeNames.push(slotType.slotTypeName);
                }
            });

            slotTypeNextToken = response.nextToken;
        } while (slotTypeNextToken);



        let intentNextToken: string | undefined;

        const intentSlotMap: { [intentName: string]: string[] } = {};
        do {
            const listIntentsResponse = await this.lexClient.send(new ListIntentsCommand({
                ...commonParameters,
                nextToken: intentNextToken
            }));

            for (const intent of listIntentsResponse.intentSummaries || []) {
                if (intent.intentName) {
                    intentSlotMap[intent.intentName] = [];

                    const listSlotsResponse = await this.lexClient.send(new ListSlotsCommand({
                        ...commonParameters,
                        intentId: intent.intentId
                    }));

                    for (const slot of listSlotsResponse.slotSummaries || []) {
                        if (slot.slotName) {
                            intentSlotMap[intent.intentName].push(slot.slotName);
                        }
                    }
                }
            }
            intentNextToken = listIntentsResponse.nextToken;
        } while (intentNextToken);

        const allResourceContext = { intents: intentSlotMap, slotTypes: slotTypeNames }

        logger.trace(`out: allResourceContext: ${stringify(allResourceContext)}`);
        return allResourceContext;
    }

    public async process(request: BuildBotInput): Promise<BuildBotOutput> {

        const logger = getLogger(this.log, 'buildBotTask', 'process');
        logger.trace(`in: request: ${stringify(request)}`);

        const { bot } = request

        ow(bot, ow.object.partialShape({
            id: ow.string.nonEmpty,
            locale: ow.string.nonEmpty
        }))

        let numOfRetry = request.numOfRetry;
        if (!numOfRetry) {
            numOfRetry = 0;
        } else {
            numOfRetry++;
            if (numOfRetry > 2) {
                throw new Error(`Failed to build bot after ${numOfRetry} retries.`)
            }
        }

        const updatedBot = await this.botsService.get(this.securityContext, bot.id)

        const statusMessage = `Building bot.`

        await this.botsService.update(this.securityContext, bot.id, {
            status: 'in-progress',
            statusMessages: [...updatedBot.statusMessages, { message: statusMessage, status: 'in-progress' }]
        });

        let failureReasons: string[] = [],
            resourcesContext = undefined;

        try {
            const { exportId } = await this.buildBot({ botId: bot.id, botVersion: bot.version, localeId: bot.locale });

            const botDefinitionLocation = await this.saveExportZipFile(exportId!, updatedBot?.botDefinitionRawLocation?.bucket!, bot)

            await this.botsService.update(this.securityContext, bot.id, {
                status: 'built',
                botDefinitionLocation,
                statusMessages: [
                    ...updatedBot.statusMessages.filter(s => s.message !== statusMessage),
                    { message: statusMessage, status: 'built' }
                ]
            });
        } catch (err: any) {
            logger.error(`out: error: ${err}`)
            if (typeof err === 'object' && err.message) {
                await this.botsService.update(this.securityContext, bot.id, {
                    status: 'error',
                    statusMessages: [
                        ...updatedBot.statusMessages.filter(s => s.message !== statusMessage),
                        { message: statusMessage, status: 'in-progress' }]
                });
                const failureReasonsSet = new Set<string>(JSON.parse(err.message ?? {}).reason?.failureReasons ?? [])
                failureReasons = Array.from(failureReasonsSet);
                resourcesContext = await this.assembleAllResourcesContext(bot);

            } else {
                throw err
            }
        }

        logger.trace(`out: bot: ${stringify(bot)}, failureReasons: ${stringify(failureReasons)}`);

        return {
            bot,
            failureReasons,
            failureReasonsToFix: failureReasons.length,
            resourcesContext,
            numOfRetry
        }
    }


    /**
     * Saves the exported Lex bot definition zip file to an S3 bucket
     * @param exportId The ID of the Lex bot export
     * @param bucket The S3 bucket name to save the zip file to
     * @param bot The bot details containing ID and name used to generate the S3 key
     * @returns Promise containing the S3 location (bucket and key) where the zip file was saved
     */
    private async saveExportZipFile(exportId: string, bucket: string, bot: BotsApiSchema.Bot): Promise<S3Location> {
        const logger = getLogger(this.log, 'buildBotTask', 'saveExportZipFile');
        logger.trace(`in: exportId: ${exportId}, bucket: ${bucket}, bot: ${stringify(bot)}`);

        const response = await this.lexClient.send(new DescribeExportCommand({ exportId: exportId }))
        // Upload the file to s3 bucket
        const botDefinitionLocation = {
            bucket: bucket,
            key: `output/${bot.id}/${bot.name}_DRAFT_LexJson.zip`
        };

        const fetchResponse = await fetch(response.downloadUrl!);
        const arrayBuffer = await fetchResponse.arrayBuffer();
        // Upload zip file to S3 bucket
        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: botDefinitionLocation.bucket,
                Key: botDefinitionLocation.key,
                Body: Buffer.from(arrayBuffer),
                ContentType: 'application/zip',
            })
        );

        logger.trace(`out: botDefinitionLocation: ${stringify(botDefinitionLocation)}`)
        return botDefinitionLocation;
    }

    /**
     * Builds a Lex bot and exports it to CSV format
     * @param commonParameters Object containing botId, botVersion, and localeId for the bot
     * @returns Promise containing the export result with exportId
     * @throws Error if bot build or export fails
     */
    private async buildBot(commonParameters: { botId: never; botVersion: string; localeId: never; }) {
        const logger = getLogger(this.log, 'buildBotTask', 'buildBot');
        logger.trace(`in: commonParameters: ${stringify(commonParameters)}`);

        await this.lexClient.send(new BuildBotLocaleCommand({
            ...commonParameters
        }));

        // Wait until BotLocale is built
        await waitUntilBotLocaleBuilt({
            client: this.lexClient,
            maxWaitTime: 60,
            minDelay: 1,
            maxDelay: 1
        }, {
            ...commonParameters
        });

        const result = await this.lexClient.send(new CreateExportCommand({
            fileFormat: 'CSV',
            resourceSpecification: { botLocaleExportSpecification: { ...commonParameters } }
        }));


        await waitUntilBotExportCompleted({
            client: this.lexClient,
            maxWaitTime: 60,
            minDelay: 1,
            maxDelay: 1
        }, {
            exportId: result.exportId
        });

        logger.trace(`out: result: ${stringify(result)}`)
        return result;
    }
}
