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

import { ListSlotTypesCommand, UpdateIntentCommand, type CreateIntentCommandInput, type CreateIntentCommandOutput, type CreateSlotCommandInput, type CreateSlotCommandOutput, type LexModelsV2Client, type Specifications, type SubSlotSetting, type UpdateIntentCommandInput } from "@aws-sdk/client-lex-models-v2";
import type { LLMValidator } from "@ivr-migration-tool/transformer";
import { type Logger } from "pino";
import ow from 'ow';
import { getLogger } from "../common/logger";
import stringify from "json-stringify-safe";
import type { BotsApiSchema, LexIntentModel, LexSlotModel } from "@ivr-migration-tool/schemas";
import type { BotsService } from "../api/bots/service";
import { BaseValidatorTask, type CreateIntentInput, type CreateIntentOutput } from "./baseValidatorTask";

export class CreateIntentTask extends BaseValidatorTask<CreateIntentInput, CreateIntentOutput> {
    constructor(
        protected readonly log: Logger<any, boolean>,
        protected readonly lexClient: LexModelsV2Client,
        protected readonly llmValidator: LLMValidator,
        private readonly botsService: BotsService
    ) {
        super(log, lexClient, llmValidator)
    }

    private async createIntent(bot: BotsApiSchema.Bot, intent: LexIntentModel.Intent): Promise<CreateIntentCommandOutput> {
        const logger = getLogger(this.log, 'createIntentTask', 'createIntent');
        logger.trace(`in: bot: ${stringify(bot)}, intent: ${stringify(intent)}`);

        let payload: CreateIntentCommandInput = {
            botId: bot.id,
            botVersion: bot.version,
            localeId: bot.locale,
            ...intent,
        }

        const response = this.updateLexResource<CreateIntentCommandInput, CreateIntentCommandOutput>('CreateIntentCommand', payload);
        logger.trace(`out: createIntentResponse: ${stringify(response)}`)
        return response;
    }


    private async createSlot(bot: BotsApiSchema.Bot, slot: LexSlotModel.SlotExportDefinition, intentId: string, slotTypeMap: Record<string, string>): Promise<CreateSlotCommandOutput> {
        const logger = getLogger(this.log, 'createIntentTask', 'createSlot');
        logger.trace(`in: bot: ${stringify(bot)}, slot: ${stringify(slot)}, intentId: ${intentId}, slotTypeMap: ${stringify(slotTypeMap)}`);
        let keepGoing = true

        let slotSpecifications: Record<string, Specifications> | undefined,
            subSlotSetting: SubSlotSetting | undefined;

        if (slot.subSlotSetting && slot.subSlotSetting?.slotSpecifications) {
            subSlotSetting = {
                expression: slot.subSlotSetting?.expression!,
            }
            slotSpecifications = {}
            for (const specification in slot?.subSlotSetting?.slotSpecifications!) {
                slotSpecifications[specification].slotTypeId = slotTypeMap[slot?.subSlotSetting?.slotSpecifications[specification].slotTypeName]
                slotSpecifications[specification].valueElicitationSetting = slot?.subSlotSetting?.slotSpecifications[specification].valueElicitationSetting
            }
        }

        const payload: CreateSlotCommandInput = {
            botId: bot.id,
            botVersion: bot.version,
            localeId: bot.locale,
            slotTypeId: slot.slotTypeName?.startsWith('AMAZON') ? slot.slotTypeName : slotTypeMap[slot.slotTypeName!],
            subSlotSetting: subSlotSetting,
            intentId,
            ...slot,
        } as CreateSlotCommandInput

        const response = this.updateLexResource<CreateSlotCommandInput, CreateSlotCommandOutput>('CreateSlotCommand', payload);

        logger.trace(`out: createSlotResponse: ${stringify(response)}`)
        return response;
    }

    public async process(event: CreateIntentInput): Promise<CreateIntentOutput> {
        const logger = getLogger(this.log, 'createIntentTask', 'process');
        logger.trace(`in: event: ${stringify(event)}`);

        ow(event.input.intents, ow.array.nonEmpty)
        ow(event.input.intents, ow.object.nonEmpty)
        ow(event.bot, ow.object.nonEmpty);

        const { bot, input, output } = event;

        const intentName = input.intents.pop();

        const intent = output.intents?.[intentName!]!;

        const updatedBot = await this.botsService.get(this.securityContext, bot.id)

        const statusMessage = `Creating intent ${intentName}.`

        await this.botsService.update(this.securityContext, bot.id, {
            status: 'in-progress',
            statusMessages: [...updatedBot.statusMessages, { message: statusMessage, status: 'in-progress' }]
        });

        const createIntentResponse = await this.createIntent(bot, intent)

        const responses = await this.lexClient.send(new ListSlotTypesCommand({ botId: bot.id, localeId: bot.locale, botVersion: bot.version }))

        const slotTypeMap: Record<string, string> = responses.slotTypeSummaries?.reduce((acc, curr) => ({
            ...acc,
            [curr.slotTypeName!]: curr.slotTypeId!
        }), {} as Record<string, string>)!

        const slotMap: Record<string, string> = {}

        const slots = Object.values(intent.slots);

        if (slots.length > 0) {
            for (const slot of slots) {
                const createSlotCommandOutput = await this.createSlot(bot, slot, createIntentResponse.intentId!, slotTypeMap)
                slotMap[slot.slotName] = createSlotCommandOutput.slotId!
            }
            // Replace the slot name with slot id that had just been created.
            await this.lexClient.send(new UpdateIntentCommand({
                ...createIntentResponse,
                slotPriorities: intent.slotPriorities
                    .map(s => ({ slotId: slotMap[s.slotName!]!, priority: s.priority }))
                    .filter(s => s?.slotId !== undefined)
            } as UpdateIntentCommandInput))
        }

        await this.botsService.update(this.securityContext, bot.id, {
            status: 'in-progress',
            statusMessages: [...updatedBot.statusMessages, { message: statusMessage, status: 'success' }]
        });

        const taskOutput: CreateIntentOutput = {
            ...event,
            input: {
                ...input,
                intents: input.intents,
                intentsToProcess: input.intents.length
            }
        }

        logger.trace(`out: taskOutput: ${stringify(taskOutput)}`)
        return taskOutput
    }
}
