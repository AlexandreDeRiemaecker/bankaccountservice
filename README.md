# Bank Account Service

The Bank Account Service project is designed to handle the following tasks:

- [x] Provide endpoints to query, create, update and delete persons, bank accounts and transactions from a Neptune graph database
- [ ] (TODO) Implement the update of account balance
- [ ] (TODO) Calculate the maximum amount a person can borrow from their friends based on their bank account balances.

The project uses NestJS for the API service, AWS CDK for infrastructure as code, and Amazon Neptune as the graph database.

## SwaggerUI and OpenAPI spec
The Swagger UI for the main branch is accessible under [/v1/swagger](https://5qh762e820.execute-api.us-east-1.amazonaws.com/v1/swagger).
The OpenAPI spec can be downloaded from [/v1/swagger-json](https://5qh762e820.execute-api.us-east-1.amazonaws.com/v1/swagger-json) .

## Getting Started

To get started with the project, follow these steps:

1. Clone the repository.
2. Add the repository secrets AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY tied to an IAM user with sufficient permissions.
3. Install dependencies by running `yarn install` at the root level.
4. Build the project using `yarn build`.
5. Deploy the infrastructure using `yarn deploy`.

## Project Structure

Please refer to the README files of the subprojects for more information:

- [Infrastructure](infrastructure/README.md): Infrastructure diagram deployed by the CDK project
- [Bank Account Service API](services/bankaccount-service-api/README.md): The main API service for managing bank accounts and transactions.
- [Bank Account Service Import Data](services/bankaccount-service-importdata/README.md): Handles the import of initial data into the Neptune database.

## Available Commands

The following commands are available at the root level:

- `yarn build`: Builds the project by running the build scripts for all subprojects.
- `yarn deploy`: Deploys the infrastructure to AWS.
- `yarn hotdeploy`: Deploys the infrastructure with hotswap fallback.
- `yarn test`: Runs tests for the API service.
