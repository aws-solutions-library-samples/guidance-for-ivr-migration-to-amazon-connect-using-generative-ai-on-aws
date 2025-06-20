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

import { beforeEach, describe, expect, test } from 'bun:test';
import { DialogAppTransformer } from './DialogAppTransformer';
import Pino, { Logger, pino } from 'pino';
import { join } from 'path';

describe('DialogAppTransformer', () => {
	const log = pino(
		pino.destination({
			sync: true, // test frameworks must use pino logger in sync mode!
		})
	) as Logger<any, boolean>;
	log.level = 'info';
	let transformer: DialogAppTransformer;

	beforeEach(() => {
		transformer = new DialogAppTransformer(log);
	});

	describe('parse', () => {
		test('should parse a dialog app definition from a JSON file', async () => {
			// Given a sample coffee shop dialog app JSON file
			const filePath = join(__dirname, 'test', 'coffeeShop.json');

			// When parsing the file
			const result = await transformer.parse(filePath);

			console.log(JSON.stringify(result));

			// Then verify the dialog app definition is correctly parsed
			expect(result).toBeDefined();
			expect(result.data.id).toBe('4a5ecb02-7ba2-4d16-a674-4e6eb7201838');
			expect(result.data.name).toBe('sz-ivr-coffee-shop-for-doc');
			expect(result.data.defaultLocale).toBe('en-US');
			expect(result.data.supportedLocales).toEqual(['en-US']);
		});

		test('should throw an error when file does not exist', async () => {
			// Given a non-existent file path
			const filePath = './test/nonexistent.json';

			// When/Then expect parsing to throw an error
			expect(transformer.parse(filePath)).rejects.toThrow();
		});
	});

});
