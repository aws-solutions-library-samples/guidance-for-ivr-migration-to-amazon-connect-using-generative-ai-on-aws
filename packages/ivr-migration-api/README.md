# IVR Migration API

The IVR Migration API is a core component of the IVR Chatbot Migration to Amazon Lex and Amazon Connect solution. This package provides the backend API services and task handlers for migrating IVR systems to Amazon Lex.

## Overview

This API service facilitates the migration of IVR systems by providing endpoints for:
- Bot management (creation, retrieval, deletion, and building)
- Test set management
- Test execution
- Recommendation task management

The service uses AWS Bedrock for generative AI capabilities to transform legacy IVR definitions into Amazon Lex compatible resources.

## Features

- RESTful API for managing migration resources
- Task-based architecture for asynchronous processing
- Integration with AWS services (S3, DynamoDB, Bedrock, Lambda)
- Authentication and authorization
- Swagger documentation

## Project Structure

- `/api` - API route handlers for different resources
- `/common` - Shared utilities and helper functions
- `/handlers` - Lambda function handlers for various tasks
- `/plugins` - Fastify plugins for configuration, authentication, etc.
- `/tasks` - Core business logic for migration tasks

## Key Components

### API Endpoints

- **Bots**: Manage Amazon Lex bots
- **Test Sets**: Manage test cases for validating bot functionality
- **Test Executions**: Run and monitor test executions
- **Tasks**: Manage recommendation tasks for migration
- **Task Items**: Access individual task items

### Task Handlers

- **Generate Slots Task**: Creates slot types from IVR definitions
- **Generate Intent Task**: Creates intents from IVR components
- **Validate Intent Task**: Validates generated intents
- **Build Bot Task**: Builds and deploys Amazon Lex bots

## Getting Started

### Prerequisites

- Node.js 22+
- Bun runtime
- AWS account with appropriate permissions

### Installation

```bash
# Install dependencies
bun install
```

### Local Development

```bash
# Start the local development server
bun start

# Build the project
bun run build

# Type checking
bun run typecheck
```

### Environment Variables

Create a `.env` file with the following variables:

```
NODE_ENV=local
LOG_LEVEL=debug
BUCKET_NAME=your-s3-bucket
TABLE_NAME=your-dynamodb-table
MODEL_ID=your-bedrock-model-id
```

## Deployment

This package is deployed as part of the IVR Migration Tool infrastructure using AWS CDK.

## License

Licensed under the Apache License, Version 2.0.