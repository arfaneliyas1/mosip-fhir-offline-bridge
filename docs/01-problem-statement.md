# 01 — Problem Statement

## Context

Healthcare and identity workflows in low-connectivity settings need to:

1. Authenticate an individual using a MOSIP / Fayda credential (e.g. signed QR) **without** a live link to the central ID stack.
2. Represent verified identity attributes in a **FHIR Patient** (and related resources) for clinical / registration systems.
3. **Sync** local verification and registration events when the edge device reconnects.

## Goals

- Define an offline-capable auth path that trusts cryptographically signed credentials.
- Map verified claims into FHIR resources in a reproducible way.
- Specify an edge sync protocol that is idempotent, auditable, and conflict-aware.

## Non-goals (initial)

- Full production MOSIP integration or certification.
- Complete FHIR server implementation.
- Biometric matching pipelines beyond what the PoC needs.

## Success criteria

- [ ] Documented offline auth sequence with threat notes
- [ ] Stable JSON schemas for QR payload and FHIR Patient mapping
- [ ] Runnable PoC: verify signature + mock sync worker
