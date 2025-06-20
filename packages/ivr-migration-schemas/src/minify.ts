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

import { parseString, Builder } from 'xml2js';

interface XmlObject {
    [key: string]: any;
}

export function cleanAndMinifyJson(json: unknown): string {
	// Helper function to check if an object is empty
	const isEmptyObject = (obj: object): boolean => {
		return Object.keys(obj).length === 0;
	};

	// Helper function to check if value should be removed
	const shouldRemove = (value: any): boolean => {
		if (value === null || value === '') return true;
		if (Array.isArray(value) && value.length === 0) return true;
		if (typeof value === 'object' && isEmptyObject(value)) return true;
		return false;
	};

    // Recursive function to clean the object
    const clean = (obj: unknown): unknown => {
        // Handle arrays
        if (Array.isArray(obj)) {
            const cleanedArray = obj
                .map(item => clean(item))
                .filter(item => !shouldRemove(item));
            return cleanedArray.length ? cleanedArray : undefined;
        }

        // Handle objects
        if (obj && typeof obj === 'object') {
            const cleaned: any = {};
            for (const [key, value] of Object.entries(obj)) {
                const cleanedValue = clean(value);
                if (!shouldRemove(cleanedValue)) {
                    cleaned[key] = cleanedValue;
                }
            }
            return isEmptyObject(cleaned) ? undefined : cleaned;
        }

        // Return primitive values as is
        return obj;
    };

    // Clean the minified JSON
    const cleaned = clean(json)

    // Remove newlines, carriage returns, and tabs outside of quotes
    let jsonString = JSON.stringify(cleaned);
    jsonString = jsonString.replace(
        /"(?:[^"\\]|\\.)*"|([^\s"]+)|[\r\n\t]+/g,
        (match, nonString) => {
            // If this is a quoted string, leave it unchanged
            if (match.startsWith('"')) {
                return match;
            }
            // Otherwise, clean up the whitespace
            return nonString ? nonString.trim() : ' ';
        }
    );

    //
    return jsonString;
}

export function cleanAndMinifyXml(xmlString: string): Promise<string> {

	const cleanXmlObject = (obj: XmlObject): XmlObject | undefined =>{
		// Handle arrays
		if (Array.isArray(obj)) {
			const cleanedArray = obj
				.map(item => cleanXmlObject(item))
				.filter(item => !isEmpty(item));
			return cleanedArray.length ? cleanedArray : undefined;
		}

		// Handle objects
		if (obj && typeof obj === 'object') {
			const cleaned: XmlObject = {};

			for (const [key, value] of Object.entries(obj)) {
				// Handle attributes separately (they start with $)
				if (key === '$') {
					const cleanedAttrs = cleanAttributes(value);
					if (Object.keys(cleanedAttrs).length > 0) {
						cleaned[key] = cleanedAttrs;
					}
					continue;
				}

				const cleanedValue = cleanXmlObject(value);
				if (!isEmpty(cleanedValue)) {
					cleaned[key] = cleanedValue;
				}
			}

			return Object.keys(cleaned).length ? cleaned : undefined;
		}

		// Handle primitive values
		return isEmpty(obj) ? undefined : obj;
	}

	const cleanAttributes = (attrs: XmlObject): XmlObject =>{
		const cleaned: XmlObject = {};

		for (const [key, value] of Object.entries(attrs)) {
			if (!isEmpty(value)) {
				cleaned[key] = value;
			}
		}

		return cleaned;
	}

	const isEmpty= (value: any): boolean =>{
		if (value === null || value === undefined) return true;
		if (typeof value === 'string' && value.trim() === '') return true;
		if (Array.isArray(value) && value.length === 0) return true;
		if (typeof value === 'object' && Object.keys(value).length === 0) return true;
		return false;
	}

    return new Promise((resolve, reject) => {
        // First convert XML to JS object
        parseString(xmlString, (err: unknown, result: XmlObject) => {
            if (err) {
                reject(err);
                return;
            }

            // Clean the object
            const cleaned = cleanXmlObject(result);

            // Convert back to XML
            const builder = new Builder({
                renderOpts: {
                    pretty: false,  // Minification
                    indent: '',
                    newline: ''
                },
                headless: true,    // Remove XML declaration
            });

            try {
                const minifiedXml = builder.buildObject(cleaned);
                resolve(minifiedXml);
            } catch (buildErr) {
                reject(buildErr);
            }
        });
    });
}
