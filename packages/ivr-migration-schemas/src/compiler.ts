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

import { compileFromFile } from 'json-schema-to-typescript';
import { readdir } from "fs/promises";
import { join } from "path";

async function main() {
	try {
		const directoryPaths = ["src/schemas/lex", "src/schemas/nuance"];
		directoryPaths.forEach(async (directoryPath) => {
			const files = await readdir(directoryPath);
			const filePaths = files
				.filter((filename) => filename.endsWith('.schema.json'))
				.map((filename) => join(directoryPath, filename));
			filePaths.forEach(async (filePath) => {
				console.log(`Processing file ${filePath}`)
				const compiled = await compileFromFile(filePath);
				Bun.write(`${filePath.replace('/schemas/', '/models/').replace('.schema.json', '.ts')}`, compiled);
			});
		});
	} catch (error) {
		console.error('Main error:', error);
	}
}

main();
