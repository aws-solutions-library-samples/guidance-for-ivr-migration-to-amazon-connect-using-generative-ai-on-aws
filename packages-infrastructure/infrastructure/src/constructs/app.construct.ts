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

import { Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib/core';
import { Distribution, HeadersFrameOption, HeadersReferrerPolicy, HttpVersion, OriginAccessIdentity, PriceClass, ResponseHeadersPolicy, SecurityPolicyProtocol, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { BlockPublicAccess, Bucket, BucketAccessControl, BucketEncryption } from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { S3BucketOrigin } from "aws-cdk-lib/aws-cloudfront-origins";
import * as path from 'path';
import { NagSuppressions } from "cdk-nag";
import { StringParameter } from "aws-cdk-lib/aws-ssm";

export const websiteUrlParameter = (environment: string) => `/ivr-migration-tool/${environment}/app/websiteUrl`;

export type IvrMigrationToolAppProps = {
    readonly environment: string;
    readonly userPoolId: string;
    readonly userPoolClientId: string;
    readonly apiUrl: string;
    readonly appSyncUrl: string;
}
/**
 * Construct to create and configure the IVR Migration Tool web application infrastructure
 * Creates:
 * - S3 bucket for static website hosting
 * - CloudFront distribution for content delivery
 * - S3 bucket for CloudFront access logs
 * - Deploys web assets and configuration
 * - Sets up security headers and policies
 */
export class IvrMigrationApp extends Construct {
    constructor(scope: Construct, id: string, props: IvrMigrationToolAppProps) {
        super(scope, id)

        const { userPoolClientId, userPoolId, apiUrl, appSyncUrl } = props;

        // amazonq-ignore-next-line
        const hostingBucket = new Bucket(this, 'StaticSiteBucket', {
            versioned: true,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            encryption: BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            autoDeleteObjects: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        const originAccessIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity');
        hostingBucket.grantRead(originAccessIdentity);

        const webAsset = s3deploy.Source.asset(path.join(__dirname, "../../../../packages/ivr-migration-app/dist"))

        // Deploy Frontend Assets
        const exportsAsset = s3deploy.Source.jsonData("aws-exports.json", {
            region: cdk.Aws.REGION,
            Auth: {
                Cognito: {
                    userPoolClientId: userPoolClientId,
                    userPoolId: userPoolId,
                },
            },
            API: {
                REST: {
                    RestApi: {
                        endpoint: apiUrl,
                    },
                },
                Events: {
                    "endpoint": appSyncUrl,
                    "region": cdk.Aws.REGION,
                    "defaultAuthMode": "userPool"
                },
            },
        });

        const responseHeadersPolicy = new ResponseHeadersPolicy(this, 'ResponseHeadersPolicy', {
            responseHeadersPolicyName: `ivr-migration-tool-${props.environment}-policy`,
            securityHeadersBehavior: {
                contentSecurityPolicy: {
                    contentSecurityPolicy:
                        `default-src 'self' https: wss:; script-src 'self'; style-src 'self'; img-src 'self' data: https:;font-src 'self' data:;`,
                    override: true,
                },
                strictTransportSecurity: {
                    accessControlMaxAge: cdk.Duration.days(365),
                    includeSubdomains: true,
                    preload: true,
                    override: true,
                },
                contentTypeOptions: {
                    override: true,
                },
                frameOptions: {
                    frameOption: HeadersFrameOption.DENY,
                    override: true,
                },
                xssProtection: {
                    protection: true,
                    modeBlock: true,
                    override: true,
                },
                referrerPolicy: {
                    referrerPolicy: HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
                    override: true,
                },
            },
        });

        // amazonq-ignore-next-line
        const cloudfrontAccessLogBucket = new Bucket(this, 'DistributionAccessLog', {
            encryption: BucketEncryption.S3_MANAGED,
            enforceSSL: true,
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            accessControl: BucketAccessControl.LOG_DELIVERY_WRITE,
        });

        // amazonq-ignore-next-line
        const distribution = new Distribution(this, 'Distribution', {
            defaultBehavior: {
                origin: S3BucketOrigin.withOriginAccessIdentity(hostingBucket, {
                    originAccessIdentity: originAccessIdentity,
                }),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                responseHeadersPolicy,
            },
            logBucket: cloudfrontAccessLogBucket,
            logFilePrefix: 'distribution-access-logs/',
            defaultRootObject: 'index.html',
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.minutes(0),
                },
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: Duration.minutes(0),
                },
            ],
            enableIpv6: true,
            httpVersion: HttpVersion.HTTP2,
            minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
            enableLogging: true,
            priceClass: PriceClass.PRICE_CLASS_100,
        });

        new StringParameter(this, 'WebsiteUrlParameter', {
            parameterName: websiteUrlParameter(props.environment),
            stringValue: distribution.distributionDomainName,
        });

        const bucketDeployment = new s3deploy.BucketDeployment(this, "UserInterfaceDeployment", {
            prune: false,
            sources: [webAsset, exportsAsset],
            destinationBucket: hostingBucket,
            distribution: distribution,
            memoryLimit: 1024
        });

        NagSuppressions.addResourceSuppressions(
            [hostingBucket, cloudfrontAccessLogBucket],
            [
                {
                    id: 'AwsSolutions-S1',
                    reason: 'No access logs for hosting bucket.',
                },
            ],
            true,
        );

        NagSuppressions.addResourceSuppressions(
            [distribution],
            [
                {
                    id: 'AwsSolutions-CFR4',
                    reason: 'We are not using custom domain but using cloudfront url.',
                },
                {
                    id: 'AwsSolutions-CFR7',
                    reason:
                        'WAF is not required for this static content distribution as it serves only public read-only content with no user input processing',
                },
            ],
            true,
        );


        NagSuppressions.addResourceSuppressions(
            bucketDeployment.handlerRole,
            [
                {
                    id: 'AwsSolutions-IAM4',
                    reason: 'CDK BucketDeployment uses managed policy for Lambda execution'
                }
            ], true
        );

        NagSuppressions.addResourceSuppressions(
            bucketDeployment.handlerRole,
            [
                {
                    id: 'AwsSolutions-IAM5',
                    reason: 'CDK BucketDeployment requires S3 permissions to deploy static assets',
                    appliesTo: [
                        'Action::s3:GetBucket*',
                        'Action::s3:GetObject*',
                        'Action::s3:List*',
                        'Resource::arn:<AWS::Partition>:s3:::cdk-hnb659fds-assets-<AWS::AccountId>-<AWS::Region>/*',
                        'Action::s3:Abort*',
                        'Action::s3:DeleteObject*',
                        'Resource::<ivrmigrationappStaticSiteBucketF0203582.Arn>/*',
                        'Resource::*'
                    ]
                }
            ], true
        );

        NagSuppressions.addResourceSuppressionsByPath(
            cdk.Stack.of(this),
            `/AppStack-${props.environment}/Custom::CDKBucketDeployment8693BB64968944B69AAFB0CC9EB8756C1024MiB/Resource`,
            [
                {
                    id: 'AwsSolutions-L1',
                    reason: 'CDK BucketDeployment uses predefined runtime version'
                }
            ]
        );
    }
}

