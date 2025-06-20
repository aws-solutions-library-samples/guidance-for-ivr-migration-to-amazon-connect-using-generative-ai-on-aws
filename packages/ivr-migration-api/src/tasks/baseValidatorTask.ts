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
import { SecurityScope, type SecurityContext } from "../common/scopes";
import { CreateIntentCommand, CreateSlotCommand, CreateSlotTypeCommand, UpdateIntentCommand, UpdateSlotCommand, UpdateSlotTypeCommand, type CreateIntentCommandInput, type CreateSlotCommandInput, type CreateSlotTypeCommandInput, type LexModelsV2Client, type UpdateIntentCommandInput, type UpdateSlotCommandInput, type UpdateSlotTypeCommandInput } from "@aws-sdk/client-lex-models-v2";
import type { Conversation, LexResourcesContext, LLMValidator } from "@ivr-migration-tool/transformer";
import { getLogger } from "../common/logger";
import stringify from "json-stringify-safe";
import type { BotsApiSchema } from "@ivr-migration-tool/schemas";
import type { TransformedResponseTaskOutput } from "./baseGeneratorTask";
import { intentPrompt as intentSyntaxErrorPrompt, slotPrompt as slotSyntaxErrorPrompt, slotTypePrompt as slotTypeSyntaxErrorPrompt } from './prompt';

export type CreateSlotTypeInput = {
    bot: BotsApiSchema.Bot,
    input: {
        slotTypes: string[];
        slotTypesToProcess?: number;
        intents: string[];
        intentsToProcess?: number;
    },
    output: TransformedResponseTaskOutput
}

export type CreateSlotTypeOutput = {
    bot: BotsApiSchema.Bot,
    input: {
        slotTypes: string[];
        slotTypesToProcess?: number;
        intents: string[];
        intentsToProcess?: number;
    },
    output: TransformedResponseTaskOutput
}

export type CreateIntentInput = {
    bot: BotsApiSchema.Bot,
    input: {
        intents: string[];
        intentsToProcess?: number;
    },
    output: TransformedResponseTaskOutput
}

export type CreateIntentOutput = CreateIntentInput

export type BuildBotInput = { bot: BotsApiSchema.Bot, numOfRetry: number; };

export type BuildBotOutput = {
    bot: BotsApiSchema.BotInternal,
    resourcesContext: LexResourcesContext | undefined;
    failureReasons: string[]
    failureReasonsToFix: number;
    numOfRetry: number;
}

export type FixBotInput = BuildBotOutput

export type FixBotOutput = FixBotInput

/**
 * Abstract base class for validator tasks that interact with Amazon Lex resources.
 * Provides common functionality for validating and updating Lex resources like intents, slots and slot types.
 * 
 * @template T - The input type for the validator task
 * @template V - The output type for the validator task
 */
export abstract class BaseValidatorTask<T, V> {

    protected securityContext: SecurityContext;

    constructor(
        protected readonly log: Logger<any, boolean>,
        protected readonly lexClient: LexModelsV2Client,
        protected readonly llmValidator: LLMValidator

    ) {
        this.securityContext = {
            email: 'transformTask',
            role: SecurityScope.contributor,
            sub: 'transformTask',
        };
    }

    /**
     * Disables all code hooks in the intent configuration
     * This includes dialog hooks, fulfillment hooks, initial response hooks and confirmation hooks
     * Code hooks are disabled to prevent any Lambda function invocations during bot execution
     * @param payload The intent configuration input that may contain code hooks to disable
     */
    private disableCodeHooks(payload: CreateIntentCommandInput): void {
        // Disable dialog code hook if present
        if (payload?.dialogCodeHook?.enabled) {
            payload.dialogCodeHook.enabled = false;
        }

        // Disable fulfillment code hook if present 
        if (payload?.fulfillmentCodeHook?.enabled) {
            payload.fulfillmentCodeHook.enabled = false;
        }

        // Disable initial response code hook if present
        if (payload.initialResponseSetting?.codeHook) {
            payload.initialResponseSetting.codeHook.active = false;
            payload.initialResponseSetting.codeHook.enableCodeHookInvocation = false;
        }

        // Disable intent confirmation code hook if present
        if (payload.intentConfirmationSetting?.codeHook) {
            payload.intentConfirmationSetting.codeHook.active = false;
            payload.intentConfirmationSetting.codeHook.enableCodeHookInvocation = false;
        }
    }


    /**
    * Executes a Lex API command based on the provided command type and input
    * @param commandType - The type of Lex command to execute (e.g. UpdateIntentCommand, CreateSlotCommand)
    * @param commandInput - The input parameters for the command
    * @returns Promise containing the response from the Lex API call
    */
    private executeLexCommandFuture(commandType: string, commandInput: any): any {
        const logger = getLogger(this.log, 'baseValidatorTask', 'executeLexCommandFuture');
        logger.trace(`in: commandType: ${commandType}, commandInput: ${stringify(commandInput)}`);

        let response;
        if (commandType === 'UpdateIntentCommand') {
            response = this.lexClient.send(new UpdateIntentCommand(commandInput as UpdateIntentCommandInput));
        } else if (commandType === 'CreateIntentCommand') {
            response = this.lexClient.send(new CreateIntentCommand(commandInput as CreateIntentCommandInput));
        } else if (commandType === 'UpdateSlotCommand') {
            response = this.lexClient.send(new UpdateSlotCommand(commandInput as UpdateSlotCommandInput));
        } else if (commandType === 'UpdateSlotTypeCommand') {
            response = this.lexClient.send(new UpdateSlotTypeCommand(commandInput as UpdateSlotTypeCommandInput));
        } else if (commandType === 'CreateSlotCommand') {
            response = this.lexClient.send(new CreateSlotCommand(commandInput as CreateSlotCommandInput));
        } else if (commandType === 'CreateSlotTypeCommand') {
            response = this.lexClient.send(new CreateSlotTypeCommand(commandInput as CreateSlotTypeCommandInput));
        }

        logger.trace(`out: response: ${stringify(response)}`);
        return response;
    }


    /**
     * Gets the appropriate conversation context for validating Lex resources based on command type
     * @param commandType - The type of Lex command being executed (e.g. UpdateIntentCommand, CreateSlotCommand)
     * @returns Conversation object containing the appropriate validation prompt for the resource type
     */
    private getValidationPromptForResourceType(commandType: string): Conversation {
        const logger = getLogger(this.log, 'baseValidatorTask', 'getValidationPromptForResourceType');
        logger.trace(`in: commandType: ${commandType}`);

        let context: Conversation;
        switch (commandType) {
            case 'UpdateIntentCommand':
            case 'CreateIntentCommand':
                context = {
                    role: "user",
                    content: [{
                        type: "text",
                        text: intentSyntaxErrorPrompt
                    }]
                }
                break;
            case 'UpdateSlotCommand':
            case 'CreateSlotCommand':
                context = {
                    role: "user",
                    content: [{
                        type: "text",
                        text: slotSyntaxErrorPrompt
                    }]
                }
                break;
            case 'UpdateSlotTypeCommand':
            case 'CreateSlotTypeCommand':
                context = {
                    role: "user",
                    content: [{
                        type: "text",
                        text: slotTypeSyntaxErrorPrompt
                    }]
                }
                break;
            default:
                throw new Error(`Unknown command type: ${commandType}`);
        }

        logger.trace(`out: context: ${stringify(context)}`);
        return context;
    }

    /**
     * Updates a Lex resource (intent, slot, or slot type) by executing the appropriate Lex API command
     * Handles validation errors by using LLM validator to fix invalid input payloads
     * Retries failed commands up to 5 times before failing
     * 
     * @param commandType - The type of Lex command to execute (e.g. UpdateIntentCommand, CreateSlotCommand)
     * @param commandInput - The input parameters for the command
     * @param resourceId - Optional ID of the resource being updated
     * @returns Promise containing the response from the Lex API call
     * @throws Error if max retries (5) are exceeded
     * @template I - Type of the command input
     * @template O - Type of the command output/response
     */
    protected async updateLexResource<I, O>(
        commandType: string,
        commandInput: I,
        resourceId?: string
    ): Promise<O> {
        const resourceType = commandType.replace('Update', '').replace('Command', '').toLowerCase();
        const logger = getLogger(this.log, 'baseValidatorTask', `update${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`);
        logger.trace(`in: ${resourceType}CommandInput: ${stringify(commandInput)}`);

        let keepGoing = true;
        let counter = 0;
        let response: any;
        let dialogHistory: Conversation[] = [];

        // Add the appropriate ID field to the input
        let inputWithId: any = {
            ...commandInput as object,
        };

        if (resourceId) {
            inputWithId[resourceType === 'intent' ? 'intentId' : resourceType === 'slot' ? 'slotId' : 'slotTypeId'] = resourceId
        }

        dialogHistory.push(this.getValidationPromptForResourceType(commandType));

        // Keep trying to execute the command until successful or max retries reached
        while (keepGoing && counter < 5) {
            try {

                // Disable any code hooks in the input configuration
                this.disableCodeHooks(inputWithId);
                // Execute the Lex API command
                response = await this.executeLexCommandFuture(commandType, inputWithId);
                // Command succeeded, exit loop
                keepGoing = false;
            } catch (err) {
                // If validation or serialization error occurs
                if (err instanceof Error && (err.name === 'ValidationException' || err.name === 'SerializationException')) {
                    // Use LLM validator to fix the input payload
                    const [validatedInput, history] = await this.llmValidator.fixLexApiPayloadFromError<T>(
                        commandType,
                        inputWithId,
                        err.message,
                        dialogHistory
                    );
                    // Update dialog history and input for next attempt
                    dialogHistory = history;
                    inputWithId = validatedInput;
                } else {
                    // For any other errors, rethrow
                    throw err;
                }
            }
            // Increment retry counter
            counter++;
            // Throw error if max retries exceeded
            if (counter === 5) {
                throw new Error('Retry too many times.');
            }
        }

        logger.trace(`out: ${resourceType}Response: ${stringify(response!)}`);
        return response!;
    }


    abstract process(event: T): Promise<V>;
}
