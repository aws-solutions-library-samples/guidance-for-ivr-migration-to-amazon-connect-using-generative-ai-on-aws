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

import { GetTestExecutionArtifactsUrlCommand, StartTestExecutionCommand, TestExecutionStatus, type LexModelsV2Client } from "@aws-sdk/client-lex-models-v2";
import { TestExecutionsApiSchema } from '@ivr-migration-tool/schemas'
import type { Logger } from "pino";
import { getLogger } from "../../common/logger";
import stringify from "json-stringify-safe";
import ow from 'ow';
import type { BotsService } from "../bots/service";
import type { SecurityContext } from "../../common/scopes";
import type { TestExecutionsRepository } from "./repository";
import { NotFoundError } from "../../common/errors";
import type { ListPaginationOptions } from "../../common/schemas";
import type { TestSetsService } from "../test-sets/service";
import { PutEventsCommand, type EventBridgeClient } from "@aws-sdk/client-eventbridge";

/**
 * Service class for managing test executions for Lex bots.
 * Handles CRUD operations for test executions, interacts with Lex Models V2 API,
 * and publishes events to EventBridge.
 */
export class TestExecutionsService {

    private readonly aliasId = 'TSTALIASID';

    constructor(
        private readonly log: Logger<any, boolean>,
        private readonly lexClient: LexModelsV2Client,
        private readonly botsService: BotsService,
        private readonly testSetsService: TestSetsService,
        private readonly repository: TestExecutionsRepository,
        private readonly eventBridgeClient: EventBridgeClient,
        private readonly eventBusName: string
    ) {
    }

    private async publishTestSetExecutionCreatedEvent(testExecution: TestExecutionsApiSchema.TestExecutionResource): Promise<void> {
        const logger = getLogger(this.log, 'TestExecutionsService', 'publishTestSetExecutionCreatedEvent');
        logger.debug(`Publishing test execution created event for test set ${testExecution.id}`);
        const event = {
            EventBusName: this.eventBusName,
            Entries: [
                {
                    Source: 'test-executions-service',
                    DetailType: 'TestExecutionCreated',
                    Detail: JSON.stringify(testExecution),
                    EventBusName: this.eventBusName,
                    Time: new Date()
                }
            ]
        };

        try {
            await this.eventBridgeClient.send(new PutEventsCommand(event));
            logger.debug(`Successfully published test execution created event for test set ${testExecution.id}`);
        } catch (error) {
            logger.error(`Failed to publish test execution created event: ${error}`);
            throw error;
        }
    }

    public async list(securityContext: SecurityContext, botId: string, options: ListPaginationOptions): Promise<[TestExecutionsApiSchema.TestExecutionResource[], string]> {
        const logger = getLogger(this.log, 'TestExecutionsService', 'list');
        logger.debug(`in: `);
        const [testSets, nextToken] = await this.repository.list(botId, options);
        logger.debug(`in: [${stringify(testSets)}, ${nextToken}]`);
        return [testSets, nextToken]
    }

    public async get(securityContext: SecurityContext, botId: string, id: string): Promise<TestExecutionsApiSchema.TestExecutionResource> {
        const logger = getLogger(this.log, 'TestExecutionsService', 'get')
        logger.debug(`in: [${stringify(id)}]`)

        ow(id, ow.string.nonEmpty)

        const testExecution = await this.repository.get(botId, id)
        if (!testExecution) {
            throw new NotFoundError(`Test Execution with id ${id} not found`)
        }

        const response = await this.lexClient.send(new GetTestExecutionArtifactsUrlCommand({ testExecutionId: id }))

        testExecution.outputDownloadUrl = response.downloadArtifactsUrl!;

        logger.debug(`out: [${stringify(testExecution)}]`)
        return testExecution;
    }


    public async update(securityContext: SecurityContext, request: Omit<TestExecutionsApiSchema.TestExecutionInternal, 'updatedAt' | 'updatedBy'>): Promise<TestExecutionsApiSchema.TestExecutionResource> {
        const logger = getLogger(this.log, 'TestExecutionsService', 'update')
        logger.debug(`in: request:${stringify(request)}`)

        ow(request, ow.object.exactShape({
            id: ow.string.nonEmpty,
            botId: ow.string.nonEmpty,
            status: ow.string.oneOf(['success', 'error', 'in-progress']),
            failureReasons: ow.optional.array
        }))

        const { id, botId, status, failureReasons } = request

        const bot = await this.repository.get(botId, id);

        if (!bot) {
            throw new NotFoundError(`Bot with id ${id} not found`)
        }

        const updatedTestExecution = await this.repository.update({
            id,
            botId,
            updatedAt: new Date().toISOString(),
            updatedBy: securityContext.email,
            failureReasons,
            status
        })

        logger.trace(`out: [${stringify(updatedTestExecution)}]`)
        return updatedTestExecution;
    }


    public async create(securityContext: SecurityContext, botId: string, request: TestExecutionsApiSchema.CreateTestExecutionResource): Promise<TestExecutionsApiSchema.TestExecutionResource> {
        const logger = getLogger(this.log, 'TestExecutionsService', 'create')
        logger.debug(`request: [${stringify(request)}], botId: ${botId}`)

        ow(request, ow.object.exactShape({
            botId: ow.string.nonEmpty,
            testSetId: ow.string.nonEmpty
        }));

        ow(botId, ow.string.nonEmpty)

        const { testSetId } = request;

        const [bot, testSet] = await Promise.all([this.botsService.get(securityContext, botId), this.testSetsService.get(securityContext, testSetId)])

        const response = await this.lexClient.send(new StartTestExecutionCommand({
            testSetId: testSet.testSetInternalId,
            target: {
                botAliasTarget: {
                    botId: bot.id,
                    localeId: bot.locale,
                    botAliasId: this.aliasId
                }
            },
            apiMode: 'NonStreaming',
            testExecutionModality: "Text",
        }))

        const testExecutionResource: TestExecutionsApiSchema.TestExecutionResource = {
            id: response.testExecutionId!,
            botId: bot.id,
            testSetId: testSetId,
            testSetName: testSet.name,
            createdAt: new Date().toISOString(),
            createdBy: securityContext.email,
            status: 'in-progress'
        };

        await this.repository.create(testExecutionResource)

        await this.publishTestSetExecutionCreatedEvent(testExecutionResource);

        logger.trace(`out: [${stringify(testExecutionResource)}]`)

        return testExecutionResource;
    }

}
