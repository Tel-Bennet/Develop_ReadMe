---
title: Phase 4 — Production Cutover
slug: phase-4
excerpt: "Move the partner to production credentials, provision the first live number, and confirm monitoring is in place."
hidden: false
---

**Goal:** Move the partner to production credentials, provision the first live number, and confirm monitoring is in place.

---

## Checklist

| # | Task | Owner | Notes |
|---|---|---|---|
| 1 | Production `AccountKey` and `AccountSecret` issued. | Telegent | — |
| 2 | Production webhooks confirmed reachable from Telegent infrastructure. | Joint | — |
| 3 | Production Message Route + Voice Route created (partner-owned going forward). | Partner | Joint call for first-time setup if needed |
| 4 | First production number provisioned end-to-end (Product → Package → Subscriber → Number → Subscription). | Partner | Capture MSISDN + TNID |
| 5 | First production outbound SMS sent and delivered. | Joint | — |
| 6 | First production inbound SMS received and parsed. | Joint | — |
| 7 | Partner-side monitoring / alerting in place (webhook failures, token expiry, error rates). | Partner | — |
| 8 | On-call escalation path documented (who pages whom, what hours, how). | Joint | — |
| 9 | Go-live sign-off. | Joint | Date + initials |

---

### First Production Number — End-to-End Flow

The first live number must be provisioned in this exact dependency order:

  
#### Create Product

`POST /v1.0/products` — defines what you're selling (eSIM, data, SMS bucket, etc.)

  
#### Create Package

`POST /v1.0/packages` — bundles one or more Products into a priced offering

  
#### Create Subscriber

`POST /v1.0/subscribers/create` — the end user who will own the number

  
#### Provision Number

`POST /v1.0/numbers/provision` — assign the number to the Subscriber and Account

    Save the `PhoneNumberAssigned` (MSISDN) and `PhoneNumberId` (TNID).

  
#### Create Subscription

`POST /v1.0/subscriptions` — links the Subscriber + Number + Package and starts billing

---

> ✅ **Success**
>
> **Phase complete when:** First production message has flowed both directions, monitoring is live, and the escalation path is written down.

---

  - **[Previous: Phase 3 — API Walkthrough & Testing](/docs/phase-3)** — Sandbox testing sign-off

  - **[Next: Phase 5 — Post-launch](/docs/phase-5)** — First 30 days stabilization
