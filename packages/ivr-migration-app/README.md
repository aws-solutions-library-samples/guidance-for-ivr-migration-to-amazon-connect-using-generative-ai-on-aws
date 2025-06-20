# IVR Migration App

The IVR Migration App is the web-based user interface component of the IVR Chatbot Migration to Amazon Lex and Amazon Connect solution. This package provides a React-based frontend for managing the migration process.

## Overview

This web application provides an intuitive interface for:
- Managing Amazon Lex bots
- Creating and managing test sets
- Viewing test execution results
- Reviewing migration recommendations

The app is built using React and AWS Amplify for authentication, with AWS Cloudscape Design System components for a consistent AWS-like user experience.

## Features

- User authentication via Amazon Cognito
- Bot management interface
- Test set creation and management
- Test execution visualization
- Migration recommendation review

## Project Structure

- `/public` - Static assets and configuration templates
- `/src` - Application source code
  - `/app` - Core application setup
  - `/components` - Reusable UI components
  - `/pages` - Page components for different routes
  - `/shared` - Shared utilities and types
  - `/slices` - Redux state management
  - `/styles` - SCSS styles

## Key Pages

- **Bot Management**: Create, view, and manage Amazon Lex bots
- **Test Sets**: Create and manage test sets for validating bot functionality
- **Test Executions**: View test execution results
- **Recommendations**: Review migration recommendations

## Getting Started

### Prerequisites

- Node.js 22+
- Bun runtime
- Backend API deployed and configured

### Installation

```bash
# Install dependencies
bun install
```

### Local Development

```bash
# Generate local configuration
bun run generate-config

# Start the development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

### Configuration

The application requires configuration for connecting to the backend API and authentication services. Copy `public/aws-exports.template.json` to `public/aws-exports.json` and update with your deployment values:

```json
{
  "API": {
    "endpoints": [
      {
        "name": "IvrMigrationApi",
        "endpoint": "https://your-api-endpoint.execute-api.region.amazonaws.com"
      }
    ]
  },
  "Auth": {
    "region": "us-east-1",
    "userPoolId": "us-east-1_xxxxxxxx",
    "userPoolWebClientId": "xxxxxxxxxxxxxxxxxxxxxxxxxx",
    "mandatorySignIn": true,
    "oauth": {
      "domain": "your-domain.auth.region.amazoncognito.com",
      "scope": ["email", "profile", "openid"],
      "redirectSignIn": "http://localhost:5173/",
      "redirectSignOut": "http://localhost:5173/",
      "responseType": "code"
    }
  }
}
```

## Deployment

This package is deployed as part of the IVR Migration Tool infrastructure using AWS CDK. The build output is hosted in an Amazon S3 bucket and served through Amazon CloudFront.

## License

Licensed under the Apache License, Version 2.0.