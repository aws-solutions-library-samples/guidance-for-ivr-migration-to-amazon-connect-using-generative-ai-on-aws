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

export class NotFoundError extends Error {
	public constructor(message: string) {
		super(message);
		this.name = 'NotFoundError';
	}
}

export class UserNotAuthorizedError extends Error {
	public constructor(message: string) {
		super(message);
		this.name = 'UserNotAuthorizedError';
	}
}

export class InvalidStateError extends Error {
	public constructor(message: string) {
		super(message);
		this.name = 'InvalidStateError';
	}
}

export class InvalidRequestError extends Error {
	public constructor(message: string) {
		super(message);
		this.name = 'InvalidRequestError';
	}
}

export class DatabaseTransactionError extends Error {
	public readonly reasons: TransactionCancellationReason[];

	public constructor(reasons: TransactionCancellationReason[]) {
		super('Transaction failed.');
		this.name = 'DatabaseTransactionError';
		this.reasons = reasons;
	}
}

export interface TransactionCancellationReason {
	item: unknown;
	code: string;
	message: string;
}

export function handleError(error: any, _request: any, reply: any) {
	// Log error
	this.log.error(`***** error: ${JSON.stringify(error)}`);
	this.log.error(`***** error.code: ${error.code}`);
	this.log.error(`***** error.name: ${error.name}`);
	this.log.error(`***** error.message: ${error.message}`);

	if (error.statusCode === 400 || Array.isArray(error.validation)) {
		return error;
	} else {
		switch (error.name) {
			case 'InvalidStateError':
				return reply.conflict(error.message);
			case 'InvalidRequestError':
			case 'InvalidNameError':
			case 'ArgumentError':
				return reply.badRequest(error.message);
			case 'NotFoundError':
				return reply.notFound(error.message);
			case 'UserNotAuthorizedError':
			case 'UnauthorizedError':
				return reply.unauthorized(error.message);
			case 'InvalidTokenError':
			case 'ForbiddenError':
			case 'ExpiredTokenException':
				return reply.forbidden(error.message);
			case 'NotImplementedError':
				return reply.notImplemented(error.message);
			case 'DatabaseTransactionError':
				return reply.internalServerError(error.message);
			default:
				return reply.imateapot(`${error.name}: ${error.message}`);
		}
	}
}
