# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## AWS Architecture Diagram

```mermaid
graph TD

  subgraph VPC[fa:fa-cloud Private VPC]
    subgraph Private_Subnets[Private Subnets]
      ENI[fa:fa-exchange ENI - Elastic Network Interface]
      Neptune[fa:fa-database Neptune Cluster]
    end
  end

  APIGateway[fa:fa-sign-in API Gateway]
  CloudWatch[fa:fa-eye CloudWatch Logs]
  LambdaAPI[fa:fa-code NestJS Lambdalith API Handler]
  LambdaInit[fa:fa-cogs Lambda Function Init Neptune]
  CDKResource[fa:fa-cogs CDK Custom Resource]

  ENI --> Neptune
  LambdaAPI --> ENI
  LambdaInit --> ENI
  APIGateway --> LambdaAPI
  APIGateway --> CloudWatch
  CDKResource -.-> LambdaInit
  Neptune --> |Trigger on Create/Update| CDKResource
```