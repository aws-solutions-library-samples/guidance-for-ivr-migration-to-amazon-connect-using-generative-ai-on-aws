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
import { CommonApiSchema, RecommendationTaskItemsApiSchema } from '@ivr-migration-tool/schemas'
import { dynamicBaseQuery } from './common';
import { events } from 'aws-amplify/api';

function providesList<R extends { taskItemId: string }[], T extends string>(resultsWithIds: R | undefined, tagType: T) {
    return resultsWithIds ? [{ type: tagType, id: 'LIST' }, ...resultsWithIds.map(({ taskItemId }) => ({ type: tagType, taskItemId }))] : [{ type: tagType, id: 'LIST' }];
}

function invalidatesList<R extends string, T extends string>(id: R, tagType: T) {
    return [
        { type: tagType, id: 'LIST' },
        { type: tagType, id },
    ];
}

export const recommendationTaskItemsApiSlice = createApi({
    reducerPath: 'recommendationTaskItemsApi',
    baseQuery: dynamicBaseQuery,
    tagTypes: ['RecommendationTaskItem'],
    endpoints: (builder) => ({

        getRecommendationTaskItem: builder.query<RecommendationTaskItemsApiSchema.TaskItemResource, { taskId: string, id: string }>({
            query: (request) => ({
                url: `/recommendationTasks/${request.taskId}/taskItems/${request.id}`,
                mode: 'cors',
                method: 'GET',
            }),
            providesTags: (_result, _error, input) => [{ type: 'RecommendationTaskItem', id: input.id }],
        }),

        listRecommendationTaskItems: builder.query<RecommendationTaskItemsApiSchema.TaskItemList, CommonApiSchema.ListPaginationOptions & { id: string }>({
            query: ({ count, token, id }) => ({
                url: `/recommendationTasks/${id}/taskItems`,
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
                    channel = await events.connect('recommendationTaskItems');
                    await cacheDataLoaded
                    channel.subscribe({
                        next: (data: { event: CommonApiSchema.Event<RecommendationTaskItemsApiSchema.TaskItemResource> }) => {
                            const { detail } = data.event;
                            updateCachedData((results) => {
                                const index = results.taskItems.findIndex(b => b.taskItemId === b.taskItemId);
                                if (index >= 0) {
                                    results.taskItems[index] = detail as RecommendationTaskItemsApiSchema.TaskItemResource
                                } else {
                                    results.taskItems.push(detail)
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
            providesTags: (result) => providesList(result?.taskItems!, 'RecommendationTaskItem'),
        }),
    }),
});

export const { useGetRecommendationTaskItemQuery, useListRecommendationTaskItemsQuery } = recommendationTaskItemsApiSlice;
