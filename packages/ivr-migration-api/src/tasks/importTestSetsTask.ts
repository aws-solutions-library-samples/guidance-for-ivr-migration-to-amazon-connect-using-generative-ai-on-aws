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

import type { S3ObjectCreatedNotificationEvent } from "aws-lambda";
import { CreateUploadUrlCommand, LexModelsV2Client, StartImportCommand, waitUntilBotImportCompleted, type StartImportCommandInput } from "@aws-sdk/client-lex-models-v2";
import type { Logger } from "pino";
import type { TestSetsService } from "../api/test-sets/service";
import type { S3Client } from "@aws-sdk/client-s3";
import { SecurityScope, type SecurityContext } from "../common/scopes";
import { getLogger } from "../common/logger";
import stringify from "json-stringify-safe";
import ow from 'ow';
import { TestSetsApiSchema } from "@ivr-migration-tool/schemas";
import type { S3Location } from "../common/schemas";

export class ImportTestSetsTask {

    private readonly securityContext: SecurityContext;

    constructor(
        protected readonly log: Logger<any, boolean>,
        protected readonly s3Client: S3Client,
        private readonly testSetsService: TestSetsService,
        private readonly lexModelClient: LexModelsV2Client,
        private readonly roleArn: string
    ) {
        this.securityContext = {
            email: 'ImportTestSetsTask',
            role: SecurityScope.contributor,
            sub: 'ImportTestSetsTask',
        }
    }

    public async process(event: S3ObjectCreatedNotificationEvent): Promise<void> {
        const logger = getLogger(this.log, 'ImportTestSetsTask', 'process');
        logger.trace(`in: event: ${stringify(event)}`);

        ow(event, ow.object.nonEmpty);
        ow(event.detail, ow.object.partialShape({
            bucket: ow.object.nonEmpty,
            object: ow.object.nonEmpty
        }))

        const { bucket, object } = event.detail

        const [, testSetId] = object.key.split('/')
        const successStatus: TestSetsApiSchema.TestSetStatus = 'success'
        const importingTestSetMessage = `Importing test set to Amazon Lex.`;

        const testSet = await this.testSetsService.get(this.securityContext, testSetId)

        await this.testSetsService.update(this.securityContext, testSetId, {
            status: successStatus,
            statusMessages: [
                ...testSet.statusMessages.map(s => ({ ...s, status: successStatus })),
                {
                    message: importingTestSetMessage,
                    status: 'in-progress'
                }]
        });

        try {
            const response = await this.importTestSet(testSet, { bucket: bucket.name, key: object.key });

            await this.testSetsService.update(this.securityContext, testSetId, {
                status: successStatus,
                testSetInternalId: response.reason?.importedResourceId!,
                statusMessages: [
                    ...testSet.statusMessages.map(s => ({ ...s, status: successStatus })),
                    {
                        message: importingTestSetMessage, status: successStatus
                    }]
            });

        } catch (err) {
            logger.error(`Test set "${testSet.name}" failed to import into Amazon Lex, err: ${err}`);

            await this.testSetsService.update(this.securityContext, testSet.id, {
                status: 'error',
                statusMessages: [...testSet.statusMessages,
                {
                    message: importingTestSetMessage, status: 'error'
                }]
            });
        }

        logger.trace("out:");
    }


    /**
     * Imports a test set into Amazon Lex
     * @param testSet The test set to import
     * @param inputFileLocation The S3 location containing the test set file
     * @returns The import response from Lex containing the imported resource ID
     */
    private async importTestSet(testSet: TestSetsApiSchema.TestSetInternal, inputFileLocation: S3Location) {
        const logger = getLogger(this.log, 'ImportTestSetsTask', 'importTestSet');
        logger.trace(`in: testSet: ${stringify(testSet)}, inputFileLocation: ${stringify(inputFileLocation)}`);

        const { importId } = await this.lexModelClient.send(new CreateUploadUrlCommand({}));

        const startImportCommandInput: StartImportCommandInput = {
            importId,
            mergeStrategy: "Overwrite",
            resourceSpecification: {
                "testSetImportResourceSpecification": {
                    "testSetName": testSet.name,
                    "description": testSet.description,
                    "roleArn": this.roleArn,
                    "storageLocation": { "s3BucketName": inputFileLocation.bucket, "s3Path": "aws/lex" },
                    "importInputLocation": { "s3BucketName": inputFileLocation.bucket, "s3Path": inputFileLocation.key },
                    "modality": "Text"
                }
            }
        };

        await this.lexModelClient.send(new StartImportCommand(startImportCommandInput));
        const response = await waitUntilBotImportCompleted(
            {
                client: this.lexModelClient,
                maxWaitTime: 300
            },
            { importId }
        );

        logger.trace(`out: response: ${stringify(response)}`)
        return response;
    }
}
