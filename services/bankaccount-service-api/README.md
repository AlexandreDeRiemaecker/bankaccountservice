# Bank Account Service API

The Bank Account Service API is designed to manage bank accounts, transactions, and persons using a Neptune graph database. It provides endpoints to query, create, update, and delete these entities.

## Available Commands

- `yarn build` compile TypeScript to JavaScript
- `yarn start` start the NestJS application
- `yarn start:dev` start the application in development mode
- `yarn start:prod` start the application in production mode
- `yarn test` run tests
- `yarn test:watch` run tests in watch mode
- `yarn test:cov` run tests with coverage
- `yarn test:e2e` run end-to-end tests
- `yarn lint` lint the codebase
- `yarn format` format the codebase

## API Documentation

The API documentation is available via Swagger. Once the application is running, you can access it at `/swagger`.

## Project Structure

- `src/`: Contains the source code of the application.
  - `app.module.ts`: The root module of the application.
  - `main.ts`: The entry point of the application.
  - `persons/`: Module for managing persons.
  - `bank-accounts/`: Module for managing bank accounts.
  - `bank-transactions/`: Module for managing bank transactions.
  - `shared/`: Shared services and modules
    - `neptune/`: Shared service for interacting with the Neptune database
