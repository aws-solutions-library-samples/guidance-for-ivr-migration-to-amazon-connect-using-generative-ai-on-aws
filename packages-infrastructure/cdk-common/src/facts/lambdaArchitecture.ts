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

import { Stack, Token } from 'aws-cdk-lib';
import { Architecture } from 'aws-cdk-lib/aws-lambda';
import type { Construct } from 'constructs';
import { FactNames } from './fact-tables.js';

export function getLambdaArchitecture(scope: Construct): Architecture {
	const preferredArchitecture = Stack.of(scope).regionalFact(FactNames.PREFERRED_LAMBDA_ARCHITECTURE, Architecture.X86_64.name);
	if (Token.isUnresolved(preferredArchitecture)) {
		return Architecture.custom(preferredArchitecture);
	}
	return preferredArchitecture === Architecture.ARM_64.name ? Architecture.ARM_64 : Architecture.X86_64;
}
