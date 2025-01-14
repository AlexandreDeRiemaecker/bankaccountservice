import { CloudFormationCustomResourceEvent } from "aws-lambda";
export declare const handler: (event: CloudFormationCustomResourceEvent) => Promise<{
    PhysicalResourceId: string;
}>;
