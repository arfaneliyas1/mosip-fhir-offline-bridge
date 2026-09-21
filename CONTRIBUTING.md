# Contributing to MOSIP-to-FHIR Offline Verification Bridge

First off, thank you for your interest in contributing! Whether you are a digital public infrastructure (DPI) architect, health informatics specialist, or software engineer, your insights help bridge the last-mile gap in rural health technology.

This repository is maintained as an open architectural specification and proof-of-concept framework. Here is how you can get involved:

---

## 1. Ways You Can Contribute

* **Review & Critique Specifications:** Read through the documents in [`/docs`](docs/) and open an issue or pull request if you spot architectural gaps, edge-case vulnerabilities, or opportunities to align closer with global standards (e.g., MOSIP Claim 169 or HL7 FHIR R4).
* **Improve Proof-of-Concept Code:** Enhance the Python cryptographic verification scripts (`/proof-of-concept/verify_qr_signature.py`) or JavaScript sync workers (`/proof-of-concept/mock_sync_worker.js`).
* **Expand Reference Schemas:** Contribute additional test vectors, mock FHIR resources, or payload translations in the [`/schemas`](schemas/) directory.
* **Documentation & Diagrams:** Improve Mermaid.js architecture diagrams or clarify technical explanations.

---

## 2. Standard Contribution Workflow

1. **Fork the Repository** to your own GitHub account.
2. **Clone your Fork** locally (`git clone https://github.com/your-username/mosip-fhir-offline-bridge.git`).
3. **Create a Feature Branch** for your change (`git checkout -b feature/amazing-improvement`).
4. **Commit Your Changes** with clear, descriptive commit messages (`git commit -m 'Add edge case handling for token expiration clock drift'`).
5. **Push to Your Branch** (`git push origin feature/amazing-improvement`).
6. **Open a Pull Request** against the `main` branch of `arfaneliyas1/mosip-fhir-offline-bridge`.

---

## 3. Pull Request Guidelines

* **Keep PRs Focused:** Try to address a single issue, document section, or code snippet per pull request.
* **Reference Standards:** When suggesting changes to identity or health mappings, cite relevant standards (e.g., MOSIP specifications, HL7 FHIR implementation guides).
* **Maintain Professionalism:** All discussions in issues and pull requests must remain collaborative, respectful, and focused on technical excellence.

---

## 4. Code of Conduct

By participating in this project, you agree to maintain a constructive, inclusive, and professional environment for fellow engineers, researchers, and public health practitioners.

Thank you for helping build resilient infrastructure for last-mile health systems!
