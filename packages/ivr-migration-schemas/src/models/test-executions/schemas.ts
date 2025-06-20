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

export const id = Type.String({ description: 'Unique id of test execution' })

const status = Type.Union([
    Type.Literal('pending'),
    Type.Literal('error'),
    Type.Literal('success'),
    Type.Literal('stopped'),
    Type.Literal('in-progress'),
]);

export type TestExecutionStatus = Static<typeof status>;

export const createTestExecutionResource = Type.Object({
    testSetId: Type.String(),
}, {
    $id: "createTestExecutionResource"
})

export type CreateTestExecutionResource = Static<typeof createTestExecutionResource>;

export const testExecutionResource = Type.Object({
    id,
    botId: Type.String(),
    testSetId: Type.String(),
    testSetName: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    createdBy: Type.String({}),
    updatedAt: Type.Optional(Type.String({ format: 'date-time' })),
    updatedBy: Type.Optional(Type.String({})),
    outputDownloadUrl: Type.Optional(Type.String({ description: 'The URL to download the test file.' })),
    failureReasons: Type.Optional(Type.Array(Type.String({ description: 'Reasons why the test failed' }))),
    status,
}, {
    $id: 'testExecutionResource'
})

export type TestExecutionResource = Static<typeof testExecutionResource>;

export type TestExecutionInternal = {
    botId: string,
    id: string,
    updatedAt: string,
    updatedBy: string,
    status: TestExecutionStatus,
    failureReasons?: string[]
}

export const testExecutionListResource = Type.Object({
    testExecutions: Type.Array(testExecutionResource),
    pagination: Type.Optional(
        Type.Object({
            token: Type.Optional(Type.String()),
            count: Type.Optional(Type.Number()),
        }))
}, {
    $id: "testExecutionListResource"
})

export type TestExecutionListResource = Static<typeof testExecutionListResource>
