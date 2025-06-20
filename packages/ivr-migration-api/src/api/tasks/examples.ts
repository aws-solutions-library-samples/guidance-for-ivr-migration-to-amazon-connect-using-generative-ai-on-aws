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

import type { RecommendationTaskApiSchema } from "@ivr-migration-tool/schemas";

export const recommendationTaskCreateRequestExample: RecommendationTaskApiSchema.TaskNew = {
	testExecutionId: '01jbdqm00vdyz1d2bdbp26qm9p',
	botId: "ULHZMUZCQI"
};

export const recommendationTaskResourceExample: RecommendationTaskApiSchema.TaskResource = {
	id: 'XP8QITQ9OR',
	taskStatus: 'success',
	itemsTotal: 11,
	itemsSucceeded: 11,
	itemsFailed: 0,
	itemsCompleted: 11,
	createdAt: '2024-10-30T03:30:58.734Z',
	createdBy: 'someone@somewhere.com',
	testExecutionId: "01jbdqm00vdyz1d2bdbp26qm9p"
};

export const recommendationTaskResourceListExample: RecommendationTaskApiSchema.TaskList = {
	tasks: [recommendationTaskResourceExample],
};
