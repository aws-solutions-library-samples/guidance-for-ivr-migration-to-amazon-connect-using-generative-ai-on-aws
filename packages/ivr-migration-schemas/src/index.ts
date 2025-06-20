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

// export the json schemas
import LexBotSchema from './schemas/lex/bot.schema.json';
import LexBotLocaleSchema from './schemas/lex/botLocale.schema.json';
import LexCustomVocabSchema from './schemas/lex/customVocab.schema.json';
import LexIntentSchema from './schemas/lex/intent.schema.json';
import LexManifestSchema from './schemas/lex/manifest.schema.json';
import LexSlotSchema from './schemas/lex/slot.schema.json';
import LexSlotTypeSchema from './schemas/lex/slotType.schema.json';
import NuanceDialogAppSchema from './schemas/nuance/dialogApp.schema.json';
import LexUpdateIntentSchema from './schemas/lex/updateIntent.schema.json';
import LexUpdateSlotSchema from './schemas/lex/updateSlot.schema.json';
import LexUpdateSlotTypeSchema from './schemas/lex/updateSlotType.schema.json';

export { LexBotSchema, LexBotLocaleSchema, LexCustomVocabSchema, LexIntentSchema, LexManifestSchema, LexSlotSchema, LexSlotTypeSchema, NuanceDialogAppSchema, LexUpdateIntentSchema, LexUpdateSlotSchema, LexUpdateSlotTypeSchema };

// export the models
import * as LexBotModel from './models/lex/bot.ts';
import * as LexBotLocaleModel from './models/lex/botLocale.ts';
import * as LexCustomVocabModel from './models/lex/customVocab.ts';
import * as LexIntentModel from './models/lex/intent.ts';
import * as LexManifestModel from './models/lex/manifest.ts';
import * as LexSlotModel from './models/lex/slot.ts';
import * as LexSlotTypeModel from './models/lex/slotType.ts';
import * as NuanceDialogAppModel from './models/nuance/dialogApp';

export { LexBotModel, LexBotLocaleModel, LexCustomVocabModel, LexIntentModel, LexManifestModel, LexSlotModel, LexSlotTypeModel, NuanceDialogAppModel };


import * as BotsApiSchema from './models/bots/schemas.ts';
import * as TestSetsApiSchema from './models/test-sets/schemas.ts';
import * as TestExecutionsApiSchema from './models/test-executions/schemas.ts';

import * as RecommendationTaskApiSchema from './models/tasks/schemas.ts';
import * as RecommendationTaskItemsApiSchema from './models/task-items/schemas.ts';

import * as CommonApiSchema from './models/common.ts';

export { BotsApiSchema, TestSetsApiSchema, CommonApiSchema, TestExecutionsApiSchema, RecommendationTaskApiSchema, RecommendationTaskItemsApiSchema };

// minify functions
export * from './minify';

