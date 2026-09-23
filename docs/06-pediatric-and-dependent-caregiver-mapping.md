# 06. Pediatric and Dependent Caregiver Mapping

## 1. Scope and Regulatory Context

This document covers the edge-case scenarios where a patient is a child or dependent and cannot be registered using the same identity flow as an adult. It complements the main patient and caregiver mapping guidance and defines the relational model for dependent care registration in low-connectivity environments.

In Ethiopia, Fayda's own registration guidance states that children above age 5 may register directly, while children under age 5 are not yet covered by the same direct registration model and remain subject to a dedicated registration program. That distinction is important because the system must not assume a single adult-only identity flow for all pediatric registrations.

---

## 2. Registration Logic for Children and Dependents

### 2.1 Direct Registration Above Age 5

For children above age 5, the registration flow may proceed in a manner comparable to adult registration, subject to the standard verification and consent checks associated with the local Fayda identity process.

### 2.2 Children Under Age 5

For children under age 5, direct independent registration is not yet treated as the normal model. Fayda guidance indicates that this cohort is still pending a dedicated registration program. In operational terms, the system should not create a stand-alone patient identity record for the child as if it were fully self-registered; instead, the caregiver relationship must be modeled explicitly and the child record should be treated as a dependent registration flow.

---

## 3. Dual-Resource Mapping Model

The edge integration pattern should use a two-resource structure for dependent care:

1. **Guardian / Caregiver**
   - Verified Fayda identity token
   - Mapped to a FHIR `RelatedPerson` or equivalent caregiver record
   - Carries the relationship to the dependent patient

2. **Dependent Child**
   - Separate FHIR `Patient` resource for the child
   - Contains the child’s demographic and care-related information
   - Linked to the caregiver via a relational reference or relationship mapping

### 3.1 Example Relationship Pattern

- Guardian's Fayda token is verified offline
- Guardian is mapped to a `RelatedPerson` record
- Child is mapped to a `Patient` record
- A linkage is created between caregiver and child using a service relationship or relational reference in the local data model

This keeps the caregiver identity distinct from the child identity while preserving the dependency chain required for care, consent, and consent tracking.

---

## 4. Consent-Driven Token Exchange Loop

Before an offline tablet renders demographic data for a citizen or caregiver, the system must operate a consent-driven token exchange loop:

1. The presenting party presents a verified Fayda token or equivalent identity artifact.
2. The local edge system checks the token signature and validity window.
3. The system confirms the purpose of the data access or callback event.
4. The user or caregiver authorizes the local display of the minimum necessary demographic data.
5. Demographic information may then be rendered from locally encrypted data stores, protected by AES-256/SQLCipher at rest.
6. Access is denied or restricted if consent is absent, expired, or not relevant to the requested action.

This is a legal and ethical requirement, not just a design preference. The architecture should minimize the amount of demographic data displayed and expose only the subset required for the local workflow.

---

## 5. Operational and Power Constraints

### 5.1 Power-Aware Queueing

During regional power outages or unstable grid conditions, the edge worker should behave conservatively:

- pause or slow the sync loop when device battery is critically low
- shift to a reduced-frequency retry cadence to preserve battery life
- hold outbound FHIR bundles locally if the device is on backup power or disconnected from the network
- resume normal batching when power is stable and connectivity returns

This is especially important in remote clinics and mobile outreach settings where power stability is a primary operational risk.

### 5.2 Recovery After Outage

When regional power returns, the edge worker should:

- re-evaluate connectivity state
- resume the queue flush process
- reattempt failed batches using the standard exponential backoff algorithm
- retain the original batch UUIDs to preserve idempotent retry behavior

---

## 6. Recommended FHIR Relationship Pattern

A child registration mapping can be represented conceptually as:

- `Patient` (child)
- `RelatedPerson` (guardian)
- `Patient.link` or equivalent local relationship reference linking the child to the guardian record

This model is suitable for dependent and pediatric registration workflows where the caregiver is the verified identity holder but the child is the subject of care and treatment records.

---

## 7. Practical Implementation Guidance

For implementation teams, the safe rule is:

- treat adult direct registration as a standard identity verification flow
- treat pediatric below-5 registration as a dependent registration flow
- keep the caregiver identity and dependent child identity as separate FHIR resources
- preserve a clear consent and minimum-data disclosure boundary before any demographic information is displayed locally
