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

import { Construct } from "constructs";
import { AccountRecovery, CfnUserPoolGroup, CfnUserPoolUser, CfnUserPoolUserToGroupAttachment, ClientAttributes, StringAttribute, UserPool, UserPoolClientIdentityProvider, type StandardAttributesMask } from "aws-cdk-lib/aws-cognito";
import { IdentityPool, UserPoolAuthenticationProvider } from "aws-cdk-lib/aws-cognito-identitypool";
import { RemovalPolicy } from "aws-cdk-lib";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { NagSuppressions } from "cdk-nag";

export interface AuthProperties {
    environment: string;
    administratorEmail: string;
}

export const userPoolIdParameter = (environment: string) => `/ivr-migration-tool/${environment}/shared/cognitoUserPoolId`;
export const userPoolArnParameter = (environment: string) => `/ivr-migration-tool/${environment}/shared/cognitoUserPoolArn`;
export const userPoolClientIdParameter = (environment: string) => `/ivr-migration-tool/${environment}/shared/cognitoUserPoolClientId`;
export const userPoolDomainParameter = (environment: string) => `/ivr-migration-tool/${environment}/shared/cognitoUserPoolDomain`;
export const adminUserParameter = (environment: string) => `/ivr-migration-tool/${environment}/shared/cognitoAdminUser`;


/**
 * Auth class extends Construct to create and manage AWS Cognito authentication resources
 * This class sets up:
 * - Cognito User Pool with email sign-in
 * - User Pool Client for application access
 * - Identity Pool for AWS service access
 * - Initial admin user and group
 * - SSM parameters to store authentication details
 */
export class Auth extends Construct {

    constructor(scope: Construct, id: string, props: AuthProperties) {
        super(scope, id);
        const { environment, administratorEmail } = props;
        // Cognito User Pool for Authentication
        // amazonq-ignore-next-line
        const userPool = new UserPool(this, "IvrMigrationToolUserPool", {
            selfSignUpEnabled: false,
            signInAliases: {
                email: true,
            },
            autoVerify: {
                email: true,
            },
            customAttributes: {
                role: new StringAttribute({ mutable: true }),
            },
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireDigits: true,
                requireUppercase: true,
                requireSymbols: true,
            },
            accountRecovery: AccountRecovery.EMAIL_ONLY,
            removalPolicy: RemovalPolicy.DESTROY,
        });

        NagSuppressions.addResourceSuppressions(
            userPool,
            [
                {
                    id: 'AwsSolutions-COG3',
                    reason: 'User can turn on AdvancedSecurity mode if they want to, the open source solution will not enforce it.',
                }
            ],
            true
        );

        const standardCognitoAttributes: StandardAttributesMask = {
            email: true,
            emailVerified: true,
        };

        const clientReadAttributes = new ClientAttributes()
            .withStandardAttributes(standardCognitoAttributes)
            .withCustomAttributes('role');

        const clientWriteAttributes = new ClientAttributes()
            .withStandardAttributes({
                ...standardCognitoAttributes,
                emailVerified: false,
            })
            .withCustomAttributes('role');

        const userPoolClient = userPool.addClient("IvrMigrationToolUserPoolClient", {
            generateSecret: false,
            authFlows: {
                adminUserPassword: true,
                userSrp: true,
            },
            supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
            readAttributes: clientReadAttributes,
            writeAttributes: clientWriteAttributes,
            preventUserExistenceErrors: true,
        });


        const identityPool = new IdentityPool(this, "IdentityPool", {
            authenticationProviders: {
                userPools: [
                    new UserPoolAuthenticationProvider({
                        userPool,
                        userPoolClient,
                    }),
                ],
            },
        });

        new StringParameter(this, 'cognitoUserPoolIdParameter', {
            parameterName: userPoolIdParameter(props.environment),
            stringValue: userPool.userPoolId,
        });

        new StringParameter(this, 'cognitoUserPoolArnParameter', {
            parameterName: userPoolArnParameter(props.environment),
            stringValue: userPool.userPoolArn,
        });

        new StringParameter(this, 'cognitoClientIdParameter', {
            parameterName: userPoolClientIdParameter(props.environment),
            stringValue: userPoolClient.userPoolClientId,
        });

        /**
         * Seed the group
         */

        const group = new CfnUserPoolGroup(this, 'Group', {
            groupName: 'ivr-migration-tool',
            userPoolId: userPool.userPoolId,
        });
        group.node.addDependency(userPool);

        /**
         * Seed the initial admin user
         */
        const adminUser = new CfnUserPoolUser(this, 'AdminUser', {
            userPoolId: userPool.userPoolId,
            username: administratorEmail,
            userAttributes: [
                {
                    name: 'email',
                    value: administratorEmail,
                },
                {
                    name: 'custom:role',
                    value: 'admin',
                },
            ],
        });
        adminUser.node.addDependency(userPool);

        const membership = new CfnUserPoolUserToGroupAttachment(this, 'AdminUserGroupMembership', {
            groupName: group.groupName as string,
            username: adminUser.username as string,
            userPoolId: userPool.userPoolId,
        });

        membership.node.addDependency(group);
        membership.node.addDependency(adminUser);
        membership.node.addDependency(userPool);

        new StringParameter(this, 'adminUserParameter', {
            parameterName: adminUserParameter(environment),
            stringValue: administratorEmail,
        });


    }
}
