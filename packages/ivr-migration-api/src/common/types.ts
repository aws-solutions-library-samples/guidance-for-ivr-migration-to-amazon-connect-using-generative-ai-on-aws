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

import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { type TIntersect, type TSchema, Type } from '@sinclair/typebox';
import type { FastifyInstance, RawReplyDefaultExpression, RawRequestDefaultExpression, RawServerDefault } from 'fastify';
import type { Logger } from 'pino';
export const apiVersion100: string = '1.0.0';

export type FastifyTypebox = FastifyInstance<
	RawServerDefault,
	RawRequestDefaultExpression<RawServerDefault>,
	RawReplyDefaultExpression<RawServerDefault>,
	Logger<any, boolean>,
	TypeBoxTypeProvider
>;

export const Nullable = <T extends TSchema>(type: T) => Type.Union([type, Type.Null()]);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function stringEnum<T extends string[]>(values: [...T], description: string, defaultOption?: string) {
	return Type.Unsafe<T[number]>({ type: 'string', enum: values, description, default: defaultOption });
}

export function convertFromTypeBoxIntersectToJSONSchema(intersectTypeBox: TIntersect): any {
	const schema: Record<string, any> = {
		type: 'object',
		properties: {},
		required: [],
	};
	const requiredSets = new Set<string>();

	for (const definition of intersectTypeBox.allOf) {
		for (const [key, value] of Object.entries(definition['properties'])) {
			schema.properties[key] = value;
		}

		if (definition.hasOwnProperty('required')) {
			for (const req of definition['required']) {
				requiredSets.add(req);
			}
		}
	}
	schema.required = Array.from(requiredSets);
	return schema;
}
