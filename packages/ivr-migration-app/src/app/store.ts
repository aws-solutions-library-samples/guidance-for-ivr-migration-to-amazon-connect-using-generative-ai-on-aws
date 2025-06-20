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

import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit';
import { botsApiSlice } from '../slices/botsApiSlice'
import { testSetsApiSlice } from '../slices/testSetsApiSlice';
import { testExecutionsApiSlice } from '../slices/testExecutionsApiSlice';
import { recommendationTasksApiSlice } from '../slices/recommendationTasksApiSlice';
import { recommendationTaskItemsApiSlice } from '../slices/recommendationTaskItemsApiSlice';

export const store = configureStore({
	reducer: {
		[botsApiSlice.reducerPath]: botsApiSlice.reducer,
		[testSetsApiSlice.reducerPath]: testSetsApiSlice.reducer,
		[testExecutionsApiSlice.reducerPath]: testExecutionsApiSlice.reducer,
		[recommendationTasksApiSlice.reducerPath]: recommendationTasksApiSlice.reducer,
		[recommendationTaskItemsApiSlice.reducerPath]: recommendationTaskItemsApiSlice.reducer,
	},
	devTools: true,
	middleware: (getDefaultMiddleware) => getDefaultMiddleware()
		.concat(botsApiSlice.middleware)
		.concat(testSetsApiSlice.middleware)
		.concat(testExecutionsApiSlice.middleware)
		.concat(recommendationTasksApiSlice.middleware)
		.concat(recommendationTaskItemsApiSlice.middleware)
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
