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

import { createHash } from 'crypto';

/**
 * Type definition for supported hash algorithms
 */
export type HashAlgorithm = 'sha256' | 'sha512';

/**
 * Secure Hash function implementation using SHA-256 or SHA-512
 */
export class SecureHash {
    /**
     * Hash algorithm options
     */
    public static readonly Algorithms = {
        SHA256: 'sha256',
        SHA512: 'sha512'
    } as const;

    /**
     * Generates a secure hash from various input types
     * @param input - The value to hash (string, number, object, etc.)
     * @param algorithm - Hash algorithm to use (default: sha256)
     * @returns Hexadecimal string hash (64 chars for SHA-256, 128 chars for SHA-512)
     */
    static generate(input: unknown, algorithm: HashAlgorithm = SecureHash.Algorithms.SHA256): string {
        const str = SecureHash.toString(input);
        return createHash(algorithm)
            .update(str)
            .digest('hex');
    }

    /**
     * Generates a shorter secure hash by truncating the full hash
     * @param input - The value to hash
     * @param length - Desired length of the hash string (max 64 for SHA-256, 128 for SHA-512)
     * @param algorithm - Hash algorithm to use (default: sha256)
     * @returns Truncated hexadecimal string hash
     */
    static generateShort(
        input: unknown,
        length: number = 32,
        algorithm: HashAlgorithm = SecureHash.Algorithms.SHA256
    ): string {
        const fullHash = SecureHash.generate(input, algorithm);
        return fullHash.slice(0, Math.min(length, fullHash.length));
    }

    /**
     * Converts input to a string representation for hashing
     * @param input - The value to convert
     * @returns String representation of the input
     */
    private static toString(input: unknown): string {
        if (input === null || input === undefined) {
            return 'null';
        }

        switch (typeof input) {
            case 'string':
                return input;
            case 'number':
            case 'boolean':
                return input.toString();
            case 'object':
                return SecureHash.stringifyObject(input);
            case 'symbol':
                return input.toString();
            case 'bigint':
                return input.toString();
            case 'function':
                return input.toString();
            default:
                return String(input);
        }
    }

    /**
     * Converts an object to a consistent string representation
     * @param obj - Object to stringify
     * @returns Sorted, deterministic string representation
     */
    private static stringifyObject(obj: object): string {
        // Handle special object types
        if (obj instanceof Date) {
            return obj.toISOString();
        }

        if (obj instanceof Map) {
            const entries = Array.from(obj.entries())
                .sort(([keyA], [keyB]) => keyA.toString().localeCompare(keyB.toString()))
                .map(([key, value]) => `${SecureHash.toString(key)}:${SecureHash.toString(value)}`);
            return `Map{${entries.join(',')}}`;
        }

        if (obj instanceof Set) {
            const values = Array.from(obj.values())
                .map(value => SecureHash.toString(value))
                .sort();
            return `Set{${values.join(',')}}`;
        }

        if (obj instanceof ArrayBuffer) {
            // Convert ArrayBuffer to array of bytes
            return `Binary[${Array.from(new Uint8Array(obj)).join(',')}]`;
        }

        // Handle TypedArray objects (Uint8Array, Float32Array, etc.)
        if (ArrayBuffer.isView(obj)) {
            if (obj instanceof DataView) {
                // Handle DataView separately
                const byteLength = obj.byteLength;
                const bytes = new Uint8Array(byteLength);
                for (let i = 0; i < byteLength; i++) {
                    bytes[i] = obj.getUint8(i);
                }
                return `DataView[${Array.from(bytes).join(',')}]`;
            } else {
                // Handle typed arrays
                return `TypedArray[${Array.from(obj as unknown as ArrayLike<number>).join(',')}]`;
            }
        }

        if (Array.isArray(obj)) {
            return `[${obj.map(item => SecureHash.toString(item)).join(',')}]`;
        }

        try {
            const keys = Object.keys(obj).sort(); // Sort keys for consistency
            const pairs = keys.map(key => `${key}:${SecureHash.toString((obj as Record<string, unknown>)[key])}`);
            return `{${pairs.join(',')}}`;
        } catch {
            // Fallback for objects that can't be processed normally (ignoring the error)
            return `Object[${Object.prototype.toString.call(obj)}]`;
        }
    }
}
