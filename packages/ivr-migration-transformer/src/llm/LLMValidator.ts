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
import { LLMBase } from "./LLMBase";
import type { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { cleanAndMinifyJson, LexUpdateIntentSchema, LexUpdateSlotSchema, LexUpdateSlotTypeSchema } from "@ivr-migration-tool/schemas";
import { getLogger } from "../common/logger";
import stringify from "json-stringify-safe";

export type LexResourcesContext = {
    intents: { [intentName: string]: string[] },
    slotTypes: string[];
}
export interface LexResourceModification {
    type: 'intent' | 'slot' | 'slotType';
    resources: { intentName?: string, slotName?: string, slotTypeName: string }[];
}

export type Conversation = {
    role: string;
    content: Array<{ type: string; text: string; }>;
}

/**
 * A class that provides validation and error correction functionality for AWS Lex V2 API operations.
 * Extends the base LLM class to leverage foundation model capabilities for analyzing and fixing Lex resource issues.
 */
export class LLMValidator extends LLMBase {

    /**
     * Creates a new instance of LLMValidator
     * @param log - Logger instance for logging operations
     * @param bedrockClient - AWS Bedrock Runtime client for making API calls
     * @param modelId - ID of the foundation model to use for validation
     */
    constructor(
        protected readonly log: Logger<any, boolean>,
        protected readonly bedrockClient: BedrockRuntimeClient,
        protected readonly modelId: string
    ) {
        super(log, bedrockClient, modelId)
    }

    /**
     * Validates and corrects API payload based on the command type and error message
     * @param command - The AWS Lex V2 API command being executed (e.g., UpdateIntentCommand)
     * @param payload - The API payload that needs validation and correction
     * @param error - The error message received from the API call
     * @param previousConversation - Optional array of previous conversation history
     * @returns Promise containing a tuple of [corrected payload, conversation history]
     * @template T - The expected type of the corrected payload
     */
    public async fixLexApiPayloadFromError<T>(command: string, payload: Record<string, any>, error: string, previousConversation?: Conversation[]): Promise<[T, Conversation[]]> {
        const logger = getLogger(this.log, 'LLMValidator', 'fixLexApiPayloadFromError');
        logger.trace(`in: command: ${command}, payload: ${stringify(payload)}, error: ${error}`)

        const getSchema = (command: string) => {
            switch (command) {
                case 'UpdateIntentCommand':
                case 'CreateIntentCommand':
                    return `
                        <IntentSchema>
                        ${cleanAndMinifyJson(LexUpdateIntentSchema)}
                        </IntentSchema>
                        `;
                case 'UpdateSlotCommand':
                case 'CreateSlotCommand':
                    return `
                         <SlotSchema>
                        ${cleanAndMinifyJson(LexUpdateSlotSchema)}
                        </SlotSchema>
                        `;
                case 'UpdateSlotType':
                case 'CreateSlotType':
                    return `
                         <SlotTypeSchema>
                        ${cleanAndMinifyJson(LexUpdateSlotTypeSchema)}
                        </SlotTypeSchema>
                        `
                default:
                    return ''
            }
        }

        const systemPrompt = `You are an expert on AWS Lex V2 API. `

        const userPrompt = `There is a call made to ${command} with the following payload

        ## Payload
        \`\`\`json
        ${JSON.stringify(payload)}
        \`\`\`

        ${getSchema(command)}

        ## Error
        And I got the following error: ${error}

        Fix the payload based on the error command and return the full JSON payload
        
        ## Result
        \`\`\`json
        \`\`\`
    `

        let initialConversation = [
            {
                role: 'user',
                content: [{ type: 'text', text: userPrompt }],
            },
        ];


        if (previousConversation ?? [].length > 0) {
            initialConversation = [
                ...previousConversation!,
                ...initialConversation
            ]
        }

        const initialResponse = await this.invokeModel(initialConversation, systemPrompt);
        logger.trace(initialResponse);

        const dialogHistory: Conversation[] = [
            ...initialConversation,
            {
                role: 'assistant',
                content: [{ type: 'text', text: initialResponse }]
            }
        ]

        const validatedInput = this.extractJsonFromString<T>(initialResponse)

        logger.trace(`out: validatedInput: ${stringify(validatedInput)}`);

        return [validatedInput, dialogHistory];
    }

    /**
     * Generates recommendations for improving Lex resources based on test execution results
     * @param errorMessage - Error message from test execution
     * @param context - Additional context information about the Lex resources
     * @returns Promise containing a tuple of [one line summary, detailed recommendation]
     */
    public async generateLexResourceRecommendations<T>(errorMessage: string, context: string): Promise<[string, string]> {
        const logger = getLogger(this.log, 'LLMValidator', 'generateLexResourceRecommendations');
        logger.trace(`in: errorMessage: ${errorMessage}, context: ${context}`)

        const systemPrompt = `You are an expert on AWS Lex V2 API. Your task is to fix issues in Lex resources based on error messages.`;

        const userPrompt = `Instruction:
- Analyze the error and provide step-by-step instructions to fix the identified issues
- Include JSON code snippets demonstrating the required changes with proper indentation
- Format response using markdown syntax with clear section headers and bullet points
- Keep recommendations concise, specific and immediately actionable
- Identify the exact resource type that needs modification (Slot Types, Slots or Intents) with the specific resource name
- For each resource, specify:
  - The exact property path that needs to be modified
  - The current problematic value
  - The recommended value with explanation
  - Any dependencies or side effects of the change
- Include the AWS console link from <Link> with proper resource IDs for direct navigation
- Validate that all recommended changes comply with Lex V2 schema requirements
- Prioritize changes if multiple issues exist, listing them in order of dependency

${context}

<TestExecutionResult>
${errorMessage}
<TestExecutionResult>

<IntentSchema>
${cleanAndMinifyJson(LexUpdateIntentSchema)}
</IntentSchema>

<SlotSchema>
${cleanAndMinifyJson(LexUpdateSlotSchema)}
</SlotSchema>

<SlotTypeSchema>
${cleanAndMinifyJson(LexUpdateSlotTypeSchema)}
</SlotTypeSchema>

<Link>
1. To fix an intent, navigate to [Intent Configuration](https://console.aws.amazon.com/lexv2/home#bot/<BotId>/version/<BotVersion>/locale/<localeId>/intent/<IntentId>)
2. To fix a slot type, navigate to [Slot Type Configuration](https://console.aws.amazon.com/lexv2/home#bot/<BotId>/version/<BotVersion>/locale/<localeId>/slotType/<slotTypeId>)

Please replace <BotId>, <BotVersion>, <localeId>, <IntentId> and <slotTypeId> with the actual values from your bot configuration.
</Link>
        `;

        const conversation = [
            {
                role: 'user',
                content: [{ type: 'text', text: userPrompt }],
            },
        ];

        const recommendation = await this.invokeModel(conversation, systemPrompt);

        logger.trace(recommendation)

        const oneLineSummary = await this.invokeModel([
            {
                role: 'user',
                content: [{
                    type: 'text', text: `Generate one line summary for the following recommendation:
                    
<Recommendation>
${recommendation}
</Recommendation>
` }],
            },
        ], systemPrompt)

        logger.trace(`out: updatedResponse: ${stringify(recommendation)}`);
        return [oneLineSummary, recommendation]
    }

    /**
     * Validates and corrects build errors in Lex resources
     * @param errorMessage - Error message from the Lex build process
     * @param payload - The resource payload that caused the build error
     * @param context - Additional context information about the resource
     * @returns Promise containing the corrected resource payload
     */
    public async fixLexBuildError<T>(errorMessage: string, payload: T, context: string): Promise<T> {
        const logger = getLogger(this.log, 'LLMValidator', 'fixLexBuildError');
        logger.trace(`in: errorMessage: ${errorMessage}, payload: ${stringify(payload)}`)

        const systemPrompt = `You are an expert on AWS Lex V2 API. Your task is to fix issues in Lex resources based on error messages.`;

        const userPrompt = `Instruction:
- Plan how do you want to fix the issue
- Fix the current resource and return the updated resource

## Additional Context
${context}

## Error
${JSON.stringify(errorMessage)}

## Current Resource
\`\`\`json
${JSON.stringify(payload)}
\`\`\`

Fix the resource based on the error command and return the full json

## Fixed response
\`\`\`json
\`\`\`
        `;

        const conversation = [
            {
                role: 'user',
                content: [{ type: 'text', text: userPrompt }],
            },
        ];

        const response = await this.invokeModel(conversation, systemPrompt);
        logger.trace(response)
        const updatedResponse = this.extractJsonFromString<T>(response);
        logger.trace(`out: updatedResponse: ${stringify(updatedResponse)}`);
        return updatedResponse
    }

    /**
     * Extracts resources that need to be modified based on a Lex build error message
     * @param errorMessage - The error message received from Lex build process
     * @param resourcesContext - Context containing information about existing Lex resources (intents and slot types)
     * @returns Promise containing details of the resources that need modification, including type and resource identifiers
     */
    public async extractResourcesFromLexError(errorMessage: string, resourcesContext: LexResourcesContext): Promise<LexResourceModification> {
        const logger = getLogger(this.log, 'LLMValidator', 'extractResourcesFromLexError');
        logger.trace(`in: errorMessage: ${errorMessage}, resourcesContext: ${resourcesContext}`)

        const resourcesContextPromptElement = `
## Intents
${Object.entries(resourcesContext.intents).map(([intentName, slots]) => `- Intent Name :${intentName}, Slots: ${slots.join(',')}`).join('\r\n')}

## SlotTypes
${resourcesContext.slotTypes.map(s => `- ${s}`).join('\r\n')}
        `;

        const systemPrompt = `You are an expert on AWS Lex V2 API. You have deep knowledge of the Lex V2 API schema, validation rules, and best practices. Your task is to analyze and fix issues in Lex resources while maintaining compliance with AWS specifications.`

        const userPrompt = `I got this error when building Amazon Lex V2 Bot
## Error
\`\`\`json
${JSON.stringify(errorMessage)}
\`\`\`

<ResourcesContext>
${resourcesContextPromptElement}
</ResourcesContext>

<IntentSchema>
${cleanAndMinifyJson(LexUpdateIntentSchema)}
</IntentSchema>

<SlotSchema>
${cleanAndMinifyJson(LexUpdateSlotSchema)}
</SlotSchema>

<SlotTypeSchema>
${cleanAndMinifyJson(LexUpdateSlotTypeSchema)}
</SlotTypeSchema>

<Instructions>
- Extract intent, slot or slotType that needs to be modified from the error message.
- Leave out any properties that cannot be extracted from the error message.
- Do not add missing slots - instead, remove slots from utterances.
- User <IntentSchema> <SlotSchema> <SlotTypeSchema> to validate the resource type.
- The <ResourcesContext> contains all resources created in Lex, use this information to help you determine the resource type to fix.
- Return the resource details in JSON format with the following structure:
    - type: intent, slot, or slotType
    - resources: array of objects containing slotName, intentName, and slotTypeName
</Instructions>

## Output
\`\`\`json
{
    "type": "intent | slot | slotType",
    "resources": [{"slotName":"<slotName>", "intentName:"<intentName>", slotTypeName:"<slotTypeName>"}]
}
\`\`\`
        `

        const initialConversation = [
            {
                role: 'user',
                content: [{ type: 'text', text: userPrompt }],
            },
        ];

        const initialResponse = await this.invokeModel(initialConversation, systemPrompt);
        logger.trace(initialResponse);

        const validatedInput = this.extractJsonFromString<LexResourceModification>(initialResponse)
        logger.trace(`out: validatedInput: ${stringify(validatedInput)}`)
        return validatedInput;
    }

}
