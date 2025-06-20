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
import { BotsApiSchema, CommonApiSchema } from '@ivr-migration-tool/schemas'
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

export const botsApiSlice = createApi({
    reducerPath: 'botsApi',
    baseQuery: dynamicBaseQuery,
    tagTypes: ['Bots'],
    endpoints: (builder) => ({
        deleteBot: builder.mutation<void, string>({
            query: (id: string) => ({
                url: `/bots/${id}`,
                mode: 'cors',
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'Bots', id: 'LIST' }],
        }),

        getBot: builder.query<BotsApiSchema.Bot, string>({
            query: (id) => ({
                url: `/bots/${id}`,
                mode: 'cors',
                method: 'GET',
            }),
            providesTags: (_result, _error, id) => [{ type: 'Bots', id }],
        }),

        buildBot: builder.mutation<BotsApiSchema.Bot, string>({
            query: (id) => ({
                url: `/bots/${id}/build`,
                mode: 'cors',
                method: 'POST',
            }),
            invalidatesTags: [{ type: 'Bots', id: 'LIST' }],
        }),

        createBot: builder.mutation<BotsApiSchema.Bot, BotsApiSchema.CreateBot>({
            query: (body: BotsApiSchema.CreateBot) => ({
                url: `/bots`,
                mode: 'cors',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Bots', id: 'LIST' }],
        }),

        listBots: builder.query<BotsApiSchema.BotList, CommonApiSchema.ListPaginationOptions>({
            query: ({ count, token }) => ({
                url: `/bots`,
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
                    channel = await events.connect('bots');
                    await cacheDataLoaded
                    channel.subscribe({
                        next: (data: { event: CommonApiSchema.Event<BotsApiSchema.Bot> }) => {
                            const { detail } = data.event;
                            updateCachedData((results) => {
                                const index = results.bots.findIndex(b => b.id === detail.id);
                                if (index >= 0) {
                                    results.bots[index] = detail as BotsApiSchema.Bot
                                } else {
                                    results.bots.push(detail)
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
            providesTags: (result) => providesList(result?.bots ?? [], 'Bots'),
        }),
    }),
});

export const { useCreateBotMutation, useListBotsQuery, useDeleteBotMutation, useGetBotQuery, useBuildBotMutation } = botsApiSlice;
