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
import { CommonApiSchema, RecommendationTaskApiSchema } from '@ivr-migration-tool/schemas'
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

export const recommendationTasksApiSlice = createApi({
    reducerPath: 'recommendationTasksApi',
    baseQuery: dynamicBaseQuery,
    tagTypes: ['RecommendationTask'],
    endpoints: (builder) => ({

        getRecommendationTask: builder.query<RecommendationTaskApiSchema.TaskResource, { testExecutionId: string, id: string }>({
            query: (request) => ({
                url: `/testExecutions/${request.testExecutionId}/recommendationTasks/${request.id}`,
                mode: 'cors',
                method: 'GET',
            }),
            providesTags: (_result, _error, input) => [{ type: 'RecommendationTask', id: `${input.testExecutionId}-${input.id}` }],
        }),

        createRecommendationTask: builder.mutation<RecommendationTaskApiSchema.TaskResource, RecommendationTaskApiSchema.TaskNew>({
            query: (body: RecommendationTaskApiSchema.TaskNew) => ({
                url: `/recommendationTasks`,
                mode: 'cors',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'RecommendationTask', id: 'LIST' }],
        }),

        listRecommendationTasks: builder.query<RecommendationTaskApiSchema.TaskList, CommonApiSchema.ListPaginationOptions & { testExecutionId: string }>({
            query: ({ count, token, testExecutionId }) => ({
                url: `/testExecutions/${testExecutionId}/recommendationTasks`,
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
                    channel = await events.connect('recommendationTasks');
                    await cacheDataLoaded
                    channel.subscribe({
                        next: (data: { event: CommonApiSchema.Event<RecommendationTaskApiSchema.TaskResource> }) => {
                            const { detail } = data.event;
                            updateCachedData((results) => {
                                const index = results.tasks.findIndex(b => b.id === b.id);
                                if (index >= 0) {
                                    results.tasks[index] = detail as RecommendationTaskApiSchema.TaskResource
                                } else {
                                    results.tasks.push(detail)
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
            providesTags: (result) => providesList(result?.tasks!, 'RecommendationTask'),
        }),
    }),
});

export const { useCreateRecommendationTaskMutation, useGetRecommendationTaskQuery, useListRecommendationTasksQuery } = recommendationTasksApiSlice;
