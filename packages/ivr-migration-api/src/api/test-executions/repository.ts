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

import { DeleteCommand, GetCommand, PutCommand, QueryCommand, UpdateCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { TestExecutionsApiSchema } from "@ivr-migration-tool/schemas";
import stringify from "json-stringify-safe";
import type { Logger } from "pino";
import { createDelimitedAttribute, expandDelimitedAttribute, type DocumentDbClientItem } from "../../common/ddbAttributes.util";
import { getLogger } from "../../common/logger";
import { PkType } from "../../common/pkUtils";
import type { ListPaginationOptions } from "../../common/schemas";

export class TestExecutionsRepository {
    constructor(private readonly log: Logger<any, boolean>, private readonly dbClient: DynamoDBDocumentClient, private readonly tableName: string) {
    }

    private assembleList(items: DocumentDbClientItem[]): TestExecutionsApiSchema.TestExecutionResource[] {
        const logger = getLogger(this.log, 'TestExecutionsRepository', 'assembleList');
        logger.trace(`in: items: ${stringify(items)}`);

        const testExecutions: TestExecutionsApiSchema.TestExecutionResource[] = [];
        items.forEach((item) => {
            const testExecution = this.assemble(item);
            if (testExecution) {
                testExecutions.push(testExecution);
            }
        });
        logger.trace(`exit: testExecutions: ${stringify(testExecutions)}`);
        return testExecutions;
    }


    private assemble(item: DocumentDbClientItem): TestExecutionsApiSchema.TestExecutionResource | undefined {
        const logger = getLogger(this.log, 'TestExecutionsRepository', 'assemble');
        logger.trace(`in: item: ${stringify(item)}`);

        if (item === undefined) {
            return undefined;
        }

        const testExecution: TestExecutionsApiSchema.TestExecutionResource = {
            id: item['id'],
            testSetId: item['testSetId'],
            testSetName: item['testSetName'],
            botId: item['botId'],
            createdAt: item['createdAt'],
            createdBy: item['createdBy'],
            updatedAt: item['updatedAt'],
            updatedBy: item['updatedBy'],
            status: item['status'],
            failureReasons: item['failureReasons'],
        };

        logger.trace(`exit: testExecution: ${stringify(testExecution)}`)
        return testExecution
    }


    async get(botId: string, id: string): Promise<TestExecutionsApiSchema.TestExecutionResource | undefined> {
        const logger = getLogger(this.log, 'TestExecutionsRepository', 'get');
        logger.debug(`in: botId: ${botId}, id: ${id} `);

        const response = await this.dbClient.send(new GetCommand({
            TableName: this.tableName,
            Key: {
                pk: createDelimitedAttribute(PkType.Bot, botId),
                sk: createDelimitedAttribute(PkType.TestExecution, id),
            }
        }))

        if (!response.Item) {
            return undefined;
        }
        const testSet = this.assemble(response.Item)
        logger.debug(`out: testExecution: ${stringify(testSet)} `);
        return testSet;
    }

    async delete(botId: string, id: string) {
        const logger = getLogger(this.log, 'TestExecutionsRepository', 'delete');
        logger.trace(`in: id: ${id} `);

        await this.dbClient.send(new DeleteCommand({
            TableName: this.tableName,
            Key: {
                pk: createDelimitedAttribute(PkType.Bot, botId),
                sk: createDelimitedAttribute(PkType.TestExecution, id),
            }
        }))
        logger.trace(`out:`)
    }

    async update(testExecution: TestExecutionsApiSchema.TestExecutionInternal): Promise<TestExecutionsApiSchema.TestExecutionResource> {

        const logger = getLogger(this.log, 'TestExecutionsRepository', 'update')
        logger.trace(`in: testExecution: ${stringify(testExecution)}`)

        const { id, ...updates } = testExecution;

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
                pk: createDelimitedAttribute(PkType.Bot, testExecution.botId),
                sk: createDelimitedAttribute(PkType.TestExecution, testExecution.id),
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


    async create(testExecution: TestExecutionsApiSchema.TestExecutionResource): Promise<TestExecutionsApiSchema.TestExecutionResource> {
        const logger = getLogger(this.log, 'TestExecutionsRepository', 'create');
        logger.debug(`in: testExecution: ${stringify(testExecution)} `);

        await this.dbClient.send(new PutCommand({
            TableName: this.tableName,
            Item: {
                pk: createDelimitedAttribute(PkType.Bot, testExecution.botId),
                sk: createDelimitedAttribute(PkType.TestExecution, testExecution.id),
                ...testExecution
            }
        }))

        logger.debug(`in: testSet: ${stringify(testExecution)} `);
        return testExecution;
    }

    async list(botId: string, options: ListPaginationOptions): Promise<[TestExecutionsApiSchema.TestExecutionResource[], string]> {
        const logger = getLogger(this.log, 'TestExecutionsRepository', 'list');
        logger.debug(`in: options: ${stringify(options)} `);

        const response = await this.dbClient.send(new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: "pk = :pk",
            ExpressionAttributeValues: {
                ":pk": createDelimitedAttribute(PkType.Bot, botId)
            },
            Limit: options.count,
            ExclusiveStartKey: options.token ? {
                pk: createDelimitedAttribute(PkType.Bot, botId),
                sk: createDelimitedAttribute(PkType.TestExecution, options.token)
            } : undefined
        }));

        logger.debug(`response: ${JSON.stringify(response)} `);
        const nextToken = response?.LastEvaluatedKey?.['sk'] == undefined ? undefined : expandDelimitedAttribute(response?.LastEvaluatedKey?.['sk'])[1];
        return [this.assembleList(response.Items!), nextToken!];
    }
}
