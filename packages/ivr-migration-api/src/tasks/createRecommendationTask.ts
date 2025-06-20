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
import { DescribeIntentCommand, ListSlotTypesCommand, type LexModelsV2Client } from "@aws-sdk/client-lex-models-v2";
import type { LLMValidator } from "@ivr-migration-tool/transformer";
import type { Logger } from "pino";
import { getLogger } from "../common/logger";
import type { RecommendationTaskService } from "../api/tasks/service";
import type { RecommendationTaskItemService } from "../api/taskItems/service";
import { PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import type { RecommendationTaskItemsApiSchema } from "@ivr-migration-tool/schemas";
import type { S3Location } from "../common/schemas";
import type { BotsService } from "../api/bots/service";
import { SecurityScope, type SecurityContext } from "../common/scopes";
import stringify from "json-stringify-safe";

export type LexResourceType = 'intent' | 'slot' | 'slotTypes'

/**
 * Interface representing the input parameters for creating a recommendation
 * @interface CreateRecommendationInput
 * @property {string} taskId - Unique identifier for the recommendation task
 * @property {string} taskItemId - Unique identifier for the task item
 * @property {string} botId - Identifier of the Lex bot
 * @property {string} testExecutionId - Identifier for the test execution
 * @property {RecommendationTaskItemsApiSchema.TestExecutionResultItem[]} testExecutionItems - Array of test execution results
 * @property {Array<{type: LexResourceType, id: string}>} resources - Array of Lex resources with their types and IDs
 */
export interface CreateRecommendationInput {
    taskId: string;
    taskItemId: string;
    botId: string;
    testExecutionId: string;
    testExecutionItems: RecommendationTaskItemsApiSchema.TestExecutionResultItem[];
    resources: { type: LexResourceType, id: string }[]
}

/**
 * Class responsible for creating recommendations based on test execution results.
 * It processes test execution data, generates recommendations using LLM validation,
 * stores the recommendations in S3, and updates task status and progress.
 */
export class CreateRecommendationTask {

    private readonly securityContext: SecurityContext = {
        email: 'CreateRecommendationTask',
        role: SecurityScope.contributor,
        sub: 'CreateRecommendationTask',
    };

    constructor(
        private readonly log: Logger<any, boolean>,
        private readonly lexClient: LexModelsV2Client,
        private readonly llmValidator: LLMValidator,
        private readonly executionTaskService: RecommendationTaskService,
        private readonly executionTaskItemService: RecommendationTaskItemService,
        private readonly s3Client: S3Client,
        private readonly bucketName: string,
        protected readonly botsService: BotsService,
    ) { }

    /**
     * Processes the input to create recommendations based on test execution results.
     * This method performs the following steps:
     * 1. Retrieves bot information using the provided botId
     * 2. Fetches intent and slot type information from Lex
     * 3. Generates recommendations using LLM validation
     * 4. Stores the recommendation in S3
     * 5. Creates a task item with the recommendation results
     * 6. Updates the task progress and status
     * 
     * @param input - The input parameters for creating a recommendation
     * @throws Error if recommendation generation or storage fails
     * @returns Promise that resolves when processing is complete
     */
    public async process(input: CreateRecommendationInput): Promise<void> {
        const logger = getLogger(this.log, 'createRecommendationTask', 'process');
        logger.trace(`in: [${JSON.stringify(input)}]`);

        const { botId, testExecutionItems, taskItemId, taskId, testExecutionId } = input;

        const bot = await this.botsService.get(this.securityContext, botId);

        const commonParameters = {
            botId,
            localeId: bot.locale,
            botVersion: bot.version,
        }

        let itemsFailed = 0,
            itemsSucceeded = 1,
            taskItemStatus: 'success' | 'error' = 'success',
            statusMessage, recommendationLocation: S3Location | undefined;

        try {
            const intents = await Promise.all(input.resources.filter(r => r.type === 'intent')
                .map(r => r.id).map(r => this.lexClient.send(new DescribeIntentCommand({ ...commonParameters, intentId: r }))))!

            const slotTypes = await this.lexClient.send(new ListSlotTypesCommand({ ...commonParameters }))

            const prompt = `<Intents>
${stringify(intents, null, 2)}
</Intents>

<SlotTypes>
${stringify(slotTypes, null, 2)}
</SlotTypes>

<Bot>
${stringify(bot, null, 2)}
</Bot>
`
            const [onelineSummary, recommendation] = await this.llmValidator.generateLexResourceRecommendations(
                JSON.stringify(testExecutionItems),
                JSON.stringify(prompt))

            const recommendationKey = `recommendationTasks/${taskId}/taskItems/${taskItemId}/recommendation.txt`;

            // Save recommendation text in S3
            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.bucketName,
                Key: recommendationKey,
                Body: recommendation,
            }))
            recommendationLocation = { bucket: this.bucketName, key: recommendationKey }
            statusMessage = onelineSummary;
        } catch (err) {
            itemsFailed = 1;
            itemsSucceeded = 0;
            taskItemStatus = 'error';
            statusMessage = (err as Error).message;
        }

        // create the task item resource
        await this.executionTaskItemService.create({
            taskId,
            taskItemId,
            status: taskItemStatus,
            statusMessage: statusMessage,
            recommendationLocation
        });

        // update the task progress
        await this.executionTaskService.updateTaskProgress({
            taskId,
            testExecutionId,
            itemsFailed,
            itemsSucceeded,
        });

        // update the task status to success, the method has condition expression to only update to success once task item had been ran
        await this.executionTaskService.updateTaskStatus({ status: 'success', taskId, testExecutionId });

        logger.trace(`out: `);
    }

}
