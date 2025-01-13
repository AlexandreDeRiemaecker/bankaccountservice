import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";
import * as neptune from "@aws-cdk/aws-neptune-alpha";

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
  }
}
