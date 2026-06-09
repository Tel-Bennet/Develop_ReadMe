---
title: Best Practices Overview
slug: index
excerpt: "A clean, end-to-end flow for provisioning subscribers, numbers, packages, data limits, and AI Guardian."
category: Best Practices
order: 0
x-mintlify-group: MVNO Guide
x-mintlify-icon: star
---

## Overview

This guide is your companion to the Telegent API. It covers the full provisioning lifecycle — from authentication through AI Guardian — written specifically for MVNOs building on the Telegent mPaaS platform.

> 📘 **Note**
>
> **What this guide covers:**
>
>   - A Quick Start summary of the seven provisioning phases in order
>   - A deep-dive reference for each phase with request/response payloads, field tables, and gotchas
>   - An appendix with the full ID glossary and common errors
>
>   **Base URL:** `https://api.telegent.com/v1.0`
>   **Full API Reference:** [docs.telegent.com](https://docs.telegent.com)
>   **Postman:** Telegent Core APIs.json (provided by your rep)

> 📘 **Info**
>
> **How to read this guide**
>
>   The Quick Start below tells you what to do and in what order. The [Reference](/best-practices/reference) gives you the request and response payloads, field tables, and gotchas for each phase. If you ever see an ID name you don't recognize (PRID, PID, PIID, MRID, CRID), check the [Appendix](/best-practices/appendix) or docs.telegent.com.

---

## Quick Start Flow

Seven short phases, in order, that take an MVNO from zero to a live, billable subscriber on a Telegent-provisioned number. Each phase links to its deep-dive in the Reference.

<img src="/images/provisioning_flow_overview.svg" alt="The Provisioning Flow — seven boxes in a horizontal sequence grouped into three stages: Set up (Account, Subscribers, Routes), Define what you sell (Products/Packages, Subscription), and Light up the line (Provision/Port, Data Limits + Guardian)" />

  
#### Phase 1 — Authenticate

Trade your `AccountKey` and `AccountSecret` for a short-lived Bearer token, scoped to a specific endpoint URL.

    → [Section 1 — Authentication](/best-practices/reference#1-authentication)

  
#### Phase 2 — Account

Create the Account. An Account is a family or a business — it sits under a Distributor, which sits under the Aggregator. Every Subscriber and every Number you provision lives under exactly one Account.

    → [Section 2 — Account](/best-practices/reference#2-account)

  
#### Phase 3 — Subscribers and Roles

Create the Manager and Subscribers under the Account. One Manager per Account is the convention; Subscribers can hold one or many Numbers each. Every Number must be assigned to both an Account and a Subscriber.

    → [Section 3 — Subscribers and Roles](/best-practices/reference#3-subscribers-and-roles)

  
#### Phase 4 — Message Route and Voice Route

Set up where SMS lands (MRID) and where calls go (CRID). Numbers cannot be provisioned without a Message Route. Voice Route is required only if you are offering voice.

    → [Section 4 — Routes](/best-practices/reference#4-routes-message-and-voice)

  
#### Phase 5 — Products, Packages, Subscriptions

Define what you sell (Products), bundle them into Packages, and tie a Package to a Subscriber with a Subscription. Telegent can pre-load common Products (eSIM, data plans) to get you started — ask your rep.

    → [Section 6 — Products and Packages](/best-practices/reference#6-products-and-packages)
    → [Section 7 — Subscriptions](/best-practices/reference#7-subscriptions)

  
#### Phase 6 — Provision or Port a Number

Either provision a brand-new mobile, IoT, or VoIP number, or port one in from another carrier. Port-ins are a multi-step lifecycle — eligibility, submit, update, cancel, and monitor — that can stay open for days while the losing carrier responds. When a subscriber leaves, issue a port-out PIN so the gaining carrier can complete the transfer.

    → [Section 5 — ICCID](/best-practices/reference#5-iccid-when-to-use-it)
    → [Section 8 — Provisioning or Porting](/best-practices/reference#8-provisioning-or-porting)

  
#### Phase 7 — Data Usage and AI Guardian

Set notify, throttle, and hard-limit thresholds per number. Enable AI Guardian per subscriber for allow-list / block-list control on SMS and Voice, plus SMS-only filter levels (CHILD / ADOLESCENT / TEENAGER).

    → [Section 9 — Data Usage](/best-practices/reference#9-data-usage-limits-and-thresholds)
    → [Section 10 — AI Guardian](/best-practices/reference#10-ai-guardian-allow-block-filter-levels)

---

## What's Next?

  - **[Comprehensive Reference](/best-practices/reference)** — Full request/response payloads, field tables, and gotchas for all 10 sections

  - **[Appendix](/best-practices/appendix)** — ID glossary and common error reference

  - **[API Reference](/api-reference/introduction)** — Full OpenAPI spec with interactive playground

  - **[Partner Onboarding](/onboarding)** — Step-by-step onboarding plan for new partners
