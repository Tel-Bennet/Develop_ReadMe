---
title: "Phase 1 — Credentials & Access"
slug: phase-1
excerpt: "Get the partner into the dev environment with credentials, console access, and a working OAuth token."
hidden: false
---

**Goal:** Get the partner into the dev environment with credentials, console access, and a working OAuth token.

---

## Checklist

| # | Task | Owner |
|---|---|---|
| 1 | Telegent account created and DID (Distributor ID) assigned. | Telegent |
| 2 | `AccountKey` (DID-...) and `AccountSecret` issued via secure channel. | Telegent |
| 3 | MVNO Console login provisioned for primary technical contact. | Telegent |
| 4 | Partner confirmed access to [docs.telegent.com](https://docs.telegent.com) (partner-facing API docs). | Partner |
| 5 | Partner accessed Swagger at `https://api.telegent.com/docs/index.html` (interactive API explorer). | Partner |
| 6 | Partner imported Postman collection (optional — Swagger covers most cases). | Partner |
| 7 | Partner generated first OAuth token successfully against `/v1.0/oauth2/tokens`. | Partner |
| 8 | Partner reviewed escalation contacts and on-call paths. | Partner |

---

### Generating Your First Token

**Endpoint:** `POST /v1.0/oauth2/tokens`

```json Request
{
  "AccountKey": "YOUR_ACCOUNT_KEY",
  "AccountSecret": "YOUR_ACCOUNT_SECRET",
  "ApiEndpoint": "https://api.telegent.com/v1.0/numbers/provision"
}
```

```json Response
{
  "token": "abcdefghi.................",
  "successful": true,
  "tokenExpiry": "05/02/2026 06:36:13 PM"
}
```

> 🚧 **Warning**
>
> **Token reminder:** Tokens are scoped to a specific `ApiEndpoint` and expire after a few minutes — always include `AccountKey`, `AccountSecret`, **and** `ApiEndpoint` in every token request. Never share credentials over email.

---

> ✅ **Success**
>
> **Phase complete when:** Partner can sign into the console, hit the dev API, and generate a valid token on their own.

---

  - **[Previous: Discovery & Setup](/docs/discovery)** — POC kickoff and NDA

  - **[Next: Phase 2 — Connectivity](/docs/phase-2)** — Configure webhooks and SIP interconnect
