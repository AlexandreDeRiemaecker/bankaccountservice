import {
  NeptunedataClient,
  ExecuteGremlinQueryCommand,
} from "@aws-sdk/client-neptunedata";
import { CloudFormationCustomResourceEvent } from "aws-lambda";
import { randomUUID } from 'crypto';

export const handler = async (event: CloudFormationCustomResourceEvent) => {
  const requestType = event.RequestType;

  if (requestType === "Delete") {
    console.log("Delete event - no action needed.");
    return { PhysicalResourceId: "InitNeptuneResource" };
  }
  if (requestType !== "Create" && requestType !== "Update") {
    console.log(`Unsupported event type: ${requestType}`);
    return { PhysicalResourceId: "InitNeptuneResource" };
  }

  if (
    !event.ResourceProperties.NeptuneEndpointHostname ||
    !event.ResourceProperties.NeptuneEndpointPort
  ) {
    throw new Error(
      "NeptuneEndpointHostname and NeptuneEndpointPort resource properties are required on the CloudFormationCustomResourceEvent"
    );
  }

  const region = process.env.AWS_REGION;
  const endpoint = `https://${event.ResourceProperties.NeptuneEndpointHostname}:${event.ResourceProperties.NeptuneEndpointPort}`;

  // choosing retry mode "adaptive" is mandatory here, as the neptune cluster can take quite 
  // some time to be actually reachable after creation
  const client = new NeptunedataClient({
    region,
    endpoint,
    retryMode: "adaptive",
  });

  try {
    console.log(`Inserting mock data using Neptune Data API (${endpoint})`);

    const gremlinQuery = `
    g
      // --- Upsert Person vertices ---
      .mergeV([(T.id): 'person-1'])
        .option(onCreate, [
          (T.label): 'Person',
          personId  : '${randomUUID()}',
          name      : 'Alice',
          email     : 'alice@example.com'
        ])
        .option(onMatch, [
          name  : 'Alice',
          email : 'alice@example.com'
        ])

      .mergeV([(T.id): 'person-2'])
        .option(onCreate, [
          (T.label): 'Person',
          personId  : '${randomUUID()}',
          name      : 'Bob',
          email     : 'bob@example.com'
        ])
        .option(onMatch, [
          name  : 'Bob',
          email : 'bob@example.com'
        ])

      .mergeV([(T.id): 'person-3'])
        .option(onCreate, [
          (T.label): 'Person',
          personId  : '${randomUUID()}',
          name      : 'Carol',
          email     : 'carol@example.com'
        ])
        .option(onMatch, [
          name  : 'Carol',
          email : 'carol@example.com'
        ])

      // --- Upsert BankAccount vertices ---
      .mergeV([(T.id): 'acc-1'])
        .option(onCreate, [
          (T.label)      : 'BankAccount',
          IBAN           : 'DE123',
          currentBalance : 1000
        ])
        .option(onMatch, [
          currentBalance : 1000
        ])

      .mergeV([(T.id): 'acc-2'])
        .option(onCreate, [
          (T.label)      : 'BankAccount',
          IBAN           : 'DE456',
          currentBalance : 2000
        ])
        .option(onMatch, [
          currentBalance : 2000
        ])

      // --- Upsert BankTransaction vertices ---
      .mergeV([(T.id): 'tx-1'])
        .option(onCreate, [
          (T.label)       : 'BankTransaction',
          transactionId   : 'tx1',
          otherPersonIBAN : 'DE999',
          amount          : -150
        ])
        .option(onMatch, [
          otherPersonIBAN : 'DE999',
          amount          : -150
        ])

      .mergeV([(T.id): 'tx-2'])
        .option(onCreate, [
          (T.label)       : 'BankTransaction',
          transactionId   : 'tx2',
          otherPersonIBAN : 'DE456',
          amount          : 300
        ])
        .option(onMatch, [
          otherPersonIBAN : 'DE456',
          amount          : 300
        ])

      // --- Upsert Edges ---
      // has_friend edges (bidirectional)
      .mergeE([(from)   : 'person-1', (to): 'person-2', (T.label): 'has_friend'])
      .mergeE([(from)   : 'person-2', (to): 'person-1', (T.label): 'has_friend'])
      .mergeE([(from)   : 'person-1', (to): 'person-3', (T.label): 'has_friend'])
      .mergeE([(from)   : 'person-3', (to): 'person-1', (T.label): 'has_friend'])
      .mergeE([(from)   : 'person-2', (to): 'person-3', (T.label): 'has_friend'])
      .mergeE([(from)   : 'person-3', (to): 'person-2', (T.label): 'has_friend'])

      // owns_account edges
      .mergeE([(from): 'person-1', (to): 'acc-1', (T.label): 'owns_account'])
      .mergeE([(from): 'person-2', (to): 'acc-2', (T.label): 'owns_account'])

      // has_transaction edges
      .mergeE([(from): 'acc-1', (to): 'tx-1', (T.label): 'has_transaction'])
      .mergeE([(from): 'acc-2', (to): 'tx-2', (T.label): 'has_transaction'])

      // Return just the IDs of inserted/matched elements
      .id()
    `;

    const response = await client.send(
      new ExecuteGremlinQueryCommand({
        gremlinQuery,
      })
    );

    console.log("Query response:", JSON.stringify(response, null, 2));
    return { PhysicalResourceId: "InitNeptuneResource" };
  } catch (error) {
    console.error("Error inserting mock data:", error);
    throw error;
  }
};
