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
import type { StreamRecord } from "aws-lambda";
import { unmarshall } from '@aws-sdk/util-dynamodb'
import type { Logger } from "pino";
import { getLogger } from "../common/logger";
import stringify from "json-stringify-safe";
import { PkType } from "../common/pkUtils";
import type { EventsApiPublisher } from "../common/events-publisher";
import type { AttributeValue } from "@aws-sdk/client-dynamodb";
import type { CommonApiSchema } from "@ivr-migration-tool/schemas";


/**
 * Class responsible for processing DynamoDB stream records and publishing events to appropriate channels.
 * Handles creation, update, and deletion events for various resource types including bots, test sets,
 * test executions, recommendation tasks and recommendation task items.
 */
export class StreamProcessorTask {

    constructor(
        private readonly log: Logger<any, boolean>,
        private readonly eventsApiPublisher: EventsApiPublisher
    ) { }

    /**
     * Determines the type of event based on the presence of OldImage and NewImage in the StreamRecord
     * @param record - The DynamoDB stream record to analyze
     * @returns 'Deleted' if only OldImage exists, 'Updated' if both OldImage and NewImage exist, 'Created' if only NewImage exists
     */
    private determineEventType(record: StreamRecord): CommonApiSchema.EventType {
        if (record.OldImage && !record.NewImage) {
            return 'Deleted';
        } else if (record.OldImage && record.NewImage) {
            return 'Updated';
        }
        return 'Created';
    }

    /**
     * Determines the appropriate event channel based on partition key (pk) and sort key (sk).
     * @param pk - The partition key from the DynamoDB record
     * @param sk - The sort key from the DynamoDB record
     * @returns The channel name as a string, or undefined if no matching channel is found
     */
    private determineChannel(pk: string, sk: string): string | undefined {
        if (pk.startsWith(PkType.Bot) && sk.startsWith(PkType.Bot)) {
            return 'bots';
        } else if (pk.startsWith(PkType.TestSet) && sk.startsWith(PkType.TestSet)) {
            return 'testSets';
        } else if (pk.startsWith(PkType.Bot) && sk.startsWith(PkType.TestExecution)) {
            return 'testExecutions';
        } else if (pk.startsWith(PkType.TestExecution) && sk.startsWith(PkType.RecommendationTask)) {
            return 'recommendationTasks';
        } else if (pk.startsWith(PkType.RecommendationTask) && sk.startsWith(PkType.RecommendationTaskItem)) {
            return 'recommendationTaskItems';
        }
        return undefined;
    }

    public async process(record: StreamRecord): Promise<void> {
        const logger = getLogger(this.log, 'streamProcessorTask', 'process');
        logger.trace(`in: record: ${stringify(record)}`);

        // Determine event type based on record structure
        const type: CommonApiSchema.EventType = this.determineEventType(record);

        // Only process if we have a new image (for Created or Updated events)
        if (record.NewImage) {
            const { pk, sk, ...resource } = unmarshall(record.NewImage as Record<string, AttributeValue> | AttributeValue);
            const channel = this.determineChannel(pk, sk);
            if (channel) {
                logger.trace(`determined channel: ${channel}`);
                await this.eventsApiPublisher.publish([{ detail: resource, type }], channel);
            } else {
                logger.warn(`Could not determine channel for pk: ${pk}, sk: ${sk}`);
            }
        }

        logger.trace('out:');

    }
}