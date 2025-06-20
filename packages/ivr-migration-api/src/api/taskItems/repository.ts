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

import { DynamoDBDocumentClient, GetCommand, type GetCommandInput, PutCommand, QueryCommand, type QueryCommandInput } from '@aws-sdk/lib-dynamodb';
import type { Logger } from 'pino';
import { createDelimitedAttribute, expandDelimitedAttribute, type DocumentDbClientItem } from '../../common/ddbAttributes.util.js';
import { PkType } from '../../common/pkUtils.js';
import type { ListPaginationOptions } from '../../common/schemas.js';
import { NotFoundError } from '../../common/errors.js';
import type { RecommendationTaskItemsApiSchema } from '@ivr-migration-tool/schemas';
import { getLogger } from '../../common/logger.js';

export class RecommendationTaskItemRepository {
	public constructor(
		private readonly log: Logger<any, boolean>,
		private readonly dc: DynamoDBDocumentClient,
		private readonly tableName: string,
	) { }

	public async create(taskItem: RecommendationTaskItemsApiSchema.TaskItemResource): Promise<void> {
		const logger = getLogger(this.log, 'RecommendationTaskItemRepository', 'create')
		logger.trace(`in: taskItem:${JSON.stringify(taskItem)}`);

		await this.dc.send(
			new PutCommand({
				TableName: this.tableName,
				Item: {
					pk: createDelimitedAttribute(PkType.RecommendationTask, taskItem.taskId),
					sk: createDelimitedAttribute(PkType.RecommendationTaskItem, taskItem.taskItemId),
					...taskItem,
				},
			})
		);

		logger.trace(`exit>`);
	}

	public async list(taskId: string, options: ListPaginationOptions): Promise<[RecommendationTaskItemsApiSchema.TaskItemResource[], string | undefined]> {
		const logger = getLogger(this.log, 'RecommendationTaskItemRepository', 'list')
		logger.trace(`in: taskId: ${taskId}, options: ${JSON.stringify(options)}`);

		let exclusiveStartKey: { pk: string; sk: string };

		if (options?.token) {
			exclusiveStartKey = {
				pk: createDelimitedAttribute(PkType.RecommendationTask, taskId),
				sk: createDelimitedAttribute(PkType.RecommendationTaskItem, options.token),
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
				':hash': createDelimitedAttribute(PkType.RecommendationTask, taskId),
				':sortKey': createDelimitedAttribute(PkType.RecommendationTaskItem),
			},
			Limit: options.count as number,
			ExclusiveStartKey: exclusiveStartKey!,
		};

		const queryResponse = await this.dc.send(new QueryCommand(params));

		const taskResourceList = queryResponse.Items!.map((i) => this.assemble(i)!);

		let nextToken: string | undefined;
		if (queryResponse.LastEvaluatedKey) {
			nextToken = expandDelimitedAttribute(queryResponse.LastEvaluatedKey['sk'])[1];
		}

		return [taskResourceList, nextToken];
	}

	public async get(taskId: string, taskItemId: string): Promise<RecommendationTaskItemsApiSchema.TaskItemResourceInternal | undefined> {
		const logger = getLogger(this.log, 'RecommendationTaskItemRepository', 'get')
		logger.trace(`in: taskId: ${taskId} taskItemId:${taskItemId}`);

		const executionTaskDbId = createDelimitedAttribute(PkType.RecommendationTask, taskId);
		const startDateTimeDbId = createDelimitedAttribute(PkType.RecommendationTaskItem, taskItemId);

		const params: GetCommandInput = {
			TableName: this.tableName,
			Key: {
				pk: executionTaskDbId,
				sk: startDateTimeDbId,
			},
		};
		const response = await this.dc.send(new GetCommand(params));
		if (response.Item === undefined) {
			throw new NotFoundError(`Task item with TaskId: ${taskId} and startDateTime:${taskItemId} not found`);
		}

		// assemble before returning
		const taskItem = this.assemble(response.Item);
		logger.trace(`exit:${JSON.stringify(taskItem)}`);
		return taskItem;
	}

	private assemble(i: DocumentDbClientItem): RecommendationTaskItemsApiSchema.TaskItemResourceInternal | undefined {
		const logger = getLogger(this.log, 'RecommendationTaskItemRepository', 'assemble')
		logger.trace(`in: assemble ${JSON.stringify(i)}`);
		if (i === undefined) {
			return undefined;
		}
		const taskItem: RecommendationTaskItemsApiSchema.TaskItemResourceInternal = {
			taskId: expandDelimitedAttribute(i['pk'])[1],
			status: i['status'],
			statusMessage: i['statusMessage'],
			taskItemId: i['taskItemId'],
			recommendationLocation: i['recommendationLocation'],
		};

		logger.trace(`exit: ${JSON.stringify(taskItem)}`)
		return taskItem;
	}
}
