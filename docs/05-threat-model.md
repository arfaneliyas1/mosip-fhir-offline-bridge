# 05. Threat Model, Security Boundaries & Architectural Limitations

## 1. Introduction & Purpose
In digital public infrastructure (DPI) and health informatics, publishing an architectural specification without an explicit threat model and list of known limitations undermines its credibility. This document outlines the adversarial assumptions, security boundaries, cryptographic constraints, and operational limitations of the **MOSIP-to-FHIR Offline Verification Bridge**.

---

## 2. Threat Model & Adversarial Assumptions

The edge architecture operates under the assumption of **hostile or disconnected physical environments**. The threat model accounts for the following actors and vectors:

### A. Tampered or Forged QR Identity Tokens
* **Threat:** An adversary attempts to present a falsified physical or digital identity QR code containing altered demographic attributes (e.g., modified age or identifier) to gain unauthorized access to specialized care or public resources.
* **Mitigation:** The edge node relies on **MOSIP Claim 169 (CBOR Web Token / CWT)** cryptographic signing standards. Because the payload is signed with the National ID Authority’s private key using Asymmetric ECDSA/RSA, any modification to the claim data invalidates the signature, causing the local verification script to reject the token instantly.

### B. Offline Replay & Stale Token Exploitation
* **Threat:** An attacker captures a legitimately signed offline QR code and attempts to reuse it long after its intended validity window.
* **Mitigation:** Tokens incorporate strict temporal bounds via issued-at (`iat`) and expiration (`exp`) claims. The edge verification engine rejects any token where the local time exceeds the expiration timestamp.

### C. Physical Edge Device Compromise (The Stolen Tablet Scenario)
* **Threat:** A rural clinic tablet running the edge client is lost, stolen, or physically seized.
* **Mitigation / Limitation:** While local SQLite/SQLCipher databases are protected via **AES-256 encryption at rest**, physical extraction of keys remains a theoretical risk if hardware-backed secure enclaves (TPM / Android Keystore) are missing or misconfigured on low-cost rural hardware. The architecture explicitly recommends hardware-backed root-of-trust modules for production deployments.

---

## 3. Known Architectural Limitations

Transparently documenting what this specification *does not* solve is critical for deployers:

### 1. Key Revocation Lag (The Offline CRL Problem)
* **Limitation:** In an online system, compromised signing keys are instantly invalidated via real-time Certificate Revocation Lists (CRLs) or Online Certificate Status Protocol (OCSP). In an off-grid setting with zero internet access, edge tablets cannot fetch real-time revocation updates.
* **Operational Trade-off:** Edge nodes rely on short-lived token expirations (e.g., maximum token validity of 24–48 hours) and periodic key-bundle updates during rare visits to connected hubs to bound the window of exposure for compromised keys.

### 2. Clock Drift Vulnerabilities
* **Limitation:** Offline signature and expiration checks depend on the edge tablet's internal hardware clock. If an adversary or faulty hardware causes severe clock drift, expired tokens might be accepted, or valid tokens rejected.
* **Mitigation:** Edge software enforces secure time synchronization via GPS hardware pulses or local network time servers whenever a connection is established, locking down manual system-time adjustments behind administrative role-based access control (RBAC).

### 3. Biometric Verification Constraints
* **Limitation:** Raw biometric templates (fingerprints or iris scans) are strictly prohibited from being stored or verified locally on peripheral edge nodes to protect citizen privacy.
* **Design Boundary:** Offline verification proves *identity possession and cryptographic authenticity via Claim 169 tokens*, but does not perform real-time local biometric de-duplication or liveness checks against central ABIS databases without network connectivity.

---

## 4. Consent, Data Minimization, and Legal Basis

A core operational requirement of this architecture is that demographic data must not be rendered on a tablet or client device merely because the token was successfully verified. Before a local system presents any identifying or demographic information, it must complete a consent-driven token exchange loop and confirm the minimum necessary disclosure for the task at hand.

### Consent-driven Token Exchange Loop
1. A citizen or caregiver presents a verified Fayda token or equivalent local identity artifact.
2. The edge client validates the signature, issuer, and time window.
3. The local workflow identifies the specific purpose for which demographic information is needed.
4. The user or authorized entity gives explicit consent for that purpose.
5. Only the minimum set of demographic fields required for the workflow is rendered on-screen.
6. If consent is absent, expired, or not relevant to the task, the client refuses to display the data and logs the access event for audit.

This is especially important for dependent and pediatric flows, where demographic release must be narrow and purpose-bound. The architecture therefore treats consent not as a UX formality but as a legal and operational gate before any data is displayed from an AES-256/SQLCipher-protected local store.

### Legal basis

Proclamation No. 1284/2023 is a confirmed legal framework governing personal data handling and consent in the Ethiopian context. It contains the relevant data-minimization and consent principles that support a purpose-limited, consent-aware offline identity workflow. In practical deployment terms, the system should treat local display of demographic data as a consented access action, not as a default right inherited from valid token verification alone.

## 5. Specification Standards Alignment
This architecture directly bridges two established global standards:
* **Identity Layer:** The repository's proof-of-concept intentionally implements a **JSON-based conceptual analogue** of the MOSIP Claim 169 model for public portfolio clarity and educational demonstration. Production-grade implementations should use the canonical **CBOR / COSE-based MOSIP Claim 169 / CWT wire format** as defined by the governing national identity specification, not a JSON re-serialization.
* **Health Interoperability Layer:** Implements **HL7 FHIR Release 4 (R4)** for structured clinical data representation, ensuring seamless translation from national identity tokens into universal medical records.
