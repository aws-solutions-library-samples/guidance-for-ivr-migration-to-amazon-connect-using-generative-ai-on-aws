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

import { DescribeIntentCommand, DescribeSlotCommand, DescribeSlotTypeCommand, ListIntentsCommand, ListSlotsCommand, ListSlotTypesCommand, type DescribeIntentCommandOutput, type LexModelsV2Client, type SlotSummary, type UpdateIntentCommandInput, type UpdateIntentCommandOutput, type UpdateSlotCommandInput, type UpdateSlotCommandOutput, type UpdateSlotTypeCommandInput, type UpdateSlotTypeCommandOutput } from "@aws-sdk/client-lex-models-v2";
import type { Logger } from "pino";
import { LLMValidator } from '../../../ivr-migration-transformer/src/llm/LLMValidator';
import { cleanAndMinifyJson, LexUpdateIntentSchema, LexUpdateSlotSchema, LexUpdateSlotTypeSchema, type BotsApiSchema, } from "@ivr-migration-tool/schemas";
import { getLogger } from "../common/logger";
import stringify from "json-stringify-safe";
import ow from 'ow';
import type { BotsService } from "../api/bots/service";
import { BaseValidatorTask, type FixBotInput, type FixBotOutput } from "./baseValidatorTask";
import { intentPrompt, slotPrompt, slotTypePrompt } from "./prompt";

export type SlotContext = string;
export type SlotContextOutput = [UpdateSlotCommandInput, SlotContext]

export class FixBotTask extends BaseValidatorTask<FixBotInput, FixBotOutput> {

    constructor(
        protected readonly log: Logger<any, boolean>,
        protected readonly lexClient: LexModelsV2Client,
        protected readonly llmValidator: LLMValidator,
        protected readonly botsService: BotsService,
    ) {
        super(log, lexClient, llmValidator)
    }

    /**
     * Assembles the context needed for slot type validation and updates.
     * @param bot - The bot object containing id, locale and other bot details
     * @param slotTypeName - Name of the slot type to assemble context for
     * @returns A tuple containing [UpdateSlotTypeCommandInput, context string] where:
     *          - UpdateSlotTypeCommandInput contains the slot type configuration to be updated
     *          - context string contains the validation schema and prompt for LLM validation
     */
    private async assembleSlotTypeContext(bot: BotsApiSchema.Bot, slotTypeName: string): Promise<[UpdateSlotTypeCommandInput, string]> {

        const commonParameters = {
            botId: bot.id,
            localeId: bot.locale,
            botVersion: bot.version,
        }

        const listSlotTypesResponse = await this.lexClient.send(new ListSlotTypesCommand(commonParameters));

        const getSlotTypeFutures = listSlotTypesResponse.slotTypeSummaries?.filter(s => s.slotTypeName === slotTypeName).map(s => this.lexClient.send(new DescribeSlotTypeCommand({
            ...commonParameters,
            slotTypeId: s.slotTypeId
        })));

        const slotType = (await Promise.all(getSlotTypeFutures!)).pop();

        const context = `
        ## Syntax Validation
        ${slotTypePrompt}

        <SlotTypeSchema>
        ${cleanAndMinifyJson(LexUpdateSlotTypeSchema)}
        </SlotTypeSchema>
        `
        return [{
            ...slotType!,
            ...commonParameters,
        } as UpdateSlotTypeCommandInput, context];
    }

    /**
     * Assembles the context needed for slot validation and updates.
     * @param bot - The bot object containing id, locale and other bot details
     * @param slotName - Name of the slot to assemble context for
     * @param intentName - Optional name of the intent containing the slot. If not provided, will search all intents
     * @returns Array of tuples containing slot update command input and context string for validation
     */
    private async assembleSlotContext(bot: BotsApiSchema.Bot, slotName: string, intentName: string): Promise<SlotContextOutput[]> {
        const commonParameters = {
            botId: bot.id,
            localeId: bot.locale,
            botVersion: bot.version,
        }

        const getSlotDetails = async (intent: DescribeIntentCommandOutput, slotSummaries: SlotSummary[]): Promise<SlotContextOutput> => {
            const getSlotFutures = slotSummaries?.filter(s => s.slotName === slotName)
                .map(s => this.lexClient.send(new DescribeSlotCommand({
                    ...commonParameters,
                    intentId: intent.intentId!,
                    slotId: s.slotId
                })));

            const slot = (await Promise.all(getSlotFutures!)).pop();

            const context = `
## Intent
\`\`\`json
${stringify(intent!)}
\`\`\`

<SlotSchema>
${cleanAndMinifyJson(LexUpdateSlotSchema)}
</SlotSchema>

<Guideline>
${slotPrompt}
<Guideline>
        `
            return [{
                ...slot!,
                ...commonParameters,
                intentId: intent!.intentId!,
            } as UpdateSlotCommandInput, context]
        }

        const slotContextOutputList = [];

        const listIntentsCommandOutput = await this.lexClient.send(new ListIntentsCommand(commonParameters));

        // If an intent name is provided, find the specific intent and its slots
        if (intentName) {
            // Find the intent summary matching the provided name
            const intentSummary = listIntentsCommandOutput.intentSummaries?.find(i => i.intentName === intentName)
            // Get the full intent details
            const intent = await this.lexClient.send(new DescribeIntentCommand({
                ...commonParameters,
                intentId: intentSummary?.intentId
            }));
            // Get all slots for this intent
            const listSlotsResponse = await this.lexClient.send(new ListSlotsCommand({
                ...commonParameters,
                intentId: intent!.intentId
            }));
            // Get slot details and context for validation
            const slotContextOutput = await getSlotDetails(intent, listSlotsResponse.slotSummaries!)
            slotContextOutputList.push(slotContextOutput);
        } else {
            // If no intent name provided, search through all intents
            // Get slots for all intents in parallel
            const getIntentsFutures = listIntentsCommandOutput.intentSummaries?.map(i => this.lexClient.send(new ListSlotsCommand({
                ...commonParameters,
                intentId: i!.intentId
            })));
            const getIntentsResponses = await Promise.all(getIntentsFutures!);
            // Check each intent's slots for a match
            for (const [index, listSlotsResponse] of getIntentsResponses.entries()) {
                const slot = listSlotsResponse.slotSummaries?.find(s => s.slotName === slotName);
                if (slot) {
                    // When matching slot found, get full intent details
                    const intent = await this.lexClient.send(new DescribeIntentCommand({
                        ...commonParameters,
                        intentId: listIntentsCommandOutput.intentSummaries![index].intentId
                    }));
                    // Get slot details and context for validation
                    const slotContextOutput = await getSlotDetails(intent, listSlotsResponse.slotSummaries!)
                    slotContextOutputList.push(slotContextOutput);
                }
            }
        }

        return slotContextOutputList;
    }

    /**
     * Assembles the context needed for intent validation and updates.
     * @param bot - The bot object containing id, locale and other bot details
     * @param intentName - Name of the intent to assemble context for
     * @returns A tuple containing [UpdateIntentCommandInput, context string] where:
     *          - UpdateIntentCommandInput contains the intent configuration to be updated
     *          - context string contains the validation schema, prompt and available slots for LLM validation
     */
    private async assembleIntentContext(bot: BotsApiSchema.Bot, intentName: string): Promise<[UpdateIntentCommandInput, string]> {
        const logger = getLogger(this.log, 'fixBotErrorTask', 'assembleIntentContext');
        logger.trace(`in: bot: ${stringify(bot)}, intentName: ${intentName}`)

        let listIntentsResponse;
        let allIntentSummaries = [];
        let nextToken;

        const commonParameters = {
            botId: bot.id,
            localeId: bot.locale,
            botVersion: bot.version,
        }


        do {
            listIntentsResponse = await this.lexClient.send(new ListIntentsCommand({
                ...commonParameters,
                nextToken
            }));

            if (listIntentsResponse.intentSummaries) {
                allIntentSummaries.push(...listIntentsResponse.intentSummaries);
            }

            nextToken = listIntentsResponse.nextToken;
        } while (nextToken);

        const intentSummary = allIntentSummaries?.find(i => i.intentName === intentName);

        const intent = await this.lexClient.send(new DescribeIntentCommand({
            ...commonParameters,
            intentId: intentSummary?.intentId
        }));

        const listSlotsResponse = await this.lexClient.send(new ListSlotsCommand({
            ...commonParameters,
            intentId: intent?.intentId
        }));

        const getSlotFutures = listSlotsResponse.slotSummaries?.map(s => this.lexClient.send(new DescribeSlotCommand({
            ...commonParameters,
            intentId: intent?.intentId,
            slotId: s.slotId
        })));

        const slots = await Promise.all(getSlotFutures!);

        const context = `
        <IntentSchema>
        ${cleanAndMinifyJson(LexUpdateIntentSchema)}
        </IntentSchema>

        <Instruction>
        ${intentPrompt}
        </Instruction>

        <AvailableSlots>
        ${slots.map(s => ` - slotId:${s.slotId!}, slotName:${s.slotName}, slotDescription:${s.description}, slotConstraint: ${s.valueElicitationSetting?.slotConstraint}\r\n`)}
        </AvailableSlots>
        `
        const intentContextOutput: [UpdateIntentCommandInput, string] = [{
            ...intent!,
            ...commonParameters,
            intentId: intent?.intentId!,
            intentName: intent?.intentName!,
        }, context]

        logger.trace(`out: intentContextOutput: ${stringify(intentContextOutput)}`)

        return intentContextOutput;
    }

    private async updateIntent(updateIntentCommandInput: UpdateIntentCommandInput): Promise<void> {
        this.updateLexResource<UpdateIntentCommandInput, UpdateIntentCommandOutput>('UpdateIntentCommand', updateIntentCommandInput, updateIntentCommandInput.intentId!);
    }

    private async updateSlotType(updateSlotTypeCommandInput: UpdateSlotTypeCommandInput): Promise<void> {
        this.updateLexResource<UpdateSlotTypeCommandInput, UpdateSlotTypeCommandOutput>('UpdateSlotTypeCommand', updateSlotTypeCommandInput, updateSlotTypeCommandInput.slotTypeId!);
    }

    private async updateSlot(updateSlotCommandInput: UpdateSlotCommandInput): Promise<void> {
        this.updateLexResource<UpdateSlotCommandInput, UpdateSlotCommandOutput>('UpdateSlotCommand', updateSlotCommandInput, updateSlotCommandInput.slotId!);
    }

    public async process(input: FixBotInput): Promise<FixBotOutput> {

        const logger = getLogger(this.log, 'fixBotErrorTask', 'process');
        logger.trace(`in: input: ${stringify(input)}`);

        const { bot, failureReasons, resourcesContext } = input
        ow(bot, ow.object.partialShape({
            id: ow.string.nonEmpty,
            locale: ow.string.nonEmpty,
        }))

        ow(failureReasons, ow.array.nonEmpty)
        const failureReason = failureReasons.pop();
        ow(failureReason, ow.string.nonEmpty)
        ow(resourcesContext, ow.object.exactShape({
            intents: ow.object.nonEmpty,
            slotTypes: ow.object.nonEmpty
        }))

        const updatedBot = await this.botsService.get(this.securityContext, bot.id)

        const statusMessage = `Fixing built failure: ${failureReason}.`

        await this.botsService.update(this.securityContext, bot.id, {
            status: 'in-progress',
            statusMessages: [...updatedBot.statusMessages, { message: statusMessage, status: 'in-progress' }]
        });

        let status: BotsApiSchema.BotStatus = 'success';

        try {
            const resourceToFix = await this.llmValidator.extractResourcesFromLexError(failureReason!, resourcesContext);

            for (const resource of resourceToFix.resources) {
                switch (resourceToFix.type) {
                    case 'intent': {
                        const [intent, intentContext] = await this.assembleIntentContext(bot, resource.intentName!);
                        const updatedIntentRequest = await this.llmValidator.fixLexBuildError<UpdateIntentCommandInput>(
                            failureReason!,
                            intent,
                            intentContext
                        );
                        await this.updateIntent({ ...updatedIntentRequest, intentId: intent.intentId });
                    }
                        break;
                    case 'slot': {
                        // Some build error contains for slots that exist in multiple intents
                        const slotContextOutputs = await this.assembleSlotContext(bot, resource.slotName!, resource.intentName!);
                        for (const slotContextOutput of slotContextOutputs) {
                            const [slot, slotContext] = slotContextOutput
                            const updatedSlotRequest = await this.llmValidator.fixLexBuildError<UpdateSlotCommandInput>(
                                failureReason!,
                                slot,
                                slotContext
                            );
                            await this.updateSlot({ ...updatedSlotRequest, slotId: slot.slotId });
                        }
                    }
                        break;
                    case 'slotType': {
                        const [slotType, slotTypeContext] = await this.assembleSlotTypeContext(bot, resource.slotTypeName!);
                        const updatedSlotTypeRequest = await this.llmValidator.fixLexBuildError<UpdateSlotTypeCommandInput>(
                            failureReason!,
                            slotType,
                            slotTypeContext
                        );
                        await this.updateSlotType({ ...updatedSlotTypeRequest, slotTypeId: slotType.slotTypeId });
                    }
                        break;
                    default:
                        this.log.warn(`Unknown resource type: ${resourceToFix.type}`);
                        break;
                }
            }
        } catch (err) {
            logger.error(err as Error);
            status = 'error'
        }

        await this.botsService.update(this.securityContext, bot.id, {
            status: 'in-progress',
            statusMessages: [...updatedBot.statusMessages, { message: statusMessage, status }]
        });

        return {
            ...input,
            failureReasons: failureReasons,
            failureReasonsToFix: failureReasons.length
        }
    }


}
