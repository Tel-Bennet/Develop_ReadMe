---
title: "Phase 3 — API Walkthrough & Sandbox Testing"
slug: phase-3
excerpt: "Walk through every Intelligent API section in dependency order. By the end, the partner has built their own number end-to-end on dev."
hidden: false
---

**Goal:** Walk the partner through every Intelligent API section in dependency order. By the end, the partner has built their own number end-to-end on dev.

> 📘 **Note**
>
> **Work the sections in order.** Each one depends on the previous: you can't create a Subscription without a Subscriber, a Number, and a Package; you can't provision a Number without Routes. Skip optional sections (Voice, Data) if they're out of scope.

---

## Checklist

### Intelligent Accounts — Child Accounts Under the Distributor

_Skip if operating under a single account._

| # | Task | Owner | ID to Save |
|---|---|---|---|
| 1 | Partner creates a child Account under their Distributor via the API. | Partner | `AID-...` |

### Intelligent Products — SKUs That Will Be Billed

| # | Task | Owner | ID to Save |
|---|---|---|---|
| 2 | Partner creates one or more Products via `POST /v1.0/products`. | Partner | `PID-...` |

### Intelligent Packages — Bundle Products into Priced Offerings

| # | Task | Owner | ID to Save |
|---|---|---|---|
| 3 | Partner creates a Package bundling one or more Products via `POST /v1.0/packages`. | Partner | `PKID-...` |

### Intelligent Routes — Message and Voice Routing Infrastructure

| # | Task | Owner | ID to Save |
|---|---|---|---|
| 4 | Partner creates a Message Route (MRID) via API. First-time setup can be a joint call. | Partner | `MRID-...` |
| 5 | Partner creates a Voice Route (CRID) via API. For SIP partners, this is a SIP-enabled route pointing to the partner's SBC. First-time setup can be a joint call. | Partner | `CRID-...` |

### Intelligent Subscribers — The End-User Record

| # | Task | Owner | ID to Save |
|---|---|---|---|
| 6 | Partner creates a Subscriber via `POST /v1.0/subscribers`. | Partner | `TSUID-...` |

### Intelligent Mobile Numbers — Number Provisioning and Lifecycle

| # | Task | Owner | ID to Save |
|---|---|---|---|
| 7 | Partner provisions a test number via `POST /v1.0/numbers/provision`. | Partner | `TNID-...` |
| 8 | Partner tests number status changes (suspend / restore / deactivate / reactivate) via `/v1.0/numbers/status`. | Partner | — |

### Intelligent Port-In — Full Lifecycle _(if porting is in scope)_

| # | Task | Owner | Notes |
|---|---|---|---|
| 8a | Eligibility checked via `POST /v1.0/numbers/portin/eligibility` before collecting any subscriber details. | Partner | Confirm number is portable to target classification |
| 8b | Port-in submitted via `POST /v1.0/numbers/portin` after LOA signed and current-carrier details confirmed. | Partner | Save `OrderId` (JNUOID-…) from the response |
| 8c | Port-in update tested via `POST /v1.0/numbers/portin/update` using the `OrderId` — simulate a carrier rejection correction. | Partner | Test `PortInDate` for wireline scenarios |
| 8d | Port-in cancel tested via `POST /v1.0/numbers/portin/cancel` using the `OrderId`. | Partner | Confirm cancel is final — a fresh submit is required to retry |
| 8e | Order status monitored via `GET /v1.0/numbers/order?OrderId=…` and partner can read all statuses (`Submitted`, `Pending Carrier Approval`, `Scheduled`, `Completed`, `Rejected`, `Cancelled`). | Partner | — |

### Intelligent Port-Out — PIN Issuance _(if porting out is in scope)_

| # | Task | Owner | Notes |
|---|---|---|---|
| 8f | Port-out PIN issued via `POST /v1.0/numbers/portout` for a test number. | Partner | Confirm PIN reaches the gaining carrier simulation |

### Intelligent Subscriptions — Link Subscriber + Number + Package

| # | Task | Owner | ID to Save |
|---|---|---|---|
| 9 | Partner creates a Subscription via `POST /v1.0/subscriptions` referencing `SubscriberId`, `TNID`, `ICCID`, and `PackageId`. | Partner | `SUB-...` |

### Intelligent Messaging — SMS and MMS Round-Trip

| # | Task | Owner | Notes |
|---|---|---|---|
| 10 | Outbound SMS sent via `/v1.0/message/outbound` and DLR received on partner webhook. | Partner | Path is singular: `message` |
| 11 | Inbound SMS received on partner webhook with correct JSON schema. | Partner | — |
| 12 | Outbound and inbound MMS tested with `MMS_Media_URL` populated. _(If MMS in scope.)_ | Partner | — |

### Intelligent Voice — Call Placement and Receipt

_Skip if voice is not in scope._

| # | Task | Owner | Notes |
|---|---|---|---|
| 13 | Partner numbers assigned to the correct Voice Route via API (SIP-enabled route for SIP partners). Allow up to 10 minutes for propagation. | Partner | — |
| 14 | OPTIONS keepalive confirmed both directions. _(SIP partners only.)_ | Joint | — |
| 15 | Outbound call placed from the test number and connected. SIP partners verify it lands on their SBC. | Partner | — |
| 16 | Inbound call received on the test number. SIP partners verify the Request-URI and headers match the agreed format. | Partner | — |

### Intelligent Data — Data Attach and Session

_Skip if data is not in scope._

| # | Task | Owner | Notes |
|---|---|---|---|
| 17 | Data session attached on the assigned APN (e.g., `iot.joonto` for IoT, `wireless.mobi` for MVNO). | Partner | — |

### CDRs — Call Detail Records

| # | Task | Owner | Notes |
|---|---|---|---|
| 18 | Sample CDR delivered (via configured method: webhook / email) and parsed by the partner. | Partner | Voice + SMS split |

### Sign-off

| # | Task | Owner |
|---|---|---|
| 19 | End-to-end happy path signed off by both teams. | Joint |

---

> 🚧 **Warning**
>
> **Voice-route propagation:** Voice-route changes propagate via a 10-minute automation cycle. For urgent moves during testing, ping Telegent on-call for a manual flip.

---

> ✅ **Success**
>
> **Phase complete when:** Every relevant Intelligent API category has been tested on dev. The partner can provision, message, and (if applicable) call from a number they created themselves.

---

  - **[Previous: Phase 2 — Connectivity](/onboarding/phase-2)** — Webhooks and SIP interconnect

  - **[Next: Phase 4 — Production Cutover](/onboarding/phase-4)** — Move to production credentials and go live
