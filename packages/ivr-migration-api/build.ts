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

await Bun.build({
	entrypoints: [
		'./src/handlers/ivr-migration-api/index.ts',
		'./src/handlers/generate-slots-task/index.ts',
		'./src/handlers/generate-intent-task/index.ts',
		'./src/handlers/validate-intent-task/index.ts',
		'./src/handlers/handle-error-task/index.ts',
		'./src/handlers/handle-success-task/index.ts',
		'./src/handlers/create-test-sets-task/index.ts',
		'./src/handlers/import-test-sets-task/index.ts',
		'./src/handlers/create-intent-task/index.ts',
		'./src/handlers/create-slot-type-task/index.ts',
		'./src/handlers/parameter-collector-task/index.ts',
		'./src/handlers/build-bot-task/index.ts',
		'./src/handlers/fix-bot-task/index.ts',
		'./src/handlers/create-recommendation-task/index.ts',
		'./src/handlers/check-test-execution-task/index.ts',
		'./src/handlers/stream-processor/index.ts',
	],
	outdir: './dist',
	root: './src/handlers',
	target: 'bun',
	minify: true,
	external: [''],
});
