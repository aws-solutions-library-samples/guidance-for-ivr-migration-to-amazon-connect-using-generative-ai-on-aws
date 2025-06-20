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

import type { Logger } from 'pino';
import type { DialogAppDefinition } from './models.ts';
import { getLogger } from '../common/logger.ts';
import stringify from 'json-stringify-safe';
import type { BotConfig } from '../trsx/TRSXTransformer.ts';
import type { BotExportStructure } from '../lex/models.ts';

export class DialogAppTransformer {
	constructor(private readonly log: Logger<any, boolean>) {}

	public async parse(filePath: string): Promise<DialogAppDefinition> {
		const logger = getLogger(this.log, 'DialogAppTransformer', 'parse');
		logger.trace(`in: filePath: ${stringify(filePath)}`);

		// Read the file content using Bun
		const file = Bun.file(filePath);
		const input = await file.text();
		logger.trace(`input:\n${input}`);

		// parse
		const definition = JSON.parse(input) as DialogAppDefinition;

		logger.trace(`exit:\n${stringify(definition)}`);
		return definition;
	}

	public async transform(c: BotConfig, d: DialogAppDefinition): Promise<BotExportStructure> {
		const logger = getLogger(this.log, 'DialogAppTransformer', 'transform');
		logger.trace(`in: botConfig: ${stringify(c)}, definition: ${stringify(d)}}`);

		// TODO: implement

		logger.trace(`exit:\n${stringify(undefined)}`);
		return undefined as unknown as BotExportStructure;
	}
}
