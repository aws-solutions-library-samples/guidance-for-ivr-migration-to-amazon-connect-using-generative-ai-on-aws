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
import { TestSetsApiSchema, CommonApiSchema } from '@ivr-migration-tool/schemas'
import { dynamicBaseQuery } from './common';
import { events } from "aws-amplify/data";

function providesList<R extends { id: string }[], T extends string>(resultsWithIds: R | undefined, tagType: T) {
    return resultsWithIds ? [{ type: tagType, id: 'LIST' }, ...resultsWithIds.map(({ id }) => ({ type: tagType, id }))] : [{ type: tagType, id: 'LIST' }];
}

function invalidatesList<R extends string, T extends string>(id: R, tagType: T) {
    return [
        { type: tagType, id: 'LIST' },
        { type: tagType, id },
    ];
}

export const testSetsApiSlice = createApi({
    reducerPath: 'testSetsApi',
    baseQuery: dynamicBaseQuery,
    tagTypes: ['TestSets'],
    endpoints: (builder) => ({
        deleteTestSet: builder.mutation<void, string>({
            query: (id: string) => ({
                url: `/testSets/${id}`,
                mode: 'cors',
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'TestSets', id: 'LIST' }],
        }),

        getTestSet: builder.query<TestSetsApiSchema.TestSet, string>({
            query: (id) => ({
                url: `/testSets/${id}`,
                mode: 'cors',
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'TestSets', id }],
        }),

        createTestSet: builder.mutation<TestSetsApiSchema.TestSet, TestSetsApiSchema.CreateTestSet>({
            query: (body: TestSetsApiSchema.CreateTestSet) => ({
                url: `/testSets`,
                mode: 'cors',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'TestSets', id: 'LIST' }],
        }),
        createTestSetUploadUrl: builder.mutation<TestSetsApiSchema.TestSetUploadUrl, string>({
            query: (id) => ({
                url: `/testSets/${id}/uploadUrl`,
                mode: 'cors',
                method: 'POST',
                body: {},
            }),
            invalidatesTags: [{ type: 'TestSets', id: 'LIST' }],
        }),

        listTestSets: builder.query<TestSetsApiSchema.TestSetList, CommonApiSchema.ListPaginationOptions>({
            query: ({ count, token }) => ({
                url: `/testSets`,
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
                    channel = await events.connect('testSets');
                    await cacheDataLoaded
                    channel.subscribe({
                        next: (data: { event: CommonApiSchema.Event<TestSetsApiSchema.TestSet> }) => {
                            const { detail } = data.event;
                            updateCachedData((results) => {
                                const index = results.testSets.findIndex(b => b.id === detail.id);
                                if (index >= 0) {
                                    results.testSets[index] = detail
                                } else {
                                    results.testSets.push(detail);
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
            providesTags: (result) => providesList(result?.testSets!, 'TestSets'),
        }),
    }),
});

export const { useCreateTestSetMutation, useDeleteTestSetMutation, useGetTestSetQuery, useListTestSetsQuery, useCreateTestSetUploadUrlMutation } = testSetsApiSlice;
