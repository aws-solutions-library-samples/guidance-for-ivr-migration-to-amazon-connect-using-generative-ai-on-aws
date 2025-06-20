# IVR Migration Tool Infrastructure

This package contains the AWS CDK infrastructure code for deploying the IVR Chatbot Migration to Amazon Lex and Amazon Connect solution.

## Overview

The infrastructure is organized into three main stacks:

1. **Shared Stack**: Core infrastructure components shared across the solution
2. **API Stack**: Backend API services and Lambda functions
3. **App Stack**: Frontend web application hosting

## Architecture

The solution deploys the following AWS resources:

- Amazon Cognito for authentication
- Amazon API Gateway for REST API endpoints
- AWS Lambda functions for backend processing
- Amazon DynamoDB for data storage
- Amazon S3 for file storage
- AWS Step Functions for workflow orchestration
- Amazon CloudFront for content delivery
- Amazon Bedrock for generative AI capabilities

## Key Components

### Constructs

- **API Construct**: API Gateway and Lambda integration
- **App Construct**: S3 website hosting and CloudFront distribution
- **Auth Construct**: Cognito user pools and identity providers
- **Bot Builder Workflow**: Step Functions workflow for bot building
- **Bun Fun**: Lambda function factory for Bun runtime
- **Lex Resource Generator**: Resources for generating Lex bot components
- **Test Generation Workflow**: Step Functions workflow for test generation

## Stack Dependencies

The stacks have the following dependencies:

```
SharedStack <-- ApiStack <-- AppStack
```

## License

Licensed under the Apache License, Version 2.0.