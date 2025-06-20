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

import { SendMessageCommand, type SendMessageCommandOutput, SQSClient } from '@aws-sdk/client-sqs';
import ow from 'ow';
import pLimit from 'p-limit';
import { ulid } from 'ulid';
import { RecommendationTaskRepository } from './repository.js';
import type { ListPaginationOptions } from '../../common/schemas.js';
import type { Logger } from 'pino';
import { type SecurityContext } from '../../common/scopes.js';
import { NotFoundError } from '../../common/errors.js';
import { GetTestExecutionArtifactsUrlCommand, ListIntentsCommand, ListTestExecutionResultItemsCommand, TestResultTypeFilter, type DescribeIntentCommandOutput, type LexModelsV2Client } from '@aws-sdk/client-lex-models-v2';
import { parse } from 'csv-parse/sync';
import type { CreateRecommendationInput, LexResourceType } from '../../tasks/createRecommendationTask.js';
import type { RecommendationTaskApiSchema, RecommendationTaskItemsApiSchema } from '@ivr-migration-tool/schemas';
import { getLogger } from '../../common/logger.js';
import stringify from 'json-stringify-safe';
import type { BotsService } from '../bots/service.js';

export class RecommendationTaskService {

	constructor(
		private readonly log: Logger<any, boolean>,
		private readonly repository: RecommendationTaskRepository,
		private readonly sqs: SQSClient,
		private readonly sqsQueueUrl: string,
		private readonly concurrencyLimit: number,
		private readonly lexClient: LexModelsV2Client,
		private readonly botsService: BotsService
	) { }

	public async updateTaskStatus(taskBatchStatus: RecommendationTaskApiSchema.TaskBatchStatus): Promise<void> {
		const logger = getLogger(this.log, 'RecommendationTaskService', 'updateTaskStatus')
		logger.trace(`in: taskBatchStatus:${JSON.stringify(taskBatchStatus)}`);


		ow(taskBatchStatus.taskId, ow.string.nonEmpty);
		ow(taskBatchStatus.testExecutionId, ow.string.nonEmpty);
		ow(taskBatchStatus.status, ow.string.oneOf(['success', 'error', 'in-progress']));

		ow(taskBatchStatus, ow.object.exactShape({
			taskId: ow.string.nonEmpty,
			testExecutionId: ow.string.nonEmpty,
			status: ow.string.oneOf(['in-progress', 'success', 'error'])
		}))

		await this.repository.updateStatus(taskBatchStatus);

		logger.trace('exit:')

	}

	public async updateTaskProgress(taskBatchProgress: RecommendationTaskApiSchema.TaskBatchProgress): Promise<void> {
		const logger = getLogger(this.log, 'RecommendationTaskService', 'updateTaskProgress')
		logger.trace(`in: taskBatchProgress:${JSON.stringify(taskBatchProgress)}`);
		ow(
			taskBatchProgress,
			ow.object.partialShape({
				taskId: ow.string.nonEmpty,
				testExecutionId: ow.string.nonEmpty,
				itemsFailed: ow.number.greaterThanOrEqual(0),
				itemsSucceeded: ow.number.greaterThanOrEqual(0),
			})
		);

		logger.trace('exit:')
		await this.repository.updateProgress(taskBatchProgress);
	}

	public async list(securityContext: SecurityContext, testExecutionId: string, options: ListPaginationOptions) {
		const logger = getLogger(this.log, 'RecommendationTaskService', 'list')
		logger.trace(`in: testExecutionId:${JSON.stringify(testExecutionId)}`);
		ow(securityContext, ow.object.nonEmpty);
		ow(testExecutionId, ow.string.nonEmpty);

		logger.trace('exit:')
		return await this.repository.list(testExecutionId, options);
	}

	public async get(securityContext: SecurityContext, testExecutionId: string, taskId: string) {
		const logger = getLogger(this.log, 'RecommendationTaskService', 'get')
		logger.trace(`in: testExecutionId:${JSON.stringify(testExecutionId)}`);
		ow(taskId, ow.string.nonEmpty);
		ow(testExecutionId, ow.string.nonEmpty);

		const executionTask = await this.repository.get(testExecutionId, taskId);

		if (!executionTask) throw new NotFoundError(`Could not find execution task with id: ${taskId}`);

		logger.trace(`exit: executionTask: ${stringify(executionTask)}`)
		return executionTask;
	}


	public async create(securityContext: SecurityContext, newExecutionTask: RecommendationTaskApiSchema.TaskNew): Promise<RecommendationTaskApiSchema.TaskResource> {
		const logger = getLogger(this.log, 'RecommendationTaskService', 'create')
		logger.trace(`in: newExecutionTask:${JSON.stringify(newExecutionTask)}`);

		ow(newExecutionTask.testExecutionId, ow.string.nonEmpty);
		ow(newExecutionTask.botId, ow.string.nonEmpty);

		const bot = await this.botsService.get(securityContext, newExecutionTask.botId);

		// Define common parameters for Lex API calls
		const commonParameters = {
			botId: bot.id,
			localeId: bot.locale,
			botVersion: bot.version,
		}
		const { intentSummaries } = await this.lexClient.send(new ListIntentsCommand(commonParameters));

		const result = await this.lexClient.send(new GetTestExecutionArtifactsUrlCommand({
			testExecutionId: newExecutionTask.testExecutionId,
		}))
		// Fetch test execution artifacts from the provided URL
		const fetchResponse = await fetch(result.downloadArtifactsUrl!);

		// Parse the CSV test execution results into structured data
		const testExecutionResult: RecommendationTaskItemsApiSchema.TestExecutionResultItem[] = await parse((await fetchResponse.text()), { columns: true, skip_empty_lines: true })

		const taskItems: CreateRecommendationInput[] = []
		const taskId = ulid().toLowerCase();

		// Assemble Non Conversational Issues
		this.filterNonConversationalErrors(testExecutionResult, intentSummaries!, taskItems, newExecutionTask, taskId);

		// Assemble Conversational Issues
		await this.filterConversationalErrors(newExecutionTask, intentSummaries!, testExecutionResult, taskItems, taskId);

		// building the activity task
		const task: RecommendationTaskApiSchema.TaskResource = {
			...newExecutionTask,
			id: taskId,
			itemsTotal: taskItems.length,
			itemsCompleted: 0,
			itemsFailed: 0,
			itemsSucceeded: 0,
			taskStatus: 'in-progress',
			createdAt: new Date(Date.now()).toISOString(),
			createdBy: securityContext.email,
		};

		try {
			// send each batch of activities to sqs for async processing
			await this.queueTasks(taskItems);
		} catch (exception) {
			task.taskStatus = 'error';
			task.statusMessage = (exception as Error)?.message;
		} finally {
			await this.repository.create(newExecutionTask.testExecutionId, task);
		}

		logger.trace(`exit: task: ${stringify(task)}`)
		return task;
	}

	private async queueTasks(taskItems: CreateRecommendationInput[]) {
		const sqsFutures: Promise<SendMessageCommandOutput>[] = [];
		const limit = pLimit(this.concurrencyLimit);
		for (const batch of taskItems) {
			sqsFutures.push(
				limit(
					async () => await this.sqs.send(
						new SendMessageCommand({
							QueueUrl: this.sqsQueueUrl,
							MessageBody: JSON.stringify(batch),
						})
					)
				)
			);
		}
		await Promise.all(sqsFutures);
	}

	/**
	 * Filters and processes conversational errors from test execution results.
	 * 
	 * @param newExecutionTask - Object containing test execution ID and bot ID
	 * @param intentSummaries - Array of intent summaries with ID and name
	 * @param testExecutionResult - Array of test execution result items
	 * @param taskItems - Array to store the created recommendation task items
	 * @param taskId - Unique identifier for the task
	 * 
	 * This method:
	 * 1. Retrieves conversation-level test results using the Lex API
	 * 2. Maps failed conversations to their associated intents
	 * 3. Creates recommendation task items for each conversation with errors
	 */
	private async filterConversationalErrors(newExecutionTask: { testExecutionId: string; botId: string; }, intentSummaries: Pick<DescribeIntentCommandOutput, 'intentId' | 'intentName'>[], testExecutionResult: RecommendationTaskItemsApiSchema.TestExecutionResultItem[], taskItems: CreateRecommendationInput[], taskId: string) {
		const logger = getLogger(this.log, 'RecommendationTaskService', 'filterConversationalErrors');
		logger.trace(`in: newExecutionTask:${stringify(newExecutionTask)}, taskId:${taskId}`);

		const listTestResultsResponse = await this.lexClient.send(new ListTestExecutionResultItemsCommand({
			testExecutionId: newExecutionTask.testExecutionId,
			resultFilterBy: {
				resultTypeFilter: TestResultTypeFilter.ConversationLevelTestResults
			}
		}));

		for (const testResult of listTestResultsResponse!.testExecutionResults!.conversationLevelTestResults?.items!) {
			const resources = intentSummaries?.filter(i => testResult.intentClassificationResults?.map(s => s.intentName).includes(i.intentName)).map(r => ({ type: 'intent' as LexResourceType, id: r.intentId! }))!;

			const conversationResults = testExecutionResult.filter(t => t["Conversation Number"] === testResult.conversationId);

			taskItems.push({
				...newExecutionTask,
				taskId,
				taskItemId: ulid().toLowerCase(),
				testExecutionItems: conversationResults,
				resources
			});
		}

		logger.trace(`exit:`)
	}

	/**
	 * Filters and processes non-conversational errors from test execution results.
	 * 
	 * @param testExecutionResult - Array of test execution result items to process
	 * @param intentSummaries - Array of intent summaries containing intent IDs and names
	 * @param taskItems - Array to store the created recommendation task items
	 * @param newExecutionTask - Object containing test execution ID and bot ID
	 * @param taskId - Unique identifier for the task
	 * 
	 * This method:
	 * 1. Filters test executions that are non-conversational (Conversation Number = '-') and failed
	 * 2. Groups the failed executions by their expected intent
	 * 3. Creates recommendation task items for each intent with failures
	 */
	private filterNonConversationalErrors(testExecutionResult: RecommendationTaskItemsApiSchema.TestExecutionResultItem[], intentSummaries: Pick<DescribeIntentCommandOutput, 'intentName' | 'intentId'>[], taskItems: CreateRecommendationInput[], newExecutionTask: { testExecutionId: string; botId: string; }, taskId: string) {
		const logger = getLogger(this.log, 'RecommendationTaskService', 'filterNonConversationalErrors');
		logger.trace(`in: testExecutionResult:${stringify(testExecutionResult)}, taskId:${taskId}, intentSummaries: ${stringify(intentSummaries)}`);

		// Group failed test executions by their expected intent
		// Only include items where Conversation Number is '-' and Line Result is 'Fail'
		const groupedByIntent = testExecutionResult.filter(t => t["Conversation Number"] === '-' && t["Line Result (E2E)"] === 'Fail').reduce<Record<string, RecommendationTaskItemsApiSchema.TestExecutionResultItem[]>>((acc, item) => {
			const intent = item["Expected Output Intent"];
			if (!acc[intent]) {
				acc[intent] = [];
			}
			acc[intent].push(item);
			return acc;
		}, {});
		// Assemble Individual Issue
		for (const failedIntent of Object.keys(groupedByIntent)) {
			const intentSummary = intentSummaries?.find(i => i.intentName === failedIntent);
			if (intentSummary) {
				taskItems.push({
					...newExecutionTask,
					taskId,
					taskItemId: ulid().toLowerCase(),
					testExecutionItems: groupedByIntent[failedIntent],
					resources: [{ type: 'intent', id: intentSummary?.intentId! }]
				});
			}
		}

		logger.trace(`exit:`)
	}
}
