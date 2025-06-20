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

import { DeleteCommand, GetCommand, PutCommand, UpdateCommand, type DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { Logger } from "pino";
import { getLogger } from "../../common/logger";
import stringify from "json-stringify-safe";
import { createDelimitedAttribute, expandDelimitedAttribute, type DocumentDbClientItem } from "../../common/ddbAttributes.util";
import { PkType } from "../../common/pkUtils";
import type { ListPaginationOptions } from "../../common/schemas";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { TestSetsApiSchema } from "@ivr-migration-tool/schemas";

export class TestSetsRepository {
    constructor(private readonly log: Logger<any, boolean>, private readonly dbClient: DynamoDBDocumentClient, private readonly tableName: string) {
    }

    private assembleList(items: DocumentDbClientItem[]): TestSetsApiSchema.TestSetInternal[] {
        const logger = getLogger(this.log, 'TestSetsRepository', 'assembleList');
        logger.trace(`in: items: ${stringify(items)}`);

        const testSets: TestSetsApiSchema.TestSetInternal[] = [];
        items.forEach((item) => {
            const testSet = this.assemble(item);
            if (testSet) {
                testSets.push(testSet);
            }
        });
        logger.trace(`exit: testSets: ${stringify(testSets)}`);
        return testSets;
    }


    private assemble(item: DocumentDbClientItem): TestSetsApiSchema.TestSetInternal | undefined {
        const logger = getLogger(this.log, 'TestSetsRepository', 'assemble');
        logger.trace(`in: item: ${stringify(item)}`);

        if (item === undefined) {
            return undefined;
        }

        const testSet: TestSetsApiSchema.TestSetInternal = {
            id: item['id'],
            description: item['description'],
            createdAt: item['createdAt'],
            createdBy: item['createdBy'],
            updatedAt: item['updatedAt'],
            updatedBy: item['updatedBy'],
            status: item['status'],
            name: item['name'],
            testSetLocation: item['testSetLocation'],
            dataSource: item['dataSource'],
            statusMessages: item['statusMessages'],
            testSetInternalId: item['testSetInternalId'],
        };

        logger.trace(`exit: testSet: ${stringify(testSet)}`)
        return testSet
    }


    async update(testSet: TestSetsApiSchema.UpdateTestSetInternal): Promise<TestSetsApiSchema.TestSet> {

        const logger = getLogger(this.log, 'TestSetsRepository', 'update')
        logger.trace(`in: bot: ${stringify(testSet)}`)

        const { id, ...updates } = testSet;

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
                pk: createDelimitedAttribute(PkType.TestSet),
                sk: createDelimitedAttribute(PkType.TestSet, id),
            },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: "ALL_NEW"
        }))

        const updatedTestSet = this.assemble(response.Attributes!)

        logger.trace(`out: updatedTestSet: ${stringify(updatedTestSet)}`)
        return updatedTestSet!
    }

    async get(testSetId: string): Promise<TestSetsApiSchema.TestSetInternal | undefined> {
        const logger = getLogger(this.log, 'TestSetsRepository', 'get');
        logger.debug(`in: testSetId: ${testSetId} `);

        const response = await this.dbClient.send(new GetCommand({
            TableName: this.tableName,
            Key: {
                pk: createDelimitedAttribute(PkType.TestSet),
                sk: createDelimitedAttribute(PkType.TestSet, testSetId),
            }
        }))

        if (!response.Item) {
            return undefined;
        }
        const testSet = this.assemble(response.Item)
        logger.debug(`out: testSet: ${stringify(testSet)} `);
        return testSet;
    }

    async delete(id: string) {
        const logger = getLogger(this.log, 'TestSetsRepository', 'delete');
        logger.trace(`in: id: ${id} `);

        await this.dbClient.send(new DeleteCommand({
            TableName: this.tableName,
            Key: {
                pk: createDelimitedAttribute(PkType.TestSet),
                sk: createDelimitedAttribute(PkType.TestSet, id),
            }
        }))
        logger.trace(`out:`)
    }

    async create(testSet: TestSetsApiSchema.TestSetInternal): Promise<TestSetsApiSchema.TestSet> {
        const logger = getLogger(this.log, 'TestSetsRepository', 'create');
        logger.debug(`in: bot: ${stringify(testSet)} `);

        await this.dbClient.send(new PutCommand({
            TableName: this.tableName,
            Item: {
                pk: createDelimitedAttribute(PkType.TestSet),
                sk: createDelimitedAttribute(PkType.TestSet, testSet.id),
                ...testSet
            }
        }))

        logger.debug(`in: testSet: ${stringify(testSet)} `);
        return testSet;
    }

    async list(options: ListPaginationOptions): Promise<[TestSetsApiSchema.TestSetInternal[], string]> {
        const logger = getLogger(this.log, 'TestSetsRepository', 'list');
        logger.debug(`in: options: ${stringify(options)} `);

        const response = await this.dbClient.send(new QueryCommand({
            TableName: this.tableName,
            KeyConditionExpression: "pk = :pk",
            ExpressionAttributeValues: {
                ":pk": createDelimitedAttribute(PkType.TestSet)
            },
            Limit: options.count,
            ExclusiveStartKey: options.token ? {
                pk: createDelimitedAttribute(PkType.TestSet),
                sk: createDelimitedAttribute(PkType.TestSet, options.token)
            } : undefined
        }));

        logger.debug(`response: ${JSON.stringify(response)} `);
        const nextToken = response?.LastEvaluatedKey?.['sk'] == undefined ? undefined : expandDelimitedAttribute(response?.LastEvaluatedKey?.['sk'])[1];
        return [this.assembleList(response.Items!), nextToken!];
    }
}
