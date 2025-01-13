import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cr from "aws-cdk-lib/custom-resources";
import * as neptune from "@aws-cdk/aws-neptune-alpha";
import * as apgw from "aws-cdk-lib/aws-apigateway";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC that only needs private subnets for lambda attachment and no IGW or NAT Gateways
    const vpc = new ec2.Vpc(this, "BankAccountService-ServiceVPC", {
      maxAzs: 2,
      createInternetGateway: false,
      natGateways: 0,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Neptune Parameter Group to enable Neptune Streams on cluster level
    const neptuneParameterGroup = new neptune.ClusterParameterGroup(
      this,
      "BankAccountService-NeptuneParameterGroup",
      {
        family: { family: "neptune1.3" },
        parameters: {
          neptune_streams: "1",
        },
      }
    );

    // Neptune Cluster on isolated subnets
    const neptuneCluster = new neptune.DatabaseCluster(
      this,
      "BankAccountService-NeptuneCluster",
      {
        vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        instanceType: neptune.InstanceType.T4G_MEDIUM,
        removalPolicy: cdk.RemovalPolicy.DESTROY, // DO NOT USE IN PRODUCTION
        clusterParameterGroup: neptuneParameterGroup,
      }
    );

    // Hook a Lambda to neptune cluster created/updated events to upsert default data into the neptune database
    this.upsertDataAfterCreateOrUpdate(vpc, neptuneCluster);

    // Lambda function to handle API requests via a bundled NestJS Lambdalith
    const apiNestHandlerFunction = new lambda.Function(
      this,
      "BankAccountService-NestJS-Lambda",
      {
        code: lambda.Code.fromAsset("../services/bankaccount-service-api/dist"),
        description: "Handles BankAccountService API requests via a bundled NestJS Lambda",
        vpc: vpc,
        runtime: lambda.Runtime.NODEJS_22_X,
        handler: "main.handler",
        environment: {
          NeptuneEndpointHostname: neptuneCluster.clusterEndpoint.hostname,
          NeptuneEndpointPort: neptuneCluster.clusterEndpoint.port.toString(),
          AWSRegion: this.region,
        },
      }
    );

    // Allow Lambda to connect to Neptune’s port
    neptuneCluster.connections.allowDefaultPortFrom(apiNestHandlerFunction);

    // API-Gateway that proxies the Lambda function
    const api = new apgw.RestApi(this, "BankAccountService-Api", {
      deploy: true,
      cloudWatchRole: true,
      deployOptions: {
        stageName: "v1",
        loggingLevel: apgw.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        accessLogDestination: new apgw.LogGroupLogDestination(
          new logs.LogGroup(this, "BankAccountService-Api-APIGWAccessLogs")
        ),
        accessLogFormat: apgw.AccessLogFormat.jsonWithStandardFields(),
      },
    });

    // Add a proxy integration targeting the lambda
    api.root.addProxy({
      defaultIntegration: new apgw.LambdaIntegration(apiNestHandlerFunction, {
        proxy: true,
      }),
    });
  }

  /**
   * This method creates a Lambda function to upsert default data into the Neptune database
   * when the Neptune cluster is created or updated.
   *
   * @param vpc - The VPC in which the Neptune cluster is deployed.
   * @param neptuneCluster - The Neptune database cluster.
   */
  private upsertDataAfterCreateOrUpdate(
    vpc: ec2.Vpc,
    neptuneCluster: neptune.DatabaseCluster
  ) {
    // Create a Lambda function to initialize the Neptune database with default data
    const initLambda = new lambda.Function(
      this,
      "BankAccountService-InitNeptuneLambda",
      {
        description: "Upserts default data into neptune db on create/update",
        code: lambda.Code.fromAsset(
          "../services/bankaccount-service-importdata/src"
        ),
        handler: "index.handler",
        runtime: lambda.Runtime.NODEJS_22_X,
        timeout: cdk.Duration.minutes(2),
        vpc,
      }
    );

    // Grant Lambda permission to run Gremlin queries with the neptune data API
    initLambda.role?.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ["neptunedata:ExecuteGremlinQuery"],
        resources: [
          `arn:aws:neptunedata:${this.region}:${this.account}:cluster:${neptuneCluster.clusterIdentifier}`,
        ],
      })
    );

    // Allow Lambda to connect to Neptune’s port if needed
    neptuneCluster.connections.allowDefaultPortFrom(initLambda);

    // Custom resource provider for lambda
    const provider = new cr.Provider(
      this,
      "BankAccountService-InitNeptuneProvider",
      {
        onEventHandler: initLambda,
      }
    );

    // Custom Resource to trigger the Lambda on create/update
    const initCustomResource = new cdk.CustomResource(
      this,
      "BankAccountService-InitNeptuneCustomResource",
      {
        serviceToken: provider.serviceToken,
        properties: {
          NeptuneEndpointHostname: neptuneCluster.clusterEndpoint.hostname,
          NeptuneEndpointPort: neptuneCluster.clusterEndpoint.port.toString(),
        },
      }
    );

    initCustomResource.node.addDependency(neptuneCluster);
  }
}
