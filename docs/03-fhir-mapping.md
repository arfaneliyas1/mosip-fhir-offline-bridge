# 03. MOSIP-to-FHIR Data Mapping Specification

## 1. Overview & Objectives
Once an offline identity token (such as a Fayda / MOSIP QR payload) is successfully validated via the local public key infrastructure, the extracted identity claims must be ingested into the local clinical database.

However, national identity schemata and global health standards use completely different structures. This document defines the **semantic translation dictionary** and structural mapping engine that converts raw identity claims into standardized **HL7 FHIR Release 4 (R4) `Patient` resources**.

---

## 2. Semantic Mapping Dictionary (`Fayda Claims` $\rightarrow$ `FHIR Patient`)

The table below outlines the precise attribute translation rules used by the edge mapper engine:

| Fayda QR Claim Attribute | HL7 FHIR Target Path | Data Type | Transformation & Constraints |
| :--- | :--- | :--- | :--- |
| `sub` (UIN Token) | `Patient.identifier` | Identifier | Map with custom system OID (`urn:oid:1.3.6.1.4.1.59784.fayda.uin`), setting `type.coding.code` to `NI` (National Identifier). |
| `full_name_en` | `Patient.name` | HumanName | Split string by whitespace into `given` (first name/middle name) and `family` (last name). Set `use` to `official`. |
| `gender` | `Patient.gender` | code | Normalize to FHIR value set: `male`, `female`, `other`, or `unknown`. |
| `birth_date` | `Patient.birthDate` | date | Direct mapping formatted as strict ISO 8601 (`YYYY-MM-DD`). |
| `phone_number` | `Patient.telecom` | ContactPoint | Set `system` to `phone`, `use` to `mobile`, and `value` to the raw string string. |
| `address.region` / `zone` / `woreda` | `Patient.address` | Address | Map administrative hierarchy into standard FHIR address elements (`state`, `district`, `city`, `country`). |

---

## 3. Complete FHIR Mapping Schema Example

When the edge translation engine processes a verified identity token, it constructs a fully compliant FHIR resource bundle or standalone resource.

### Source: Decrypted Fayda Identity Claims Fragment
```json
{
  "sub": "UIN-9876-5432-1098",
  "identity_claims": {
    "full_name_en": "Abebe Kebede",
    "gender": "M",
    "birth_date": "1994-06-12",
    "phone_number": "+251911234567",
    "address": {
      "region": "Oromia",
      "zone": "East Shewa",
      "woreda": "Adama Zuria"
    }
  }
}
```
