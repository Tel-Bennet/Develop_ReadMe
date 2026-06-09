---
title: API Reference
slug: introduction
category: API Reference
order: 0
x-mintlify-group: Overview
---

## Overview

The Telegent mPaaS API gives you programmatic control over the full mobile communications 
lifecycle — from provisioning and porting phone numbers, to routing voice calls 
and sending messages, to managing subscribers, accounts, packages, and AI-powered filtering.

All requests are made over HTTPS to the base URL:

```text
https://api.telegent.com/v1.0
```

Responses are JSON and always include a `Successful` field:

```json
{
  "Successful": true,
  "Data": { ... }
}
```

---

## Quick Start

  
#### Get Your Credentials

Obtain your `AccountKey` and `AccountSecret` from your Telegent representative or 
    the [API Portal](https://api.telegent.com).

  
#### Authenticate

Exchange your credentials for a Bearer token via `POST /v1.0/oauth2/tokens`. 
    See the [OAuth2 endpoint](/api-reference/oauth2) for details.

  
#### Make Your First Call

Include the token in the `Authorization` header on every request:
```http
    Authorization: Bearer YOUR_TOKEN_HERE
```

---

## API Categories

  - **[OAuth2](/api-reference/oauth2)** — Exchange credentials for a Bearer token

  - **[Numbers](/api-reference/numbers)** — Search availability, provision numbers, manage inventory, and configure data usage

  - **[Number Porting](/api-reference/numbers)** — Port numbers in or out, check eligibility, and manage port requests

  - **[Message](/api-reference/message)** — Create message routes, send outbound SMS/MMS, and query message history

  - **[Voice](/api-reference/voice)** — Configure voice routes and manage outbound/inbound call handling

  - **[Workgroups](/api-reference/workgroups)** — Manage workgroups, activities, and call handling logic

  - **[Products, Packages & Subscriptions](/api-reference/products)** — Define services and products, bundle into packages, and manage subscriptions

  - **[AI Guardian](/api-reference/ai-guardian)** — Configure per-subscriber call and message filters, blocked contacts, and 
    guardian relationships

  - **[Accounts & Subscribers](/api-reference/accounts)** — Create and manage accounts, subscribers, aggregators, and distributors

---

## Need Help?

  - **[Quick Start Guide](/quick-start-guide)** — Step-by-step authentication and first API call

  - **[API Portal](https://api.telegent.com)** — Access the API management console

  - **[Support](https://support.telegent.com/support/home)** — Visit our support portal for help and resources
