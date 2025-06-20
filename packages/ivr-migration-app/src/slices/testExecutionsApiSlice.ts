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

import { createApi } from '@reduxjs/toolkit/query/react';
import { CommonApiSchema, TestExecutionsApiSchema } from '@ivr-migration-tool/schemas'
import { dynamicBaseQuery } from './common';
import { events } from 'aws-amplify/api';

function providesList<R extends { id: string }[], T extends string>(resultsWithIds: R | undefined, tagType: T) {
    return resultsWithIds ? [{ type: tagType, id: 'LIST' }, ...resultsWithIds.map(({ id }) => ({ type: tagType, id }))] : [{ type: tagType, id: 'LIST' }];
}

function invalidatesList<R extends string, T extends string>(id: R, tagType: T) {
    return [
        { type: tagType, id: 'LIST' },
        { type: tagType, id },
    ];
}

export const testExecutionsApiSlice = createApi({
    reducerPath: 'testExecutionsApi',
    baseQuery: dynamicBaseQuery,
    tagTypes: ['TestExecutions'],
    endpoints: (builder) => ({

        getTestExecution: builder.query<TestExecutionsApiSchema.TestExecutionResource, { botId: string, id: string }>({
            query: (request) => ({
                url: `/bots/${request.botId}/testExecutions/${request.id}`,
                mode: 'cors',
                method: 'GET',
            }),
            providesTags: (_result, _error, input) => [{ type: 'TestExecutions', id: input.id }],
        }),

        createTestExecution: builder.mutation<TestExecutionsApiSchema.TestExecutionResource, TestExecutionsApiSchema.CreateTestExecutionResource & { botId: string }>({
            query: (body: TestExecutionsApiSchema.CreateTestExecutionResource & { botId: string }) => ({
                url: `/bots/${body.botId}/testExecutions`,
                mode: 'cors',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'TestExecutions', id: 'LIST' }],
        }),

        listTestExecutions: builder.query<TestExecutionsApiSchema.TestExecutionListResource, CommonApiSchema.ListPaginationOptions & { botId: string }>({
            query: ({ count, token, botId }) => ({
                url: `/bots/${botId}/testExecutions`,
                mode: 'cors',
                method: 'GET',
                params: {
                    count,
                    token,
                },
            }),
            async onCacheEntryAdded(
                _arg,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved },
            ) {
                let channel;
                try {
                    channel = await events.connect('testExecutions');
                    await cacheDataLoaded
                    channel.subscribe({
                        next: (data: { event: CommonApiSchema.Event<TestExecutionsApiSchema.TestExecutionResource> }) => {
                            const { detail } = data.event;
                            updateCachedData((results) => {
                                const index = results.testExecutions.findIndex(b => b.id === detail.id);
                                if (index >= 0) {
                                    results.testExecutions[index] = detail as TestExecutionsApiSchema.TestExecutionResource
                                } else {
                                    results.testExecutions.push(detail)
                                }
                            })
                        },
                        error: (value) => console.error(value),
                    })
                } catch (e) {
                    console.log(e)
                }
                await cacheEntryRemoved
                channel?.close();
            },
            providesTags: (result) => providesList(result?.testExecutions!, 'TestExecutions'),
        }),
    }),
});

export const { useCreateTestExecutionMutation, useGetTestExecutionQuery, useListTestExecutionsQuery } = testExecutionsApiSlice;
