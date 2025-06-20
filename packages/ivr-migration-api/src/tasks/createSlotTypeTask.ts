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

import { type CreateSlotTypeCommandInput, type CreateSlotTypeCommandOutput, type LexModelsV2Client } from "@aws-sdk/client-lex-models-v2";
import type { LLMValidator } from "@ivr-migration-tool/transformer";
import { type Logger } from "pino";
import ow from 'ow';
import { getLogger } from "../common/logger";
import stringify from "json-stringify-safe";
import type { SlotTypeExportDefinition } from "../../../ivr-migration-schemas/src/models/lex/slotType";
import type { BotsService } from "../api/bots/service";
import { BaseValidatorTask, type CreateSlotTypeInput, type CreateSlotTypeOutput } from "./baseValidatorTask";

export class CreateSlotTypeTask extends BaseValidatorTask<CreateSlotTypeInput, CreateSlotTypeOutput> {
    constructor(
        protected readonly log: Logger<any, boolean>,
        protected readonly lexClient: LexModelsV2Client,
        protected readonly llmValidator: LLMValidator,
        protected readonly botsService: BotsService,
    ) {
        super(log, lexClient, llmValidator)
    }

    public async process(event: CreateSlotTypeInput): Promise<CreateSlotTypeOutput> {
        const logger = getLogger(this.log, 'buildSlotTypesTask', 'process');
        logger.trace(`in: event: ${stringify(event)}`);

        ow(event.input.slotTypes, ow.array.nonEmpty);
        ow(event.output?.slotTypes, ow.object.nonEmpty)

        const { bot, input, output } = event;
        const slotTypeName = input.slotTypes.pop();
        const slotType: SlotTypeExportDefinition = output.slotTypes?.[slotTypeName!]!;

        const updatedBot = await this.botsService.get(this.securityContext, bot.id)
        const statusMessage = `Creating slot type ${slotTypeName}.`
        await this.botsService.update(this.securityContext, bot.id, {
            status: 'in-progress',
            statusMessages: [...updatedBot.statusMessages, { message: statusMessage, status: 'in-progress' }]
        });

        const payload: CreateSlotTypeCommandInput = {
            botId: bot.id,
            botVersion: bot.version,
            localeId: bot.locale,
            ...slotType
        }
        await this.updateLexResource<CreateSlotTypeCommandInput, CreateSlotTypeCommandOutput>('CreateSlotTypeCommand', payload)

        await this.botsService.update(this.securityContext, bot.id, {
            status: 'in-progress',
            statusMessages: [...updatedBot.statusMessages, { message: statusMessage, status: 'success' }]
        });

        const taskOutput = {
            ...event,
            input: {
                ...input,
                slotTypes: input.slotTypes,
                slotTypesToProcess: input.slotTypes.length
            }
        }

        logger.trace(`out: taskOutput: ${stringify(taskOutput)}`)
        return taskOutput
    }
}
