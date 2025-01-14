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
          transactionId   : '${(0, crypto_1.randomUUID)()}',
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
          transactionId   : '${(0, crypto_1.randomUUID)()}',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxvRUFHcUM7QUFFckMsbUNBQW9DO0FBRTdCLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxLQUF3QyxFQUFFLEVBQUU7SUFDeEUsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQztJQUV0QyxJQUFJLFdBQVcsS0FBSyxRQUFRLEVBQUUsQ0FBQztRQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7UUFDaEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLHFCQUFxQixFQUFFLENBQUM7SUFDdkQsQ0FBQztJQUNELElBQUksV0FBVyxLQUFLLFFBQVEsSUFBSSxXQUFXLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDekQsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQkFBMkIsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUN0RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUscUJBQXFCLEVBQUUsQ0FBQztJQUN2RCxDQUFDO0lBRUQsSUFDRSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyx1QkFBdUI7UUFDakQsQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsbUJBQW1CLEVBQzdDLENBQUM7UUFDRCxNQUFNLElBQUksS0FBSyxDQUNiLDJIQUEySCxDQUM1SCxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDO0lBQ3RDLE1BQU0sUUFBUSxHQUFHLFdBQVcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHVCQUF1QixJQUFJLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0lBRS9ILDJGQUEyRjtJQUMzRixvREFBb0Q7SUFDcEQsTUFBTSxNQUFNLEdBQUcsSUFBSSxzQ0FBaUIsQ0FBQztRQUNuQyxNQUFNO1FBQ04sUUFBUTtRQUNSLFNBQVMsRUFBRSxVQUFVO0tBQ3RCLENBQUMsQ0FBQztJQUVILElBQUksQ0FBQztRQUNILE9BQU8sQ0FBQyxHQUFHLENBQUMsK0NBQStDLFFBQVEsR0FBRyxDQUFDLENBQUM7UUFFeEUsTUFBTSxZQUFZLEdBQUc7Ozs7Ozt5QkFNQSxJQUFBLG1CQUFVLEdBQUU7Ozs7Ozs7Ozs7Ozt5QkFZWixJQUFBLG1CQUFVLEdBQUU7Ozs7Ozs7Ozs7Ozt5QkFZWixJQUFBLG1CQUFVLEdBQUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7K0JBa0NOLElBQUEsbUJBQVUsR0FBRTs7Ozs7Ozs7Ozs7OytCQVlaLElBQUEsbUJBQVUsR0FBRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztLQTRCdEMsQ0FBQztRQUVGLE1BQU0sUUFBUSxHQUFHLE1BQU0sTUFBTSxDQUFDLElBQUksQ0FDaEMsSUFBSSwrQ0FBMEIsQ0FBQztZQUM3QixZQUFZO1NBQ2IsQ0FBQyxDQUNILENBQUM7UUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxxQkFBcUIsRUFBRSxDQUFDO0lBQ3ZELENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyw0QkFBNEIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNuRCxNQUFNLEtBQUssQ0FBQztJQUNkLENBQUM7QUFDSCxDQUFDLENBQUM7QUF6SlcsUUFBQSxPQUFPLFdBeUpsQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIE5lcHR1bmVkYXRhQ2xpZW50LFxuICBFeGVjdXRlR3JlbWxpblF1ZXJ5Q29tbWFuZCxcbn0gZnJvbSBcIkBhd3Mtc2RrL2NsaWVudC1uZXB0dW5lZGF0YVwiO1xuaW1wb3J0IHsgQ2xvdWRGb3JtYXRpb25DdXN0b21SZXNvdXJjZUV2ZW50IH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcbmltcG9ydCB7IHJhbmRvbVVVSUQgfSBmcm9tICdjcnlwdG8nO1xuXG5leHBvcnQgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudDogQ2xvdWRGb3JtYXRpb25DdXN0b21SZXNvdXJjZUV2ZW50KSA9PiB7XG4gIGNvbnN0IHJlcXVlc3RUeXBlID0gZXZlbnQuUmVxdWVzdFR5cGU7XG5cbiAgaWYgKHJlcXVlc3RUeXBlID09PSBcIkRlbGV0ZVwiKSB7XG4gICAgY29uc29sZS5sb2coXCJEZWxldGUgZXZlbnQgLSBubyBhY3Rpb24gbmVlZGVkLlwiKTtcbiAgICByZXR1cm4geyBQaHlzaWNhbFJlc291cmNlSWQ6IFwiSW5pdE5lcHR1bmVSZXNvdXJjZVwiIH07XG4gIH1cbiAgaWYgKHJlcXVlc3RUeXBlICE9PSBcIkNyZWF0ZVwiICYmIHJlcXVlc3RUeXBlICE9PSBcIlVwZGF0ZVwiKSB7XG4gICAgY29uc29sZS5sb2coYFVuc3VwcG9ydGVkIGV2ZW50IHR5cGU6ICR7cmVxdWVzdFR5cGV9YCk7XG4gICAgcmV0dXJuIHsgUGh5c2ljYWxSZXNvdXJjZUlkOiBcIkluaXROZXB0dW5lUmVzb3VyY2VcIiB9O1xuICB9XG5cbiAgaWYgKFxuICAgICFldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuTmVwdHVuZUVuZHBvaW50SG9zdG5hbWUgfHxcbiAgICAhZXZlbnQuUmVzb3VyY2VQcm9wZXJ0aWVzLk5lcHR1bmVFbmRwb2ludFBvcnRcbiAgKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgXCJOZXB0dW5lRW5kcG9pbnRIb3N0bmFtZSBhbmQgTmVwdHVuZUVuZHBvaW50UG9ydCByZXNvdXJjZSBwcm9wZXJ0aWVzIGFyZSByZXF1aXJlZCBvbiB0aGUgQ2xvdWRGb3JtYXRpb25DdXN0b21SZXNvdXJjZUV2ZW50XCJcbiAgICApO1xuICB9XG5cbiAgY29uc3QgcmVnaW9uID0gcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTjtcbiAgY29uc3QgZW5kcG9pbnQgPSBgaHR0cHM6Ly8ke2V2ZW50LlJlc291cmNlUHJvcGVydGllcy5OZXB0dW5lRW5kcG9pbnRIb3N0bmFtZX06JHtldmVudC5SZXNvdXJjZVByb3BlcnRpZXMuTmVwdHVuZUVuZHBvaW50UG9ydH1gO1xuXG4gIC8vIGNob29zaW5nIHJldHJ5IG1vZGUgXCJhZGFwdGl2ZVwiIGlzIG1hbmRhdG9yeSBoZXJlLCBhcyB0aGUgbmVwdHVuZSBjbHVzdGVyIGNhbiB0YWtlIHF1aXRlIFxuICAvLyBzb21lIHRpbWUgdG8gYmUgYWN0dWFsbHkgcmVhY2hhYmxlIGFmdGVyIGNyZWF0aW9uXG4gIGNvbnN0IGNsaWVudCA9IG5ldyBOZXB0dW5lZGF0YUNsaWVudCh7XG4gICAgcmVnaW9uLFxuICAgIGVuZHBvaW50LFxuICAgIHJldHJ5TW9kZTogXCJhZGFwdGl2ZVwiLFxuICB9KTtcblxuICB0cnkge1xuICAgIGNvbnNvbGUubG9nKGBJbnNlcnRpbmcgbW9jayBkYXRhIHVzaW5nIE5lcHR1bmUgRGF0YSBBUEkgKCR7ZW5kcG9pbnR9KWApO1xuXG4gICAgY29uc3QgZ3JlbWxpblF1ZXJ5ID0gYFxuICAgIGdcbiAgICAgIC8vIC0tLSBVcHNlcnQgUGVyc29uIHZlcnRpY2VzIC0tLVxuICAgICAgLm1lcmdlVihbKFQuaWQpOiAncGVyc29uLTEnXSlcbiAgICAgICAgLm9wdGlvbihvbkNyZWF0ZSwgW1xuICAgICAgICAgIChULmxhYmVsKTogJ1BlcnNvbicsXG4gICAgICAgICAgcGVyc29uSWQgIDogJyR7cmFuZG9tVVVJRCgpfScsXG4gICAgICAgICAgbmFtZSAgICAgIDogJ0FsaWNlJyxcbiAgICAgICAgICBlbWFpbCAgICAgOiAnYWxpY2VAZXhhbXBsZS5jb20nXG4gICAgICAgIF0pXG4gICAgICAgIC5vcHRpb24ob25NYXRjaCwgW1xuICAgICAgICAgIG5hbWUgIDogJ0FsaWNlJyxcbiAgICAgICAgICBlbWFpbCA6ICdhbGljZUBleGFtcGxlLmNvbSdcbiAgICAgICAgXSlcblxuICAgICAgLm1lcmdlVihbKFQuaWQpOiAncGVyc29uLTInXSlcbiAgICAgICAgLm9wdGlvbihvbkNyZWF0ZSwgW1xuICAgICAgICAgIChULmxhYmVsKTogJ1BlcnNvbicsXG4gICAgICAgICAgcGVyc29uSWQgIDogJyR7cmFuZG9tVVVJRCgpfScsXG4gICAgICAgICAgbmFtZSAgICAgIDogJ0JvYicsXG4gICAgICAgICAgZW1haWwgICAgIDogJ2JvYkBleGFtcGxlLmNvbSdcbiAgICAgICAgXSlcbiAgICAgICAgLm9wdGlvbihvbk1hdGNoLCBbXG4gICAgICAgICAgbmFtZSAgOiAnQm9iJyxcbiAgICAgICAgICBlbWFpbCA6ICdib2JAZXhhbXBsZS5jb20nXG4gICAgICAgIF0pXG5cbiAgICAgIC5tZXJnZVYoWyhULmlkKTogJ3BlcnNvbi0zJ10pXG4gICAgICAgIC5vcHRpb24ob25DcmVhdGUsIFtcbiAgICAgICAgICAoVC5sYWJlbCk6ICdQZXJzb24nLFxuICAgICAgICAgIHBlcnNvbklkICA6ICcke3JhbmRvbVVVSUQoKX0nLFxuICAgICAgICAgIG5hbWUgICAgICA6ICdDYXJvbCcsXG4gICAgICAgICAgZW1haWwgICAgIDogJ2Nhcm9sQGV4YW1wbGUuY29tJ1xuICAgICAgICBdKVxuICAgICAgICAub3B0aW9uKG9uTWF0Y2gsIFtcbiAgICAgICAgICBuYW1lICA6ICdDYXJvbCcsXG4gICAgICAgICAgZW1haWwgOiAnY2Fyb2xAZXhhbXBsZS5jb20nXG4gICAgICAgIF0pXG5cbiAgICAgIC8vIC0tLSBVcHNlcnQgQmFua0FjY291bnQgdmVydGljZXMgLS0tXG4gICAgICAubWVyZ2VWKFsoVC5pZCk6ICdhY2MtMSddKVxuICAgICAgICAub3B0aW9uKG9uQ3JlYXRlLCBbXG4gICAgICAgICAgKFQubGFiZWwpICAgICAgOiAnQmFua0FjY291bnQnLFxuICAgICAgICAgIElCQU4gICAgICAgICAgIDogJ0RFMTIzJyxcbiAgICAgICAgICBjdXJyZW50QmFsYW5jZSA6IDEwMDBcbiAgICAgICAgXSlcbiAgICAgICAgLm9wdGlvbihvbk1hdGNoLCBbXG4gICAgICAgICAgY3VycmVudEJhbGFuY2UgOiAxMDAwXG4gICAgICAgIF0pXG5cbiAgICAgIC5tZXJnZVYoWyhULmlkKTogJ2FjYy0yJ10pXG4gICAgICAgIC5vcHRpb24ob25DcmVhdGUsIFtcbiAgICAgICAgICAoVC5sYWJlbCkgICAgICA6ICdCYW5rQWNjb3VudCcsXG4gICAgICAgICAgSUJBTiAgICAgICAgICAgOiAnREU0NTYnLFxuICAgICAgICAgIGN1cnJlbnRCYWxhbmNlIDogMjAwMFxuICAgICAgICBdKVxuICAgICAgICAub3B0aW9uKG9uTWF0Y2gsIFtcbiAgICAgICAgICBjdXJyZW50QmFsYW5jZSA6IDIwMDBcbiAgICAgICAgXSlcblxuICAgICAgLy8gLS0tIFVwc2VydCBCYW5rVHJhbnNhY3Rpb24gdmVydGljZXMgLS0tXG4gICAgICAubWVyZ2VWKFsoVC5pZCk6ICd0eC0xJ10pXG4gICAgICAgIC5vcHRpb24ob25DcmVhdGUsIFtcbiAgICAgICAgICAoVC5sYWJlbCkgICAgICAgOiAnQmFua1RyYW5zYWN0aW9uJyxcbiAgICAgICAgICB0cmFuc2FjdGlvbklkICAgOiAnJHtyYW5kb21VVUlEKCl9JyxcbiAgICAgICAgICBvdGhlclBlcnNvbklCQU4gOiAnREU5OTknLFxuICAgICAgICAgIGFtb3VudCAgICAgICAgICA6IC0xNTBcbiAgICAgICAgXSlcbiAgICAgICAgLm9wdGlvbihvbk1hdGNoLCBbXG4gICAgICAgICAgb3RoZXJQZXJzb25JQkFOIDogJ0RFOTk5JyxcbiAgICAgICAgICBhbW91bnQgICAgICAgICAgOiAtMTUwXG4gICAgICAgIF0pXG5cbiAgICAgIC5tZXJnZVYoWyhULmlkKTogJ3R4LTInXSlcbiAgICAgICAgLm9wdGlvbihvbkNyZWF0ZSwgW1xuICAgICAgICAgIChULmxhYmVsKSAgICAgICA6ICdCYW5rVHJhbnNhY3Rpb24nLFxuICAgICAgICAgIHRyYW5zYWN0aW9uSWQgICA6ICcke3JhbmRvbVVVSUQoKX0nLFxuICAgICAgICAgIG90aGVyUGVyc29uSUJBTiA6ICdERTQ1NicsXG4gICAgICAgICAgYW1vdW50ICAgICAgICAgIDogMzAwXG4gICAgICAgIF0pXG4gICAgICAgIC5vcHRpb24ob25NYXRjaCwgW1xuICAgICAgICAgIG90aGVyUGVyc29uSUJBTiA6ICdERTQ1NicsXG4gICAgICAgICAgYW1vdW50ICAgICAgICAgIDogMzAwXG4gICAgICAgIF0pXG5cbiAgICAgIC8vIC0tLSBVcHNlcnQgRWRnZXMgLS0tXG4gICAgICAvLyBoYXNfZnJpZW5kIGVkZ2VzIChiaWRpcmVjdGlvbmFsKVxuICAgICAgLm1lcmdlRShbKGZyb20pICAgOiAncGVyc29uLTEnLCAodG8pOiAncGVyc29uLTInLCAoVC5sYWJlbCk6ICdoYXNfZnJpZW5kJ10pXG4gICAgICAubWVyZ2VFKFsoZnJvbSkgICA6ICdwZXJzb24tMicsICh0byk6ICdwZXJzb24tMScsIChULmxhYmVsKTogJ2hhc19mcmllbmQnXSlcbiAgICAgIC5tZXJnZUUoWyhmcm9tKSAgIDogJ3BlcnNvbi0xJywgKHRvKTogJ3BlcnNvbi0zJywgKFQubGFiZWwpOiAnaGFzX2ZyaWVuZCddKVxuICAgICAgLm1lcmdlRShbKGZyb20pICAgOiAncGVyc29uLTMnLCAodG8pOiAncGVyc29uLTEnLCAoVC5sYWJlbCk6ICdoYXNfZnJpZW5kJ10pXG4gICAgICAubWVyZ2VFKFsoZnJvbSkgICA6ICdwZXJzb24tMicsICh0byk6ICdwZXJzb24tMycsIChULmxhYmVsKTogJ2hhc19mcmllbmQnXSlcbiAgICAgIC5tZXJnZUUoWyhmcm9tKSAgIDogJ3BlcnNvbi0zJywgKHRvKTogJ3BlcnNvbi0yJywgKFQubGFiZWwpOiAnaGFzX2ZyaWVuZCddKVxuXG4gICAgICAvLyBvd25zX2FjY291bnQgZWRnZXNcbiAgICAgIC5tZXJnZUUoWyhmcm9tKTogJ3BlcnNvbi0xJywgKHRvKTogJ2FjYy0xJywgKFQubGFiZWwpOiAnb3duc19hY2NvdW50J10pXG4gICAgICAubWVyZ2VFKFsoZnJvbSk6ICdwZXJzb24tMicsICh0byk6ICdhY2MtMicsIChULmxhYmVsKTogJ293bnNfYWNjb3VudCddKVxuXG4gICAgICAvLyBoYXNfdHJhbnNhY3Rpb24gZWRnZXNcbiAgICAgIC5tZXJnZUUoWyhmcm9tKTogJ2FjYy0xJywgKHRvKTogJ3R4LTEnLCAoVC5sYWJlbCk6ICdoYXNfdHJhbnNhY3Rpb24nXSlcbiAgICAgIC5tZXJnZUUoWyhmcm9tKTogJ2FjYy0yJywgKHRvKTogJ3R4LTInLCAoVC5sYWJlbCk6ICdoYXNfdHJhbnNhY3Rpb24nXSlcblxuICAgICAgLy8gUmV0dXJuIGp1c3QgdGhlIElEcyBvZiBpbnNlcnRlZC9tYXRjaGVkIGVsZW1lbnRzXG4gICAgICAuaWQoKVxuICAgIGA7XG5cbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGNsaWVudC5zZW5kKFxuICAgICAgbmV3IEV4ZWN1dGVHcmVtbGluUXVlcnlDb21tYW5kKHtcbiAgICAgICAgZ3JlbWxpblF1ZXJ5LFxuICAgICAgfSlcbiAgICApO1xuXG4gICAgY29uc29sZS5sb2coXCJRdWVyeSByZXNwb25zZTpcIiwgSlNPTi5zdHJpbmdpZnkocmVzcG9uc2UsIG51bGwsIDIpKTtcbiAgICByZXR1cm4geyBQaHlzaWNhbFJlc291cmNlSWQ6IFwiSW5pdE5lcHR1bmVSZXNvdXJjZVwiIH07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkVycm9yIGluc2VydGluZyBtb2NrIGRhdGE6XCIsIGVycm9yKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcbiJdfQ==