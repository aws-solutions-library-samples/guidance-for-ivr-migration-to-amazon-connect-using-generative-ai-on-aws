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
import { BotsApiSchema, TestExecutionsApiSchema } from '@ivr-migration-tool/schemas';
import { createdAt, createdBy, updatedAt, updatedBy } from '../common';
import { stringEnum } from '../types';

export const id = Type.String({ description: 'Task resource id.' });

const taskStatus = stringEnum(['in-progress', 'success', 'error'], 'Task execution status');

export const taskNew = Type.Object(
	{
		testExecutionId: TestExecutionsApiSchema.id,
		botId: BotsApiSchema.botId,
	},
	{ $id: 'taskNew' }
);

const fromTaskIdPagination = Type.Optional(Type.String({ description: 'Last evaluated task Id' }));

export const taskResource = Type.Object(
	{
		id,
		taskStatus,
		testExecutionId: TestExecutionsApiSchema.id,
		createdAt,
		createdBy,
		statusMessage: Type.Optional(Type.String({ description: 'message for the status' })),
		progress: Type.Optional(Type.Number({ description: 'total progress of the task' })),
		itemsTotal: Type.Number({ description: 'total number of items in the task' }),
		itemsSucceeded: Type.Number({ description: 'total number of items succeeded' }),
		itemsFailed: Type.Number({ description: 'no. of items failed' }),
		itemsCompleted: Type.Number({ description: 'no. of items completed' }),
		updatedAt: Type.Optional(updatedAt),
		updatedBy: Type.Optional(updatedBy),
	},
	{
		$id: 'taskResource',
	}
);

export const taskList = Type.Object(
	{
		tasks: Type.Array(Type.Ref(taskResource)),
		pagination: Type.Optional(
			Type.Object({
				lastEvaluated: Type.Optional(fromTaskIdPagination),
			})
		),
	},
	{
		$id: 'executionTasks_list',
	}
);

export type TaskResource = Static<typeof taskResource>;
export type TaskList = Static<typeof taskList>;
export type TaskNew = Static<typeof taskNew>;

export interface TaskBatchProgress {
	taskId: string;
	testExecutionId: string;
	itemsFailed: number;
	itemsSucceeded: number;
}

export interface TaskBatchStatus {
	taskId: string;
	testExecutionId: string;
	status: string;
}
