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
import ow from 'ow';
import type { RecommendationTaskService } from '../tasks/service';
import type { RecommendationTaskItemRepository } from './repository';
import type { Logger } from 'pino';
import type { SecurityContext } from '../../common/scopes.js';
import { NotFoundError } from '../../common/errors.js';
import type { ListPaginationOptions, NextToken } from '../../common/schemas.js';
import type { RecommendationTaskItemsApiSchema } from '@ivr-migration-tool/schemas';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import { getLogger } from '../../common/logger.js';

export class RecommendationTaskItemService {
	public constructor(private readonly log: Logger<any, boolean>, private readonly repository: RecommendationTaskItemRepository, private readonly taskService: RecommendationTaskService, private readonly s3Client: S3Client) { }

	public async create(taskItem: RecommendationTaskItemsApiSchema.TaskItemResourceInternal): Promise<void> {
		const logger = getLogger(this.log, 'RecommendationTaskItemService', 'create')
		logger.trace(`in:  taskItem: ${JSON.stringify(taskItem)}`);
		ow(
			taskItem,
			ow.object.partialShape({
				taskId: ow.string.nonEmpty,
				status: ow.string.oneOf(['success', 'error']),
			})
		);

		await this.repository.create(taskItem);
		logger.trace(`exit:`);
	}

	public async get(securityContext: SecurityContext, taskId: string, taskItemId: string): Promise<RecommendationTaskItemsApiSchema.TaskItemResourceInternal> {
		const logger = getLogger(this.log, 'RecommendationTaskItemService', 'get')
		logger.trace(`in: taskId:${taskId}, taskItemId:${taskItemId}`);

		ow(taskId, ow.string.nonEmpty);
		ow(taskItemId, ow.string.nonEmpty);

		const taskItem = await this.repository.get(taskId, taskItemId);

		if (taskItem === undefined) {
			throw new NotFoundError(`Task Item '${taskItemId}' not found.`);
		}

		if (taskItem.recommendationLocation)
			taskItem.recommendationDownloadUrl = await getSignedUrl(this.s3Client, new GetObjectCommand({
				Bucket: taskItem.recommendationLocation.bucket, Key: taskItem.recommendationLocation.key
			}), { expiresIn: 3600 })

		logger.trace(`exit:${JSON.stringify(taskItem)}`);
		return taskItem;
	}


	public async list(securityContext: SecurityContext, taskId: string, options: ListPaginationOptions): Promise<[RecommendationTaskItemsApiSchema.TaskItemResource[], NextToken]> {
		const logger = getLogger(this.log, 'RecommendationTaskItemService', 'list')
		logger.trace(`in: taskId:${taskId}, options: ${JSON.stringify(options)}`);
		ow(taskId, ow.string.nonEmpty);

		const [taskItems, nextToken] = await this.repository.list(taskId, options);

		logger.trace(`exit: taskItems: ${JSON.stringify(taskItems)}, options: ${JSON.stringify(options)}`);
		return [taskItems, nextToken!];
	}
}
