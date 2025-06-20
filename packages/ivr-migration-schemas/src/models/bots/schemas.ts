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

import { Type, type Static } from "@sinclair/typebox";
import type { S3Location } from "../common";

export const botId = Type.String({ description: 'Unique id of bot' })

export const type = Type.Union([
    Type.Literal('NUANCE'),
    Type.Literal('VXML'),
    Type.Literal('FLOW_DIAGRAM'),
]);

export const locale = Type.Union([
    Type.Literal('ar_AE'),
    Type.Literal('ar_SA'),
    Type.Literal('de_DE'),
    Type.Literal('en_AU'),
    Type.Literal('en_GB'),
    Type.Literal('en_IN'),
    Type.Literal('en_US'),
    Type.Literal('es_ES'),
    Type.Literal('es_MX'),
    Type.Literal('es_US'),
    Type.Literal('fr_CA'),
    Type.Literal('fr_FR'),
    Type.Literal('hi_IN'),
    Type.Literal('it_IT'),
    Type.Literal('ja_JP'),
    Type.Literal('ko_KR'),
    Type.Literal('pt_BR'),
    Type.Literal('pt_PT'),
    Type.Literal('zh_CN'),
    Type.Literal('zh_TW')
]);

export type Locale = Static<typeof locale>;

const status = Type.Union([
    Type.Literal('pending'),
    Type.Literal('error'),
    Type.Literal('success'),
    Type.Literal('stopped'),
    Type.Literal('in-progress'),
    Type.Literal('built'),
]);

export type BotStatus = Static<typeof status>;

const statusMessage = Type.Object({
    status,
    message: Type.String({ description: 'detail on the status message' }),
}, { $id: 'botStatusMessage' });


export const botResource = Type.Object({
    id: botId,
    name: Type.String(),
    description: Type.Optional(Type.String()),
    status,
    locale,
    type,
    version: Type.String({ default: 'DRAFT' }),
    statusMessages: Type.Array(statusMessage),
    inputUploadUrl: Type.Optional(Type.String({ description: 'The URL to upload the input. This is a required parameter if type is VXML or TRSX.' })),
    outputDownloadUrl: Type.Optional(Type.String({ description: 'The URL to download the bot definition zip.' })),
    rawOutputDownloadUrl: Type.Optional(Type.String({ description: 'The URL to download the bot definition zip.' })),
    createdAt: Type.String({ format: 'date-time' }),
    createdBy: Type.String({}),
    updatedAt: Type.Optional(Type.String({ format: 'date-time' })),
    updatedBy: Type.Optional(Type.String({})),
}, {
    $id: 'botResource'
})

export type Bot = Static<typeof botResource>

export type BotInternal = Bot & { botDefinitionLocation?: S3Location, botDefinitionRawLocation?: S3Location }

export const createBotResource = Type.Object({
    name: Type.String(),
    description: Type.Optional(Type.String()),
    locale,
    type,
}, { $id: 'createBotResource' })

export type CreateBot = Static<typeof createBotResource>

export const upateBotResource = Type.Object({
    status,
    statusMessages: Type.Array(statusMessage),
}, { $id: 'updateBotResource' })

export type UpdateBot = Static<typeof upateBotResource>

export type UpdateBotInternal = UpdateBot & { id: string, updatedAt: string, updatedBy: string, botDefinitionRawLocation?: S3Location, botDefinitionLocation?: S3Location }

export const botListResource = Type.Object({
    bots: Type.Array(Type.Ref(botResource)),
    pagination: Type.Optional(
        Type.Object({
            token: Type.Optional(Type.String()),
            count: Type.Optional(Type.Number()),
        })
    ),
}, { $id: 'botListResource' })

export type BotList = Static<typeof botListResource>;

