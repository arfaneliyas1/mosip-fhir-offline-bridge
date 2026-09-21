# MOSIP-to-FHIR Offline Verification Bridge 🏥⚡

> **An Open-Source Architectural Specification and Technical Blueprint for Last-Mile Digital Health Interoperability in Low-Connectivity Environments.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Architecture: Offline-First Edge](https://img.shields.io/badge/Architecture-Offline--First%20Edge-green.svg)]()
[![Status: Specification / RFC](https://img.shields.io/badge/Status-Active%20Specification-orange.svg)]()
[![DPI: MOSIP / Fayda ID](https://img.shields.io/badge/DPI-MOSIP%20%2F%20Fayda%20ID-purple.svg)]()

---

## 1. Executive Summary & The Last-Mile Problem

Digital Public Infrastructure (DPI) initiatives across East Africa—such as Ethiopia's **Fayda National ID** platform (built on MOSIP standards)—are establishing foundational layers for digital governance and public service delivery. Concurrently, national health ministries are accelerating electronic health record (EHR) deployments.

However, a critical architectural disconnect exists at the last mile: **Centralized, cloud-only verification models fail catastrophically in rural and peripheral healthcare settings.**

In rural clinics, health posts, and mobile health units operating under chronic power grid instability and zero internet connectivity, centralized verification APIs break down. Clinicians are forced to choose between halting care or operating completely blind.

**The MOSIP-to-FHIR Offline Verification Bridge** provides an open-source architectural specification that decouples trust from cloud connectivity—enabling offline cryptographic identity verification, automatic translation into international **HL7 FHIR health records**, and secure **Store-and-Forward synchronization** when network paths reopen.

---

## 2. High-Level System Architecture

```mermaid
graph TD
    A[Patient QR Code<br/>Signed Fayda Token] -->|Scanned Offline| B[Edge Node / Tablet]
    B --> C{Verify Signature}
    C -->|Valid| D[Pre-loaded Local Public Key<br/>Fayda PKI Keystore]
    C -->|Invalid| E[Reject Token]
    D --> F[MOSIP-to-FHIR Mapper Engine]
    F --> G[Encrypted Local Database<br/>SQLite / SQLCipher AES-256]
    G -->|Store-and-Forward Queue| H{Network Available?}
    H -->|Yes| I[Central Cloud Platform<br/>FaydaVerse / MoH FHIR API]
    H -->|No| G
```

## 3. Core Technical Pillars

The specification is broken down into five foundational pillars detailed inside the `docs/` directory:

- **Problem Statement & Rural Realities** (`docs/01-problem-statement.md`)
  - Frames the last-mile infrastructure challenge and explains why cloud-only identity systems break in low-connectivity clinical settings.

- **Zero-Data Cryptographic e-KYC** (`docs/02-offline-auth-spec.md`)
  - Utilizes asymmetric cryptography (ECDSA/RSA) and pre-loaded public key bundles to cryptographically verify time-signed national ID QR codes with 0 bytes of internet data.

- **Identity-to-Health Interoperability** (`docs/03-fhir-mapping.md`)
  - Provides a strict semantic translation dictionary mapping national ID claims (UIN, demographic attributes) directly into standardized HL7 FHIR Release 4 (Patient) JSON resources.

- **Store-and-Forward Edge Synchronization** (`docs/04-edge-sync-protocol.md`)
  - Implements AES-256 encrypted local SQLite/Realm storage with transactional outbound queues, background network monitors, and optimistic locking for conflict-free cloud synchronization.

- **Threat Model & Security Boundaries** (`docs/05-threat-model.md`)
  - Documents adversarial assumptions, attack surfaces, key rotation limits, offline revocation constraints, and the architecture's explicit operational boundaries.

## 4. Documentation Map

- [docs/01-problem-statement.md](docs/01-problem-statement.md) — problem framing and rural infrastructure constraints
- [docs/02-offline-auth-spec.md](docs/02-offline-auth-spec.md) — PKI trust model and offline verification flow
- [docs/03-fhir-mapping.md](docs/03-fhir-mapping.md) — MOSIP/Fayda claims mapped to HL7 FHIR Patient resources
- [docs/04-edge-sync-protocol.md](docs/04-edge-sync-protocol.md) — store-and-forward sync and conflict handling
- [docs/05-threat-model.md](docs/05-threat-model.md) — threat analysis, mitigations, and known limitations

## 5. Repository Structure

```text
mosip-fhir-offline-bridge/
├── README.md                      # Master Technical Whitepaper (You are here)
├── LICENSE                        # Open Source MIT License
├── CONTRIBUTING.md                 # Contribution and collaboration guide
├── docs/                          # Detailed Technical Specifications
│   ├── 01-problem-statement.md    # Rural infrastructure constraints & clinical impact
│   ├── 02-offline-auth-spec.md    # Cryptographic trust model & public key caching
│   ├── 03-fhir-mapping.md         # Semantic mapping dictionary (MOSIP to HL7 FHIR)
│   ├── 04-edge-sync-protocol.md   # Store-and-forward queueing & conflict resolution
│   └── 05-threat-model.md         # Threat model, security boundaries, and limitations
├── schemas/                       # Reference Data Models & JSON Payloads
│   ├── fayda-qr-payload.json      # Mock decrypted Fayda ID QR token structure
│   └── fhir-patient.json          # Valid HL7 FHIR Patient resource representation
├── diagrams/                      # System Visualizations & Sequence Workflows
│   └── offline-auth-sequence.mmd  # Mermaid sequence diagram for offline auth
├── proof-of-concept/              # Conceptual Code Snippets
│   ├── verify_qr_signature.py     # Python script for offline public key verification
│   └── mock_sync_worker.js        # JavaScript background worker for sync queueing
└── .github/                       # GitHub automation and metadata (if added later)
```

## 6. Quick Inspection: Data Schemas & PoC

- **Examine Data Mappings:** Review `schemas/fayda-qr-payload.json` to see a sample decrypted ID token, and `schemas/fhir-patient.json` to see its translated FHIR equivalent.
- **Review Verification Logic:** Check `proof-of-concept/verify_qr_signature.py` for a lightweight Python implementation of offline public key signature validation.
- **Review Sync Queueing:** Check `proof-of-concept/mock_sync_worker.js` for edge queue management and online connectivity listeners.

## 7. Contributing & Community Feedback

This repository is maintained as an open architectural specification. We welcome peer reviews, architectural critiques, and contributions from digital public infrastructure (DPI) specialists, health informatics engineers, and public health practitioners.

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for the recommended contribution process and collaboration standards.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/architectural-improvement`).
3. Commit your changes (`git commit -m 'Add review notes on edge sync conflict handling'`).
4. Push to the branch (`git push origin feature/architectural-improvement`).
5. Open a Pull Request.

## 8. License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---
