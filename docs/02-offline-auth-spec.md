# 02 — Offline Auth Spec

## Overview

Offline authentication verifies a signed Fayda / MOSIP QR (or equivalent credential payload) on the edge device using a **pre-provisioned public key / trust store**, without calling the online IDA APIs at verification time.

## Actors

| Actor | Role |
|-------|------|
| Subject | Holds the credential (QR / digital ID) |
| Edge verifier | Scans QR, verifies signature, maps to FHIR |
| Trust store | Root / intermediate keys provisioned to the edge |
| Sync worker | Uploads verification events when online |

## High-level flow

1. Edge device is provisioned with trusted public keys and policy (validity windows, allowed claim sets).
2. Subject presents QR / credential.
3. Verifier parses payload per `schemas/fayda-qr-payload.json`.
4. Verifier checks signature, expiry, and policy.
5. On success, verifier creates / updates a local FHIR Patient (`schemas/fhir-patient.json`).
6. Event is queued for sync (`docs/04-edge-sync-protocol.md`).

See also: `diagrams/offline-auth-sequence.mmd`.

## Cryptographic checks (draft)

- Algorithm and key ID from payload / header
- Signature over canonical payload bytes
- Not-before / expiry if present
- Optional: device binding / nonce (future)

## Failure modes

| Condition | Result |
|-----------|--------|
| Unknown / untrusted key | Reject |
| Bad signature | Reject |
| Expired credential | Reject (or warn per policy) |
| Schema mismatch | Reject |

## Open questions

- Exact Fayda QR encoding and signature format to target first
- Key rotation / trust-store update while offline
- Privacy: which claims are stored locally vs hashed
