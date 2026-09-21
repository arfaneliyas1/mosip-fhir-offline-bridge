# 03 — FHIR Mapping

## Purpose

Map verified MOSIP / Fayda identity attributes into a FHIR R4 **Patient** resource suitable for edge clinical/registration systems.

## Source → FHIR (draft)

| Source claim | FHIR path | Notes |
|--------------|-----------|-------|
| Unique ID / UIN / VID | `Patient.identifier` | Use a named system URI |
| Name | `Patient.name` | Official / usual |
| Date of birth | `Patient.birthDate` | ISO date |
| Gender | `Patient.gender` | Map to FHIR codes |
| Phone / email | `Patient.telecom` | Optional |
| Address | `Patient.address` | Optional |
| Photo | `Patient.photo` | Optional / consent-gated |

## Identifier systems (placeholders)

Replace with official system URIs when finalized:

- `https://example.org/fayda/id` — primary subject ID
- `https://example.org/mosip/vid` — virtual ID if used

## Verification metadata

Store offline verification outcome outside the core demographics, e.g.:

- `Patient.extension` for verification timestamp, key id, edge device id
- Or a linked `Provenance` / `AuditEvent` when the edge FHIR store supports it

## Schema

Canonical shape for the PoC: `schemas/fhir-patient.json`.

## Open questions

- Which FHIR version is mandatory for target deployments (R4 vs R5)
- Whether to emit only Patient or also RelatedPerson / Encounter stubs
- Consent and minimization of PII on the edge
