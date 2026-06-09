---
title: Phase 2 — Connectivity
slug: phase-2
excerpt: "Collect webhook URLs and, for SIP partners, exchange SBC IPs and agree on signaling so the network is ready before testing begins."
hidden: false
---

**Goal:** Collect the partner's webhook URLs and, for SIP partners, exchange SBC IPs and agree on signaling so the network is ready before testing begins.

---

## Checklist

### Webhooks — Inbound Messaging and DLR

| # | Task | Owner |
|---|---|---|
| 1 | Partner provided inbound message webhook URL (with auth type: Bearer / Basic). | Partner |
| 2 | Partner provided DLR (delivery report) webhook URL — may reuse the inbound URL. | Partner |
| 3 | Webhook URLs reachable from Telegent infrastructure (firewall / IP whitelist done). | Joint |
| 4 | CDR delivery method chosen: webhook / email / both. Voice and SMS files are split. | Partner |
| 5 | Partner reviewed inbound JSON schema (`Message_ID`, `Owner`, `To`, `From`, `Message_Body`, `Segment`, etc.) per the Customer FAQ. | Partner |

### SIP Interconnect — If Voice via SIP is in Scope

| # | Task | Owner |
|---|---|---|
| 6 | Partner provided SBC public IP(s) for SIP signaling and media. | Partner |
| 7 | Telegent provided Telegent SBC IP(s). | Telegent |
| 8 | Mutual IP whitelist applied on both sides. | Joint |
| 9 | Custom SIP headers agreed (e.g., hairpin flags for FMC, identifying flag headers). | Joint |

---

### Inbound Message Webhook — Expected JSON Schema

When an inbound SMS/MMS is delivered to your webhook, the payload includes:

| Field | Description |
|---|---|
| `Message_ID` | Unique identifier for the message |
| `Owner` | The Telegent number that received the message |
| `To` | Recipient number (E.164) |
| `From` | Sender number (E.164) |
| `Message_Body` | Text content of the message |
| `Segment` | Number of SMS segments |

> 📘 **Note**
>
> For the full inbound message schema, refer to the Customer FAQ provided by your Telegent representative.

---

> ✅ **Success**
>
> **Phase complete when:** Webhooks are reachable from Telegent, and (for SIP partners) both sides have whitelisted each other and agreed on headers.

---

  - **[Previous: Phase 1 — Credentials & Access](/onboarding/phase-1)** — Credentials and first OAuth token

  - **[Next: Phase 3 — API Walkthrough & Testing](/onboarding/phase-3)** — End-to-end sandbox testing
