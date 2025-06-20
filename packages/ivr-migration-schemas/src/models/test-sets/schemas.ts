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

import { Type, type Static } from "@sinclair/typebox";
import type { S3Location } from "../common";

const status = Type.Union([
    Type.Literal('pending'),
    Type.Literal('error'),
    Type.Literal('success'),
    Type.Literal('stopped'),
    Type.Literal('in-progress'),
]);

export type TestSetStatus = Static<typeof status>

const statusMessage = Type.Object({
    status,
    message: Type.String({ description: 'detail on the status message' }),
}, { $id: 'testSetStatusMessage' });

export const createTestSetResource = Type.Object({
    name: Type.String(),
    description: Type.Optional(Type.String()),
    dataSource: Type.Object({
        botDataSource: Type.Object({
            botId: Type.String(),
        })
    })
}, {
    $id: "createTestSetResource"
})

export type CreateTestSet = Static<typeof createTestSetResource>

export const testSetId = Type.String({ description: 'Unique identifier of testset' })

export const testSetResource = Type.Object({
    id: testSetId,
    name: Type.String(),
    status,
    description: Type.Optional(Type.String()),
    dataSource: Type.Object({
        botDataSource: Type.Object({
            botId: Type.String(),
        })
    }),
    outputDownloadUrl: Type.Optional(Type.String({ description: 'The URL to download the test file.' })),
    statusMessages: Type.Array(statusMessage),
    createdAt: Type.String({ format: 'date-time' }),
    createdBy: Type.String({}),
    updatedAt: Type.Optional(Type.String({ format: 'date-time' })),
    updatedBy: Type.Optional(Type.String({})),
}, {
    $id: "testSetResource"
})

export const updateTestSetResource = Type.Object({
    status,
    statusMessages: Type.Array(statusMessage),
}, { $id: 'updateTestSetResource' })

export type UpdateTestSet = Static<typeof updateTestSetResource>

export type UpdateTestSetInternal = UpdateTestSet & { id: string, updatedAt: string, updatedBy: string, testSetLocation?: S3Location, testSetInternalId?: string }

export type TestSet = Static<typeof testSetResource>

export type TestSetInternal = TestSet & { testSetLocation?: S3Location, testSetInternalId?: string }

export const testSetUploadUrlResource = Type.Object({
    uploadUrl: Type.String(),
}, {
    $id: "testSetUploadUrlResource"
})

export type TestSetUploadUrl = Static<typeof testSetUploadUrlResource>

export const testSetListResource = Type.Object({
    testSets: Type.Array(testSetResource),
    pagination: Type.Optional(
        Type.Object({
            token: Type.Optional(Type.String()),
            count: Type.Optional(Type.Number()),
        }))
}, {
    $id: "testSetListResource"
})

export type TestSetList = Static<typeof testSetListResource>
