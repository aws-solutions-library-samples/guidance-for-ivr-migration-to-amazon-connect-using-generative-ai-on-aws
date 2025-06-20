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
import { GetObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import type { BotsService } from '../api/bots/service';
import { type Logger } from 'pino';
import { getLogger } from '../common/logger';
import stringify from 'json-stringify-safe';
import { TRSXTransformer, TRSX, type LLMTransformedOutput } from '@ivr-migration-tool/transformer';
import * as fs from 'fs';
import path from 'path';
import { SecurityScope, type SecurityContext } from '../common/scopes';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { pipeline } from 'stream/promises';
import AdmZip from 'adm-zip';
import { LexSlotTypeModel } from '@ivr-migration-tool/schemas';
import {
    LexSlotModel,
    NuanceDialogAppModel,
} from '@ivr-migration-tool/schemas';
import type { S3Location } from '../common/schemas';


export type TransformedResponseTaskOutput = {
    slots?: Record<string, LexSlotModel.SlotExportDefinition>
    slotTypes?: Record<string, LexSlotTypeModel.SlotTypeExportDefinition>
    intents?: LLMTransformedOutput,
}

export type TransformedResponseTaskInput = {
    components?: string[];
    componentsToProcess?: number;
    intents?: string[];
    intentsToProcess?: number;
}

export interface TransformerTaskResponse {
    output?: TransformedResponseTaskOutput
    input?: TransformedResponseTaskInput
}

export type GenerateIntentInput = TransformerTaskResponse & S3Location

export type GenerateIntentOutput = GenerateIntentInput;

export type ValidateIntentInput = GenerateIntentInput;

export type ValidateIntentOutput = GenerateIntentInput;

/**
 * Abstract base class for generator tasks that process Nuance project files.
 * Provides common functionality for retrieving and parsing Nuance project definitions from S3.
 * @template T The input type for the task
 * @template V The output type for the task
 */
export abstract class BaseGeneratorTask<T, V> {
    protected securityContext: SecurityContext;

    constructor(
        protected readonly log: Logger<any, boolean>,
        protected readonly botsService: BotsService,
        protected readonly s3Client: S3Client,
        protected readonly transformer: TRSXTransformer

    ) {
        this.securityContext = {
            email: 'transformTask',
            role: SecurityScope.contributor,
            sub: 'transformTask',
        };
    }

    /**
     * Retrieves and parses Nuance project definition files from S3
     * @param s3Location Location of the zipped project files in S3 (bucket and key)
     * @returns Promise containing tuple of parsed TRSX project and Nuance Mix dialog app schema
     */
    protected async getNuanceProjectDefinition(s3Location: S3Location): Promise<[TRSX.Project, NuanceDialogAppModel.NuanceMixProjectSchema]> {
        const logger = getLogger(this.log, 'baseTask', 'getNuanceProjectDefinition');
        logger.trace(`in: s3Location: ${stringify(s3Location)}`);

        const folder = await this.unzipFile({
            bucket: s3Location.bucket,
            key: s3Location.key,
        });
        const [trsxFile, dialogAppFile] = await this.findNuanceProjectFiles(folder);

        // Read TRSX XMl file and parse it to JSON
        const trsxProject: TRSX.Project = await this.transformer.parse(trsxFile);

        // Read dialog file and parse JSON
        const dialogContent = fs.readFileSync(dialogAppFile, 'utf8');
        const dialogAppProject: NuanceDialogAppModel.NuanceMixProjectSchema = JSON.parse(dialogContent);

        logger.trace(`out: trsxProject: ${stringify(trsxProject)}, dialogAppProject: ${stringify(dialogAppProject)}`)

        return [trsxProject, dialogAppProject]
    }

    private async unzipFile(location: S3Location): Promise<string> {
        const logger = getLogger(this.log, 'transformTask', 'unzipFile');
        logger.trace(`in: location: ${stringify(location)}`);

        let tempDir = null;
        let tempZipFile = null;

        tempDir = await mkdtemp(join(tmpdir(), 'ivr-migration-'));
        tempZipFile = join(tempDir, 'temp.zip');

        // Get the zipped file from S3
        const response = await this.s3Client.send(
            new GetObjectCommand({
                Bucket: location.bucket,
                Key: location.key,
            })
        );

        // Stream to file
        await pipeline(response.Body as any, fs.createWriteStream(tempZipFile));

        // Unzip
        const zip = new AdmZip(tempZipFile);
        zip.extractAllTo(tempDir, true);

        // Remove temporary zip file
        await rm(tempZipFile);

        logger.trace(`out: tempPath: ${tempDir}`);
        return tempDir;
    }

    /**
     * Searches for and returns the paths to the Nuance project files (.trsx and .json) within a directory
     * @param folder - The directory path to search for Nuance project files
     * @returns Promise containing tuple of [trsxFilePath, dialogJsonFilePath]
     * @throws Error if either the TRSX or JSON file cannot be found
     */
    private async findNuanceProjectFiles(folder: string): Promise<[string, string]> {
        const logger = getLogger(this.log, 'transformTask', 'findNuanceProjectFiles');
        logger.trace(`in: folder: ${folder}`);

        // Read all files in the directory
        const files = fs.readdirSync(folder);

        let trsxFile, dialogJsonFile;
        // Filter for .trsx files
        for (const file of files) {
            if (file.endsWith('.trsx')) {
                trsxFile = path.join(folder, file);
            }
            if (file.endsWith('.json')) {
                dialogJsonFile = path.join(folder, file);
            }
        }

        if (!trsxFile || !dialogJsonFile) {
            throw new Error('Could not find TRSX or JSON file');
        }

        logger.trace(`out: trsxFile: ${trsxFile}, dialogJsonFile: ${dialogJsonFile}`)
        return [trsxFile!, dialogJsonFile!];
    }

    abstract process(event: T): Promise<V>;
}
