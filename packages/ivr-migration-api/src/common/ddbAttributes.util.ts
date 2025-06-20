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
import type { NativeAttributeValue } from '@aws-sdk/lib-dynamodb';

// TODO: refactor to use common library

export const RESERVED_PREFIX = '___';

export const pkDelimiter: string = ':';

export function createDelimitedAttribute(keyPrefix: string, ...items: (string | number | boolean)[]): string {
	const escapedItems = items.map((i) => {
		if (typeof i === 'string') {
			return encodeURIComponent(i).toLowerCase();
		} else {
			return i;
		}
	});
	return `${delimitedAttributePrefix(keyPrefix)}${escapedItems.join(pkDelimiter)}`;
}

export function createDelimitedAttributePrefix(keyPrefix: string, ...items: (string | number | boolean)[]): string {
	let key = `${createDelimitedAttribute(keyPrefix, ...items)}`;
	if (!key.endsWith(pkDelimiter)) {
		key += pkDelimiter;
	}
	return key;
}

export function expandDelimitedAttribute(value: string): string[] {
	if (value === null || value === undefined) {
		return undefined;
	}
	const expanded = value.split(pkDelimiter);
	return expanded.map((i) => {
		if (typeof i === 'string') {
			return decodeURIComponent(i);
		} else {
			return i;
		}
	});
}

export function delimitedAttributePrefix(keyPrefix: string): string {
	return `${keyPrefix}${pkDelimiter}`;
}

export function isPkType(value: string, keyPrefix: string): boolean {
	return value.startsWith(delimitedAttributePrefix(keyPrefix));
}

export type DocumentDbClientItem = {
	[key: string]: NativeAttributeValue;
};
