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
import type { TestSetsApiSchema } from "@ivr-migration-tool/schemas";

export const createTestSetResourceExample: TestSetsApiSchema.CreateTestSet = {
    name: "sample-test-set",
    dataSource: {
        botDataSource: {
            botId: "1234"
        }
    }
}

export const testSetUploadUrlExampe: TestSetsApiSchema.TestSetUploadUrl = {
    uploadUrl: "https://example.com/upload-url"
}

export const testSetResourceExample: TestSetsApiSchema.TestSet = {
    id: "test-set-id",
    name: "sample-test-set",
    status: "in-progress",
    description: "sample-test-set-description",
    dataSource: {
        botDataSource: {
            botId: "1234"
        }
    },
    createdAt: "user@example.com",
    createdBy: new Date().toISOString(),
    statusMessages: [{
        status: "pending",
        message: "Importing test set to Amazon Lex."
    }]
}

export const testSetListResourceExample: TestSetsApiSchema.TestSetList = {
    testSets: [testSetResourceExample]
}
