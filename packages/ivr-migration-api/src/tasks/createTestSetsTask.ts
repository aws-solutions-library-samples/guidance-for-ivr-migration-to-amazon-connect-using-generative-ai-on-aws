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

import { type Logger } from "pino";
import { BaseGeneratorTask, type TransformedResponseTaskOutput } from './baseGeneratorTask';
import type { BotsService } from "../api/bots/service";
import type { LLMTransformer, TRSXTransformer } from "@ivr-migration-tool/transformer";
import { GetObjectCommand, PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import { getLogger } from "../common/logger";
import stringify from "json-stringify-safe";
import { TestSetsService } from '../api/test-sets/service';
import ow from 'ow';
import type { EventBridgeEvent } from "aws-lambda";
import { TestSetsApiSchema } from '@ivr-migration-tool/schemas';

export class CreateTestSetsTask extends BaseGeneratorTask<EventBridgeEvent<'TestSetCreated', TestSetsApiSchema.TestSet>, void> {
    constructor(
        protected readonly log: Logger<any, boolean>,
        protected readonly botsService: BotsService,
        protected readonly s3Client: S3Client,
        protected readonly transformer: TRSXTransformer,
        private readonly llmTransformer: LLMTransformer,
        private readonly testSetsService: TestSetsService,
    ) {
        super(log, botsService, s3Client, transformer);
    }

    public async process(event: EventBridgeEvent<'TestSetCreated', TestSetsApiSchema.TestSet>): Promise<void> {
        const logger = getLogger(this.log, 'createTestSetsTask', 'process');
        logger.trace(`in: event: ${stringify(event)}`);

        ow(event.detail, ow.object.partialShape({
            id: ow.string.nonEmpty,
            dataSource: ow.object.partialShape({
                botDataSource: ow.object.partialShape({
                    botId: ow.string.nonEmpty
                })
            }),
        }))

        const { dataSource, id } = event.detail;

        const testSet = await this.testSetsService.get(this.securityContext, id);

        const generatingTestSetMessage = `Generating test set using Nuance Dialog and TRSX specification files.`;


        await this.testSetsService.update(this.securityContext, id, {
            status: 'in-progress',
            statusMessages: [...testSet.statusMessages, { message: generatingTestSetMessage, status: 'in-progress' }]
        });


        const bot = await this.botsService.get(this.securityContext, dataSource.botDataSource.botId);
        // Get the Nuance specification file
        const { bucket } = bot.botDefinitionLocation!;

        const [trsxProject, dialogAppProject] = await this.getNuanceProjectDefinition({ bucket: bucket, key: `input/${bot.id}/botSourceDefinition.zip` });

        // Get the generated output for the bot
        const botDefinitionRaw = bot.botDefinitionRawLocation;
        const response = await this.s3Client.send(new GetObjectCommand({ Bucket: bucket, Key: botDefinitionRaw?.key }));
        const transformedOutput: TransformedResponseTaskOutput = JSON.parse(await response.Body?.transformToString('utf-8')!);
        const csvContent = await this.llmTransformer.createTestSetsFromNuanceSpecification({ trsxProject, dialogAppProject, transformedResponseTaskOutput: transformedOutput });

        // Add validation to filter out invalid CSV lines
        const csvLines = csvContent.split('\n');
        const validCsvLines = csvLines.filter(line => {
            return line.split(',').length > 4
        });
        const validCsvContent = validCsvLines.join('\n');

        const testSetKey = `test-sets/${id}/test.csv`;
        const testSetLocation = {
            bucket: bucket,
            key: testSetKey,
        };

        // Upload test set csv file
        await this.s3Client.send(new PutObjectCommand({
            Bucket: testSetLocation.bucket,
            Key: testSetLocation.key,
            Body: validCsvContent,
        }))


        await this.testSetsService.update(this.securityContext, id, {
            status: 'in-progress',
            testSetLocation: testSetLocation,
            statusMessages: [...testSet.statusMessages,
            {
                message: generatingTestSetMessage, status: 'success'
            }]
        });





    }

}
