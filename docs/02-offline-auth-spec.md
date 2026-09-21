# 02. Cryptographic Trust & Offline e-KYC Verification Specification

## 1. Overview & Trust Anchor Model
In an online environment, verification relies on live API calls to a centralized server managed by the National ID authority (e.g., Fayda / MOSIP). In an offline-first architecture, trust must be decentralized mathematically via **Public Key Infrastructure (PKI)**.

The root of trust originates from the **National Identity Authority Root Certificate Authority (CA)**, which issues cryptographically signed digital tokens to citizens. Edge verification nodes (such as rural clinic tablets) do not need internet access to talk to the server; instead, they operate using a locally cached, pre-loaded bundle of trusted public keys.

---

## 2. Public Key Infrastructure (PKI) Caching & Management
To verify identity tokens offline without network calls, edge nodes must maintain an up-to-date local cryptographic keystore.

* **Initial Key Provisioning:** When the clinic tablet is periodically brought to an urban hub or connected via a rare network window, it downloads the current public key certificate bundle (`fayda_root_ca.pem` and active intermediate signing keys) from the national authority.
* **Certificate Validity & Rotation:** Keys include predefined validity periods. The edge application enforces strict expiration checks to prevent verification using outdated or compromised keys.
* **Secure Local Keystore:** Public keys and signing certificates are stored securely within the encrypted local storage layer, protected against unauthorized extraction or tampering.

---

## 3. Structure of the Time-Signed Identity Token (QR Code)
When a citizen presents their identity, the QR code encodes a digitally signed JSON payload (or JSON Web Token equivalent) containing essential demographic claims and cryptographic metadata.

### Example Payload Structure
```json
{
  "iss": "FaydaVerse_National_ID_Authority",
  "sub": "UIN-9876-5432-1098",
  "iat": 1756000000,
  "exp": 1756086400,
  "identity_claims": {
    "full_name_en": "Abebe Kebede",
    "full_name_am": "አበበ ከበደ",
    "gender": "M",
    "birth_date": "1994-06-12",
    "phone_number": "+251911234567",
    "address": {
      "region": "Oromia",
      "zone": "East Shewa",
      "woreda": "Adama Zuria"
    }
  },
  "signature": "MEUCIQD3v8x...mock_ecdsa_signature_string...=="
}
```
