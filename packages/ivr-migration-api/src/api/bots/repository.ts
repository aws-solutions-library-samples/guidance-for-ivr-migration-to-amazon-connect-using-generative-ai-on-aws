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

import type { Logger } from "pino";
import { getLogger } from "../../common/logger";
import stringify from "json-stringify-safe";
import type { ListPaginationOptions, S3Location } from "../../common/schemas";
import { DeleteCommand, GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { createDelimitedAttribute, expandDelimitedAttribute, type DocumentDbClientItem } from "../../common/ddbAttributes.util";
import { PkType } from "../../common/pkUtils";
import type { BotsApiSchema } from "@ivr-migration-tool/schemas";

export class BotsRepository {
    constructor(private readonly log: Logger<any, boolean>, private readonly dbClient: DynamoDBDocumentClient, private readonly tableName: string) {
    }

    private assembleList(items: DocumentDbClientItem[]): BotsApiSchema.BotInternal[] {
        const logger = getLogger(this.log, 'BotsRepository', 'assembleList');
        logger.trace(`in: items: ${stringify(items)}`);

        const bots: BotsApiSchema.BotInternal[] = [];
        items.forEach((item) => {
            const bot = this.assemble(item);
            if (bot) {
                bots.push(bot);
            }
        });
        logger.trace(`exit: bots: ${stringify(bots)}`);
        return bots;
    }


    private assemble(item: DocumentDbClientItem): BotsApiSchema.BotInternal | undefined {
        const logger = getLogger(this.log, 'BotsRepository', 'assemble');
        logger.trace(`in: item: ${stringify(item)}`);

        if (item === undefined) {
            return undefined;
        }

        const bot: BotsApiSchema.BotInternal = {
            id: item['id'],
            type: item['type'],
            description: item['description'],
            createdAt: item['createdAt'],
            createdBy: item['createdBy'],
            updatedAt: item['updatedAt'],
            updatedBy: item['updatedBy'],
            status: item['status'],
            name: item['name'],
            locale: item['locale'],
            statusMessages: item['statusMessages'],
            botDefinitionLocation: item['botDefinitionLocation'],
            botDefinitionRawLocation: item['botDefinitionRawLocation'],
            version: item['version']
        };

        logger.trace(`exit: bot: ${stringify(bot)}`)
        return bot
    }

    async delete(id: string) {
        const logger = getLogger(this.log, 'BotsRepository', 'delete');
        logger.trace(`in: id: ${id} `);

        await this.dbClient.send(new DeleteCommand({
            TableName: this.tableName,
            Key: {
                pk: createDelimitedAttribute(PkType.Bot),
                sk: createDelimitedAttribute(PkType.Bot, id),
            }
        }))
        logger.trace(`out:`)
    }

    async update(bot: BotsApiSchema.UpdateBotInternal): Promise<BotsApiSchema.Bot> {

        const logger = getLogger(this.log, 'BotsRepository', 'update')
        logger.trace(`in: bot: ${stringify(bot)}`)

        const { id, ...updates } = bot;

        const updateExpressions: string[] = [];
        const expressionAttributeValues: Record<string, any> = {};
        const expressionAttributeNames: Record<string, any> = {};

        Object.entries(updates).forEach(([key, value]) => {
            if (value !== undefined) {
                const attributeName = `#${key}`;
                const attributeValue = `:${key}`;
                updateExpressions.push(`${attributeName} = ${attributeValue}`);
                expressionAttributeValues[attributeValue] = value;
                expressionAttributeNames[attributeName] = key;
            }
        });

        const response = await this.dbClient.send(new UpdateCommand({
            TableName: this.tableName,
            Key: {
                pk: createDelimitedAttribute(PkType.Bot),
                sk: createDelimitedAttribute(PkType.Bot, id),
            },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "ALL_NEW"
        }))

        const updatedBot = this.assemble(response.Attributes!)

        logger.trace(`out: updatedBot: ${stringify(updatedBot)}`)
        return updatedBot!
    }

    async create(bot: BotsApiSchema.BotInternal): Promise<BotsApiSchema.Bot> {
        const logger = getLogger(this.log, 'BotsRepository', 'create');
        logger.debug(`in: bot: ${stringify(bot)} `);

        await this.dbClient.send(new PutCommand({
            TableName: this.tableName,
            Item: {
                pk: createDelimitedAttribute(PkType.Bot),
                sk: createDelimitedAttribute(PkType.Bot, bot.id),
                ...bot
            }
        }))

        logger.debug(`in: bot: ${stringify(bot)} `);
        return bot;
    }

    async get(botId: string): Promise<BotsApiSchema.BotInternal | undefined> {
        const logger = getLogger(this.log, 'BotsRepository', 'get');
        logger.debug(`in: botId: ${botId} `);

        const response = await this.dbClient.send(new GetCommand({
            TableName: this.tableName,
            Key: {
                pk: createDelimitedAttribute(PkType.Bot),
                sk: createDelimitedAttribute(PkType.Bot, botId),
            }
        }))

        if (!response.Item) {
            return undefined;
        }
        const bot = this.assemble(response.Item)
        logger.debug(`out: bot: ${stringify(bot)} `);
        return bot;
    }

    async list(options: ListPaginationOptions): Promise<[BotsApiSchema.BotInternal[], string]> {
        const logger = getLogger(this.log, 'BotsRepository', 'list');
        logger.debug(`in: options: ${stringify(options)} `);

        const response = await this.dbClient.send(new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: "pk = :pk",
            ExpressionAttributeValues: {
                ":pk": createDelimitedAttribute(PkType.Bot)
            },
            Limit: options.count,
            ExclusiveStartKey: options.token ? {
                pk: createDelimitedAttribute(PkType.Bot),
                sk: createDelimitedAttribute(PkType.Bot, options.token)
            } : undefined
        }));

        logger.debug(`response: ${JSON.stringify(response)} `);
        const nextToken = response?.LastEvaluatedKey?.['sk'] == undefined ? undefined : expandDelimitedAttribute(response?.LastEvaluatedKey?.['pk'])[1];
        return [this.assembleList(response.Items!), nextToken!];
    }

}
