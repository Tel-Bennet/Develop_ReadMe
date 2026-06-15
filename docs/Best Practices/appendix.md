---
title: Appendix
slug: appendix
excerpt: ID glossary and common error reference for the Telegent API.
hidden: false
---

## ID Glossary

Every ID in Telegent has a prefix that tells you exactly what it refers to. When you see an unknown ID in a payload or error message, look it up here first.

| ID | Resource | How it's created |
|---|---|---|
| `AID` | Account | `POST /v1.0/account/create` |
| `TSUID` | Subscriber | `POST /v1.0/subscribers/create` |
| `MRID` | Message Route | `POST /v1.0/message/routes` — required to provision numbers |
| `CRID` | Voice Route | `POST /v1.0/voice/routes` — required if `VoiceEnabled` |
| `PID` | Product | `POST /v1.0/products` — smallest billable unit, bundled into Packages |
| `PKID` | Package | `POST /v1.0/packages` — a bundle of Products sold at one price |
| `NID` / `TNID` | Phone Number | `POST /v1.0/numbers/provision` or `/numbers/portin` |
| `ICCID` | SIM | Physical SIM or eSIM identifier — optional on most calls |
| `CFID` | Call Filter | Per-subscriber Guardian call-filter record |
| `MFID` | Message Filter | Per-subscriber Guardian message-filter record |

> 📘 **Info**
>
> `PRID` and `PIID` also appear in some endpoints (Phone Rate ID, Product Item ID). For their exact meaning and where they apply, see [docs.telegent.com](https://docs.telegent.com) — the spec is the source of truth.

---

## Common Errors

| Error | Area | Resolution |
|---|---|---|
| `401` | Auth | Bearer token expired, or the token's `ApiEndpoint` scope doesn't match the URL you called. Generate a fresh, endpoint-scoped token. |
| `MessageRouteId required` | Routes | You skipped Phase 4. Create an MRID before `/numbers/provision`. |
| `Email already exists` | Subscribers | Subscriber emails are unique platform-wide. Pick a different one. |
| `Invalid AccountId` | Account | AID typo or you used a sandbox AID against production. Verify with your rep. |
| `NumberType / MessageType mismatch` | Provisioning | `iot` = p2p only. Use `mvno` for a2p on a mobile line. |

---

  - **[Back to Reference](/docs/reference)** — Full request/response payloads and field tables

  - **[API Reference](/reference/getting-started)** — Full OpenAPI spec with interactive playground
