# Bank Account Service Import Data

The Bank Account Service Import Data module is responsible for importing initial data into the Neptune database using AWS Lambda and the Neptune Data API.

## Available Commands

- `yarn build` compile TypeScript to JavaScript
- `yarn watch` watch for changes and compile

## Project Structure

- `src/`: Contains the source code of the module.
  - `index.ts`: The entry point of the Lambda function that handles the import of initial data into the Neptune database.

## Usage

This module is designed to be used as part of the overall Bank Account Service project. It is triggered by the AWS CDK stack to upsert default data into the Neptune database when the Neptune cluster is created or updated.

## AWS Lambda Function

The Lambda function defined in `src/index.ts` uses the Neptune Data API to insert mock data into the Neptune database. The function is triggered by a CloudFormation custom resource during the deployment of the infrastructure stack.

## Example Data

The example data inserted by the Lambda function includes:

- Persons: Alice, Bob, and Carol
- Bank Accounts: Two accounts with IBANs `DE123` and `DE456`
- Bank Transactions: Two transactions with random UUIDs
- Relationships: `has_friend` and `owns_account` edges between the entities