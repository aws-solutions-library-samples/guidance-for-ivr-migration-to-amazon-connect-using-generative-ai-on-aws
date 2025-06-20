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

import { DynamoDBDocumentClient, GetCommand, QueryCommand, type QueryCommandInput, TransactWriteCommand, type TransactWriteCommandInput, UpdateCommand, type UpdateCommandInput } from '@aws-sdk/lib-dynamodb';
import { createDelimitedAttribute, expandDelimitedAttribute, type DocumentDbClientItem } from '../../common/ddbAttributes.util.js';
import type { Logger } from 'pino';
import type { ListPaginationOptions } from '../../common/schemas.js';
import { PkType } from '../../common/pkUtils.js';
import type { RecommendationTaskApiSchema } from '@ivr-migration-tool/schemas';
import { getLogger } from '../../common/logger.js';
import stringify from 'json-stringify-safe';

export class RecommendationTaskRepository {
	private readonly MAX_RETRIES: number = 10

	public constructor(
		private readonly log: Logger<any, boolean>,
		private readonly dc: DynamoDBDocumentClient,
		private readonly tableName: string,
	) { }

	public async updateProgress(taskBatchProgress: RecommendationTaskApiSchema.TaskBatchProgress): Promise<void> {
		const logger = getLogger(this.log, 'RecommendationTaskRepository', 'updateProgress')
		logger.trace(`in: taskResource:${JSON.stringify(taskBatchProgress)}`);

		const testExecutionDbId = createDelimitedAttribute(PkType.TestExecution, taskBatchProgress.testExecutionId);
		const dbId = createDelimitedAttribute(PkType.RecommendationTask, taskBatchProgress.taskId);
		const command: UpdateCommandInput = {
			TableName: this.tableName,
			Key: {
				pk: testExecutionDbId,
				sk: dbId,
			},
			UpdateExpression:
				'set itemsCompleted = itemsCompleted + :val, itemsFailed = itemsFailed + :failed, itemsSucceeded = itemsSucceeded + :succeeded, updatedAt = :updatedAt',
			ExpressionAttributeValues: {
				':succeeded': taskBatchProgress.itemsSucceeded,
				':failed': taskBatchProgress.itemsFailed,
				':updatedAt': new Date(Date.now()).toISOString(),
				':val': 1,
			},
			ReturnValues: 'ALL_NEW',
		};

		await this.dc.send(new UpdateCommand(command));

		logger.trace('exit:')
	}

	public async updateStatus(taskBatchStatus: RecommendationTaskApiSchema.TaskBatchStatus): Promise<void> {
		const logger = getLogger(this.log, 'RecommendationTaskRepository', 'updateStatus')
		logger.trace(`in: taskBatchStatus:${JSON.stringify(taskBatchStatus)}`);

		const testExecutionDbId = createDelimitedAttribute(PkType.TestExecution, taskBatchStatus.testExecutionId);
		const dbId = createDelimitedAttribute(PkType.RecommendationTask, taskBatchStatus.taskId);

		const command: UpdateCommandInput = {
			TableName: this.tableName,
			Key: {
				pk: testExecutionDbId,
				sk: dbId,
			},
			UpdateExpression: 'set taskStatus = :s, updatedAt = :updatedAt',
			ExpressionAttributeValues: {
				':s': taskBatchStatus.status,
				':updatedAt': new Date(Date.now()).toISOString(),
			},
			ReturnValues: 'ALL_NEW',
		};

		if (taskBatchStatus.status === 'in-progress') {
			command.ConditionExpression = 'itemsCompleted < itemsTotal';
		}

		if (taskBatchStatus.status === 'success') {
			command.ConditionExpression = 'itemsCompleted = itemsTotal';
		}

		await this.updateWithRetry(command)

		logger.trace(`exit:`);
	}

	public async updateWithRetry(command: UpdateCommandInput, attempt: number = 1): Promise<boolean> {
		const logger = getLogger(this.log, 'RecommendationTaskRepository', 'updateWithRetry')
		logger.trace(`in: command:${JSON.stringify(command)}`);

		if (attempt > this.MAX_RETRIES) {
			this.log.error(`dynamoDb.util update: the following items failed writing:\n${JSON.stringify(command)}`);
			return false;
		}

		try {
			await this.dc.send(new UpdateCommand(command));
		} catch (e) {
			this.log.error(`dynamoDb.util update: error: ${JSON.stringify(e)}`);
			// TODO: validate if need to retry only when certain errors happen ?
			await this.updateWithRetry(command, ++attempt);
		}

		logger.trace(`exit:`);
		return true;
	}

	public async list(testExecutionId: string, options: ListPaginationOptions): Promise<[RecommendationTaskApiSchema.TaskResource[], string | undefined]> {
		const logger = getLogger(this.log, 'RecommendationTaskRepository', 'list')
		logger.trace(`in: testExecutionId:${JSON.stringify(testExecutionId)}, options: ${stringify(options)}`);

		let exclusiveStartKey;

		if (options?.token) {
			exclusiveStartKey = {
				pk: createDelimitedAttribute(PkType.TestExecution, testExecutionId),
				sk: createDelimitedAttribute(PkType.RecommendationTask, options.token),
			};
		}

		const params: QueryCommandInput = {
			TableName: this.tableName,
			KeyConditionExpression: `#hash=:hash AND begins_with(#sortKey,:sortKey)`,
			ExpressionAttributeNames: {
				'#hash': 'pk',
				'#sortKey': 'sk',
			},
			ExpressionAttributeValues: {
				':hash': createDelimitedAttribute(PkType.TestExecution, testExecutionId),
				':sortKey': createDelimitedAttribute(PkType.RecommendationTask),
			},
			Limit: options.count as number,
			ExclusiveStartKey: exclusiveStartKey,
		};

		const queryResponse = await this.dc.send(new QueryCommand(params));

		const taskResourceList: RecommendationTaskApiSchema.TaskResource[] = queryResponse!.Items!.map((i) => this.assemble(i)!);

		let nextToken: string | undefined;
		if (queryResponse.LastEvaluatedKey) {
			nextToken = expandDelimitedAttribute(queryResponse.LastEvaluatedKey['sk'])[1];
		}

		return [taskResourceList, nextToken];
	}

	private assemble(i: DocumentDbClientItem): RecommendationTaskApiSchema.TaskResource | undefined {
		const logger = getLogger(this.log, 'RecommendationTaskRepository', 'assemble')
		logger.trace(`in: i:${JSON.stringify(i)}`);


		if (i === undefined) {
			return undefined;
		}
		const task: RecommendationTaskApiSchema.TaskResource = {
			id: expandDelimitedAttribute(i['sk'])[1],
			taskStatus: i['taskStatus'],
			itemsTotal: i['itemsTotal'],
			itemsSucceeded: i['itemsSucceeded'],
			itemsFailed: i['itemsFailed'],
			itemsCompleted: i['itemsCompleted'],
			createdAt: i['createdAt'],
			createdBy: i['createdBy'],
			testExecutionId: i['testExecutionId'],
		};

		logger.trace(`exit: task:${JSON.stringify(task)}`)
		return task;
	}

	public async get(testExecutionId: string, taskId: string): Promise<RecommendationTaskApiSchema.TaskResource | undefined> {
		const logger = getLogger(this.log, 'RecommendationTaskRepository', 'get')
		logger.trace(`in: testExecutionId:${testExecutionId}, taskId:${taskId}`);

		const testExecutionDbId = createDelimitedAttribute(PkType.TestExecution, testExecutionId);
		const taskDbId = createDelimitedAttribute(PkType.RecommendationTask, taskId);

		const getCommandResponse = await this.dc.send(
			new GetCommand({
				TableName: this.tableName,
				Key: {
					pk: testExecutionDbId,
					sk: taskDbId,
				},
			})
		);

		if (!getCommandResponse.Item) return undefined;

		const result = this.assemble(getCommandResponse.Item);
		logger.trace(`exit: ${JSON.stringify(result)}`);
		return result;
	}

	public async create(testExecutionId: string, task: RecommendationTaskApiSchema.TaskResource): Promise<void> {
		const logger = getLogger(this.log, 'RecommendationTaskRepository', 'create')
		logger.trace(`in: testExecutionId:${testExecutionId}, task:${JSON.stringify(task)}`);

		// keys
		const testExecutionDbId = createDelimitedAttribute(PkType.TestExecution, testExecutionId);
		const taskDbId = createDelimitedAttribute(PkType.RecommendationTask, task.id);

		const params: TransactWriteCommandInput = {
			TransactItems: [
				{
					Put: {
						TableName: this.tableName,
						Item: {
							pk: testExecutionDbId,
							sk: taskDbId,
							...task,
						},
					},
				},
			],
		};

		await this.dc.send(new TransactWriteCommand(params));

		logger.trace('exit:');
	}
}
