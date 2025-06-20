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

import { DescribeTestExecutionCommand, type DescribeTestExecutionCommandOutput, type LexModelsV2Client, type TestExecutionStatus } from "@aws-sdk/client-lex-models-v2";
import { getLogger } from "../common/logger";
import stringify from "json-stringify-safe";
import type { TestExecutionsApiSchema } from "@ivr-migration-tool/schemas";
import type { Logger } from "pino";
import { TestExecutionsService } from '../api/test-executions/service';
import pWaitFor from "p-wait-for";
import type { EventBridgeEvent } from "aws-lambda";
import { SecurityScope } from "../common/scopes";
import ow from 'ow';

export class CheckTestExecutionTask {

    private readonly securityContext = {
        email: 'CheckTestExecutionTask',
        role: SecurityScope.contributor,
        sub: 'CheckTestExecutionTask',
    };

    constructor(
        private readonly log: Logger<any, boolean>,
        private readonly lexClient: LexModelsV2Client,
        private readonly testExecutionsService: TestExecutionsService,
    ) {
    }

    /**
     * Maps AWS Lex test execution status to internal application status
     * @param status The AWS Lex test execution status
     * @returns The mapped internal test execution status
     */
    private mapExecutionStatus(status: TestExecutionStatus): TestExecutionsApiSchema.TestExecutionStatus {
        const logger = getLogger(this.log, 'CheckTestExecutionTask', 'mapExecutionStatus');
        logger.trace(`in: [${stringify(status)}]`)
        switch (status) {
            case 'Completed':
                return 'success';
            case 'Failed':
                return 'error';
            case 'Pending':
                return 'in-progress';
            case 'InProgress':
                return 'in-progress';
            case 'Stopped':
                return 'error';
            default:
                return 'error';
        }
    }

    /**
     * Processes a test execution event from EventBridge
     * Polls the Lex test execution status until completion and updates the internal test execution status
     * @param event The EventBridge event containing test execution details
     * @returns Promise that resolves when processing is complete
     */
    public async process(event: EventBridgeEvent<'TestExecutionCreated', TestExecutionsApiSchema.TestExecutionResource>): Promise<void> {
        const logger = getLogger(this.log, 'CheckTestExecutionTask', 'process');
        logger.trace(`in: [${stringify(event)}]`);

        ow(event?.detail, ow.object.partialShape({
            id: ow.string.nonEmpty,
            botId: ow.string.nonEmpty,
        }))

        const { id, botId } = event.detail;

        let response: DescribeTestExecutionCommandOutput | undefined;

        await pWaitFor(async (): Promise<any> => {
            response = await this.lexClient.send(new DescribeTestExecutionCommand({ testExecutionId: id }))
            logger.debug(`Test execution status: ${response.testExecutionStatus}`);
            return ['Completed', 'Stopped', 'Failed'].includes(response.testExecutionStatus!);
        }, { timeout: 2 * 60000, interval: 2000 })

        logger.debug(`Final test execution status: ${response!.testExecutionStatus}`);

        await this.testExecutionsService.update(this.securityContext, {
            id,
            botId,
            failureReasons: response?.failureReasons,
            status: this.mapExecutionStatus(response!.testExecutionStatus!),
        })

        logger.trace('out');
    }

}
