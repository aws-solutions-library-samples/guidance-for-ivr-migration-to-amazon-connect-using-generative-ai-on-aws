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

import { Stack, type StackProps } from "aws-cdk-lib";
import { ivrMigrationApiUrlParameter } from "./constructs/api.construct";
import type { Construct } from "constructs";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { userPoolClientIdParameter, userPoolIdParameter } from './constructs/auth.construct';
import { IvrMigrationApp } from "./constructs/app.construct";
import { ivrMigrationAppSyncUrlParameter } from "./constructs/notification.construct";

export type AppStackProps = StackProps & {
    readonly environment: string;
    readonly administratorEmail: string;
}
/**
 * AppStack class extends the AWS CDK Stack class to create the IVR Migration application infrastructure
 * This stack retrieves necessary parameters from SSM Parameter Store and creates the IVR Migration App
 * with authentication, API and AppSync configurations
 */
export class AppStack extends Stack {

    constructor(scope: Construct, id: string, props: AppStackProps) {
        super(scope, id, props)

        const userPoolId = StringParameter.fromStringParameterAttributes(this, 'userPoolIdd', {
            parameterName: userPoolIdParameter(props.environment),
            simpleName: false,
        }).stringValue;


        const userPoolClientId = StringParameter.fromStringParameterAttributes(this, 'userPoolClientId', {
            parameterName: userPoolClientIdParameter(props.environment),
            simpleName: false,
        }).stringValue;

        const apiUrl = StringParameter.fromStringParameterAttributes(this, 'ivrMigrationApiUrl', {
            parameterName: ivrMigrationApiUrlParameter(props.environment),
            simpleName: false,
        }).stringValue;

        const appSyncUrl = StringParameter.fromStringParameterAttributes(this, 'ivrMigrationAppSyncUrl', {
            parameterName: ivrMigrationAppSyncUrlParameter(props.environment),
            simpleName: false,
        }).stringValue;

        new IvrMigrationApp(this, 'ivr-migration-app', {
            ...props,
            userPoolId,
            userPoolClientId,
            apiUrl,
            appSyncUrl
        })
    }
}
