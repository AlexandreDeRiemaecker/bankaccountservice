"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_neptunedata_1 = require("@aws-sdk/client-neptunedata");
const crypto_1 = require("crypto");
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
          personId  : '${(0, crypto_1.randomUUID)()}',
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
          personId  : '${(0, crypto_1.randomUUID)()}',
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
          personId  : '${(0, crypto_1.randomUUID)()}',
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
          IBAN           : 'DE89370400440532013000',
          currentBalance : 1000
        ])
        .option(onMatch, [
          currentBalance : 1000
        ])

      .mergeV([(T.id): 'acc-2'])
        .option(onCreate, [
          (T.label)      : 'BankAccount',
          IBAN           : 'DE89370400440532013001',
          currentBalance : 2000
        ])
        .option(onMatch, [
          currentBalance : 2000
        ])

      // --- Upsert BankTransaction vertices ---
      .mergeV([(T.id): 'tx-1'])
        .option(onCreate, [
          (T.label)       : 'BankTransaction',
          transactionId   : '${(0, crypto_1.randomUUID)()}',
          otherPersonIBAN : 'DE89370400440532013002',
          amount          : 150
        ])
        .option(onMatch, [
          otherPersonIBAN : 'DE89370400440532013002',
          amount          : 300
        ])

      .mergeV([(T.id): 'tx-2'])
        .option(onCreate, [
          (T.label)       : 'BankTransaction',
          transactionId   : '${(0, crypto_1.randomUUID)()}',
          otherPersonIBAN : 'DE89370400440532013001',
          amount          : 300
        ])
        .option(onMatch, [
          otherPersonIBAN : 'DE89370400440532013001',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvRUFHcUM7QUFFckMsbUNBQW9DO0FBRTdCLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxLQUF3QyxFQUFFLEVBQUU7SUFDeEUsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztJQUV0QyxJQUFJLFdBQVcsS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7UUFDaEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLHFCQUFxQixFQUFFLENBQUM7SUFDdkQsQ0FBQztJQUNELElBQUksV0FBVyxLQUFLLFFBQVEsSUFBSSxXQUFXLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDekQsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUN0RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUscUJBQXFCLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBRUQsSUFDRSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyx1QkFBdUI7UUFDakQsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsbUJBQW1CLEVBQzdDLENBQUM7UUFDRCxNQUFNLElBQUksS0FBSyxDQUNiLDJIQUEySCxDQUM1SCxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO0lBQ3RDLE1BQU0sUUFBUSxHQUFHLFdBQVcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHVCQUF1QixJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBRS9ILDBGQUEwRjtJQUMxRixvREFBb0Q7SUFDcEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxzQ0FBaUIsQ0FBQztRQUNuQyxNQUFNO1FBQ04sUUFBUTtRQUNSLFNBQVMsRUFBRSxVQUFVO0tBQ3RCLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsK0NBQStDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFFeEUsTUFBTSxZQUFZLEdBQUc7Ozs7Ozt5QkFNQSxJQUFBLG1CQUFVLEdBQUU7Ozs7Ozs7Ozs7Ozt5QkFZWixJQUFBLG1CQUFVLEdBQUU7Ozs7Ozs7Ozs7Ozt5QkFZWixJQUFBLG1CQUFVLEdBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7K0JBa0NOLElBQUEsbUJBQVUsR0FBRTs7Ozs7Ozs7Ozs7OytCQVlaLElBQUEsbUJBQVUsR0FBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQTRCdEMsQ0FBQztRQUVGLE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FDaEMsSUFBSSwrQ0FBMEIsQ0FBQztZQUM3QixZQUFZO1NBQ2IsQ0FBQyxDQUNILENBQUM7UUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxxQkFBcUIsRUFBRSxDQUFDO0lBQ3ZELENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuRCxNQUFNLEtBQUssQ0FBQztJQUNkLENBQUM7QUFDSCxDQUFDLENBQUM7QUF6SlcsUUFBQSxPQUFPLFdBeUpsQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIE5lcHR1bmVkYXRhQ2xpZW50LFxuICBFeGVjdXRlR3JlbWxpblF1ZXJ5Q29tbWFuZCxcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1uZXB0dW5lZGF0YVwiO1xuaW1wb3J0IHsgQ2xvdWRGb3JtYXRpb25DdXN0b21SZXNvdXJjZUV2ZW50IH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcbmltcG9ydCB7IHJhbmRvbVVVSUQgfSBmcm9tIFwiY3J5cHRvXCI7XG5cbmV4cG9ydCBjb25zdCBoYW5kbGVyID0gYXN5bmMgKGV2ZW50OiBDbG91ZEZvcm1hdGlvbkN1c3RvbVJlc291cmNlRXZlbnQpID0+IHtcbiAgY29uc3QgcmVxdWVzdFR5cGUgPSBldmVudC5SZXF1ZXN0VHlwZTtcblxuICBpZiAocmVxdWVzdFR5cGUgPT09IFwiRGVsZXRlXCIpIHtcbiAgICBjb25zb2xlLmxvZyhcIkRlbGV0ZSBldmVudCAtIG5vIGFjdGlvbiBuZWVkZWQuXCIpO1xuICAgIHJldHVybiB7IFBoeXNpY2FsUmVzb3VyY2VJZDogXCJJbml0TmVwdHVuZVJlc291cmNlXCIgfTtcbiAgfVxuICBpZiAocmVxdWVzdFR5cGUgIT09IFwiQ3JlYXRlXCIgJiYgcmVxdWVzdFR5cGUgIT09IFwiVXBkYXRlXCIpIHtcbiAgICBjb25zb2xlLmxvZyhgVW5zdXBwb3J0ZWQgZXZlbnQgdHlwZTogJHtyZXF1ZXN0VHlwZX1gKTtcbiAgICByZXR1cm4geyBQaHlzaWNhbFJlc291cmNlSWQ6IFwiSW5pdE5lcHR1bmVSZXNvdXJjZVwiIH07XG4gIH1cblxuICBpZiAoXG4gICAgIWV2ZW50LlJlc291cmNlUHJvcGVydGllcy5OZXB0dW5lRW5kcG9pbnRIb3N0bmFtZSB8fFxuICAgICFldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuTmVwdHVuZUVuZHBvaW50UG9ydFxuICApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBcIk5lcHR1bmVFbmRwb2ludEhvc3RuYW1lIGFuZCBOZXB0dW5lRW5kcG9pbnRQb3J0IHJlc291cmNlIHByb3BlcnRpZXMgYXJlIHJlcXVpcmVkIG9uIHRoZSBDbG91ZEZvcm1hdGlvbkN1c3RvbVJlc291cmNlRXZlbnRcIlxuICAgICk7XG4gIH1cblxuICBjb25zdCByZWdpb24gPSBwcm9jZXNzLmVudi5BV1NfUkVHSU9OO1xuICBjb25zdCBlbmRwb2ludCA9IGBodHRwczovLyR7ZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLk5lcHR1bmVFbmRwb2ludEhvc3RuYW1lfToke2V2ZW50LlJlc291cmNlUHJvcGVydGllcy5OZXB0dW5lRW5kcG9pbnRQb3J0fWA7XG5cbiAgLy8gY2hvb3NpbmcgcmV0cnkgbW9kZSBcImFkYXB0aXZlXCIgaXMgbWFuZGF0b3J5IGhlcmUsIGFzIHRoZSBuZXB0dW5lIGNsdXN0ZXIgY2FuIHRha2UgcXVpdGVcbiAgLy8gc29tZSB0aW1lIHRvIGJlIGFjdHVhbGx5IHJlYWNoYWJsZSBhZnRlciBjcmVhdGlvblxuICBjb25zdCBjbGllbnQgPSBuZXcgTmVwdHVuZWRhdGFDbGllbnQoe1xuICAgIHJlZ2lvbixcbiAgICBlbmRwb2ludCxcbiAgICByZXRyeU1vZGU6IFwiYWRhcHRpdmVcIixcbiAgfSk7XG5cbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZyhgSW5zZXJ0aW5nIG1vY2sgZGF0YSB1c2luZyBOZXB0dW5lIERhdGEgQVBJICgke2VuZHBvaW50fSlgKTtcblxuICAgIGNvbnN0IGdyZW1saW5RdWVyeSA9IGBcbiAgICBnXG4gICAgICAvLyAtLS0gVXBzZXJ0IFBlcnNvbiB2ZXJ0aWNlcyAtLS1cbiAgICAgIC5tZXJnZVYoWyhULmlkKTogJ3BlcnNvbi0xJ10pXG4gICAgICAgIC5vcHRpb24ob25DcmVhdGUsIFtcbiAgICAgICAgICAoVC5sYWJlbCk6ICdQZXJzb24nLFxuICAgICAgICAgIHBlcnNvbklkICA6ICcke3JhbmRvbVVVSUQoKX0nLFxuICAgICAgICAgIG5hbWUgICAgICA6ICdBbGljZScsXG4gICAgICAgICAgZW1haWwgICAgIDogJ2FsaWNlQGV4YW1wbGUuY29tJ1xuICAgICAgICBdKVxuICAgICAgICAub3B0aW9uKG9uTWF0Y2gsIFtcbiAgICAgICAgICBuYW1lICA6ICdBbGljZScsXG4gICAgICAgICAgZW1haWwgOiAnYWxpY2VAZXhhbXBsZS5jb20nXG4gICAgICAgIF0pXG5cbiAgICAgIC5tZXJnZVYoWyhULmlkKTogJ3BlcnNvbi0yJ10pXG4gICAgICAgIC5vcHRpb24ob25DcmVhdGUsIFtcbiAgICAgICAgICAoVC5sYWJlbCk6ICdQZXJzb24nLFxuICAgICAgICAgIHBlcnNvbklkICA6ICcke3JhbmRvbVVVSUQoKX0nLFxuICAgICAgICAgIG5hbWUgICAgICA6ICdCb2InLFxuICAgICAgICAgIGVtYWlsICAgICA6ICdib2JAZXhhbXBsZS5jb20nXG4gICAgICAgIF0pXG4gICAgICAgIC5vcHRpb24ob25NYXRjaCwgW1xuICAgICAgICAgIG5hbWUgIDogJ0JvYicsXG4gICAgICAgICAgZW1haWwgOiAnYm9iQGV4YW1wbGUuY29tJ1xuICAgICAgICBdKVxuXG4gICAgICAubWVyZ2VWKFsoVC5pZCk6ICdwZXJzb24tMyddKVxuICAgICAgICAub3B0aW9uKG9uQ3JlYXRlLCBbXG4gICAgICAgICAgKFQubGFiZWwpOiAnUGVyc29uJyxcbiAgICAgICAgICBwZXJzb25JZCAgOiAnJHtyYW5kb21VVUlEKCl9JyxcbiAgICAgICAgICBuYW1lICAgICAgOiAnQ2Fyb2wnLFxuICAgICAgICAgIGVtYWlsICAgICA6ICdjYXJvbEBleGFtcGxlLmNvbSdcbiAgICAgICAgXSlcbiAgICAgICAgLm9wdGlvbihvbk1hdGNoLCBbXG4gICAgICAgICAgbmFtZSAgOiAnQ2Fyb2wnLFxuICAgICAgICAgIGVtYWlsIDogJ2Nhcm9sQGV4YW1wbGUuY29tJ1xuICAgICAgICBdKVxuXG4gICAgICAvLyAtLS0gVXBzZXJ0IEJhbmtBY2NvdW50IHZlcnRpY2VzIC0tLVxuICAgICAgLm1lcmdlVihbKFQuaWQpOiAnYWNjLTEnXSlcbiAgICAgICAgLm9wdGlvbihvbkNyZWF0ZSwgW1xuICAgICAgICAgIChULmxhYmVsKSAgICAgIDogJ0JhbmtBY2NvdW50JyxcbiAgICAgICAgICBJQkFOICAgICAgICAgICA6ICdERTg5MzcwNDAwNDQwNTMyMDEzMDAwJyxcbiAgICAgICAgICBjdXJyZW50QmFsYW5jZSA6IDEwMDBcbiAgICAgICAgXSlcbiAgICAgICAgLm9wdGlvbihvbk1hdGNoLCBbXG4gICAgICAgICAgY3VycmVudEJhbGFuY2UgOiAxMDAwXG4gICAgICAgIF0pXG5cbiAgICAgIC5tZXJnZVYoWyhULmlkKTogJ2FjYy0yJ10pXG4gICAgICAgIC5vcHRpb24ob25DcmVhdGUsIFtcbiAgICAgICAgICAoVC5sYWJlbCkgICAgICA6ICdCYW5rQWNjb3VudCcsXG4gICAgICAgICAgSUJBTiAgICAgICAgICAgOiAnREU4OTM3MDQwMDQ0MDUzMjAxMzAwMScsXG4gICAgICAgICAgY3VycmVudEJhbGFuY2UgOiAyMDAwXG4gICAgICAgIF0pXG4gICAgICAgIC5vcHRpb24ob25NYXRjaCwgW1xuICAgICAgICAgIGN1cnJlbnRCYWxhbmNlIDogMjAwMFxuICAgICAgICBdKVxuXG4gICAgICAvLyAtLS0gVXBzZXJ0IEJhbmtUcmFuc2FjdGlvbiB2ZXJ0aWNlcyAtLS1cbiAgICAgIC5tZXJnZVYoWyhULmlkKTogJ3R4LTEnXSlcbiAgICAgICAgLm9wdGlvbihvbkNyZWF0ZSwgW1xuICAgICAgICAgIChULmxhYmVsKSAgICAgICA6ICdCYW5rVHJhbnNhY3Rpb24nLFxuICAgICAgICAgIHRyYW5zYWN0aW9uSWQgICA6ICcke3JhbmRvbVVVSUQoKX0nLFxuICAgICAgICAgIG90aGVyUGVyc29uSUJBTiA6ICdERTg5MzcwNDAwNDQwNTMyMDEzMDAyJyxcbiAgICAgICAgICBhbW91bnQgICAgICAgICAgOiAxNTBcbiAgICAgICAgXSlcbiAgICAgICAgLm9wdGlvbihvbk1hdGNoLCBbXG4gICAgICAgICAgb3RoZXJQZXJzb25JQkFOIDogJ0RFODkzNzA0MDA0NDA1MzIwMTMwMDInLFxuICAgICAgICAgIGFtb3VudCAgICAgICAgICA6IDMwMFxuICAgICAgICBdKVxuXG4gICAgICAubWVyZ2VWKFsoVC5pZCk6ICd0eC0yJ10pXG4gICAgICAgIC5vcHRpb24ob25DcmVhdGUsIFtcbiAgICAgICAgICAoVC5sYWJlbCkgICAgICAgOiAnQmFua1RyYW5zYWN0aW9uJyxcbiAgICAgICAgICB0cmFuc2FjdGlvbklkICAgOiAnJHtyYW5kb21VVUlEKCl9JyxcbiAgICAgICAgICBvdGhlclBlcnNvbklCQU4gOiAnREU4OTM3MDQwMDQ0MDUzMjAxMzAwMScsXG4gICAgICAgICAgYW1vdW50ICAgICAgICAgIDogMzAwXG4gICAgICAgIF0pXG4gICAgICAgIC5vcHRpb24ob25NYXRjaCwgW1xuICAgICAgICAgIG90aGVyUGVyc29uSUJBTiA6ICdERTg5MzcwNDAwNDQwNTMyMDEzMDAxJyxcbiAgICAgICAgICBhbW91bnQgICAgICAgICAgOiAzMDBcbiAgICAgICAgXSlcblxuICAgICAgLy8gLS0tIFVwc2VydCBFZGdlcyAtLS1cbiAgICAgIC8vIGhhc19mcmllbmQgZWRnZXMgKGJpZGlyZWN0aW9uYWwpXG4gICAgICAubWVyZ2VFKFsoZnJvbSkgICA6ICdwZXJzb24tMScsICh0byk6ICdwZXJzb24tMicsIChULmxhYmVsKTogJ2hhc19mcmllbmQnXSlcbiAgICAgIC5tZXJnZUUoWyhmcm9tKSAgIDogJ3BlcnNvbi0yJywgKHRvKTogJ3BlcnNvbi0xJywgKFQubGFiZWwpOiAnaGFzX2ZyaWVuZCddKVxuICAgICAgLm1lcmdlRShbKGZyb20pICAgOiAncGVyc29uLTEnLCAodG8pOiAncGVyc29uLTMnLCAoVC5sYWJlbCk6ICdoYXNfZnJpZW5kJ10pXG4gICAgICAubWVyZ2VFKFsoZnJvbSkgICA6ICdwZXJzb24tMycsICh0byk6ICdwZXJzb24tMScsIChULmxhYmVsKTogJ2hhc19mcmllbmQnXSlcbiAgICAgIC5tZXJnZUUoWyhmcm9tKSAgIDogJ3BlcnNvbi0yJywgKHRvKTogJ3BlcnNvbi0zJywgKFQubGFiZWwpOiAnaGFzX2ZyaWVuZCddKVxuICAgICAgLm1lcmdlRShbKGZyb20pICAgOiAncGVyc29uLTMnLCAodG8pOiAncGVyc29uLTInLCAoVC5sYWJlbCk6ICdoYXNfZnJpZW5kJ10pXG5cbiAgICAgIC8vIG93bnNfYWNjb3VudCBlZGdlc1xuICAgICAgLm1lcmdlRShbKGZyb20pOiAncGVyc29uLTEnLCAodG8pOiAnYWNjLTEnLCAoVC5sYWJlbCk6ICdvd25zX2FjY291bnQnXSlcbiAgICAgIC5tZXJnZUUoWyhmcm9tKTogJ3BlcnNvbi0yJywgKHRvKTogJ2FjYy0yJywgKFQubGFiZWwpOiAnb3duc19hY2NvdW50J10pXG5cbiAgICAgIC8vIGhhc190cmFuc2FjdGlvbiBlZGdlc1xuICAgICAgLm1lcmdlRShbKGZyb20pOiAnYWNjLTEnLCAodG8pOiAndHgtMScsIChULmxhYmVsKTogJ2hhc190cmFuc2FjdGlvbiddKVxuICAgICAgLm1lcmdlRShbKGZyb20pOiAnYWNjLTInLCAodG8pOiAndHgtMicsIChULmxhYmVsKTogJ2hhc190cmFuc2FjdGlvbiddKVxuXG4gICAgICAvLyBSZXR1cm4ganVzdCB0aGUgSURzIG9mIGluc2VydGVkL21hdGNoZWQgZWxlbWVudHNcbiAgICAgIC5pZCgpXG4gICAgYDtcblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgY2xpZW50LnNlbmQoXG4gICAgICBuZXcgRXhlY3V0ZUdyZW1saW5RdWVyeUNvbW1hbmQoe1xuICAgICAgICBncmVtbGluUXVlcnksXG4gICAgICB9KVxuICAgICk7XG5cbiAgICBjb25zb2xlLmxvZyhcIlF1ZXJ5IHJlc3BvbnNlOlwiLCBKU09OLnN0cmluZ2lmeShyZXNwb25zZSwgbnVsbCwgMikpO1xuICAgIHJldHVybiB7IFBoeXNpY2FsUmVzb3VyY2VJZDogXCJJbml0TmVwdHVuZVJlc291cmNlXCIgfTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiRXJyb3IgaW5zZXJ0aW5nIG1vY2sgZGF0YTpcIiwgZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuIl19