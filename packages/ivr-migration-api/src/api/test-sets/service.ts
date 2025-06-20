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

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { BotsService } from "../bots/service";
import { InvalidRequestError, NotFoundError } from "../../common/errors";
import { getLogger } from "../../common/logger";
import type { ListPaginationOptions, S3Location } from "../../common/schemas";
import stringify from "json-stringify-safe";
import type { TestSetsRepository } from "./repository";
import type { Logger } from "pino";
import ow from 'ow';
import { ulid } from "ulid";
import { PutEventsCommand, type EventBridgeClient } from "@aws-sdk/client-eventbridge";
import type { TestSetsApiSchema } from "@ivr-migration-tool/schemas";
import { DeleteTestSetCommand, type LexModelsV2Client } from "@aws-sdk/client-lex-models-v2";
import type { SecurityContext } from '../../common/scopes';

const FIVE_MINUTES = 5 * 60;

export class TestSetsService {
    constructor(
        private readonly log: Logger<any, boolean>,
        private readonly s3Client: S3Client,
        private readonly bucketName: string,
        private readonly botsService: BotsService,
        private readonly repository: TestSetsRepository,
        private readonly eventBridgeClient: EventBridgeClient,
        private readonly eventBusName: string,
        private readonly lexClient: LexModelsV2Client,
    ) { }


    public async delete(securityContext: SecurityContext, id: string) {
        const logger = getLogger(this.log, 'TestSetsService', 'delete')
        logger.debug(`in: [${stringify(id)}]`)

        ow(id, ow.string.nonEmpty);

        const testSet = await this.repository.get(id);
        if (!testSet) {
            throw new NotFoundError(`Test set with id ${id} not found`)
        }

        if (testSet.testSetInternalId) {
            await this.lexClient.send(new DeleteTestSetCommand({ testSetId: testSet.testSetInternalId }))
        }

        // Delete bot from both Lex and DynamoDB
        await this.repository.delete(id)

        logger.debug(`out: [${stringify(id)}]`)
    }

    public async get(securityContext: SecurityContext, id: string): Promise<TestSetsApiSchema.TestSetInternal> {
        const logger = getLogger(this.log, 'TestSetsService', 'get')
        logger.debug(`in: [${stringify(id)}]`)

        ow(id, ow.string.nonEmpty)

        const testSet = await this.repository.get(id)
        if (!testSet) {
            throw new NotFoundError(`Bot with id ${id} not found`)
        }

        if (testSet.testSetLocation) {
            testSet.outputDownloadUrl = await this.generateSignedUrl(testSet.testSetLocation.key, 'get')
        }

        logger.debug(`out: [${stringify(testSet)}]`)
        return testSet;
    }

    private async publishTestSetCreatedEvent(testSet: TestSetsApiSchema.TestSetInternal): Promise<void> {
        const logger = getLogger(this.log, 'TestSetsService', 'publishTestSetCreatedEvent');
        logger.debug(`Publishing test set created event for test set ${testSet.id}`);
        const event = {
            EventBusName: this.eventBusName,
            Entries: [
                {
                    Source: 'test-sets-service',
                    DetailType: 'TestSetCreated',
                    Detail: JSON.stringify(testSet),
                    EventBusName: this.eventBusName,
                    Time: new Date()
                }
            ]
        };

        try {
            await this.eventBridgeClient.send(new PutEventsCommand(event));

            logger.debug(`Successfully published test set created event for test set ${testSet.id}`);
        } catch (error) {
            logger.error(`Failed to publish test set created event: ${error}`);
            throw error;
        }
    }

    public async update(securityContext: SecurityContext, id: string, updateTestSet: TestSetsApiSchema.UpdateTestSet & { testSetLocation?: S3Location, testSetInternalId?: string }): Promise<TestSetsApiSchema.TestSet> {
        const logger = getLogger(this.log, 'TestSetsService', 'update')
        logger.debug(`in: [${stringify(updateTestSet)}]`)

        ow(updateTestSet.status, ow.string.nonEmpty)

        const testSet = await this.repository.get(id);
        if (!testSet) {
            throw new NotFoundError(`Test Set with id ${id} not found`)
        }

        const updatedTestSet = await this.repository.update({
            id,
            updatedAt: new Date().toISOString(),
            updatedBy: securityContext.email,
            status: updateTestSet.status,
            statusMessages: updateTestSet.statusMessages,
            testSetLocation: updateTestSet.testSetLocation,
            testSetInternalId: updateTestSet.testSetInternalId
        })

        logger.trace(`out: [${stringify(testSet)}]`)
        return updatedTestSet;
    }

    public async createUploadUrl(securityContext: SecurityContext, testSetId: string): Promise<TestSetsApiSchema.TestSetUploadUrl> {
        const logger = getLogger(this.log, 'TestSetsService', 'createUploadUrl')
        logger.trace(`in: [${stringify(testSetId)}]`)

        ow(testSetId, ow.string.nonEmpty);

        const testSetKey = `test-sets/${testSetId}/test.csv`;

        await this.update(securityContext, testSetId, {
            status: 'in-progress',
            statusMessages: [{
                status: "in-progress",
                message: "Waiting for user to upload file."
            }],
        })

        const uploadUrl = await this.generateSignedUrl(testSetKey, 'put')
        logger.trace(`out: [${stringify(uploadUrl)}]`)
        return { uploadUrl };
    }

    public async create(securityContext: SecurityContext, createTestSet: TestSetsApiSchema.CreateTestSet): Promise<TestSetsApiSchema.TestSet> {
        const logger = getLogger(this.log, 'TestSetsService', 'create')
        logger.debug(`in: [${stringify(createTestSet)}]`)

        ow(createTestSet.name, ow.string.nonEmpty);
        ow(createTestSet.dataSource, ow.object.exactShape({
            botDataSource: ow.object.exactShape({
                botId: ow.string.nonEmpty
            })
        }
        ))

        const bot = await this.botsService.get(securityContext, createTestSet.dataSource.botDataSource.botId);

        if (!["success", "built"].includes(bot.status)) {
            throw new InvalidRequestError(`Bot ${bot.id} is not in 'success' or 'built' state.`)
        }

        const testSet: TestSetsApiSchema.TestSetInternal = {
            id: ulid().toLowerCase(),
            ...createTestSet,
            createdAt: new Date().toISOString(),
            createdBy: securityContext.email,
            status: 'in-progress',
            statusMessages: [{
                status: 'success',
                message: `Creating test set metadata.`
            }]
        };

        await this.repository.create(testSet);

        await this.publishTestSetCreatedEvent(testSet)

        logger.debug(`out: [${stringify(testSet)}]`)
        return testSet;
    }

    public async list(securityContext: SecurityContext, options: ListPaginationOptions): Promise<[TestSetsApiSchema.TestSet[], string]> {
        const logger = getLogger(this.log, 'TestSetsService', 'list');
        logger.debug(`in: `);
        const [testSets, nextToken] = await this.repository.list(options);
        logger.debug(`in: [${stringify(testSets)}, ${nextToken}]`);
        return [testSets, nextToken]
    }

    private async generateSignedUrl(key: string, command: 'put' | 'get', expiresIn = FIVE_MINUTES): Promise<string> {
        const logger = getLogger(this.log, 'TestSetsService', 'generateSignedUrl')
        logger.trace(`in: [${stringify(key)}]`)
        const input = {
            Bucket: this.bucketName,
            Key: key
        }
        const params: PutObjectCommand = command === 'put' ? new PutObjectCommand(input) : new GetObjectCommand(input);
        const url = await getSignedUrl(this.s3Client, params, { expiresIn });
        logger.trace(`out: [${stringify(url)}]`)
        return url;
    }
}
