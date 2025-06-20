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
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { cleanAndMinifyJson, LexBotLocaleModel, LexBotModel, LexCustomVocabModel, LexIntentModel, LexIntentSchema, LexSlotSchema, LexSlotTypeSchema, NuanceDialogAppSchema, type LexSlotModel, type LexSlotTypeModel, type NuanceDialogAppModel } from "@ivr-migration-tool/schemas";
import ow from 'ow';
import { getLogger } from "../common/logger";
import stringify from "json-stringify-safe";
import { TRSX } from '@ivr-migration-tool/transformer';
import type { Project } from "../trsx/models";
import bestPracticeText from "./bestPractice.html" with { type: "text" };
import bestPracticeSlotText from "./bestPracticeSlots.html" with { type: "text" };
import bestPracticeTestSet from "./testSetInstruction.html" with { type: "text" };
import { type TransformedResponseTaskOutput } from '../../../ivr-migration-api/src/tasks/baseGeneratorTask';
import type { SlotTypeExportDefinition } from "../../../ivr-migration-schemas/src/models/lex/slotType";
import type { SlotExportDefinition } from "../../../ivr-migration-schemas/src/models/lex/slot";
import { LLMBase } from "./LLMBase";


export type LLMTransformedIntent = LexIntentModel.Intent &
{
    slots: Record<string, LexSlotModel.SlotExportDefinition>
};

export type LLMTransformedOutput = Record<string, LexIntentModel.Intent &
{
    slots: Record<string, LexSlotModel.SlotExportDefinition>
}>;

export type ValidateLlmIntentOutput = {
    intent: LLMTransformedIntent,
    slots: Record<string, LexSlotModel.SlotExportDefinition>
    slotTypes: Record<string, LexSlotTypeModel.SlotTypeExportDefinition>
}

export interface BotExportStructure {
    bot: LexBotModel.BotExportDefinition;
    botLocales: {
        [locale: string]: {
            botLocale: LexBotLocaleModel.BotLocaleExportDefinition;
            intents: {
                [intentName: string]: LexIntentModel.Intent & {
                    slots: {
                        [slotName: string]: LexSlotModel.SlotExportDefinition
                    }
                };
            };
            slotTypes: {
                [typeName: string]: LexSlotTypeModel.SlotTypeExportDefinition;
            };
        };
    };
    customVocabulary?: {
        [locale: string]: LexCustomVocabModel.CustomVocabularyExportDefinition[];
    };
}

/**
 * LLMTransformer class handles transformation of Nuance Mix/Dialog.app components to AWS Lex V2 resources
 * using Large Language Models (LLM).
 * 
 * This class provides functionality to:
 * - Generate Lex V2 slots and slot types from TRSX and Dialog App projects
 * - Create test sets based on Nuance Mix dialog specifications 
 * - Generate Lex V2 intents for implicit/built-in intents
 * - Generate Lex V2 intents from Nuance components
 * - Validate and enhance Lex V2 intent outputs against best practices
 * 
 * @extends LLMBase Base class providing common LLM functionality
 */
export class LLMTransformer extends LLMBase {

    constructor(
        protected readonly log: Logger<any, boolean>,
        protected readonly bedrockClient: BedrockRuntimeClient,
        protected readonly modelId: string
    ) {
        super(log, bedrockClient, modelId)
    }

    /**
     * Generates Lex V2 slots and slot types from a TRSX project and Dialog App project
     * 
     * @param request Object containing:
     *   - trsxProject: The TRSX project containing concept definitions
     *   - dialogAppProject: The Nuance Dialog App project containing node definitions
     * @returns Object containing:
     *   - slots: Record of generated Lex slot definitions indexed by slot name
     *   - slotTypes: Record of generated Lex slot type definitions indexed by type name
     */
    public async generateSlots(request: { trsxProject: Project, dialogAppProject: NuanceDialogAppModel.NuanceMixProjectSchema }): Promise<
        {
            slots: Record<string, LexSlotModel.SlotExportDefinition>,
            slotTypes: Record<string, LexSlotTypeModel.SlotTypeExportDefinition>
        }> {

        const logger = getLogger(this.log, 'llmTransformer', 'generateSlots');
        logger.trace(`in: request: ${stringify(request)}`);

        const { trsxProject, dialogAppProject } = request

        ow(dialogAppProject, ow.object.nonEmpty);
        ow(trsxProject, ow.object.nonEmpty);

        // Find concept in Dialog App JSON that overlap with TRSX file
        const matchedConcepts = dialogAppProject.data!.ontology!.concepts!
            .map((dialogConcept: any) => {
                const trsxConcept = trsxProject.ontology?.concepts?.find((c) => c.name === dialogConcept.name);
                if (trsxConcept === undefined) return undefined;
                return {
                    ...dialogConcept,
                    ...trsxConcept,
                };
            })
            .filter((d) => d !== undefined);

        // Create a Dictionary indexed by concept Id
        const matchedConceptsDict = matchedConcepts.reduce((acc, concept) => {
            acc[concept.id] = concept;
            return acc;
        }, {} as Record<string, NuanceDialogAppModel.Entity1>);

        let slots: Record<string, LexSlotModel.SlotExportDefinition> = {};
        let slotTypes: Record<string, LexSlotTypeModel.SlotTypeExportDefinition> = {};

        for (const component of dialogAppProject.data?.components!) {
            // https://docs.nuance.com/mix/tools/mix-dialog/build-dialog-flows/nod-question-router/
            // Question router (controller) node is used to manage all entities required to fulfill an intent. The question router node specifies multiple pieces of information to be collected, and determines the next node in the dialog flow, based on the information collected so far. Here we can figure out all the concepts that we need to convert to Slot.
            const slotNodes = component.nodes!
                .filter((o: NuanceDialogAppModel.Node) => o.controllerNode)
                .flatMap((node) => (node.controllerNode as NuanceDialogAppModel.ControllerNode).concepts!.filter((o: any) => o.conceptId in matchedConceptsDict));

            for (let node of component.nodes!) {
                const nodeToBeProcessed = slotNodes.find((o) => o.collectGotoNodeId === node.id);
                if (nodeToBeProcessed) {
                    // retrieve the slot name
                    const slotName = matchedConceptsDict[nodeToBeProcessed.conceptId!].name;
                    // Here we're processing the node that is used to recognise the concept (slot)
                    const { slot, slotType } = await this.generateSlotFromRecognitionNode({ node, trsxProject, slotName });
                    slots[slot.slotName!] = slot;
                    if (slotType) {
                        slotTypes[slotType.slotTypeName!] = slotType;
                    }
                    // replace the node with text indicating that there is slot for this particular node
                    let nodeIndex = component.nodes!.findIndex((n) => n.id === node.id);
                    component.nodes![nodeIndex] = {
                        id: node.id,
                        parentComponentId: node.parentComponentId,
                        recognitionNode2: `This is converted to slot ${slotName}` as any,
                    };
                }
            }
        }

        const slotsToCreateFromTRSX = trsxProject.ontology?.concepts?.filter((o) => slots[o.name] === undefined) ?? []

        if (slotsToCreateFromTRSX.length > 0) {
            const trsxSlotResponse = await this.generateSlotFromTRSX({
                trsxProject,
                slotsToCreate: slotsToCreateFromTRSX
            });

            slots = {
                ...slots,
                ...Object.fromEntries(
                    trsxSlotResponse.slots.map((concept: SlotExportDefinition) => [concept.slotName, concept])
                )
            }

            slotTypes = {
                ...slotTypes,
                ...Object.fromEntries(
                    trsxSlotResponse.slotTypes.map((concept: SlotTypeExportDefinition) => [concept.slotTypeName, concept])
                )
            }
        }

        logger.trace(`out: slots: ${stringify(slots)}, slotTypes: ${stringify(slotTypes)}`)

        return {
            slots, slotTypes
        }
    }

    /**
     * Creates test sets for Lex V2 based on Nuance Mix dialog specification
     * 
     * @param request Object containing:
     *   - transformedResponseTaskOutput: The transformed response task output containing intents and slots
     *   - dialogAppProject: The Nuance Dialog App project containing node definitions
     *   - trsxProject: The TRSX project containing concept definitions
     * @returns CSV formatted string containing the generated test sets
     */
    public async createTestSetsFromNuanceSpecification(request: { transformedResponseTaskOutput: TransformedResponseTaskOutput, dialogAppProject: NuanceDialogAppModel.NuanceMixProjectSchema, trsxProject: TRSX.Project }): Promise<string> {
        const logger = getLogger(this.log, 'llmTransformer', 'createTestSetsFromNuanceSpecification');

        logger.trace(`in: request: ${stringify(request)}`)

        const system_prompt =
            'You are an expert in the migration of Interactive Voice Response (IVR) systems, with extensive experience in transitioning bots from legacy platforms such as Nuance.mix and Nuance Dialog.app to AWS Lex V2.';

        const { trsxProject, dialogAppProject, transformedResponseTaskOutput } = request;

        const user_prompt = `Instruction:
        - Create Lex V2 Test Sets based on Nuance Mix dialog specification <TRSXInput> and <DialogApp>
        - Ensure each row follows the column format
        
        <TRSXInput>
        ${cleanAndMinifyJson(trsxProject)}
        </TRSXInput>
        
        <DialogApp>
        ${cleanAndMinifyJson(dialogAppProject)}
        </DialogApp>

        <ExpectedIntents>
        ${cleanAndMinifyJson(Object.values(transformedResponseTaskOutput.intents!).map(i => `name: ${i.intentName}\r\ndescription: ${i.description}`).join('\r\n'))}
        </ExpectedIntents>

        <ExpectedSlots>
        ${cleanAndMinifyJson(Object.values(transformedResponseTaskOutput.slots!).map(i => `name: ${i.slotName}\r\ndescription: ${i.description}`).join('\r\n'))}
        </ExpectedSlots>

        <Instruction>
        ${bestPracticeTestSet}
        </Instruction>
        `
        const finalResponse = await this.invokeModel([
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: user_prompt,
                    },
                ],
            },
        ], system_prompt);

        logger.trace(finalResponse);

        const csvContent = this.extractCsvFromString(finalResponse);

        logger.trace(`out: csvContent: ${stringify(csvContent)}`);

        return csvContent;
    }


    /**
     * Generates Lex V2 slots and slot types from TRSX concepts that don't have corresponding Dialog App nodes
     * 
     * @param request Object containing:
     *   - trsxProject: The TRSX project containing concept definitions
     *   - slotsToCreate: Array of TRSX concepts to convert into Lex slots
     * @returns Object containing:
     *   - slots: Array of generated Lex slot definitions
     *   - slotTypes: Array of generated Lex slot type definitions
     */
    private async generateSlotFromTRSX(request: { trsxProject: TRSX.Project, slotsToCreate: TRSX.Concept[] }): Promise<{ slots: LexSlotModel.SlotExportDefinition[], slotTypes: LexSlotTypeModel.SlotTypeExportDefinition[] }> {
        const logger = getLogger(this.log, 'llmTransformer', 'generateSlotFromTRSX');

        logger.trace(`in: request: ${stringify(request)}`)

        const { trsxProject, slotsToCreate } = request

        ow(trsxProject, ow.object.nonEmpty);
        ow(slotsToCreate, ow.array.nonEmpty);

        const system_prompt =
            'You are an expert in the migration of Interactive Voice Response (IVR) systems, with extensive experience in transitioning bots from legacy platforms such as Nuance.mix and Nuance Dialog.app to AWS Lex V2.';

        const user_prompt = `Instruction:
	- Analyze the provided nuance TRSX file concepts.
	- Generate the AWS Lex V2 Slot and Slot types.
    - Use built-in slot type whenever possible.
	- Return JSON with the following format {"slots":"[array of generated slot]", "slotTypes":"[array of generated slot types]".
	
<LexSlotSchema>
${cleanAndMinifyJson(LexSlotSchema)}
</LexSlotSchema>

<LexSlotTypeSchema>
${cleanAndMinifyJson(LexSlotTypeSchema)}
</LexSlotTypeSchema>

<TRSXInput>
${cleanAndMinifyJson(trsxProject)}
</TRSXInput>

<BestPractice>
${bestPracticeSlotText}
</BestPractice>

<SlotsToGenerate>
${slotsToCreate.map(s => s.name).join('\r\n')}
</SlotsToGenerate>

Results
\`\`\`json
\`\`\``

        const finalResponse = await this.invokeModel([

            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: user_prompt,
                    },
                ],
            },
        ], system_prompt);

        const jsonResponse = this.extractJsonFromString<{ slots: LexSlotModel.SlotExportDefinition[], slotTypes: LexSlotTypeModel.SlotTypeExportDefinition[] }>(finalResponse);

        logger.trace(`out: jsonResponse: ${stringify(jsonResponse)}`);

        return jsonResponse;
    }

    /**
     * Generates a Lex V2 slot and slot type from a Nuance recognition node
     * 
     * @param request Object containing:
     *   - slotName: Name of the slot to generate
     *   - node: The Nuance recognition node containing slot configuration
     *   - trsxProject: The TRSX project containing concept definitions
     * @returns Object containing:
     *   - slot: The generated Lex slot definition
     *   - slotType: The generated Lex slot type definition
     */
    private async generateSlotFromRecognitionNode(request: {
        slotName: string,
        node: NuanceDialogAppModel.RecognitionNode2,
        trsxProject: TRSX.Project
    },
    ): Promise<{ slot: LexSlotModel.SlotExportDefinition; slotType: LexSlotTypeModel.SlotTypeExportDefinition }> {

        const logger = getLogger(this.log, 'llmTransformer', 'generateSlotFromRecognitionNode');

        logger.trace(`in: request: ${stringify(request)}`)

        const { slotName, trsxProject: project, node } = request

        ow(node, ow.object.nonEmpty);
        ow(project, ow.object.nonEmpty);
        ow(slotName, ow.string.nonEmpty);

        const system_prompt = 'You are an expert in the migration of Interactive Voice Response (IVR) systems, with extensive experience in transitioning bots from legacy platforms such as Nuance.mix and Nuance Dialog.app to AWS Lex V2.';

        const user_prompt_1 = `Instructions:

- Analyze the provided nuance TRSX and associated Dialog.app to understand the objective of the chat bot, each of its intents, and the overall conversation flow. Try to understand the customers goal.
- Summarize your understanding.

<NuanceDialogAppSchema>
${cleanAndMinifyJson(NuanceDialogAppSchema)}
</NuanceDialogAppSchema>

<Input_TRSX>
${cleanAndMinifyJson(project)}
</Input_TRSX>

<Input_RecognitionNode>
${cleanAndMinifyJson(node)}
</Input_RecognitionNode>
`;

        const user_prompt_2 = `Instructions:

- Based on your new understanding of the Nuance bot, create an equivalent AWS Lex V2 Slot named ${slotName} and SlotType with migrated functionality.
- The migrated functionality must adhere to the "LexSlotSchema" "LexSlotTypeSchema" schemas. Do not restrict yourself to just providing the required fields, but also include any optional fields that you believe are necessary for the slot and slot type to function correctly in AWS Lex V2.
- Plan your steps first and then implement the plan.
- Follow best pratice outlined in <BestPractice>.
- Use built-in slot type whenever possible.
- Return only JSON with the following format {"slot":"<the slot definition>", "slotType":"<the slot type definition>"}.


<LexSlotSchema>
${cleanAndMinifyJson(LexSlotSchema)}
</LexSlotSchema>

<LexSlotTypeSchema>
${cleanAndMinifyJson(LexSlotTypeSchema)}
</LexSlotTypeSchema>

<BestPractice>
${bestPracticeSlotText}
</BestPractice>
`;

        const initialConversation = [
            {
                role: 'user',
                content: [{ type: 'text', text: user_prompt_1 }],
            },
        ];

        const initialResponse = await this.invokeModel(initialConversation, system_prompt);
        logger.trace(initialResponse);

        const finalResponse = await this.invokeModel([
            ...initialConversation,
            {
                role: 'assistant',
                content: [{ type: 'text', text: initialResponse }],
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: user_prompt_2,
                    },
                ],
            },
        ], system_prompt);
        logger.trace(finalResponse);
        const jsonResult = this.extractJsonFromString<{ slot: LexSlotModel.SlotExportDefinition, slotType: LexSlotTypeModel.SlotTypeExportDefinition }>(finalResponse)

        logger.trace(`out: ${stringify(jsonResult)}`)

        return jsonResult;
    }


    /**
     * Generates Lex V2 intents for implicit/built-in intents that are not defined in the TRSX project
     * 
     * @param request Object containing:
     *   - trsxProject: The TRSX project containing concept definitions
     *   - slots: Record of available Lex slot definitions indexed by slot name
     *   - dialogAppProject: The Nuance Dialog App project containing node definitions
     *   - excludedComponents: List of component IDs to exclude from intent generation
     * @returns Record of generated Lex intent definitions indexed by intent name, including associated slots
     */
    public async generateNonTRSXIntents(request: {
        trsxProject: TRSX.Project,
        slots: Record<string, LexSlotModel.SlotExportDefinition>,
        dialogAppProject: NuanceDialogAppModel.NuanceMixProjectSchema,
        excludedComponents: string[],
    }
    ): Promise<LLMTransformedOutput> {

        const logger = getLogger(this.log, 'llmTransformer', 'generateNonTRSXIntents');
        logger.trace(`in: request: ${stringify(request)}`);

        const { dialogAppProject, trsxProject, excludedComponents, slots } = request;

        ow(excludedComponents, ow.array.nonEmpty)
        ow(trsxProject, ow.object.nonEmpty)
        ow(dialogAppProject, ow.object.nonEmpty)
        ow(slots, ow.object.nonEmpty)

        const components = dialogAppProject.data?.components?.filter(component => !excludedComponents.includes(component.id!));

        const system_prompt = 'You are an expert in the migration of Interactive Voice Response (IVR) systems, with extensive experience in transitioning bots from legacy platforms such as Nuance.mix and Nuance Dialog.app to AWS Lex V2.';

        const user_prompt_1 = `Instructions:

- Analyze the provided nuance TRSX and associated Dialog.app to understand the objective of the chat bot, each of its intents, and the overall conversation flow. Try to understand the customers goal.
- Summarize your understanding.
- Also include any implicit intents.

<Input_NuanceDialogApp>
${cleanAndMinifyJson(dialogAppProject)}
</Input_NuanceDialogApp>

<BestPractices>
${bestPracticeText}
</BestPractices>
`;

        const user_prompt_2 = `Instructions:

- Based on your new understanding of the Nuance bot, create an equivalent list of AWS Lex V2 Intents for the implicit intents only.
- The migrated functionality must adhere to the "LexIntentSchema" schema. 
- Plan your steps first and then implement the plan.
- Do not restrict yourself to just providing the required fields, but also include any optional fields that you believe are necessary for the intent to function correctly in AWS Lex V2.
- You can only use the slot in <AvailableSlots>
- Here are the list of build in intents
    a. AMAZON.CancelIntent
    b. AMAZON.FallbackIntent
    c. AMAZON.HelpIntent
    d. AMAZON.KendraSearchIntent
    e. AMAZON.PauseIntent
    f. AMAZON.QnAIntent
    g. AMAZON.QnAIntent (multiple use support)
    h. AMAZON.QinConnectIntent
    i. AMAZON.RepeatIntent
    j. AMAZON.ResumeIntent
    k. AMAZON.StartOverIntent
    l. AMAZON.StopIntent
- If you're using Built-in intents, you can't do the following:
    a. Add or remove sampleUtterances from the base intent
    b. Configure slots
- If you're using Built-in intents, do the following:
    a. set the parentSignature to the build in intent name.
    b. make sure your intent name differes with the built in intent name.
- Return only JSON with the following format {"intents": [{ "intent":<generate Amazon Lex Intent>, "slots": [list of slot name that are used for the intent] }]}.

<AvailableSlots>
${JSON.stringify(Object.values(slots).map(o => o.slotName).join("\r\n"))}
</AvailableSlots>

<IntentSchema>
${cleanAndMinifyJson(LexIntentSchema)}
</IntentSchema>

Results
\`\`\`json
\`\`\`
`;
        const initialConversation = [
            {
                role: 'user',
                content: [{ type: 'text', text: user_prompt_1 }],
            },
        ];

        const initialResponse = await this.invokeModel(initialConversation, system_prompt);
        logger.trace(initialResponse);

        dialogAppProject.data!.components = components;

        const user_prompt_3 = `Instructions:

- Analyze the provided nuance TRSX and associated Dialog.app to understand the objective of the chat bot, each of its intents, and the overall conversation flow. Try to understand the customers goal.
- Summarize your understanding.
- Make sure to include any implicit intents

<Input_NuanceDialogApp>
${cleanAndMinifyJson(dialogAppProject)}
</Input_NuanceDialogApp>`

        const finalResponse = await this.invokeModel([
            {
                role: 'user',
                content: [{ type: 'text', text: user_prompt_3 }],
            },

            {
                role: 'assistant',
                content: [{ type: 'text', text: initialResponse }],
            },

            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: user_prompt_2,
                    },
                ],
            },
        ], system_prompt);

        logger.trace(finalResponse)

        const jsonResult = this.extractJsonFromString<{ intents: { intent: LexIntentModel.Intent, slots: string[] }[] }>(finalResponse)

        logger.trace(`out: jsonResult: ${stringify(jsonResult)}`)

        const intents: Record<string, any> = {}

        for (const parsedIntent of Object.values(jsonResult.intents).filter(i => i.intent.intentName !== 'FallbackIntent')) {

            intents[parsedIntent.intent.intentName as string] = {
                ...parsedIntent.intent,
                slots: parsedIntent.slots.map(s => slots[s]).reduce((acc, curr) => {
                    acc[curr!.slotName] = curr!;
                    return acc;
                }, {} as Record<string, LexSlotModel.SlotExportDefinition>)
            }
        }
        return intents;
    }

    /**
     * Generates a Lex V2 intent and associated slots from a Nuance component
     * 
     * @param request Object containing:
     *   - intentName: Name of the intent to generate
     *   - trsxProject: The TRSX project containing concept definitions
     *   - slots: Record of available Lex slot definitions indexed by slot name
     *   - component: The Nuance Dialog App component to transform into an intent
     * @returns Object containing:
     *   - intent: The generated Lex intent definition
     *   - slots: Record of Lex slot definitions used by this intent, indexed by slot name
     */
    public async generateIntent(request: {
        intentName: string,
        trsxProject: TRSX.Project,
        slots: Record<string, LexSlotModel.SlotExportDefinition>,
        component: NuanceDialogAppModel.Component,
    }
    ): Promise<{ intent: LexIntentModel.Intent, slots: Record<string, LexSlotModel.SlotExportDefinition> }> {

        const logger = getLogger(this.log, 'llmTransformer', 'generateIntent');
        logger.trace(`in: request: ${stringify(request)}`);

        const { intentName, trsxProject, component, slots } = request;

        ow(intentName, ow.string.nonEmpty)
        ow(trsxProject, ow.object.nonEmpty)
        ow(component, ow.object.nonEmpty)
        ow(slots, ow.object.nonEmpty)

        const system_prompt =
            'You are an expert in the migration of Interactive Voice Response (IVR) systems, with extensive experience in transitioning bots from legacy platforms such as Nuance.mix and Nuance Dialog.app to AWS Lex V2.';

        const user_prompt_1 = `Instructions:

- Analyze the provided nuance TRSX and associated Dialog.app to understand the objective of the chat bot, each of its intents, and the overall conversation flow. Try to understand the customers goal.
- Summarize your understanding.

<NuanceDialogAppSchema>
${cleanAndMinifyJson(NuanceDialogAppSchema)}
</NuanceDialogAppSchema>

<Input_NuanceTRSX>
${cleanAndMinifyJson(trsxProject)}
</Input_NuanceTRSX>

<Input_NuanceDialogComponent>
${cleanAndMinifyJson(component)}
</Input_NuanceDialogComponent>
`;

        const user_prompt_2 = `Instructions:

- Based on your new understanding of the Nuance bot, create an equivalent AWS Lex V2 Intent ${intentName} with migrated functionality.
- Ensure the created intent matches the <IntentSchema>
- The migrated functionality must adhere to the "LexIntentSchema" schema. Do not restrict yourself to just providing the required fields, but also include any optional fields that you believe are necessary for the intent to function correctly in AWS Lex V2.
- If field is not available set it to null.
- Plan your steps first and then implement the plan.
- Return only JSON with the following format {"intent": "<the Amazon Lex v2 Intent>", "slots":["name of the slot used"]}.
- You can only use the slot in <AvailableSlots>

<AvailableSlots>
${JSON.stringify(Object.values(slots).map(o => o.slotName).join("\r\n"))}
</AvailableSlots>

<IntentSchema>
${cleanAndMinifyJson(LexIntentSchema)}
</IntentSchema>
`;

        const initialConversation = [
            {
                role: 'user',
                content: [{ type: 'text', text: user_prompt_1 }],
            },
        ];

        const initialResponse = await this.invokeModel(initialConversation, system_prompt);
        logger.trace(initialResponse);

        const finalResponse = await this.invokeModel([
            ...initialConversation,
            {
                role: 'assistant',
                content: [{ type: 'text', text: initialResponse }],
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: user_prompt_2,
                    },
                ],
            },
        ], system_prompt);

        logger.trace(finalResponse)

        const jsonResult = this.extractJsonFromString<{ intent: LexIntentModel.Intent, slots: string[] }>(finalResponse)

        const createIntentOutput = {
            intent: jsonResult.intent,
            slots: jsonResult.slots.map(s => slots[s]).reduce((acc, curr) => {
                acc[curr!.slotName] = curr!;
                return acc;
            }, {} as Record<string, LexSlotModel.SlotExportDefinition>)
        }

        logger.trace(`out: jsonResult: ${stringify(createIntentOutput)}`)

        return createIntentOutput;
    }

    /**
     * Validates and enhances a Lex V2 intent output by analyzing it against best practices
     * 
     * @param request Object containing:
     *   - intentToValidateName: Name of the intent to validate
     *   - transformedResponseTaskOutput: The transformed response task output containing intents and slots
     * @returns Object containing:
     *   - intent: The validated and enhanced Lex intent definition
     *   - slots: Record of validated Lex slot definitions used by this intent, indexed by slot name
     *   - slotTypes: Record of validated Lex slot type definitions used by this intent, indexed by type name
     */
    public async validateIntentOutput(request: { intentToValidateName: string, transformedResponseTaskOutput: TransformedResponseTaskOutput }): Promise<ValidateLlmIntentOutput> {

        const logger = getLogger(this.log, 'llmTransformer', 'validateIntentOutput');
        logger.trace(`in: request: ${stringify(request)}`);

        const { intentToValidateName, transformedResponseTaskOutput } = request;

        ow(transformedResponseTaskOutput, ow.object.nonEmpty);
        ow(intentToValidateName, ow.string.nonEmpty);

        const system_prompt = 'You are an expert in the migration of Interactive Voice Response (IVR) systems, with extensive experience in transitioning bots from legacy platforms such as Nuance.mix and Nuance Dialog.app to AWS Lex V2.';

        const { slots, ...intentToValidate } = transformedResponseTaskOutput.intents![intentToValidateName!]!;

        const user_prompt_1 = `Instructions:
- Analyze the provided intent ${intentToValidateName} against the best practices <BestPractices> and provide list of actionable recommendation steps to improve the Amazon Lex V2 Intent and Slot Definition.
- Do not rename the intentName
- Re-use the slots in <AvailableSlots> whenever possible. Do not restrict yourself to just providing the required fields, but also include any optional fields that you believe are necessary for the slot and slot type to function correctly in AWS Lex V2.

<AvailableSlots>
${cleanAndMinifyJson(transformedResponseTaskOutput.slots)}
</AvailableSlots>

<AvailableSlots>
${Object.values(transformedResponseTaskOutput.slots!).map(o => `- slotName: ${o.slotName}, description: ${o.description}`).join("\r\n")}
</AvailableSlots>

<OtherIntents>
${cleanAndMinifyJson(Object.values(transformedResponseTaskOutput.intents!).filter(i => i.intentName !== intentToValidateName).map(i => `- intentName: ${i.intentName}\r\ndescription: ${i.description}`).join('\r\n'))}
</OtherIntents>

<Intent>
${cleanAndMinifyJson(intentToValidate)}
</Intent>

<BestPractices>
${bestPracticeText}
</BestPractices>
            `;

        const initialConversation = [
            {
                role: 'user',
                content: [{ type: 'text', text: user_prompt_1 }],
            },
        ];

        const recommendationResponse = await this.invokeModel(initialConversation, system_prompt);
        logger.trace(recommendationResponse);

        const user_prompt_2 = `Instructions:

- Implement all the recommendations steps <Recommendation> for the intent ${intentToValidateName}
- Ensure the created intent matches the <IntentSchema>
- The migrated functionality must adhere to the "LexIntentSchema" schema. Do not restrict yourself to just providing the required fields, but also include any optional fields that you believe are necessary for the intent to function correctly in AWS Lex V2.
- Plan your steps first and then implement the plan.
- Return only JSON with the following format { "intent":<generate Amazon Lex Intent>, "slots": <Dictionary Lex Slot used in the intent indexed by slot name>, "slotTypes":<Dictionary of Lex Slot Types used in the intent indexed by Slot Type Name> }.
<LexV2_IntentSchema>
${cleanAndMinifyJson(LexIntentSchema)}
</LexV2_IntentSchema>

<LexV2_SlotSchema>
${cleanAndMinifyJson(LexSlotSchema)}
</LexV2_SlotSchema>

<LexV2_SlotTypeSchema>
${cleanAndMinifyJson(LexSlotTypeSchema)}
</LexV2_SlotTypeSchema>

<Recommendation>
${recommendationResponse}
</Recommendation>

Results
\`\`\`json
\`\`\`
`
        const finalResponse = await this.invokeModel([
            ...initialConversation,
            {
                role: 'assistant',
                content: [{ type: 'text', text: recommendationResponse }],
            },
            {
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: user_prompt_2,
                    },
                ],
            },
        ], system_prompt);

        logger.trace(finalResponse)

        const jsonResult = this.extractJsonFromString<ValidateLlmIntentOutput>(finalResponse)

        for (const newSlot of Object.values(jsonResult.slots!)) {

            const oldSlot = transformedResponseTaskOutput!.slots![newSlot.slotName]

            if (oldSlot) {

                const user_prompt_3 = `Instructions:
- Analyze the <NewSlot> and <OldSlot> against the best practices <BestPractices>
- Summarize your understanding.

<NewSlot>
${cleanAndMinifyJson(newSlot)}
</NewSlot>

<OldSlot>
${cleanAndMinifyJson(oldSlot)}
</OldSlot>
        
<LexSlotSchema>
${cleanAndMinifyJson(LexSlotSchema)}
</LexSlotSchema>

<LexSlotTypeSchema>
${cleanAndMinifyJson(LexSlotTypeSchema)}
</LexSlotTypeSchema>

<BestPractices>
${bestPracticeSlotText}
</BestPractices>
        `;

                const user_prompt_4 = `Instructions:

- Based on your new understanding of the Nuance bot, generate Amazon Lex V2 Slot resource.
- The migrated functionality must adhere to the "LexSlotSchema" schemas. 
- Do not restrict yourself to just providing the required fields, but also include any optional fields that you believe are necessary for the slot and slot type to function correctly in AWS Lex V2.
- Plan your steps first and then implement the plan.

Results
\`\`\`json
\`\`\``

                const initialConversation = [
                    {
                        role: 'user',
                        content: [{ type: 'text', text: user_prompt_3 }],
                    },
                ];

                const slotRecommendationResponse = await this.invokeModel(initialConversation, system_prompt);
                logger.trace(slotRecommendationResponse)

                const finalResponse = await this.invokeModel([
                    ...initialConversation,
                    {
                        role: 'assistant',
                        content: [{ type: 'text', text: slotRecommendationResponse }],
                    },
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: user_prompt_4,
                            },
                        ],
                    },
                ], system_prompt);

                logger.trace(finalResponse)

                const modifiedSlot = this.extractJsonFromString<LexSlotModel.SlotExportDefinition>(finalResponse)
                jsonResult.slots[newSlot.slotName] = modifiedSlot;
            }
        }
        logger.trace(`out: jsonResult: ${stringify(jsonResult)} `)
        return jsonResult;
    }
}
