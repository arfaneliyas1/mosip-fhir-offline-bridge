# 04 — Edge Sync Protocol

## Purpose

When connectivity returns, the edge device uploads queued offline verification / registration events to a cloud (or facility) endpoint in an **idempotent**, ordered-enough manner.

## Concepts

| Term | Meaning |
|------|---------|
| Outbox | Local durable queue of sync envelopes |
| Envelope | One sync unit: id, type, payload, created_at, hash |
| Ack | Cloud acknowledgement with envelope id |
| Conflict | Same logical subject updated from multiple edges |

## Envelope (draft)

```json
{
  "envelope_id": "uuid",
  "device_id": "string",
  "event_type": "offline_verify | patient_upsert",
  "occurred_at": "ISO-8601",
  "payload": {},
  "payload_sha256": "hex"
}
```

## Sync steps

1. Worker wakes on network / schedule.
2. Reads next N unacked envelopes from outbox.
3. POSTs batch to sync API (TLS, device credentials).
4. On 2xx + ack list, mark envelopes synced.
5. On 4xx validation error, quarantine with reason.
6. On 5xx / network error, retry with backoff.

See PoC: `proof-of-concept/mock_sync_worker.js`.

## Idempotency

- Cloud keys on `envelope_id` (and optionally `payload_sha256`).
- Replays must not create duplicate Patients; merge by subject identifier.

## Security notes

- Mutual TLS or signed device JWT
- Encrypt PII at rest on the edge
- Minimize fields in sync payloads

## Open questions

- Batch size and priority (verify events vs full FHIR resources)
- Multi-edge conflict resolution policy
- Offline duration limits and re-verification requirements
