# Bank Account Service

The Bank Account Service project is designed to handle the following tasks:

- [x] Provide endpoints to query, create, update and delete persons, bank accounts and transactions from a Neptune graph database
- [ ] (TODO) Implement the update of account balance
- [ ] (TODO) Calculate the maximum amount a person can borrow from their friends based on their bank account balances.

The project uses NestJS for the API service, AWS CDK for infrastructure as code, and Amazon Neptune as the graph database.

## Table of Contents

- [SwaggerUI and OpenAPI spec](#swaggerui-and-openapi-spec)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Available Commands](#available-commands)
- [Key decisions](#Key decisions)
  - [Lambdalith](#lambdalith)
  - [Near-real-time updates with SQS](#near-real-time-updates-with-sqs)
  - [Notes on using GremlinJS](#notes-on-using-gremlinjs)
  - [Notes on import-data](#notes-on-import-data)
  - [Notes on the CI/CD pipeline](#notes-on-the-cicd-pipeline)
  - [Notes on CORS](#notes-on-cors)
  - [VertexIds and Business Ids](#vertexids-and-business-ids)
  - [Exploring the data via Graphistry](#exploring-the-data-via-graphistry)
  - [Friendships](#friendships)

## SwaggerUI and OpenAPI spec

The Swagger UI for the main branch deployment is accessible under [/v1/swagger](https://5qh762e820.execute-api.us-east-1.amazonaws.com/v1/swagger).
The OpenAPI spec can be downloaded from [/v1/swagger-json](https://5qh762e820.execute-api.us-east-1.amazonaws.com/v1/swagger-json).

## Getting Started

### To get started with the project by forking

1. Fork the repository.
2. Add the repository secrets AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY tied to an IAM user with sufficient permissions.
3. Run the GitHub Action workflow to build and deploy. The AWS account will be the one tied to the IAM identity of your credentials in the GitHub secrets.

### To get started with the project locally

1. Install dependencies by running `yarn install` at the root level.
2. Build the project using `yarn build`.
3. Deploy the infrastructure using `yarn deploy`.

## Project Structure

Please refer to the README files of the subprojects for more information:

- [Infrastructure](infrastructure/README.md): Infrastructure diagram deployed by the CDK project.
- [Bank Account Service API](services/bankaccount-service-api/README.md): The main API service for managing bank accounts and transactions.
- [Bank Account Service Import Data](services/bankaccount-service-importdata/README.md): Handles the import of initial data into the Neptune database.

## Available Commands

The following commands are available at the root level:

- `yarn build`: Builds the project by running the build scripts for all subprojects.
- `yarn deploy`: Deploys the infrastructure to AWS.
- `yarn hotdeploy`: Deploys the infrastructure with hotswap fallback.
- `yarn test`: Runs tests for the API service.

## Key decisions

### Lambdalith

Monolithic lambdas that serve multiple routes can cause longer cold startup, but also reduce the occurrence of cold-startups because the same lambda is executed more often. As it is easier than multiple small lambdas to locally run the solution and to migrate the project to containers (when using Express/NestJS), we choose this approach. However, it is recommended to architect services that are granular enough in order to avoid an unacceptable increase in cold-start times, build time, and deployment time due to a fat NodeJS bundle that creates long initializaton times.

### Near-real-time updates with SQS

We use SQS with lambdas consuming and processing Neptune record updates and updating the Neptune graph for account balance and credit line in an async, eventually consistent way. We use a Dead-Letter-Queue to ensure we don't loose events. This replaces the bulk approach triggered via webhook that would have run once every night. This also allows to be quickly aware of issues with new deployments instead of an alarm at night.

### Notes on using GremlinJS

We use GremlinJS with strongly typed queries to prevent malicious injections into queries (similar to SQL injections).

### Notes on import-data

Because efficient upserts with mergeV and mergeE are supported only by Neptune, we use the data API instead of the Gremlin client in the initial upsert lambda. Furthermore, this lambda may need to retry because the endpoint might not be available directly after Neptune cluster creation, and the client SDK for the data API can perform a reliable exponential-backoff by default.

### Notes on the CI/CD pipeline

For simplicity in solo development, the whole pipeline is run on a push on any branch and deploys a separate stack for each branch. For better collaboration in a real setup, the CI should be performed on any push from any branch, while the CD should only be performed when a pull request to merge into main is opened by locally merging the branch of the PR with main before deploying to a staging environment (Gitflow approach). Furthermore, the main branch should be configured to only allow PR merges and no direct pushes, and it should only allow the merge of an incoming branch when tests, build, and deployment to staging were successful.

### Notes on CORS

CORS headers currently allow "\*" and should be specified for production.

### VertexIds and Business Ids

We use the Business Id because the VertexIds in AWS Neptune can change when vertices are re-created, during bulk loads without explicit IDs, or after export and re-import, making it unsuitable as a primary key for our CRUD operations.

### Exploring the data via Graphistry

Should we want to explore the data easily, we can add an additional CDK stack that imports the CF Template provided at [Enabling low code graph data apps with Amazon Neptune and Graphistry](https://aws.amazon.com/blogs/database/enabling-low-code-graph-data-apps-with-amazon-neptune-and-graphistry/) with the CF parameters pointing to our Neptune Cluster.

### Friendships

We could have handled friendships with the persons module, but with many-to-many relationships, we prefer seeing that bi-directional relationship "Person_Person" called "Friendship" as its own REST resource. This ensures that if we need to add properties to a friendship (e.g., a creationDate), we don't need to introduce breaking changes in the API. This is a case that may start out as just an edge, but could become it's own vertex with two edges.
