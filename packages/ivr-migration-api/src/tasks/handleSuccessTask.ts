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

import { PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import type { BotsService } from '../api/bots/service';
import { type Logger } from 'pino';
import { getLogger } from '../common/logger';
import ow from 'ow';
import stringify from 'json-stringify-safe';
import { TRSXTransformer, type BotExportStructure } from '@ivr-migration-tool/transformer';
import { BaseGeneratorTask, type GenerateIntentInput } from './baseGeneratorTask';
import { BotsApiSchema } from '@ivr-migration-tool/schemas';
import type { S3Location } from '../common/schemas';

export class HandleSuccessTask extends BaseGeneratorTask<GenerateIntentInput, void> {
	constructor(
		protected readonly log: Logger<any, boolean>,
		protected readonly botsService: BotsService,
		protected readonly s3Client: S3Client,
		protected readonly transformer: TRSXTransformer,
	) {
		super(log, botsService, s3Client, transformer);
	}

	public async process(event: GenerateIntentInput): Promise<void> {
		const logger = getLogger(this.log, 'handleSuccessTask', 'process');
		logger.trace(`in: event: ${stringify(event)}`);

		ow(event.bucket, ow.string.nonEmpty);
		ow(event.key, ow.string.nonEmpty);
		ow(event.output, ow.object.nonEmpty)
		ow(event.output?.intents, ow.object.nonEmpty);
		ow(event.output?.slotTypes, ow.object.nonEmpty);

		const botId = event.key.split('/')[1];

		// This will throw error if bot does not exist
		const bot = await this.botsService.get(this.securityContext, botId);

		let status: BotsApiSchema.BotStatus = 'success',
			botDefinitionLocation: S3Location | undefined,
			botDefinitionRawLocation: S3Location | undefined;

		const lastMessage = `Storing the generated bot definition to S3.`;

		let statusMessages = [...bot.statusMessages, { status, message: lastMessage }]

		try {
			const botExportStructure: BotExportStructure = {
				bot: {
					name: bot.name!,
					dataPrivacy: {
						childDirected: false
					},
					idleSessionTTLInSeconds: 0
				},
				botLocales: {
					[bot.locale]: {
						botLocale: {
							name: bot.locale,
							identifier: bot.locale,
							nluConfidenceThreshold: 0.4,
							voiceSettings: {
								voiceId: 'Joanna'
							}
						},
						intents: event.output.intents,
						slotTypes: event.output.slotTypes
					}
				}
			}

			const rawOutput = `output/${botId}/${bot.name}_raw.json`;
			botDefinitionRawLocation = {
				bucket: event.bucket,
				key: rawOutput,
			};
			await this.s3Client.send(new PutObjectCommand({
				Bucket: botDefinitionRawLocation.bucket,
				Key: botDefinitionRawLocation.key,
				Body: JSON.stringify(event.output),
			}))

		} catch (err) {
			status = 'error'
			statusMessages = [...bot.statusMessages, { status: 'error', message: lastMessage }];
			logger.error(`Could not transform specification file: err: ${stringify(err)}`);
			throw err;
		} finally {
			// update the bot definition location id specified
			await this.botsService.update(this.securityContext, botId, {
				status,
				statusMessages,
				botDefinitionLocation,
				botDefinitionRawLocation
			});
		}
		logger.trace('out:');
	}
}
