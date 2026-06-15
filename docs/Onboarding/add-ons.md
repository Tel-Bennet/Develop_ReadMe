---
title: Conditional Add-ons
slug: add-ons
excerpt: "A2P (10DLC), IoT, and Static IP / private APN add-ons — run these alongside the matching phase."
hidden: false
---

Run these alongside the matching phase. Skip any that don't apply to your use case.

---

## Add-on A — A2P Messaging (10DLC)

**Required if** the partner is sending A2P (application-to-person) messages. Slots in alongside **Phase 3 — Intelligent Messaging** testing.

| # | Task | Owner | Notes |
|---|---|---|---|
| 1 | TCR brand registered via Telegent's Sinch DCA path. | Partner | Brand ID |
| 2 | TCR campaign registered (use case, sample messages, opt-in/opt-out flow). | Partner | Campaign ID |
| 3 | KYC documentation submitted to Sinch / TCR. | Partner | — |
| 4 | Campaign approved and bound to partner's `NumberType=mvno` + `MessageType=a2p` numbers. | Joint | — |
| 5 | Throughput / TPS confirmed for the campaign tier. | Joint | — |

> 📘 **Note**
>
> For A2P, use `NumberType = "mvno"` and `MessageType = "a2p"` when provisioning numbers. `iot` numbers are p2p only.

---

## Add-on B — IoT

**Required for** IoT modules / cellular devices that aren't phones. Slots in alongside **Phase 3 — Intelligent Data** testing.

| # | Task | Owner | Notes |
|---|---|---|---|
| 1 | APN confirmed (default: `iot.joonto`). | Joint | — |
| 2 | Module IMEI / TAC list provided for whitelist if device class is non-phone. | Partner | — |
| 3 | T-Mobile IMEI / TAC whitelist applied to the account. | Telegent | Prevents `EMM_CAUSE_ESM_FAILURE` |
| 4 | Radio access confirmed (Cat-1 validated; CAT-M1 / NB-IoT subject to engineering confirmation per SIM SKU). | Joint | — |
| 5 | Test device attach + data session on partner module. | Partner | — |
| 6 | Sample data CDR delivered with expected fields populated. | Partner | — |

> 🚧 **Warning**
>
> **CAT-M1 / NB-IoT support** is subject to engineering confirmation per SIM SKU — verify with your Telegent rep before committing to a device class.

---

## Add-on C — Static IP / Private APN

**Required if** the partner needs static IP allocations or a dedicated APN. Slots in alongside **Phase 2 or Phase 3**.

| # | Task | Owner | Notes |
|---|---|---|---|
| 1 | Static-IP requirement confirmed (count, region, IPv4/IPv6). | Joint | — |
| 2 | APN confirmed (e.g., `telegent.static`) or private APN scoped with T-Mobile. | Telegent | — |
| 3 | IP allocations issued and mapped to ICCIDs / MSISDNs. | Telegent | — |
| 4 | Partner-side firewall / NAT rules adjusted. | Partner | — |
| 5 | Reachability test from partner to device IP. | Partner | — |

---

> 📘 **Note**
>
> Pair this checklist with the **Telegent Customer FAQ** for technical detail on each API call.

---

  - **[Back to Onboarding Overview](/docs/onboarding-overview)** — Full phase summary and navigation

  - **[Best Practices Guide](/docs/best-practices-overview)** — Deep-dive API reference for MVNO provisioning
