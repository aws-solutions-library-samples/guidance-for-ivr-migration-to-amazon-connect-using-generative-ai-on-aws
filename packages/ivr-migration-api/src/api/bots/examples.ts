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

import type { BotsApiSchema } from "@ivr-migration-tool/schemas"

export const botResourceExample: BotsApiSchema.Bot = {
    id: "8IUFK6R7F2",
    status: "success",
    createdAt: "user@example.com",
    createdBy: new Date().toISOString(),
    name: "OrderCoffeeBot",
    version: 'DRAFT',
    locale: "ar_AE",
    type: "NUANCE",
    statusMessages: [{
        status: "pending",
        message: "Creating Slots and SlotTypes."
    }]
}

export const botResourceListExample: BotsApiSchema.BotList = {
    bots: [botResourceExample]
}

export const createBotResourceExample: BotsApiSchema.CreateBot = {
    name: "OrderCoffeeBot",
    locale: "ar_AE",
    type: "NUANCE"
}

