#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { InfrastructureStack } from "../lib/infrastructure-stack";
import { execSync } from "child_process";

function executeGitCommand(command: string): string {
  return execSync(command, { encoding: "utf-8" }).trim();
}

const BRANCH: string = executeGitCommand("git branch --show-current");

const app = new cdk.App();
const branchName = BRANCH;

if (!BRANCH || BRANCH.trim().length == 0) {
  throw new Error(
    "Branch name could not be determined via 'git branch --show-current'"
  );
}

new InfrastructureStack(app, `BankAccountService-${BRANCH}`, {
  description: `Infrastructure stack for branch ${branchName} of the BankAccountService project (https://github.com/AlexandreDeRiemaecker/bankaccountservice)`,
  tags: {
    Project: "AccountBalanceService",
    Branch: branchName,
  },
});
