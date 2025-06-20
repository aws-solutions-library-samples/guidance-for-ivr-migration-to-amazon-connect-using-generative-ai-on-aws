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

import { factMappings, getOrThrow } from "@ivr-migration-tool/cdk-common";
import { App, Aspects } from "aws-cdk-lib";
import { SharedStack } from "./shared.stack";
import { ApiStack } from "./api.stack";
import { AppStack } from "./app.stack";
import { Fact } from "aws-cdk-lib/region-info";
import { AwsSolutionsChecks, NagReportFormat } from "cdk-nag";

const app = new App();

Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true, reports: true }));


// mandatory config
const environment = getOrThrow(app, 'environment');
const administratorEmail = getOrThrow(app, 'administratorEmail');

const stackName = (environment: string, suffix: string) => `ivr-migration-tool-${environment}-${suffix}`;
const stackDescription = (moduleName: string) => `Infrastructure for IVR Migration Tool ${moduleName} module`;

for (const [factName, regionMapping] of Object.entries(factMappings)) {
    for (const [region, value] of Object.entries(regionMapping)) {
        Fact.register({
            region: region,
            name: factName,
            value: value,
        });
    }
}

const sharedStack = new SharedStack(app, `SharedStack-${environment}`, {
    stackName: stackName(environment, 'infrastructure'),
    description: `Infrastructure Share Module -- Guidance for IVR Migration to Amazon Connect/Lex using Generative AI on AWS (SO9458).`,
    environment,
    administratorEmail,
});

const apiStack = new ApiStack(app, `ApiStack-${environment}`, {
    stackName: stackName(environment, 'api'),
    description: stackDescription('api'),
    environment,
    administratorEmail,
})

apiStack.addDependency(sharedStack);

const appStack = new AppStack(app, `AppStack-${environment}`, {
    stackName: stackName(environment, 'app'),
    description: stackDescription('app'),
    environment,
    administratorEmail,
})

appStack.addDependency(apiStack);
appStack.addDependency(sharedStack);
