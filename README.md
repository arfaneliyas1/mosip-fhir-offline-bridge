# MOSIP FHIR Offline Bridge

Proof-of-concept and design docs for bridging **MOSIP / Fayda** offline authentication with **FHIR** patient records at the edge, including sync back to the online stack when connectivity returns.

## Layout

```
mosip-fhir-offline-bridge/
├── docs/                 # Problem statement and technical specs
├── diagrams/             # Mermaid sequence and architecture diagrams
├── schemas/              # JSON schemas (QR payload, FHIR Patient)
└── proof-of-concept/     # Minimal verification and sync samples
```

## Docs

| Doc | Description |
|-----|-------------|
| [01-problem-statement.md](docs/01-problem-statement.md) | Context and goals |
| [02-offline-auth-spec.md](docs/02-offline-auth-spec.md) | Offline auth flow |
| [03-fhir-mapping.md](docs/03-fhir-mapping.md) | Fayda/MOSIP → FHIR mapping |
| [04-edge-sync-protocol.md](docs/04-edge-sync-protocol.md) | Edge ↔ cloud sync |

## Proof of concept

- `proof-of-concept/verify_qr_signature.py` — verify a signed Fayda/MOSIP QR payload
- `proof-of-concept/mock_sync_worker.js` — mock edge sync worker

## Status

Scaffold / early design. Specs and PoC code are placeholders to be filled in.
