# 04. Store-and-Forward Edge Synchronization & Conflict Resolution Protocol

## 1. Overview & Operational Model
In off-grid rural health posts, edge devices (tablets or local mini-PCs) function as independent operational units. When clinical encounters and patient identity mappings occur offline, they cannot be written directly to the central health platform.

Instead, the system implements a **Store-and-Forward Edge Synchronization Protocol**. This protocol guarantees that local data is securely preserved at rest, queued transactionally, and asynchronously synchronized through **OpenHIM middleware** to the broader Ethiopian health interoperability stack whenever intermittent network connectivity becomes available.

In Ethiopia's operational context, the middleware layer is the integration boundary between field devices and ministry systems. Facility validation is performed against the **Master Facility Registry (MFR)**, hosted at `mfrv2.moh.gov.et`, before patient or encounter payloads are forwarded to downstream systems.

---

## 2. Local Encrypted Storage Engine (At-Rest Security)
To comply with medical data privacy regulations and protect sensitive health information on field tablets, local data storage must be heavily encrypted.

* **Embedded Database Architecture:** The edge node utilizes an embedded, ACID-compliant relational or object database (e.g., **SQLite with SQLCipher** or **Realm Mobile Database**).
* **AES-256 Encryption:** All database files are encrypted at rest using industry-standard **AES-256 encryption**, with cryptographic keys securely managed via the device's hardware-backed keystore.
* **The Outbound Queue Table (`sync_queue`):** Clinical mutations (created patients, encounters, observations) are written simultaneously to local data tables and queued for synchronization.

### Conceptual `sync_queue` Schema
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | UUID / String | Unique identifier for the sync payload item. |
| `resource_type` | String | FHIR Resource type (e.g., `Patient`, `Encounter`, `Observation`). |
| `payload_json` | TEXT | Encrypted JSON string of the complete HL7 FHIR resource. |
| `action` | Enum (`CREATE`, `UPDATE`) | The intended REST operation on the central server. |
| `status` | Enum (`PENDING`, `SYNCING`, `FAILED`, `SYNCED`) | Current synchronization state. |
| `retry_count` | Integer | Number of failed sync attempts. |
| `created_at` | Timestamp | Local timestamp when the record was generated. |

---

## 3. OpenHIM Middleware, Facility Validation, and Asynchronous Batching
Sync operations are completely decoupled from active clinical workflows to prevent UI blocking during poor network conditions.

1. **Passive Connectivity Monitoring:** A background daemon or service continuously monitors network availability via OS socket status, ping heuristics, or network state APIs.
2. **OpenHIM Integration Boundary:** When connectivity is detected, the sync worker pushes outbound payloads through **OpenHIM middleware** rather than directly to a ministry-owned backend. OpenHIM acts as the secure mediator, routing transaction bundles to downstream services and enforcing basic auditing and policy checks.
3. **Facility Validation Against MFR:** Before a patient registration or encounter record is forwarded, the system validates the submitting facility code against the **Master Facility Registry (MFR)** at `mfrv2.moh.gov.et`. This reduces the risk of invalid facility submissions and improves downstream traceability.
4. **Batch Transaction Bundling (`FHIR Bundle`):** The sync worker pulls a batch of pending records (e.g., up to 50 items) from the local `sync_queue` and wraps them into an **HL7 FHIR Transaction Bundle (`Bundle` of type `transaction`)**.
5. **Upstream REST Push:** The batch bundle is transmitted securely over TLS through OpenHIM or a designated mediator endpoint via a standard REST API call:
   * `POST /fhir/v1/Bundle`
6. **Queue Pruning & Acknowledgement:** Upon receiving a `201 Created` or `200 OK` response from the mediator or origin server, the edge worker updates the local queue items to `SYNCED` and purges them based on retention policies.

> Note: The exact naming of a central patient/client registry varies by implementation. In some deployments it is a patient registry component, in others a broader client master. This document intentionally avoids asserting a single named system unless independently verified in the target environment.

---

## 4. Conflict Resolution & Optimistic Locking
In distributed healthcare systems, a patient record modified offline at a rural post might have also been updated elsewhere (e.g., at a regional hospital or via an online portal).

To manage discrepancies without crashing the sync engine, the architecture employs **Optimistic Locking**:
* **Version Headers (`ETag` / `meta.versionId`):** Every FHIR resource maintains a version counter. When synced, the central server checks the incoming record's version against the master database.
* **Non-Conflicting Merges:** If resource attributes affect separate fields (e.g., adding a new observation versus editing demographic info), the server merges them automatically.
* **Conflict State Handling (`409 Conflict`):** If a direct structural conflict occurs, the central server rejects the batch item with a `409 Conflict` status code. The edge sync worker flags the record as `CONFLICT_REQUIRES_REVIEW`, notifying local system administrators while allowing standard clinical operations to continue uninterrupted.

---

## 5. Fault Tolerance & Exponential Backoff
Rural network links are notoriously unstable and prone to dropping mid-transfer.
* **Exponential Backoff:** If a network request fails or times out, the sync worker applies an exponential backoff algorithm (e.g., retrying after 5s, 15s, 60s, up to a maximum cap of 1 hour) to prevent network congestion or battery drain.
* **Self-Scheduling Retry:** The worker may schedule its own retry attempt after a delay rather than waiting for an external online event. This allows failed batches to re-enter the queue automatically when the device remains offline or the intermediary is temporarily unavailable.
* **Idempotency:** All sync payloads include unique client-generated UUIDs, ensuring that if a batch is successfully processed by the server but the acknowledgement response is lost due to a sudden power cut, re-transmitting the batch will not create duplicate patient records.
