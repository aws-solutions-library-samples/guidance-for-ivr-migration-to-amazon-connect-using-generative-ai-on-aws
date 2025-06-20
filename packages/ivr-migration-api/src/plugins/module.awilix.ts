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

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, type TranslateConfig } from '@aws-sdk/lib-dynamodb';
import { type Cradle, diContainer, type FastifyAwilixOptions, fastifyAwilixPlugin } from '@fastify/awilix';
import { asFunction, Lifetime } from 'awilix';
import fp from 'fastify-plugin';
import { LOGGER } from '../common/logger';
import { GroupPermissions } from '../common/fgac';
import { BotsRepository } from '../api/bots/repository';
import { BotsService } from '../api/bots/service';
import { S3Client } from '@aws-sdk/client-s3';
import { LexModelsV2Client } from '@aws-sdk/client-lex-models-v2';
import { HandleSuccessTask } from '../tasks/handleSuccessTask';
import { TRSXTransformer, TRSXListener, LLMTransformer, LLMValidator } from '@ivr-migration-tool/transformer';
import { BedrockRuntimeClient } from '@aws-sdk/client-bedrock-runtime';
import { GenerateSlotsTask } from '../tasks/generateSlotsTask';
import { GenerateIntentTask } from '../tasks/generateIntentTask';
import { HandleErrorTask } from '../tasks/handleErrorTask';
import { ConfiguredRetryStrategy } from "@smithy/util-retry";
import { ValidateIntentTask } from '../tasks/validateIntentTask';
import { CreateTestSetsTask } from '../tasks/createTestSetsTask';
import { TestSetsRepository } from '../api/test-sets/repository';
import { TestSetsService } from '../api/test-sets/service';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { EventsApiPublisher } from '../common/events-publisher';
import { CreateSlotTypeTask } from '../tasks/createSlotTypeTask';
import { CreateIntentTask } from '../tasks/createIntentTask';
import { ParameterCollectorTask } from '../tasks/parameterCollectorTask';
import { BuildBotTask } from '../tasks/buildBotTask';
import { FixBotTask } from '../tasks/fixBotTask';
import { TestExecutionsRepository } from '../api/test-executions/repository';
import { TestExecutionsService } from '../api/test-executions/service';
import { ImportTestSetsTask } from '../tasks/importTestSetsTask';
import { RecommendationTaskService } from '../api/tasks/service';
import { RecommendationTaskRepository } from '../api/tasks/repository';
import { SQSClient } from '@aws-sdk/client-sqs';
import { RecommendationTaskItemService } from '../api/taskItems/service';
import { RecommendationTaskItemRepository } from '../api/taskItems/repository';
import { CreateRecommendationTask } from '../tasks/createRecommendationTask';
import { CheckTestExecutionTask } from '../tasks/checkTestExecutionTask';
import { StreamProcessorTask } from '../tasks/streamProcessorTask';

declare module '@fastify/awilix' {
	interface Cradle {
		dynamoDBDocumentClient: DynamoDBDocumentClient;
		s3Client: S3Client;
		eventBridgeClient: EventBridgeClient;
		authChecker: GroupPermissions;
		lexClient: LexModelsV2Client;
		bedrockRuntimeClient: BedrockRuntimeClient;
		sqsClient: SQSClient;
		// Bots
		botsRepository: BotsRepository;
		botsService: BotsService;
		// Bots
		testSetsRepository: TestSetsRepository;
		testSetsService: TestSetsService;
		// Test Execution
		testExecutionsRepository: TestExecutionsRepository;
		testExecutionsService: TestExecutionsService;
		// Transformer
		trsxTransformer: TRSXTransformer;
		llmTransformer: LLMTransformer;
		llmValidator: LLMValidator;
		trsxListener: TRSXListener;
		// Generate Resources Tasks
		generateSlotsTask: GenerateSlotsTask;
		generateIntentTask: GenerateIntentTask;
		handleErrorTask: HandleErrorTask;
		handleSuccessTask: HandleSuccessTask;
		validateIntentTask: ValidateIntentTask;
		// Recommendation Task
		createRecommendationTask: CreateRecommendationTask;
		// Test Execution Task
		checkTestExecutionTask: CheckTestExecutionTask;
		// Create Test Set Tasks
		createTestSetsTask: CreateTestSetsTask
		importTestSetsTask: ImportTestSetsTask;
		// Create Bot Tasks
		createSlotTypeTask: CreateSlotTypeTask;
		createIntentTask: CreateIntentTask;
		parameterCollectorTask: ParameterCollectorTask;
		buildBotTask: BuildBotTask;
		fixBotTask: FixBotTask;
		// Events Publisher
		eventsApiPublisher: EventsApiPublisher;
		// Recommendation Task
		recommendationTaskService: RecommendationTaskService;
		recommendationTaskRepository: RecommendationTaskRepository;
		// Recommendation Task Item
		recommendationTaskItemService: RecommendationTaskItemService;
		recommendationTaskItemRepository: RecommendationTaskItemRepository;
		// Stream Processor
		streamProcessorTask: StreamProcessorTask;

	}
}

class S3ClientFactory {
	public static create(region: string | undefined): S3Client {
		const s3 = new S3Client({ region });
		return s3;
	}
}

class EventBridgeClientFactory {
	public static create(region: string | undefined): EventBridgeClient {
		const eventBridge = new EventBridgeClient({ region });
		return eventBridge;
	}
}

class BedrockRuntimeClientFactory {
	public static create(region: string | undefined): BedrockRuntimeClient {
		const bedrockRuntimeClient = new BedrockRuntimeClient({
			region,
			retryStrategy: new ConfiguredRetryStrategy(
				3, // used.
				(attempt: number) => {
					return attempt * 60000
				}
			),
		});
		return bedrockRuntimeClient;
	}
}


class LexModelsV2ClientFactory {
	public static create(region: string | undefined): LexModelsV2Client {
		const lex = new LexModelsV2Client({ region });
		return lex;
	}
}

class SqsClientFactory {
	public static create(region: string | undefined): SQSClient {
		const sqsClient = new SQSClient({ region });
		return sqsClient;
	}
}

class DynamoDBDocumentClientFactory {
	public static create(region: string): DynamoDBDocumentClient {
		const ddb = new DynamoDBClient({ region });
		const marshallOptions = {
			convertEmptyValues: false,
			removeUndefinedValues: true,
			convertClassInstanceToMap: false,
		};
		const unmarshallOptions = {
			wrapNumbers: false,
		};
		const translateConfig: TranslateConfig = { marshallOptions, unmarshallOptions };
		const dbc = DynamoDBDocumentClient.from(ddb, translateConfig);
		return dbc;
	}
}

export default fp<FastifyAwilixOptions>(async (app): Promise<void> => {
	// first register the DI plugin
	await app.register(fastifyAwilixPlugin, {
		disposeOnClose: true,
		disposeOnResponse: false,
	});

	const commonInjectionOptions = {
		lifetime: Lifetime.SINGLETON,
	};

	const awsRegion = Bun.env['AWS_REGION']!;
	const tableName = Bun.env['TABLE_NAME']!;
	const bucketName = Bun.env['BUCKET_NAME']!;
	const lexRoleArn = Bun.env['LEX_ROLE_ARN']!;
	const eventBusName = Bun.env['EVENT_BUS_NAME']!;
	const taskQueueUrl = Bun.env['TASK_QUEUE_URL']!;
	// then we can register our classes with the DI container
	diContainer.register({
		dynamoDBDocumentClient: asFunction(() => DynamoDBDocumentClientFactory.create(awsRegion), {
			...commonInjectionOptions,
		}),
		s3Client: asFunction(() => S3ClientFactory.create(awsRegion), {
			...commonInjectionOptions
		}),
		sqsClient: asFunction(() => SqsClientFactory.create(awsRegion), {
			...commonInjectionOptions
		}),
		eventBridgeClient: asFunction(() => EventBridgeClientFactory.create(awsRegion), {
			...commonInjectionOptions
		}),
		bedrockRuntimeClient: asFunction(() => BedrockRuntimeClientFactory.create(awsRegion), {
			...commonInjectionOptions
		}),
		lexClient: asFunction(() => LexModelsV2ClientFactory.create(awsRegion), {
			...commonInjectionOptions
		}),
		authChecker: asFunction(() => new GroupPermissions(LOGGER), {
			...commonInjectionOptions,
		}),
		// Bots domain service
		botsRepository: asFunction((c: Cradle) => new BotsRepository(LOGGER, c.dynamoDBDocumentClient, tableName), {
			...commonInjectionOptions,
		}),

		botsService: asFunction((c: Cradle) => new BotsService(LOGGER, c.botsRepository, c.s3Client, bucketName, c.lexClient, lexRoleArn, c.eventBridgeClient, eventBusName), {
			...commonInjectionOptions,
		}),

		testSetsRepository: asFunction((c: Cradle) => new TestSetsRepository(LOGGER, c.dynamoDBDocumentClient, tableName), {
			...commonInjectionOptions,
		}),

		testSetsService: asFunction((c: Cradle) => new TestSetsService(LOGGER, c.s3Client, bucketName, c.botsService, c.testSetsRepository, c.eventBridgeClient, eventBusName, c.lexClient), {
			...commonInjectionOptions,
		}),

		testExecutionsRepository: asFunction((c: Cradle) => new TestExecutionsRepository(LOGGER, c.dynamoDBDocumentClient, tableName), {
			...commonInjectionOptions,
		}),

		testExecutionsService: asFunction((c: Cradle) => new TestExecutionsService(LOGGER, c.lexClient, c.botsService, c.testSetsService, c.testExecutionsRepository, c.eventBridgeClient, eventBusName), {
			...commonInjectionOptions,
		}),

		trsxListener: asFunction(() => new TRSXListener(LOGGER), {
			...commonInjectionOptions,
		}),

		trsxTransformer: asFunction((c: Cradle) => new TRSXTransformer(LOGGER, c.trsxListener), {
			...commonInjectionOptions,
		}),

		llmTransformer: asFunction((c: Cradle) => new LLMTransformer(LOGGER, c.bedrockRuntimeClient, Bun.env.MODEL_ID!), {
			...commonInjectionOptions,
		}),

		llmValidator: asFunction((c: Cradle) => new LLMValidator(LOGGER, c.bedrockRuntimeClient, Bun.env.MODEL_ID!), {
			...commonInjectionOptions,
		}),

		generateSlotsTask: asFunction((c: Cradle) => new GenerateSlotsTask(LOGGER, c.botsService, c.s3Client, c.trsxTransformer, c.llmTransformer), {
			...commonInjectionOptions,
		}),

		generateIntentTask: asFunction((c: Cradle) => new GenerateIntentTask(LOGGER, c.botsService, c.s3Client, c.trsxTransformer, c.llmTransformer), {
			...commonInjectionOptions,
		}),

		createTestSetsTask: asFunction((c: Cradle) => new CreateTestSetsTask(LOGGER, c.botsService, c.s3Client, c.trsxTransformer, c.llmTransformer, c.testSetsService), {
			...commonInjectionOptions,
		}),

		importTestSetsTask: asFunction((c: Cradle) => new ImportTestSetsTask(LOGGER, c.s3Client, c.testSetsService, c.lexClient, lexRoleArn), {
			...commonInjectionOptions,
		}),

		validateIntentTask: asFunction((c: Cradle) => new ValidateIntentTask(LOGGER, c.botsService, c.s3Client, c.trsxTransformer, c.llmTransformer), {
			...commonInjectionOptions,
		}),

		handleErrorTask: asFunction((c: Cradle) => new HandleErrorTask(LOGGER, c.botsService, c.s3Client, c.trsxTransformer), {
			...commonInjectionOptions,
		}),

		handleSuccessTask: asFunction((c: Cradle) => new HandleSuccessTask(LOGGER, c.botsService, c.s3Client, c.trsxTransformer), {
			...commonInjectionOptions,
		}),

		createSlotTypeTask: asFunction((c: Cradle) => new CreateSlotTypeTask(LOGGER, c.lexClient, c.llmValidator, c.botsService), {
			...commonInjectionOptions,
		}),

		createIntentTask: asFunction((c: Cradle) => new CreateIntentTask(LOGGER, c.lexClient, c.llmValidator, c.botsService), {
			...commonInjectionOptions,
		}),

		buildBotTask: asFunction((c: Cradle) => new BuildBotTask(LOGGER, c.lexClient, c.botsService, c.s3Client), {
			...commonInjectionOptions,
		}),

		fixBotTask: asFunction((c: Cradle) => new FixBotTask(LOGGER, c.lexClient, c.llmValidator, c.botsService), {
			...commonInjectionOptions,
		}),

		parameterCollectorTask: asFunction((c: Cradle) => new ParameterCollectorTask(LOGGER, c.s3Client, c.lexClient, c.botsService), {
			...commonInjectionOptions,
		}),

		recommendationTaskService: asFunction((c: Cradle) => new RecommendationTaskService(LOGGER, c.recommendationTaskRepository, c.sqsClient, taskQueueUrl, 2, c.lexClient, c.botsService), {
			...commonInjectionOptions,
		}),

		recommendationTaskRepository: asFunction((c: Cradle) => new RecommendationTaskRepository(LOGGER, c.dynamoDBDocumentClient, tableName), {
			...commonInjectionOptions,
		}),

		recommendationTaskItemService: asFunction((c: Cradle) => new RecommendationTaskItemService(LOGGER, c.recommendationTaskItemRepository, c.recommendationTaskService, c.s3Client), {
			...commonInjectionOptions,
		}),

		recommendationTaskItemRepository: asFunction((c: Cradle) => new RecommendationTaskItemRepository(LOGGER, c.dynamoDBDocumentClient, tableName), {
			...commonInjectionOptions,
		}),

		eventsApiPublisher: asFunction((c: Cradle) => new EventsApiPublisher(LOGGER, Bun.env.EVENT_API_ENDPOINT!, Bun.env.EVENT_API_KEY!), {
			...commonInjectionOptions,
		}),

		createRecommendationTask: asFunction((c: Cradle) => new CreateRecommendationTask(LOGGER, c.lexClient, c.llmValidator, c.recommendationTaskService, c.recommendationTaskItemService, c.s3Client, bucketName, c.botsService), {
			...commonInjectionOptions,
		}),

		checkTestExecutionTask: asFunction((c: Cradle) => new CheckTestExecutionTask(LOGGER, c.lexClient, c.testExecutionsService), {
			...commonInjectionOptions,
		}),

		streamProcessorTask: asFunction((c: Cradle) => new StreamProcessorTask(LOGGER, c.eventsApiPublisher), {
			...commonInjectionOptions,
		}),
	});
});
