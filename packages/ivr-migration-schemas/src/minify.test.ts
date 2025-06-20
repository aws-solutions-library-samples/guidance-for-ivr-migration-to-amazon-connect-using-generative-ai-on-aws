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

import { describe, expect, test } from 'bun:test';
import { cleanAndMinifyJson, cleanAndMinifyXml } from './minify';
import * as fs from 'fs';
import * as path from 'path';

describe('minification functions', () => {
	describe('cleanAndMinifyJson', () => {
		test('should successfully minify the Lex schema file', () => {
			// Read the schema file
			const schemaPath = path.join(__dirname, 'schemas/lex/bot.schema.json');
			const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

			// Minify the schema
			const minifiedSchema = cleanAndMinifyJson(schema);

			// Verify the minified schema is not empty
			expect(minifiedSchema).toBeDefined();
			expect(Object.keys(minifiedSchema).length).toBeGreaterThan(0);

			// Verify that no null values, empty strings, or empty arrays remain
			function verifyNoEmptyValues(obj: any) {
				if (typeof obj !== 'object' || obj === null) {
					return;
				}

				if (Array.isArray(obj)) {
					expect(obj.length).toBeGreaterThan(0);
					obj.forEach((item) => verifyNoEmptyValues(item));
				} else {
					Object.entries(obj).forEach(([key, value]) => {
						expect(value).not.toBeNull();
						if (typeof value === 'string') {
							expect(value).not.toBe('');
						}
						if (Array.isArray(value)) {
							expect(value.length).toBeGreaterThan(0);
						}
						verifyNoEmptyValues(value);
					});
				}
			}

			verifyNoEmptyValues(minifiedSchema);

			console.log('Minified schema:', minifiedSchema);
		});
	});

	describe('cleanAndMinifyXml', () => {
        test('should successfully minify XML content', async () => {
            const testXml = `
                <?xml version="1.0" encoding="UTF-8"?>
                <root>
                    <person id="1" emptyAttr="">
                        <name>John</name>
                        <email></email>
                        <address>
                            <street></street>
                            <city>New York</city>
                        </address>
                        <phones>
                            <phone></phone>
                            <phone>123-456-7890</phone>
                        </phones>
                        <emptyTag></emptyTag>
                    </person>
                </root>
            `;

            const minifiedXml = await cleanAndMinifyXml(testXml);

            // Verify the minified XML is not empty
            expect(minifiedXml).toBeDefined();
            expect(minifiedXml.length).toBeGreaterThan(0);

            // Verify no whitespace between tags
            expect(minifiedXml).not.toMatch(/>\s+</);

            // Verify empty elements are removed
            expect(minifiedXml).not.toContain('<emptyTag>');
            expect(minifiedXml).not.toContain('<email>');
            expect(minifiedXml).not.toContain('<street>');

            // Verify empty attributes are removed
            expect(minifiedXml).not.toContain('emptyAttr=""');

            // Verify valid content is preserved
            expect(minifiedXml).toContain('<name>John</name>');
            expect(minifiedXml).toContain('<city>New York</city>');
            expect(minifiedXml).toContain('<phone>123-456-7890</phone>');

			console.log('Minified XML:', minifiedXml);
        });

        test('should handle XML files', async () => {
            // Create a temporary test file
            const testXmlPath = path.join(__dirname, 'test.xml');
            const testXml = `
                <?xml version="1.0" encoding="UTF-8"?>
                <root>
                    <element>
                        <child>Test</child>
                        <empty></empty>
                    </element>
                </root>
            `;
            fs.writeFileSync(testXmlPath, testXml);

            try {
                // Read and minify the XML
                const xmlContent = fs.readFileSync(testXmlPath, 'utf8');
                const minifiedXml = await cleanAndMinifyXml(xmlContent);

                // Verify minification
                expect(minifiedXml).toBeDefined();
                expect(minifiedXml).not.toContain('<empty>');
                expect(minifiedXml).toContain('<child>Test</child>');
                expect(minifiedXml).not.toMatch(/>\s+</);

                // Write minified output for inspection
                const outputPath = path.join(__dirname, 'test.minified.xml');
                fs.writeFileSync(outputPath, minifiedXml);

            } finally {
                // Clean up test files
                if (fs.existsSync(testXmlPath)) {
                    fs.unlinkSync(testXmlPath);
                }
                const minifiedPath = path.join(__dirname, 'test.minified.xml');
                if (fs.existsSync(minifiedPath)) {
                    fs.unlinkSync(minifiedPath);
                }
            }
        });

        test('should handle invalid XML gracefully', async () => {
            const invalidXml = '<root><unclosed>';
            expect(cleanAndMinifyXml(invalidXml)).rejects.toThrow();
        });
    });
});
