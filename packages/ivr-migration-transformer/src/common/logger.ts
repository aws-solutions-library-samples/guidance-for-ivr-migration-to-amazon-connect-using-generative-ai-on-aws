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

import { pino, type Logger, type LoggerOptions } from 'pino';

const environment = Bun.env.NODE_ENV;
const logLevel = Bun.env.LOG_LEVEL;

const envToLogger: Record<string, LoggerOptions<any>> = {
	local: {
		level: logLevel ?? 'warn',
	},
	cloud: {
		level: logLevel ?? 'warn',
	},
};

export const LOGGER: Logger<any, boolean> = pino(
	envToLogger[environment!] ?? {
		level: logLevel ?? 'warn',
	}
);

export const getLogger = (log: Logger<any, boolean>, file: string, method: string): Logger<any, boolean> => {
	return log.child({ file, method });
};
