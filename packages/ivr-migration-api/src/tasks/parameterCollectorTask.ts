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

import { DeleteIntentCommand, DeleteSlotTypeCommand, ListIntentsCommand, ListSlotTypesCommand, type LexModelsV2Client, } from "@aws-sdk/client-lex-models-v2";
import { GetObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import type { Logger } from "pino";
import type { TransformedResponseTaskOutput } from "./baseGeneratorTask";
import ow from 'ow';
import { getLogger } from "../common/logger";
import stringify from "json-stringify-safe";
import type { BotsApiSchema } from "@ivr-migration-tool/schemas";
import type { BotsService } from "../api/bots/service";
import { SecurityScope, type SecurityContext } from "../common/scopes";
import type { CreateSlotTypeInput } from "./baseValidatorTask";
import type { EventBridgeEvent } from "aws-lambda";

export class ParameterCollectorTask {
    protected securityContext: SecurityContext;

    constructor(
        protected readonly log: Logger<any, boolean>,
        protected readonly s3Client: S3Client,
        private readonly lexClient: LexModelsV2Client,
        protected readonly botsService: BotsService,
    ) {
        this.securityContext = {
            email: 'transformTask',
            role: SecurityScope.contributor,
            sub: 'transformTask',
        };
    }

    /**
     * Cleans up existing resources (intents and slot types) for a given bot in Amazon Lex
     * @param bot The bot internal configuration object
     * @returns Promise that resolves when cleanup is complete
     */
    private async cleanUpResources(bot: BotsApiSchema.BotInternal): Promise<void> {
        const logger = getLogger(this.log, 'parameterCollectorTask', 'cleanUpResources');
        logger.trace(`in: event: ${stringify(bot)}`);

        const commonParameters = { botId: bot.id, botVersion: bot.version, localeId: bot.locale }

        const listIntentsResponse = await this.lexClient.send(new ListIntentsCommand(commonParameters))

        const deleteIntentFutures = [];

        for (const intent of listIntentsResponse.intentSummaries!) {
            if (intent.intentName !== 'FallbackIntent') {
                deleteIntentFutures.push(this.lexClient.send(new DeleteIntentCommand({
                    ...commonParameters,
                    intentId: intent.intentId,
                })))
            }
        }

        await Promise.all(deleteIntentFutures)

        const deleteSlotTypeFutures = [];

        const listSlotTypesResponse = await this.lexClient.send(new ListSlotTypesCommand(commonParameters))

        for (const slotType of listSlotTypesResponse.slotTypeSummaries!) {
            deleteSlotTypeFutures.push(this.lexClient.send(new DeleteSlotTypeCommand({
                ...commonParameters,
                slotTypeId: slotType.slotTypeId,
            })))
        }

        await Promise.all(deleteSlotTypeFutures)

        logger.trace(`out: event: ${stringify(bot)}`)
    }


    public async process(event: EventBridgeEvent<'BuildBotStarted', BotsApiSchema.BotInternal>): Promise<CreateSlotTypeInput> {
        const logger = getLogger(this.log, 'parameterCollectorTask', 'process');
        logger.trace(`in: event: ${stringify(event)}`);

        ow(event, ow.object.nonEmpty);
        ow(event.detail, ow.object.nonEmpty);
        ow(event.detail!.botDefinitionRawLocation, ow.object.exactShape({
            bucket: ow.string.nonEmpty,
            key: ow.string
        }))

        const bot = event.detail;
        const statusMessage = 'Deleting existing resources in Amazon Lex.'

        await this.botsService.update(this.securityContext, bot.id, {
            status: 'in-progress',
            statusMessages: [...bot.statusMessages, { message: statusMessage, status: 'in-progress' }]
        });
        // Clean up existing resources
        await this.cleanUpResources(bot)

        const response = await this.s3Client.send(new GetObjectCommand({ Bucket: bot.botDefinitionRawLocation?.bucket, Key: bot.botDefinitionRawLocation?.key }));
        const transformedOutput: TransformedResponseTaskOutput = JSON.parse(await response.Body?.transformToString('utf-8')!);

        const sampleUtterances = new Set<string>

        // Ensure there are not duplications for utterances
        for (const [name, intent] of Object.entries(transformedOutput.intents!)) {
            const modifiedUtterances = [];
            for (const item of transformedOutput.intents![name]!.sampleUtterances ?? []!) {
                if (!sampleUtterances.has(item.utterance)) {
                    modifiedUtterances.push(item)
                }
                sampleUtterances.add(item.utterance)
            }
            transformedOutput.intents![name]!.sampleUtterances = modifiedUtterances;
        }

        await this.botsService.update(this.securityContext, bot.id, {
            status: 'in-progress',
            statusMessages: [...bot.statusMessages, { message: statusMessage, status: 'success' }]
        });

        // We're not going to re-create built-in intent type
        const intents = Object.values(transformedOutput.intents!).map(i => i.intentName);
        // We're not going to create built-in slot type
        const slotTypes = Object.values(transformedOutput.slotTypes!).map(i => i.slotTypeName).filter(s => !s.startsWith('AMAZON.'))
        const output: CreateSlotTypeInput = {
            bot,
            input: {
                intents: intents,
                intentsToProcess: intents.length,
                slotTypes: slotTypes,
                slotTypesToProcess: slotTypes.length
            },
            output: transformedOutput
        }

        logger.trace(`out: event: ${stringify(output)}`)
        return output;
    }
}
