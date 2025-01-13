"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_neptunedata_1 = require("@aws-sdk/client-neptunedata");
const handler = async (event) => {
    const requestType = event.RequestType;
    if (requestType === "Delete") {
        console.log("Delete event - no action needed.");
        return { PhysicalResourceId: "InitNeptuneResource" };
    }
    if (requestType !== "Create" && requestType !== "Update") {
        console.log(`Unsupported event type: ${requestType}`);
        return { PhysicalResourceId: "InitNeptuneResource" };
    }
    if (!event.ResourceProperties.NeptuneEndpointHostname ||
        !event.ResourceProperties.NeptuneEndpointPort) {
        throw new Error("NeptuneEndpointHostname and NeptuneEndpointPort resource properties are required on the CloudFormationCustomResourceEvent");
    }
    const region = process.env.AWS_REGION;
    const endpoint = `https://${event.ResourceProperties.NeptuneEndpointHostname}:${event.ResourceProperties.NeptuneEndpointPort}`;
    // choosing retry mode "adaptive" is mandatory here, as the neptune cluster can take quite 
    // some time to be actually reachable after creation
    const client = new client_neptunedata_1.NeptunedataClient({
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
          personId  : '1',
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
          personId  : '2',
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
          personId  : '3',
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
        const response = await client.send(new client_neptunedata_1.ExecuteGremlinQueryCommand({
            gremlinQuery,
        }));
        console.log("Query response:", JSON.stringify(response, null, 2));
        return { PhysicalResourceId: "InitNeptuneResource" };
    }
    catch (error) {
        console.error("Error inserting mock data:", error);
        throw error;
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvRUFHcUM7QUFHOUIsTUFBTSxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQXdDLEVBQUUsRUFBRTtJQUN4RSxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDO0lBRXRDLElBQUksV0FBVyxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzdCLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUNoRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUscUJBQXFCLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBQ0QsSUFBSSxXQUFXLEtBQUssUUFBUSxJQUFJLFdBQVcsS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUN6RCxPQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixXQUFXLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxxQkFBcUIsRUFBRSxDQUFDO0lBQ3ZELENBQUM7SUFFRCxJQUNFLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHVCQUF1QjtRQUNqRCxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxtQkFBbUIsRUFDN0MsQ0FBQztRQUNELE1BQU0sSUFBSSxLQUFLLENBQ2IsMkhBQTJILENBQzVILENBQUM7SUFDSixDQUFDO0lBRUQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUM7SUFDdEMsTUFBTSxRQUFRLEdBQUcsV0FBVyxLQUFLLENBQUMsa0JBQWtCLENBQUMsdUJBQXVCLElBQUksS0FBSyxDQUFDLGtCQUFrQixDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFFL0gsMkZBQTJGO0lBQzNGLG9EQUFvRDtJQUNwRCxNQUFNLE1BQU0sR0FBRyxJQUFJLHNDQUFpQixDQUFDO1FBQ25DLE1BQU07UUFDTixRQUFRO1FBQ1IsU0FBUyxFQUFFLFVBQVU7S0FDdEIsQ0FBQyxDQUFDO0lBRUgsSUFBSSxDQUFDO1FBQ0gsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQ0FBK0MsUUFBUSxHQUFHLENBQUMsQ0FBQztRQUV4RSxNQUFNLFlBQVksR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7S0F3R3BCLENBQUM7UUFFRixNQUFNLFFBQVEsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQ2hDLElBQUksK0NBQTBCLENBQUM7WUFDN0IsWUFBWTtTQUNiLENBQUMsQ0FDSCxDQUFDO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUscUJBQXFCLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsNEJBQTRCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDbkQsTUFBTSxLQUFLLENBQUM7SUFDZCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBekpXLFFBQUEsT0FBTyxXQXlKbEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBOZXB0dW5lZGF0YUNsaWVudCxcbiAgRXhlY3V0ZUdyZW1saW5RdWVyeUNvbW1hbmQsXG59IGZyb20gXCJAYXdzLXNkay9jbGllbnQtbmVwdHVuZWRhdGFcIjtcbmltcG9ydCB7IENsb3VkRm9ybWF0aW9uQ3VzdG9tUmVzb3VyY2VFdmVudCB9IGZyb20gXCJhd3MtbGFtYmRhXCI7XG5cbmV4cG9ydCBjb25zdCBoYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBDbG91ZEZvcm1hdGlvbkN1c3RvbVJlc291cmNlRXZlbnQpID0+IHtcbiAgY29uc3QgcmVxdWVzdFR5cGUgPSBldmVudC5SZXF1ZXN0VHlwZTtcblxuICBpZiAocmVxdWVzdFR5cGUgPT09IFwiRGVsZXRlXCIpIHtcbiAgICBjb25zb2xlLmxvZyhcIkRlbGV0ZSBldmVudCAtIG5vIGFjdGlvbiBuZWVkZWQuXCIpO1xuICAgIHJldHVybiB7IFBoeXNpY2FsUmVzb3VyY2VJZDogXCJJbml0TmVwdHVuZVJlc291cmNlXCIgfTtcbiAgfVxuICBpZiAocmVxdWVzdFR5cGUgIT09IFwiQ3JlYXRlXCIgJiYgcmVxdWVzdFR5cGUgIT09IFwiVXBkYXRlXCIpIHtcbiAgICBjb25zb2xlLmxvZyhgVW5zdXBwb3J0ZWQgZXZlbnQgdHlwZTogJHtyZXF1ZXN0VHlwZX1gKTtcbiAgICByZXR1cm4geyBQaHlzaWNhbFJlc291cmNlSWQ6IFwiSW5pdE5lcHR1bmVSZXNvdXJjZVwiIH07XG4gIH1cblxuICBpZiAoXG4gICAgIWV2ZW50LlJlc291cmNlUHJvcGVydGllcy5OZXB0dW5lRW5kcG9pbnRIb3N0bmFtZSB8fFxuICAgICFldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuTmVwdHVuZUVuZHBvaW50UG9ydFxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIk5lcHR1bmVFbmRwb2ludEhvc3RuYW1lIGFuZCBOZXB0dW5lRW5kcG9pbnRQb3J0IHJlc291cmNlIHByb3BlcnRpZXMgYXJlIHJlcXVpcmVkIG9uIHRoZSBDbG91ZEZvcm1hdGlvbkN1c3RvbVJlc291cmNlRXZlbnRcIlxuICAgICk7XG4gIH1cblxuICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OO1xuICBjb25zdCBlbmRwb2ludCA9IGBodHRwczovLyR7ZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLk5lcHR1bmVFbmRwb2ludEhvc3RuYW1lfToke2V2ZW50LlJlc291cmNlUHJvcGVydGllcy5OZXB0dW5lRW5kcG9pbnRQb3J0fWA7XG5cbiAgLy8gY2hvb3NpbmcgcmV0cnkgbW9kZSBcImFkYXB0aXZlXCIgaXMgbWFuZGF0b3J5IGhlcmUsIGFzIHRoZSBuZXB0dW5lIGNsdXN0ZXIgY2FuIHRha2UgcXVpdGUgXG4gIC8vIHNvbWUgdGltZSB0byBiZSBhY3R1YWxseSByZWFjaGFibGUgYWZ0ZXIgY3JlYXRpb25cbiAgY29uc3QgY2xpZW50ID0gbmV3IE5lcHR1bmVkYXRhQ2xpZW50KHtcbiAgICByZWdpb24sXG4gICAgZW5kcG9pbnQsXG4gICAgcmV0cnlNb2RlOiBcImFkYXB0aXZlXCIsXG4gIH0pO1xuXG4gIHRyeSB7XG4gICAgY29uc29sZS5sb2coYEluc2VydGluZyBtb2NrIGRhdGEgdXNpbmcgTmVwdHVuZSBEYXRhIEFQSSAoJHtlbmRwb2ludH0pYCk7XG5cbiAgICBjb25zdCBncmVtbGluUXVlcnkgPSBgXG4gICAgZ1xuICAgICAgLy8gLS0tIFVwc2VydCBQZXJzb24gdmVydGljZXMgLS0tXG4gICAgICAubWVyZ2VWKFsoVC5pZCk6ICdwZXJzb24tMSddKVxuICAgICAgICAub3B0aW9uKG9uQ3JlYXRlLCBbXG4gICAgICAgICAgKFQubGFiZWwpOiAnUGVyc29uJyxcbiAgICAgICAgICBwZXJzb25JZCAgOiAnMScsXG4gICAgICAgICAgbmFtZSAgICAgIDogJ0FsaWNlJyxcbiAgICAgICAgICBlbWFpbCAgICAgOiAnYWxpY2VAZXhhbXBsZS5jb20nXG4gICAgICAgIF0pXG4gICAgICAgIC5vcHRpb24ob25NYXRjaCwgW1xuICAgICAgICAgIG5hbWUgIDogJ0FsaWNlJyxcbiAgICAgICAgICBlbWFpbCA6ICdhbGljZUBleGFtcGxlLmNvbSdcbiAgICAgICAgXSlcblxuICAgICAgLm1lcmdlVihbKFQuaWQpOiAncGVyc29uLTInXSlcbiAgICAgICAgLm9wdGlvbihvbkNyZWF0ZSwgW1xuICAgICAgICAgIChULmxhYmVsKTogJ1BlcnNvbicsXG4gICAgICAgICAgcGVyc29uSWQgIDogJzInLFxuICAgICAgICAgIG5hbWUgICAgICA6ICdCb2InLFxuICAgICAgICAgIGVtYWlsICAgICA6ICdib2JAZXhhbXBsZS5jb20nXG4gICAgICAgIF0pXG4gICAgICAgIC5vcHRpb24ob25NYXRjaCwgW1xuICAgICAgICAgIG5hbWUgIDogJ0JvYicsXG4gICAgICAgICAgZW1haWwgOiAnYm9iQGV4YW1wbGUuY29tJ1xuICAgICAgICBdKVxuXG4gICAgICAubWVyZ2VWKFsoVC5pZCk6ICdwZXJzb24tMyddKVxuICAgICAgICAub3B0aW9uKG9uQ3JlYXRlLCBbXG4gICAgICAgICAgKFQubGFiZWwpOiAnUGVyc29uJyxcbiAgICAgICAgICBwZXJzb25JZCAgOiAnMycsXG4gICAgICAgICAgbmFtZSAgICAgIDogJ0Nhcm9sJyxcbiAgICAgICAgICBlbWFpbCAgICAgOiAnY2Fyb2xAZXhhbXBsZS5jb20nXG4gICAgICAgIF0pXG4gICAgICAgIC5vcHRpb24ob25NYXRjaCwgW1xuICAgICAgICAgIG5hbWUgIDogJ0Nhcm9sJyxcbiAgICAgICAgICBlbWFpbCA6ICdjYXJvbEBleGFtcGxlLmNvbSdcbiAgICAgICAgXSlcblxuICAgICAgLy8gLS0tIFVwc2VydCBCYW5rQWNjb3VudCB2ZXJ0aWNlcyAtLS1cbiAgICAgIC5tZXJnZVYoWyhULmlkKTogJ2FjYy0xJ10pXG4gICAgICAgIC5vcHRpb24ob25DcmVhdGUsIFtcbiAgICAgICAgICAoVC5sYWJlbCkgICAgICA6ICdCYW5rQWNjb3VudCcsXG4gICAgICAgICAgSUJBTiAgICAgICAgICAgOiAnREUxMjMnLFxuICAgICAgICAgIGN1cnJlbnRCYWxhbmNlIDogMTAwMFxuICAgICAgICBdKVxuICAgICAgICAub3B0aW9uKG9uTWF0Y2gsIFtcbiAgICAgICAgICBjdXJyZW50QmFsYW5jZSA6IDEwMDBcbiAgICAgICAgXSlcblxuICAgICAgLm1lcmdlVihbKFQuaWQpOiAnYWNjLTInXSlcbiAgICAgICAgLm9wdGlvbihvbkNyZWF0ZSwgW1xuICAgICAgICAgIChULmxhYmVsKSAgICAgIDogJ0JhbmtBY2NvdW50JyxcbiAgICAgICAgICBJQkFOICAgICAgICAgICA6ICdERTQ1NicsXG4gICAgICAgICAgY3VycmVudEJhbGFuY2UgOiAyMDAwXG4gICAgICAgIF0pXG4gICAgICAgIC5vcHRpb24ob25NYXRjaCwgW1xuICAgICAgICAgIGN1cnJlbnRCYWxhbmNlIDogMjAwMFxuICAgICAgICBdKVxuXG4gICAgICAvLyAtLS0gVXBzZXJ0IEJhbmtUcmFuc2FjdGlvbiB2ZXJ0aWNlcyAtLS1cbiAgICAgIC5tZXJnZVYoWyhULmlkKTogJ3R4LTEnXSlcbiAgICAgICAgLm9wdGlvbihvbkNyZWF0ZSwgW1xuICAgICAgICAgIChULmxhYmVsKSAgICAgICA6ICdCYW5rVHJhbnNhY3Rpb24nLFxuICAgICAgICAgIHRyYW5zYWN0aW9uSWQgICA6ICd0eDEnLFxuICAgICAgICAgIG90aGVyUGVyc29uSUJBTiA6ICdERTk5OScsXG4gICAgICAgICAgYW1vdW50ICAgICAgICAgIDogLTE1MFxuICAgICAgICBdKVxuICAgICAgICAub3B0aW9uKG9uTWF0Y2gsIFtcbiAgICAgICAgICBvdGhlclBlcnNvbklCQU4gOiAnREU5OTknLFxuICAgICAgICAgIGFtb3VudCAgICAgICAgICA6IC0xNTBcbiAgICAgICAgXSlcblxuICAgICAgLm1lcmdlVihbKFQuaWQpOiAndHgtMiddKVxuICAgICAgICAub3B0aW9uKG9uQ3JlYXRlLCBbXG4gICAgICAgICAgKFQubGFiZWwpICAgICAgIDogJ0JhbmtUcmFuc2FjdGlvbicsXG4gICAgICAgICAgdHJhbnNhY3Rpb25JZCAgIDogJ3R4MicsXG4gICAgICAgICAgb3RoZXJQZXJzb25JQkFOIDogJ0RFNDU2JyxcbiAgICAgICAgICBhbW91bnQgICAgICAgICAgOiAzMDBcbiAgICAgICAgXSlcbiAgICAgICAgLm9wdGlvbihvbk1hdGNoLCBbXG4gICAgICAgICAgb3RoZXJQZXJzb25JQkFOIDogJ0RFNDU2JyxcbiAgICAgICAgICBhbW91bnQgICAgICAgICAgOiAzMDBcbiAgICAgICAgXSlcblxuICAgICAgLy8gLS0tIFVwc2VydCBFZGdlcyAtLS1cbiAgICAgIC8vIGhhc19mcmllbmQgZWRnZXMgKGJpZGlyZWN0aW9uYWwpXG4gICAgICAubWVyZ2VFKFsoZnJvbSkgICA6ICdwZXJzb24tMScsICh0byk6ICdwZXJzb24tMicsIChULmxhYmVsKTogJ2hhc19mcmllbmQnXSlcbiAgICAgIC5tZXJnZUUoWyhmcm9tKSAgIDogJ3BlcnNvbi0yJywgKHRvKTogJ3BlcnNvbi0xJywgKFQubGFiZWwpOiAnaGFzX2ZyaWVuZCddKVxuICAgICAgLm1lcmdlRShbKGZyb20pICAgOiAncGVyc29uLTEnLCAodG8pOiAncGVyc29uLTMnLCAoVC5sYWJlbCk6ICdoYXNfZnJpZW5kJ10pXG4gICAgICAubWVyZ2VFKFsoZnJvbSkgICA6ICdwZXJzb24tMycsICh0byk6ICdwZXJzb24tMScsIChULmxhYmVsKTogJ2hhc19mcmllbmQnXSlcbiAgICAgIC5tZXJnZUUoWyhmcm9tKSAgIDogJ3BlcnNvbi0yJywgKHRvKTogJ3BlcnNvbi0zJywgKFQubGFiZWwpOiAnaGFzX2ZyaWVuZCddKVxuICAgICAgLm1lcmdlRShbKGZyb20pICAgOiAncGVyc29uLTMnLCAodG8pOiAncGVyc29uLTInLCAoVC5sYWJlbCk6ICdoYXNfZnJpZW5kJ10pXG5cbiAgICAgIC8vIG93bnNfYWNjb3VudCBlZGdlc1xuICAgICAgLm1lcmdlRShbKGZyb20pOiAncGVyc29uLTEnLCAodG8pOiAnYWNjLTEnLCAoVC5sYWJlbCk6ICdvd25zX2FjY291bnQnXSlcbiAgICAgIC5tZXJnZUUoWyhmcm9tKTogJ3BlcnNvbi0yJywgKHRvKTogJ2FjYy0yJywgKFQubGFiZWwpOiAnb3duc19hY2NvdW50J10pXG5cbiAgICAgIC8vIGhhc190cmFuc2FjdGlvbiBlZGdlc1xuICAgICAgLm1lcmdlRShbKGZyb20pOiAnYWNjLTEnLCAodG8pOiAndHgtMScsIChULmxhYmVsKTogJ2hhc190cmFuc2FjdGlvbiddKVxuICAgICAgLm1lcmdlRShbKGZyb20pOiAnYWNjLTInLCAodG8pOiAndHgtMicsIChULmxhYmVsKTogJ2hhc190cmFuc2FjdGlvbiddKVxuXG4gICAgICAvLyBSZXR1cm4ganVzdCB0aGUgSURzIG9mIGluc2VydGVkL21hdGNoZWQgZWxlbWVudHNcbiAgICAgIC5pZCgpXG4gICAgYDtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2xpZW50LnNlbmQoXG4gICAgICBuZXcgRXhlY3V0ZUdyZW1saW5RdWVyeUNvbW1hbmQoe1xuICAgICAgICBncmVtbGluUXVlcnksXG4gICAgICB9KVxuICAgICk7XG5cbiAgICBjb25zb2xlLmxvZyhcIlF1ZXJ5IHJlc3BvbnNlOlwiLCBKU09OLnN0cmluZ2lmeShyZXNwb25zZSwgbnVsbCwgMikpO1xuICAgIHJldHVybiB7IFBoeXNpY2FsUmVzb3VyY2VJZDogXCJJbml0TmVwdHVuZVJlc291cmNlXCIgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgaW5zZXJ0aW5nIG1vY2sgZGF0YTpcIiwgZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuIl19