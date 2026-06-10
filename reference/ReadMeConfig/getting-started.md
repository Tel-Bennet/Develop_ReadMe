---
title: Getting Started
excerpt: Provision numbers, send messages, route voice calls, and manage subscribers through a single REST API.
api_config: getting-started
hidden: false
icon: icon-book1
---
The Telegent mPaaS API gives you programmatic control over the full mobile communications lifecycle — provisioning and porting phone numbers, routing voice calls, sending messages, and managing subscribers, accounts, packages, and AI-powered filtering.

> 📘 **API basics**
>
> **Base URL:** `https://api.telegent.com/v1.0`
> **Auth:** `Authorization: Bearer <token>` on every request — see [OAuth2](/reference/oauth2) to obtain a token.
> **Response shape:** every response is JSON and includes a top-level `Successful` boolean.

## Browse by category

<Cards>
  <Card kind="tile" title="OAuth2" href="/reference/oauth2" icon="fa-duotone fa-key">Exchange credentials for a Bearer token</Card>

  <Card kind="tile" title="Numbers" href="/reference/numbers" icon="fa-duotone fa-phone">Search availability, provision, port, and manage number inventory and data usage</Card>

  <Card kind="tile" title="Message" href="/reference/message" icon="fa-duotone fa-message">Create message routes, send outbound SMS/MMS, and query message history</Card>

  <Card kind="tile" title="Voice" href="/reference/voice" icon="fa-duotone fa-phone-volume">Configure voice routes and manage outbound/inbound call handling</Card>

  <Card kind="tile" title="Workgroups" href="/reference/workgroups" icon="fa-duotone fa-microphone">Manage workgroups, activities, and call-handling logic</Card>

  <Card kind="tile" title="Subscribers & AI Guardian" href="/reference/subscribers" icon="fa-duotone fa-shield">Manage subscribers and configure per-subscriber call/message filters, blocked contacts, and guardian relationships</Card>

  <Card kind="tile" title="Accounts" href="/reference/accounts" icon="fa-duotone fa-users">Manage accounts, distributors, and aggregators</Card>

  <Card kind="tile" title="Products & Packages" href="/reference/products" icon="fa-duotone fa-box">Define products and services and bundle them into packages and subscriptions</Card>
</Cards>

## Prefer a guided walkthrough?

<Cards>
  <Card kind="tile" title="Quick Start Guide" href="/docs/quick-start-guide" icon="fa-duotone fa-bolt">End-to-end walkthrough from credentials to your first working setup</Card>

  <Card kind="tile" title="Partner Onboarding" href="/docs/onboarding-overview" icon="fa-duotone fa-rocket-launch">The full POC → production plan for new MVNO and IoT partners</Card>
</Cards>
