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

import { type Static, Type } from '@sinclair/typebox';
import type { S3Location } from '../common';
import { stringEnum } from '../types';

export const statusQS = Type.Optional(Type.String({ description: 'filter by status of the tasks, i.e. success, failure' }));
export const taskItemStatus = stringEnum(['success', 'error'], 'Execution task item state');
export const taskId = Type.String({ description: 'Recommendation task id.' });
export const taskItemId = Type.String({ description: 'Recommendation task item id.' });

export const taskItemResource = Type.Object(
	{
		taskId,
		taskItemId,
		status: Type.Optional(taskItemStatus),
		statusMessage: Type.Optional(Type.String({ description: 'failure message' })),
		recommendationDownloadUrl: Type.Optional(Type.String({ description: 'recommendation download url' })),
	},
	{
		$id: 'taskItemResource',
	}
);

export const taskItemList = Type.Object(
	{
		taskItems: Type.Array(Type.Ref(taskItemResource)),
		pagination: Type.Optional(
			Type.Object({
				count: Type.Optional(Type.Number()),
				token: Type.Optional(taskItemId),
			})
		),
	},
	{ $id: 'taskItemListResource' }
);

export type TaskItemResource = Static<typeof taskItemResource>;
export type TaskItemStatus = Static<typeof taskItemStatus>;
export type TaskItemList = Static<typeof taskItemList>;

export type TaskItemResourceInternal = TaskItemResource & { recommendationLocation?: S3Location }

export interface TestExecutionResultItem {
	"Line Number": string;
	"Conversation Number": string;
	"Source": string;
	"Input": string;
	"Expected Output Intent": string;
	"Expected Output Slot 1": string;
	"Expected Output Slot 2": string;
	"Expected Output Slot 3": string;
	"Actual Transcription": string;
	"Actual Output Intent": string;
	"Actual Output Slot 1": string;
	"Conversation Result (E2E)": string;
	"Line Result (E2E)": string;
	"Intent Recognition": string;
	"Slot Recognition": string;
	"Error Message": string;
	[key: string]: string;
}
