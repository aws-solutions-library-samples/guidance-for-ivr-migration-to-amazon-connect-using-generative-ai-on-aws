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
import { join } from 'path';
import { TRSXTransformer } from './TRSXTransformer';
import pino, { Logger } from 'pino';
import { TRSXListener } from './TRSXListener';
import { BotConfig } from './TRSXTransformer';
import { BotDefinitionExporter } from '../lex/BotDefinitionExporter';
import { writeFileSync } from 'fs';
import { TSRX } from './models';


describe('TRSXTransformer', () => {
	const log = pino(
		pino.destination({
			sync: true, // test frameworks must use pino logger in sync mode!
		})
	) as Logger<any, boolean>;
	log.level = 'info';
	let listener: TRSXListener;
	let transformer: TRSXTransformer;

	beforeEach(() => {
		listener = new TRSXListener(log);
		transformer = new TRSXTransformer(log, listener);
	});

	describe('parse', () => {
		test('should parse a valid TRSX file correctly', async () => {
			// Arrange
			const filePath = join(__dirname, 'test', 'sample.trsx.xml');

			// Act
			const result = await transformer.parse(filePath);

			// Assert
			expect(result).toBeDefined();
			expect(result.metadata).toBeDefined();
			expect(result.metadata).toHaveLength(5);
			expect(result.metadata).toContainEqual({
				key: 'description',
				value: 'Sample model with a freeform entity and a list entity',
			});
			expect(result.metadata).toContainEqual({
				key: 'short_name',
				value: 'Search Engine Query Sample Model',
			});
			expect(result.metadata).toContainEqual({
				key: 'source',
				value: 'Nuance Communications',
			});
			expect(result.metadata).toContainEqual({
				key: 'type',
				value: 'sample',
			});
			expect(result.metadata).toContainEqual({
				key: 'version',
				value: '1.0.0',
			});

			// Verify intents
			expect(result.ontology?.intents).toHaveLength(1);
			expect(result.ontology!.intents![0].name).toBe('SEARCH');
			expect(result.ontology!.intents![0].links).toHaveLength(2);
			expect(result.ontology!.intents![0].links).toContainEqual({ conceptref: 'SEARCH_ENGINE' });
			expect(result.ontology!.intents![0].links).toContainEqual({ conceptref: 'SEARCH_QUERY' });

			// Verify concepts
			expect(result.ontology!.concepts).toHaveLength(2);
			expect(result.ontology!.concepts![0]).toEqual({
				name: 'SEARCH_QUERY',
				freetext: true,
			});
			expect(result.ontology!.concepts![1]).toEqual({
				name: 'SEARCH_ENGINE',
			});

			// Verify dictionaries
			expect(result.dictionaries).toHaveLength(1);
			expect(result.dictionaries![0].conceptref).toEqual('SEARCH_ENGINE');
			expect(result.dictionaries![0].entries).toHaveLength(8);
			expect(result.dictionaries![0].entries[0]).toEqual({
				literal: 'bing',
				value: 'bing',
			});
			expect(result.dictionaries![0].entries[1]).toEqual({
				literal: 'duck duck go',
				value: 'duckduckgo',
			});
			expect(result.dictionaries![0].entries[2]).toEqual({
				literal: 'duckduckgo',
				value: 'duckduckgo',
			});
			expect(result.dictionaries![0].entries[3]).toEqual({
				literal: 'google',
				value: 'google',
			});
			expect(result.dictionaries![0].entries[4]).toEqual({
				literal: 'wiki',
				value: 'wikipedia',
			});
			expect(result.dictionaries![0].entries[5]).toEqual({
				literal: 'wikipedia',
				value: 'wikipedia',
			});
			expect(result.dictionaries![0].entries[6]).toEqual({
				literal: 'wikipédia',
				value: 'wikipedia',
			});
			expect(result.dictionaries![0].entries[7]).toEqual({
				literal: 'yahoo',
				value: 'yahoo',
			});

			// Verify samples
			expect(result.samples).toBeDefined();
			expect(result.samples).toHaveLength(14);
			expect(result.samples![0]).toEqual({
				intentref: 'SEARCH',
				count: 1,
				text: "I'd like to find {SEARCH_QUERY} on {SEARCH_ENGINE}",
				annotations: [
					{
						conceptref: 'SEARCH_QUERY',
						text: 'good coffee places nearby',
					},
					{
						conceptref: 'SEARCH_ENGINE',
						text: 'bing',
					},
				],
			});
			expect(result.samples![1]).toEqual({
				intentref: 'SEARCH',
				count: 1,
				text: 'look up {SEARCH_QUERY} on {SEARCH_ENGINE}',
				annotations: [
					{
						conceptref: 'SEARCH_QUERY',
						text: 'Edward Snowden',
					},
					{
						conceptref: 'SEARCH_ENGINE',
						text: 'duckduckgo',
					},
				],
			});
			expect(result.samples![2]).toEqual({
				intentref: 'SEARCH',
				count: 1,
				text: '{SEARCH_ENGINE}  {SEARCH_QUERY} ?',
				annotations: [
					{
						conceptref: 'SEARCH_ENGINE',
						text: 'google',
					},
					{
						conceptref: 'SEARCH_QUERY',
						text: 'how long does a sequoia live',
					},
				],
			});
			expect(result.samples![3]).toEqual({
				intentref: 'SEARCH',
				count: 1,
				text: 'find me some {SEARCH_QUERY} on {SEARCH_ENGINE}',
				annotations: [
					{
						conceptref: 'SEARCH_QUERY',
						text: 'cat pictures',
					},
					{
						conceptref: 'SEARCH_ENGINE',
						text: 'bing',
					},
				],
			});
			expect(result.samples![4]).toEqual({
				intentref: 'SEARCH',
				count: 1,
				text: 'search {SEARCH_QUERY} in {SEARCH_ENGINE}',
				annotations: [
					{
						conceptref: 'SEARCH_QUERY',
						text: 'cheap flights',
					},
					{
						conceptref: 'SEARCH_ENGINE',
						text: 'yahoo',
					},
				],
			});
			expect(result.samples![5]).toEqual({
				intentref: 'SEARCH',
				count: 1,
				text: "I'd like to search for {SEARCH_QUERY} on {SEARCH_ENGINE} please",
				annotations: [
					{
						conceptref: 'SEARCH_QUERY',
						text: 'the list of lists of lists',
					},
					{
						conceptref: 'SEARCH_ENGINE',
						text: 'wikipedia',
					},
				],
			});
			expect(result.samples![6]).toEqual({
				intentref: 'SEARCH',
				count: 1,
				text: 'search {SEARCH_QUERY} on {SEARCH_ENGINE}',
				annotations: [
					{
						conceptref: 'SEARCH_QUERY',
						text: 'do a barrel roll',
					},
					{
						conceptref: 'SEARCH_ENGINE',
						text: 'google',
					},
				],
			});
			expect(result.samples![7]).toEqual({
				intentref: 'SEARCH',
				count: 1,
				text: 'search for {SEARCH_QUERY}',
				annotations: [
					{
						conceptref: 'SEARCH_QUERY',
						text: 'chinese chicken salad recipes',
					},
				],
			});
			expect(result.samples![8]).toEqual({
				intentref: 'SEARCH',
				count: 1,
				text: 'search for {SEARCH_QUERY}',
				annotations: [
					{
						conceptref: 'SEARCH_QUERY',
						text: 'cats',
					},
				],
			});
			expect(result.samples![9]).toEqual({
				intentref: 'SEARCH',
				count: 1,
				text: 'search for {SEARCH_QUERY} on {SEARCH_ENGINE}',
				annotations: [
					{
						conceptref: 'SEARCH_QUERY',
						text: 'cat toys',
					},
					{
						conceptref: 'SEARCH_ENGINE',
						text: 'yahoo',
					},
				],
			});
			expect(result.samples![10]).toEqual({
				intentref: 'SEARCH',
				count: 1,
				text: 'search for {SEARCH_QUERY} on {SEARCH_ENGINE}',
				annotations: [
					{
						conceptref: 'SEARCH_QUERY',
						text: 'thai noodles',
					},
					{
						conceptref: 'SEARCH_ENGINE',
						text: 'bing',
					},
				],
			});
			expect(result.samples![11]).toEqual({
				intentref: 'SEARCH',
				count: 1,
				text: 'search {SEARCH_QUERY}',
				annotations: [
					{
						conceptref: 'SEARCH_QUERY',
						text: 'how to fix a leaky tap',
					},
				],
			});
			expect(result.samples![12]).toEqual({
				intentref: 'SEARCH',
				count: 1,
				text: 'search {SEARCH_ENGINE} for {SEARCH_QUERY}',
				annotations: [
					{
						conceptref: 'SEARCH_ENGINE',
						text: 'google',
					},
					{
						conceptref: 'SEARCH_QUERY',
						text: 'a new car',
					},
				],
			});
			expect(result.samples![13]).toEqual({
				intentref: 'SEARCH',
				count: 1,
				text: 'search on {SEARCH_ENGINE} for {SEARCH_QUERY}',
				annotations: [
					{
						conceptref: 'SEARCH_ENGINE',
						text: 'google',
					},
					{
						conceptref: 'SEARCH_QUERY',
						text: 'tree pruning',
					},
				],
			});
		});

		test('should throw error for non-existent file', async () => {
			// Arrange
			const filePath = 'non-existent-file.xml';

			// Act & Assert
			expect(transformer.parse(filePath)).rejects.toThrow();
		});
	});
});
