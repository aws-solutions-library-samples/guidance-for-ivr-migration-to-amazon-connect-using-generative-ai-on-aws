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

import { CharStream, CommonTokenStream, ParseTreeWalker } from 'antlr4ng';
import stringify from 'json-stringify-safe';
import type { Logger } from 'pino';
import { getLogger } from '../common/logger.ts';
import { TRSXLexer } from './generated/TRSXLexer';
import { TRSXParser } from './generated/TRSXParser';
import type { Project } from './models.ts';
import { TRSXListener } from './TRSXListener';

/**
 * Configuration interface for defining a Lex bot's properties
 * @interface BotConfig
 * @property {string} botName - The name of the Lex bot
 * @property {string} identifier - Unique identifier for the bot
 * @property {string} [description] - Optional description of the bot's purpose and functionality
 * @property {boolean} childDirected - Indicates whether the bot is directed at children under 13 years old
 * @property {number} [idleSessionTTLInSeconds] - Optional timeout duration for idle sessions in seconds
 * @property {number} [nluConfidenceThreshold] - Optional confidence threshold for natural language understanding
 * @property {string} [voiceId] - Optional identifier for the voice to be used by the bot
 */
export interface BotConfig {
    botName: string;
    identifier: string;
    description?: string;
    childDirected: boolean;
    idleSessionTTLInSeconds?: number;
    nluConfidenceThreshold?: number;
    voiceId?: string;
}
/**
 * A class responsible for transforming TRSX (Nuance) format files into Amazon Lex bot definitions
 * @class TRSXTransformer
 * @description This transformer handles parsing TRSX XML files, validating their structure,
 * and converting them into Lex bot configurations. It manages the transformation of intents,
 * slots, and utterances from the Nuance format to the corresponding Lex format.
 */
export class TRSXTransformer {
    /**
     * Creates an instance of TRSXTransformer
     * @constructor
     * @param {Logger<any, boolean>} log - Logger instance for tracking the transformation process
     * @param {TRSXListener} listener - TRSX parser listener for processing the XML structure
     */
    constructor(private readonly log: Logger<any, boolean>, private readonly listener: TRSXListener) {
    }

    /**
     * Default timeout in seconds for idle bot sessions
     * @constant {number}
     */
    readonly DEFAULT_IDLE_SESSION_TIMEOUT = 300;

    /**
     * Default confidence threshold for Natural Language Understanding
     * @constant {number}
     */
    readonly DEFAULT_NLU_CONFIDENCE_THRESHOLD = 0.8;

    /**
     * Mapping of locale codes to their default voice IDs for Text-to-Speech
     * @constant {Record<string,string>}
     */
    readonly DEFAULT_VOICE_ID: Record<string, string> = {
        'ar-AE': 'Hala',
        'arb': 'Zeina',
        'ca-ES': 'Arlet',
        'cmn-CN': 'Zhiyu',
        'cs-CZ': 'Jitka',
        'cy-GB': 'Gwyneth',
        'da-DK': 'Naja',
        'de-AT': 'Hannah',
        'de-CH': 'Sabrina',
        'de-DE': 'Marlene',
        'en-AU': 'Nicole',
        'en-GB-WLS': 'Geraint',
        'en-GB': 'Amy',
        'en-IE': 'Niamh',
        'en-IN': 'Aditi',
        'en-NZ': 'Aria',
        'en-SG': 'Jasmine',
        'en-US': 'Joanna',
        'en-ZA': 'Ayanda',
        'es-ES': 'Conchita',
        'es-MX': 'Mia',
        'es-US': 'Lupe',
        'fi-FI': 'Suvi',
        'fr-BE': 'Isabelle',
        'fr-CA': 'Gabrielle',
        'fr-FR': 'Mathieu',
        'hi-IN': 'Kajal',
        'is-IS': 'Dora',
        'it-IT': 'Bianca',
        'ja-JP': 'Mizuki',
        'ko-KR': 'Seoyeon',
        'nb-NO': 'Liv',
        'nl-BE': 'Lisa',
        'nl-NL': 'Laura',
        'pl-PL': 'Ola',
        'pt-BR': 'Camila',
        'pt-PT': 'Ines',
        'ro-RO': 'Carmen',
        'ru-RU': 'Tatyana',
        'sv-SE': 'Astrid',
        'tr-TR': 'Filiz',
        'yue-CN': 'Hiujin',
    }

    /**
     * Parses an XML file that conforms to the trsx schema
     * @param filePath Path to the XML file to process
     */
    /**
     * Parses a TRSX XML file into a Project structure
     * @async
     * @param {string} filePath - Path to the TRSX XML file to be processed
     * @returns {Promise<Project>} Promise resolving to the parsed project structure
     * @throws {Error} If the file cannot be read or parsed
     * @description Uses ANTLR4 to parse the XML file and extract the project structure,
     * including intents, concepts, and samples. The parsing is done using a generated
     * lexer and parser, with results collected via the TRSXListener.
     */
    public async parse(filePath: string): Promise<Project> {
        const logger = getLogger(this.log, 'TRSXTransformer', 'parse');
        logger.trace(`in: filePath: ${stringify(filePath)}`);

        // Read the file content using Bun
        const file = Bun.file(filePath);
        const input = await file.text();
        logger.trace(`input:\n${input}`);

        // TODO: validate the xml file against the trsx schema before proceeding

        // Create the lexer
        const chars = CharStream.fromString(input);
        const lexer = new TRSXLexer(chars);

        // Create the token stream
        const tokens = new CommonTokenStream(lexer);

        // Create the parser
        const parser = new TRSXParser(tokens);
        parser.buildParseTrees = true;

        // Parse the document
        const tree = parser.document();

        // Walk the parse tree with the listener
        const walker = new ParseTreeWalker();
        walker.walk(this.listener, tree);

        // Return the parsed project data
        const project = this.listener.getResult().project;
        logger.trace(`exit:\n${stringify(project)}`);
        return project;
    }
}


