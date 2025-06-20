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

import { type BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import stringify from "json-stringify-safe";
import type { Logger } from "pino";
import { getLogger } from "../common/logger";

export type ClaudeMessagesApiResponse = {
    "id": string,
    "model": string,
    "type": "message",
    "role": "assistant",
    "content": [
        {
            "type": string,
            "text": string,
            "image": object,
            "id": string,
            "name": string,
            "input": object
        }
    ],
    "stop_reason": string,
    "stop_sequence": string,
    "usage": {
        "input_tokens": number,
        "output_tokens": number
    }

}

/**
 * Abstract base class for Large Language Model (LLM) interactions
 * Provides common functionality for working with AWS Bedrock Runtime Client
 * and handling model responses in different formats (JSON, CSV)
 */
export abstract class LLMBase {

    constructor(
        protected readonly log: Logger<any, boolean>,
        protected readonly bedrockClient: BedrockRuntimeClient,
        protected readonly modelId: string
    ) { }

    /**
     * Extracts and parses JSON content from a string that contains JSON data enclosed in ```json``` code blocks
     * @param text - The input string containing JSON data within code blocks
     * @returns The parsed JSON object of type T
     * @throws Error if no JSON content is found in the code blocks or if parsing fails
     */
    protected extractJsonFromString<T>(text: string): T {
        const logger = getLogger(this.log, 'LLMBase', 'extractJsonFromString');
        logger.trace(`in: text: ${stringify(text)}`);
        const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch.length > 0 && jsonMatch[jsonMatch.length - 1]) {
            const matchedJson = jsonMatch[jsonMatch.length - 1]!
            logger.trace(`out: json: ${matchedJson}`);
            return JSON.parse(matchedJson);
        }
        throw new Error('No JSON found in the text');
    }

    /**
     * Extracts CSV content from a string that contains CSV data enclosed in ```csv``` code blocks
     * @param text - The input string containing CSV data within code blocks
     * @returns The extracted CSV content as a string
     * @throws Error if no CSV content is found in the code blocks
     */
    protected extractCsvFromString(text: string): string {
        const logger = getLogger(this.log, 'LLMBase', 'extractCsvFromString');
        logger.trace(`in: text: ${stringify(text)}`);

        const csvMatch = text.match(/```csv\s*([\s\S]*?)\s*```/);
        if (csvMatch && csvMatch.length > 0 && csvMatch[csvMatch.length - 1]) {
            const matchedCsv = csvMatch[csvMatch.length - 1]!
            logger.trace(`out: csv: ${matchedCsv}`);
            return matchedCsv;
        }
        throw new Error('No CSV found in the text');
    }


    /**
     * Invokes the LLM model with the given messages and system prompt
     * @param messages - Array of message objects containing role and content
     * @param systemPrompt - System prompt to provide context/instructions to the model
     * @returns Promise containing the model's response text
     */
    protected async invokeModel(messages: Array<{ role: string; content: Array<{ type: string; text: string; }>; }>, systemPrompt: string) {
        const logger = getLogger(this.log, 'LLMBase', 'invokeModel');
        logger.trace(`in: messages: ${stringify(messages)}`);

        const command = new InvokeModelCommand({
            contentType: 'application/json',
            body: JSON.stringify({
                system: systemPrompt,
                anthropic_version: 'bedrock-2023-05-31',
                max_tokens: 200000,
                messages,
                temperature: 0.2
            }),
            modelId: this.modelId,
        });
        const response = await this.bedrockClient.send(command);

        const decodedBody = new TextDecoder().decode(response.body);

        const parsedJSON: ClaudeMessagesApiResponse = JSON.parse(decodedBody);

        logger.trace(`usage: inputToken: ${parsedJSON.usage.input_tokens}, outputToken: ${parsedJSON.usage.output_tokens}`);
        logger.trace(`out: parsedJSON: ${stringify(parsedJSON.content[0].text)}`);

        return parsedJSON.content[0].text;
    }
}
