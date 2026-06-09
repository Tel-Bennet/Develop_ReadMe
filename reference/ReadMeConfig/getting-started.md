---
title: Getting Started
excerpt: Set up the welcome page for your API to help users make their first call.
api_config: getting-started
hidden: false
icon: icon-book1
---
## Overview

The Telegent mPaaS API gives you programmatic control over the full mobile communications lifecycle — from provisioning and porting phone numbers, to routing voice calls and sending messages, to managing subscribers, accounts, packages, and AI-powered filtering.

All requests are made over HTTPS to the base URL:

```text
https://api.telegent.com/v1.0
```

Responses are JSON and always include a `Successful` field:

```json
{
  "Successful": true,
  "Data": { "..." : "..." }
}
```

## Quick Start

1. **Get your credentials** — obtain your `AccountKey` and `AccountSecret` from your Telegent representative or the [API Portal](https://api.telegent.com).
2. **Authenticate** — exchange your credentials for a Bearer token via [`POST /v1.0/OAuth2/tokens`](/reference/post_v1-0-oauth2-tokens).
3. **Make your first call** — include the token in the `Authorization` header on every request:

```http
Authorization: Bearer YOUR_TOKEN_HERE
```

## API Categories

<Cards>
  <Card kind="tile" title="OAuth2" href="/reference/post_v1-0-oauth2-tokens" icon="fa-duotone fa-key">Exchange credentials for a Bearer token</Card>

  <Card kind="tile" title="Numbers" href="/reference/post_v1-0-numbers-availability" icon="fa-duotone fa-phone">Search availability, provision numbers, manage inventory, and configure data usage</Card>

  <Card kind="tile" title="Number Porting" href="/reference/post_v1-0-numbers-portin" icon="fa-duotone fa-arrows-left-right">Port numbers in or out, check eligibility, and manage port requests</Card>

  <Card kind="tile" title="Message" href="/reference/post_v1-0-message-outbound" icon="fa-duotone fa-message">Create message routes, send outbound SMS/MMS, and query message history</Card>

  <Card kind="tile" title="Voice" href="/reference/post_v1-0-voice-routes" icon="fa-duotone fa-phone-volume">Configure voice routes and manage outbound/inbound call handling</Card>

  <Card kind="tile" title="Workgroups" href="/reference/post_v1-0-workgroups" icon="fa-duotone fa-microphone">Manage workgroups, activities, and call handling logic</Card>

  <Card kind="tile" title="Products, Packages & Subscriptions" href="/reference/get_v1-0-products" icon="fa-duotone fa-box">Define services and products, bundle into packages, and manage subscriptions</Card>

  <Card kind="tile" title="AI Guardian" href="/reference/post_v1-0-subscribers-message-filter" icon="fa-duotone fa-shield">Configure per-subscriber call and message filters, blocked contacts, and guardian relationships</Card>

  <Card kind="tile" title="Accounts & Subscribers" href="/reference/get_v1-0-account" icon="fa-duotone fa-users">Create and manage accounts, subscribers, aggregators, and distributors</Card>
</Cards>

## Need Help?

<Cards>
  <Card kind="tile" title="Quick Start Guide" href="/docs/quick-start-guide" icon="fa-duotone fa-rocket-launch">Step-by-step authentication and first API call</Card>

  <Card kind="tile" title="API Portal" href="https://api.telegent.com" icon="fa-duotone fa-globe">Access the API management console</Card>

  <Card kind="tile" title="Support" href="https://support.telegent.com/support/home" icon="fa-duotone fa-life-ring">Visit our support portal for help and resources</Card>
</Cards>
