---
title: Comprehensive Reference
slug: reference
excerpt: "Full request/response payloads, field tables, and gotchas for all 10 API sections."
hidden: false
---

Each section follows the same shape: what the resource is, why it exists, the happy-path call, the parameters that matter, and the gotchas to plan around. For full schemas and additional optional fields, check docs.telegent.com.

---

## 1. Authentication

Every Telegent API call needs a Bearer token. You get one by posting your `AccountKey` and `AccountSecret` to the OAuth2 token endpoint. Tokens are short-lived and scoped to a specific `ApiEndpoint` URL, so generate a fresh one for each endpoint you call (or refresh on expiry).

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

Once you have a token, add this header to every subsequent request:

```
Authorization: Bearer YOUR_TOKEN
```

> 👍 **Tip**
>
> **Cache the token** in memory for the life of its expiry. Don't request a new token for every call — that's wasteful. Do regenerate when `ApiEndpoint` changes, since scope is per-URL.

---

## 2. Account

### Where an Account sits in the hierarchy

Telegent's org chart has four tiers. At the top is the **Aggregator** — the platform owner. Beneath it sit one or more **Distributors** (carriers, MVNEs, resellers). Each Distributor owns one or more **Accounts**, and each Account is the unit you'll actually work with day to day.

### What an Account is

Think of an Account as a family or a business. It holds one **Manager** — the steward who can administer the Account — and any number of **Subscribers**, who are the people actually using the service. A Subscriber, in turn, can hold one or many phone **Numbers**. Every Number that goes live on the platform is bound to exactly one Account and exactly one Subscriber. There is no orphan number on Telegent.

**Endpoint:** `POST /v1.0/account/create`

```json Request
{
  "AccountName": "Acme MVNO",
  "AccountAdmin": "ops@acmemobile.com",
  "BillingAddress": {
    "Street1": "100 Main St",
    "Street2": "Suite 200",
    "City": "Lehi",
    "State": "Utah",
    "Zip": "84043",
    "Country": "USA"
  },
  "MailingAddress": {
    "Street1": null,
    "City": null,
    "State": null,
    "Zip": null
  }
}
```

```json Response
{
  "AccountId": "AID-ceb82085-2725-45a1-bd5e-526ed19799d7",
  "AccountName": "Acme MVNO",
  "TotalSubscribers": 0,
  "BillingAddress": { "..." : "..." },
  "MailingAddress": { "..." : "..." }
}
```

### Parameters worth knowing

| Field | Type | Description |
|---|---|---|
| `AccountName` | string | Display name — the name of the family or business. Visible on invoices and reports. |
| `AccountAdmin` | string | Email of the Manager. They receive billing and system notices for the whole Account. |
| `BillingAddress` | object | Required for invoicing. Set `Country = USA` unless you're an international Distributor. |
| `MailingAddress` | object | Optional. Leave fields null if same as Billing. |

> 🚧 **Warning**
>
> **Save the AccountId (AID).** Every Subscriber you create and every Number you provision needs an AID. For Distributors managing more than one Account, AID becomes required on most downstream calls. Persist it the moment you create the Account.

> 📘 **Note**
>
> **The one rule to remember:** Every Number must have both an Account (AID) and a Subscriber (TSUID) assigned to it. Never provision or port a number without deciding who it belongs to first.

---

## 3. Subscribers and Roles

A Subscriber is a real person (or service identity) that lives under an Account. A Subscriber can hold one phone Number or many — a parent on a family plan might have a single line; a business operations lead might own a dozen IoT lines. Either way, every Number a Subscriber owns is bound to the same Account.

### The three roles

Each Subscriber record carries a **Role**. The Role determines what that person can do inside the Account.

| Role | Description |
|---|---|
| **Subscriber** | End user. Holds one or more Numbers, a Subscription, and (optionally) Guardian filters. Cannot administer the Account. |
| **Manager** | The steward of the Account — typically one per Account. Manages Subscribers, Subscriptions, Guardian filters, and data limits within their Account. |
| **Account Admin** | Administrative role at the Account level. Can configure routes, manage Packages, update billing info. Use sparingly; Distributors usually hold this. |

> 📘 **Info**
>
> **Manager = One per Account.** Telegent's product convention is one Manager per Account — the head of the family or the operations lead at the business. You can technically create multiple Subscribers with the Manager role, but the cleanest model (and the one MVNO billing assumes) is a single Manager who owns the Account-level decisions.

**Endpoint:** `POST /v1.0/subscribers/create`

```json Request
{
  "Name": "Jane Doe",
  "Email": "jane@example.com",
  "PhoneNumbers": ["+18015551234"],
  "Role": "Subscriber",
  "Password": "set-a-secure-default",
  "AccountId": "AID-…"
}
```

```json Response
{
  "SubscriberId": "TSUID-90c644ff-7f70-4587-a27e-d1d45bde7528",
  "Name": "Jane Doe",
  "Email": "jane@example.com",
  "PhoneNumbers": ["+18015551234"],
  "Role": "Subscriber",
  "Account": {
    "AccountId": "AID-…",
    "CompanyName": "Acme MVNO"
  }
}
```

### Parameters worth knowing

| Field | Type | Description |
|---|---|---|
| `Name` | string | Required. Free-text display name. |
| `Email` | string | Required. Must be unique across the entire platform. |
| `PhoneNumbers` | string[] | Required. E.164 format. Can be empty array on create, then assigned later. |
| `Role` | enum | `Subscriber` \| `Manager` \| `Account Admin` |
| `Password` | string | Required at create. Issue a temp value and force a reset on first login. |
| `AccountId` | string | Required. The AID this subscriber belongs to. |

> 🚧 **Warning**
>
> **Save the SubscriberId (TSUID).** TSUID is the join key for everything subscriber-specific: number assignment, subscriptions, AI Guardian filters, data usage settings. Without it, you can't tie a phone number to a person.

---

## 4. Routes — Message and Voice

Routes tell Telegent where to send inbound traffic and where to receive your callbacks. A **Message Route** is required before you can provision any number. A **Voice Route** is required only if the number will handle calls.

### 4.1 Message Route (MRID)

**Endpoint:** `POST /v1.0/message/routes`

```json Request
{
  "RouteName": "Main SMS Webhook",
  "MessageUrl": "https://yourapi.example.com/inbound-sms",
  "MessageUrlMethod": "POST",
  "MessageRouteEnabled": true,
  "MessageAuthenticationType": "Basic",
  "MessageUsername": "admin",
  "MessagePasswordToken": "passwordOrBearer",
  "CallbackMessageUrl": "https://yourapi.example.com/sms-status",
  "CallbackMessageUrlMethod": "POST",
  "CallbackMessageAuthenticationType": "Basic",
  "CallbackMessageUsername": "admin",
  "CallbackMessagePasswordToken": "password",
  "InboundBypass": false,
  "OutboundBypass": false,
  "IntelligentRouteEnabled": true,
  "AccountId": "AID-…"
}
```

```json Response
{
  "MessageRouteId": "MRID-ad0ff867-57dc-4aeb-80e9-9d18349080e9",
  "AccountId": "AID-…",
  "RouteName": "Main SMS Webhook",
  "MessageUrl": "https://yourapi.example.com/inbound-sms",
  "MessageUrlMethod": "POST",
  "MessageRouteEnabled": true,
  "MessageAuthenticationType": "Basic",
  "MessageUsername": "admin",
  "CallbackMessageUrl": "https://yourapi.example.com/sms-status",
  "CallbackMessageUrlMethod": "POST",
  "CallbackMessageAuthenticationType": "Basic",
  "InboundBypass": false,
  "OutboundBypass": false,
  "IntelligentRouteEnabled": true
}
```

> ✅ **Success**
>
> Save the `MessageRouteId` (MRID) — you will need it on every number provision call.

### 4.2 Voice Route (CRID)

**Endpoint:** `POST /v1.0/voice/routes`

Voice Routes support three `RouteType` values: `"Trunk"` (SIP trunk to your softswitch / PBX), `"URL"` (webhook for VoIP-style apps), or `"Forward"` (PSTN forward). Most MVNO setups use `Trunk`.

```json Request
{
  "RouteName": "Main SIP Trunk",
  "RouteType": "Trunk",
  "TrunkIp1": "20.87.87.87",
  "TrunkPort1": "5061",
  "TrunkTransport1": "UDP",
  "TrunkUri1": "https://pstn.yourcarrier.com",
  "TrunkEnabled1": true,
  "Trunk1Priortiy": 10,
  "Trunk1Weight": 10,
  "CallbackVoiceUrl": "https://yourapi.example.com/voice-events",
  "CallbackVoiceUrlMethod": "POST",
  "IntelligentRouteEnabled": true,
  "RouteEnabled": true,
  "AccountId": "AID-…"
}
```

```json Response
{
  "CallRouteId": "CRID-509de94f-79cc-429b-a317-2102654dabbb",
  "AccountId": "AID-…",
  "RouteName": "Main SIP Trunk",
  "RouteType": "Trunk",
  "TrunkIp1": "20.87.87.87",
  "TrunkPort1": "5061",
  "TrunkTransport1": "UDP",
  "TrunkUri1": "https://pstn.yourcarrier.com",
  "TrunkEnabled1": true,
  "Trunk1Priortiy": 10,
  "Trunk1Weight": 10,
  "IntelligentRouteEnabled": true,
  "RouteEnabled": true,
  "IpWhiteList": []
}
```

> ✅ **Success**
>
> Save the `CallRouteId` (CRID) for voice-enabled provisioning.

### Parameters worth knowing

| Field | Type | Description |
|---|---|---|
| `MessageUrl` | string | Where inbound SMS/MMS payloads are delivered. |
| `CallbackMessageUrl` | string | Where delivery receipts and status callbacks are delivered. |
| `TrunkIp1` / `Uri1` | string | Primary SIP endpoint. Configure two trunks (1 + 2) for failover. |
| `IntelligentRouteEnabled` | bool | Turn this on to enable AI Guardian + intelligent routing on the route. |
| `AccountId` | string | Conditional: required when a Distributor manages multiple Accounts. |

> 📘 **Note**
>
> **Authentication on your webhook.** Telegent supports Basic and Bearer on both the inbound URL and the callback URL. Use HTTPS endpoints. If you are running behind a CDN or load balancer, whitelist Telegent IPs separately — `IpWhitelist` on the Voice Route only applies to trunk traffic.

---

## 5. ICCID — When to Use It

ICCID is the unique serial of a SIM card or eSIM profile. Telegent treats ICCID as **optional** on both provision and port-in calls. Whether you should send one depends on the lifecycle moment.

> 📘 **Note**
>
> **Two places ICCID shows up:** ICCID is accepted on both `/numbers/provision` (when you want to pair on create) and `/numbers/portin` (when you are porting a number onto an existing SIM). On a Subscription, ICCID also identifies the SIM tied to that billing relationship.

  - **[Use ICCID when…](#)** — - Activating a physical SIM that the subscriber already has in hand — pair the ICCID at provision so the line is live the moment you respond to the API
    - Issuing an eSIM and have the profile ICCID generated — pair it at provision so the QR / activation code maps to a real number on first scan
    - Migrating a subscriber from another platform and need to preserve their SIM

  - **[Skip ICCID when…](#)** — - Reserving numbers in bulk before SIMs are mailed — provision without ICCID, then bind ICCID later via Numbers Update
    - Provisioning data-only numbers that will be assigned by ProductType (no SIM in the loop)
    - Running test / sandbox flows

---

## 6. Products and Packages

Products are the smallest billable unit in Telegent (an eSIM, a GB of data, an SMS bucket, a feature add-on). **Packages** bundle Products into something you actually sell to a subscriber. Then a **Subscription** ties one Package to one Subscriber.

### 6.1 Products

**Endpoint:** `POST /v1.0/products`

```json Request
{
  "SKU": "eSim",
  "Description": "Telegent eSim",
  "Type": "esim",
  "SubType": "esim",
  "Cost": 12.34,
  "BillingFrequency": "MRC"
}
```

```json Response
{
  "ProductId": "PRID-4384E69B-3194-9943-F839-20E477C8E399",
  "SKU": "eSim",
  "Description": "Telegent eSim",
  "Type": "esim",
  "SubType": "esim",
  "Cost": 12.34,
  "BillingFrequency": "MRC",
  "Active": true
}
```

| Field | Type | Description |
|---|---|---|
| `SKU` | string | Your internal stock-keeping code. Keep it stable; reports key off this. |
| `Type` / `SubType` | string | Product family (`esim`, `data`, `sms`, `feature`, etc.). See docs.telegent.com for the current enum. |
| `Cost` | number | Wholesale cost to you. Pricing to the subscriber lives on the Package. |
| `BillingFrequency` | string | `MRC` (monthly), `NRC` (one-time), or usage-based. Drives invoicing cadence. |

> 👍 **Tip**
>
> **Telegent can pre-load common Products.** If you don't want to define eSIM, base SMS, and data-tier Products from scratch, ask your Telegent rep to pre-load the standard catalog onto your Account. You can then bundle them into Packages without ever calling `/products` yourself.

### 6.2 Packages

**Endpoint:** `POST /v1.0/packages`

A Package has a name, a price the subscriber pays, and one or more **Package Items** — each Item references a `ProductId`.

```json Request
{
  "PackageName": "Family 10GB",
  "Description": "10GB data + unlimited SMS",
  "Type": "sip",
  "Price": 39.99,
  "Monthly": true,
  "PackageItems": [
    { "ProductId": "PID-…esim",      "Price": "0.00",  "Monthly": false, "Type": "esim" },
    { "ProductId": "PID-…data-10gb", "Price": "30.00", "Monthly": true,  "Type": "data" },
    { "ProductId": "PID-…sms-unl",   "Price": "9.99",  "Monthly": true,  "Type": "sms"  }
  ]
}
```

```json Response
{
  "PackageId": "PID-23bf4d8d-14bf-431b-88a4-9a214a87b58a",
  "PackageName": "Family 10GB",
  "Description": "10GB data + unlimited SMS",
  "Type": "sip",
  "Price": 39.99,
  "Monthly": true,
  "Active": true
}
```

### Adding items after the fact

If you need to add an item to an existing Package without rebuilding it:

**Endpoint:** `POST /v1.0/packages/items/add`

```json Request
{
  "PackageId": "PKID-…",
  "ProductId": "PID-…",
  "Price": "1.12",
  "Monthly": false,
  "Type": "addon"
}
```

```json Response
{
  "PackageItemId": "PIID-4efee842-16f0-4803-9780-8c3c30d19b74",
  "PackageId": "PKID-…",
  "Type": "addon",
  "Price": 1.12,
  "Monthly": false,
  "Active": true
}
```

> 👍 **Tip**
>
> **Start with a small starter set.** Build three Packages: an entry tier, a mid tier, and a premium. Build them once, then create variants by cloning. Avoid creating a unique Package per subscriber — Subscriptions are how you customize per-subscriber pricing.

---

## 7. Subscriptions

A Subscription is the billing relationship: one Subscriber, one Package, one number (TN), and — optionally — one ICCID. This is what kicks off recurring charges.

**Endpoint:** `POST /v1.0/subscriptions`

```json Request
{
  "SubscriberId": "TSUID-…",
  "TNID":  "NID-…",
  "ICCID": "8901240397190002080",
  "PackageId": "PKID-…",
  "Type": "Mvno"
}
```

```json Response
{
  "SubscriptionId": "SUB-ef84c0b5-d750-4a5a-99b1-4705089cd20c",
  "SubscriberId": "TSUID-…",
  "TNID": "NID-…",
  "ICCID": "8901240397190002080",
  "PackageId": "PKID-…",
  "Type": "Mvno",
  "Active": true
}
```

### Parameters worth knowing

| Field | Type | Description |
|---|---|---|
| `SubscriberId` | string | TSUID from Section 3. |
| `TNID` | string | The number identifier issued by `/numbers/provision` or `/numbers/portin`. |
| `ICCID` | string | Optional. Bind the SIM to this Subscription. |
| `PackageId` | string | PKID from Section 6.2. |
| `Type` | string | `Mvno`, `Iot` — must match the kind of number the Subscription is on. |

> 📘 **Note**
>
> **One Subscription per number, not per subscriber.** A Subscriber with two lines has two Subscriptions. Keep them separate — it makes cancellation, plan changes, and refunds clean.

---

## 8. Provisioning or Porting

> 🚧 **Warning**
>
> **Every number must have an Account and a Subscriber.** Before you call `/numbers/provision` or `/numbers/portin`, decide which Account (`AccountId`) and which Subscriber (`AssignedSubscriberId`) the new Number will belong to. The API will let you provision without a Subscriber, but you'll have to bind one later via Numbers Update — and you'll have an orphan in your inventory in the meantime.

### 8.1 Provision a brand-new number

**Step 1 — Check availability:**

Before committing to a provision, confirm that inventory exists in your target area. Pass the number type and capabilities you need along with an `AreaCode` or `ZipCode`. The response returns `AvailableNumberAreas` — a list of `NGP` code and `AreaCode` pairs that have live inventory. Pick the `NGP` and `AreaCode` you want and carry them into Step 2. Use `PageNumber` to paginate if your preferred area code doesn't appear on the first page.

**Endpoint:** `POST /v1.0/numbers/availability`

```json Request
{
  "NumberType": "mobile",
  "MessageType": "p2p",
  "MessageEnabled": true,
  "VoiceEnabled": true,
  "PageNumber": 1,
  "AreaCode": "201",
  "ZipCode": ""
}
```

```json Response
{
  "RequestId": "T-04139",
  "RequestDate": "2025-05-14T18:37:18.2408767Z",
  "NumberType": "mobile",
  "VoiceEnabled": true,
  "MessageEnabled": true,
  "AreaCode": "201",
  "PageNumber": 1,
  "ResultsTotal": 7700,
  "AvailableNumberAreas": [
    { "NGP": "SAG", "AreaCode": 201, "Zipcode": "07001" },
    { "NGP": "AGP", "AreaCode": 201, "Zipcode": "07002" }
  ]
}
```

**Step 2 — Provision:**

Once you have an available area, purchase and activate the number. Supply the `MessageRouteId` (MRID) and `VoiceRouteId` (CRID) from Section 4 and the `AreaCode` from Step 1. Set `ProductType` to match the capabilities you want on the line — `sms+data+voice` for a full MVNO line, `data-only` for IoT. The response returns `PhoneNumberId` (the `NID-` identifier) and `PhoneNumberAssigned` (the E.164 number) — save both. `NID` is what you'll reference in subscriptions, data usage settings, and route updates.

**Endpoint:** `POST /v1.0/numbers/provision`

```json Request
{
  "NumberType": "mvno",
  "MessageType": "p2p",
  "MessageEnabled": true,
  "VoiceEnabled": true,
  "DataEnabled": true,
  "MessageRouteId": "MRID-…",
  "VoiceRouteId": "CRID-…",
  "AreaCode": "201",
  "ICCID": "8901240397190195850",
  "ProductType": "sms+data+voice",
  "AssignedSubscriberId": "TSUID-…",
  "AccountId": "AID-…"
}
```

```json Response
{
  "OrderDate": "2025-10-29T12:36:19.338438+00:00",
  "OrderId": "JNUOID-76ba71a8-d7a6-4489-b695-1ad363b8d596",
  "OrderStatus": "Complete",
  "PhoneNumberAssigned": "+12015551234",
  "PhoneNumberId": "NID-8bdf915a-ef65-46c9-8c66-96c98d42d9ca",
  "ICCID": "8901240397190195850",
  "SubscriberId": "TSUID-…",
  "ErrorMessage": null
}
```

> 📘 **Note**
>
> **NumberType rules to remember:** `iot` numbers are p2p only — never a2p. For a2p messaging on a mobile-style line, use `NumberType = "mvno"`.

### 8.2 Port a number in — the full lifecycle

Port-ins are not one-shot. A request can be open for days while the losing carrier responds, and during that window you may need to correct details, push out the activation date, or pull the request entirely. Plan for all five steps below — eligibility, submit, update, cancel, and monitor — as a single workflow.

**Step 1 — Check eligibility before you collect anything from the subscriber:**

```json Request
{
  "PhoneNumber": "+13136398786",
  "TargetClassification": "mvno"
}
```

```json Response
{
  "PhoneNumber": "+13136398786",
  "Eligible": true,
  "CurrentCarrier": "Verizon",
  "NumberType": "mobile",
  "Message": "Number is eligible for port-in"
}
```

If eligibility comes back positive, get the subscriber's signed LOA and current carrier account details, then submit. If it's negative, stop here — you can't port that number into your classification.

**Step 2 — Submit the port-in:**

```json Request
{
  "PortInNumber": "+15555551234",
  "ICCID": "8901240397190195850",
  "CurrentCarrierName": "Verizon",
  "CurrentAccountNumber": "46512222",
  "CurrentAccountPassword": "0000",
  "TargetPortinClassification": "mvno",
  "SubscriberName": "Jane Doe",
  "CurrentBillingAddress": {
    "Street1": "2701 N Thanksgiving Way",
    "Street2": "Suite 202",
    "City": "Lehi",
    "State": "UT",
    "Zip": "84043"
  }
}
```

```json Response
{
  "OrderId": "JNUOID-6c058364-66a7-485b-93e1-7a2aa75e4fed",
  "OrderDate": "2025-05-14T18:00:00.0000000+00:00",
  "Status": "Pending",
  "PhoneNumber": "+15555551234",
  "ICCID": "8901240397190195850"
}
```

The response includes an `OrderId` (`JNUOID-…`). Save it — every later call in the lifecycle (update, cancel, status) keys off this `OrderId`.

**Step 3 — Update an open port-in if details change:**

If the losing carrier rejects the request because of a name mismatch, wrong account number, or a missing port-in date, fix the record without cancelling and resubmitting. `PortInDate` is required for wirelines (5–10 business day windows) and conditional otherwise.

```json Request
{
  "OrderId": "JNUOID-6c058364-66a7-485b-93e1-7a2aa75e4fed",
  "CurrentCarrierName": "Sinch",
  "SubscriberName": "Jane Doe",
  "CurrentAccountNumber": "7617",
  "CurrentAccountPassword": "0813",
  "PortInDate": "04/23/2026",
  "CurrentBillingAddress": {
    "Street1": "2701 N Thanksgiving Way",
    "Street2": "",
    "City": "Lehi",
    "State": "UT",
    "Zip": "84043"
  }
}
```

```json Response
{
  "OrderId": "JNUOID-6c058364-66a7-485b-93e1-7a2aa75e4fed",
  "Status": "Updated",
  "Message": "Port-in order updated successfully"
}
```

**Step 4 — Cancel a port-in that should not proceed:**

Subscriber changed their mind. The losing carrier disputed past the resolution window. The eligibility was right but the LOA never came back signed. Whatever the reason, you cancel by `OrderId` — never by phone number.

```json Request
{
  "OrderId": "JNUOID-6e3eb213-baf1-47bb-9db0-5d7d09d4b7b4"
}
```

```json Response
{
  "OrderId": "JNUOID-6e3eb213-baf1-47bb-9db0-5d7d09d4b7b4",
  "Status": "Cancelled"
}
```

> 🚧 **Warning**
>
> **Cancel is final.** If the subscriber later wants to port the same number again, run eligibility and submit a fresh request — you can't un-cancel.

**Step 5 — Monitor the order:**

Between submit and activation, poll the order to see where it stands (`Submitted`, `Pending Carrier Approval`, `Scheduled`, `Completed`, `Rejected`, `Cancelled`).

```
GET /v1.0/numbers/order?OrderId=JNUOID-19b3d376-2440-477f-a3dc-c91a36989316
```

```json Response
{
  "OrderDate": "2025-12-08T00:12:08.89",
  "OrderId": "JNUOID-19b3d376-2440-477f-a3dc-c91a36989316",
  "OrderStatus": "Completed",
  "OrderType": "portin",
  "PhoneNumbersOrdered": [
    { "Number": "+15555551234" }
  ]
}
```

> 👍 **Tip**
>
> **Port-in best practice:** Always run eligibility first — it tells you whether the number is portable to your classification before you spend the port fee or commit the subscriber to a date. Submit only after the LOA is signed and the current-carrier account details are verified. Poll the order daily until you see `Completed`, and notify the subscriber the moment status flips.

### 8.3 Port a number out

When a subscriber leaves your MVNO for another carrier, the gaining carrier initiates the port-out on their side, but they'll need a PIN from you (and the subscriber will need to authorize the release). Issue the PIN through:

```json Request
{
  "PortOutNumber": "+17746996223",
  "PortOutPIN": "1234"
}
```

```json Response
{
  "OrderId": "JNUOID-dabada8a-b621-4c99-8ef3-9c79254e30b1",
  "OrderDate": "2025-05-14T18:00:00.0000000+00:00",
  "Status": "Pending",
  "PhoneNumber": "+17746996223"
}
```

> 📘 **Note**
>
> **Port-out is a courtesy, not an obstacle.** FCC rules require carriers to release numbers on subscriber request. Issue the PIN promptly. Don't suspend service before the port-out completes — that breaks the gaining carrier's validation and creates a support escalation.

---

## 9. Data Usage Limits and Thresholds

Telegent gives you three knobs per number: a **Notify** threshold (lets the subscriber know they're getting close), a **Throttle** threshold (slows them down past a point), and a **Limit** (hard cap). Set all three in one call.

**Endpoint:** `POST /v1.0/numbers/data-usage`

```json Request
{
  "ValueUnit": "MB",
  "NotifyValue": 8,
  "ThrottleValue": 10,
  "ThrottleSpeed": "1-mbps",
  "LimitValue": 15,
  "PhoneNumbers": [
    { "Number": "+12016093801" },
    { "Number": "+12232233180" }
  ]
}
```

```json Response
{
  "Status": "Complete",
  "StatusMessage": "",
  "ValueUnit": "MB",
  "NotifyValue": 8,
  "ThrottleValue": 10,
  "ThrottleSpeed": "1-mbps",
  "LimitValue": 15,
  "PhoneNumbers": [
    { "Number": "+12016093801" },
    { "Number": "+12232233180" }
  ]
}
```

### Parameters worth knowing

| Field | Type | Description |
|---|---|---|
| `ValueUnit` | enum | `MB`. Applies to all three thresholds. |
| `NotifyValue` | number | Subscriber is notified when usage hits this value. |
| `ThrottleValue` | number | Speed is throttled to `ThrottleSpeed` once usage hits this value. |
| `ThrottleSpeed` | enum | `64-kbps` \| `128-kbps` \| `256-kbps` \| `512-kbps` \| `1-mbps` \| `5-mbps` \| `20-mbps` \| `50-mbps` \| `100-mbps` |
| `LimitValue` | number | Hard cap. Data is cut off (or charged overage, depending on plan) past this. |
| `PhoneNumbers` | array | One or many numbers. The same thresholds apply to every number in the array. |

> 📘 **Info**
>
> Use `POST /v1.0/numbers/data-usage/settings` to read the configured thresholds for a number, and `POST /v1.0/numbers/data-usage/info` to read the current usage against those thresholds.

---

## 10. AI Guardian — Allow / Block + Filter Levels

AI Guardian is **per-subscriber**. Two surfaces: voice (Call Filter) and SMS (Message Filter). For both, MVNOs should ship the allow-list and block-list controls. SMS additionally supports age-based Filter Levels (`CHILD`, `ADOLESCENT`, `TEENAGER`). Voice Filter Levels are a future release for SIP.

### 10.1 Turn the feature on

**Endpoint:** `POST /v1.0/subscribers/guardian-features`

```json Request
{
  "SubscriberId": "TSUID-…",
  "EnableIntelligentGuardianCalls": true,
  "EnableIntelligentGuardianMessages": true
}
```

```json Response
{
  "SubscriberId": "TSUID-…",
  "EnableIntelligentGuardianCalls": true,
  "EnableIntelligentGuardianMessages": true
}
```

> 📘 **Info**
>
> `GET /v1.0/subscribers/guardian-features?SubscriberId=TSUID-…` returns the current flags so your UI can render checkbox state.

### 10.2 Voice — Allow / Block only

**Endpoint:** `POST /v1.0/subscribers/call-filter`

```json Request
{
  "SubscriberId": "TSUID-…",
  "Phone": "+18015551234",
  "AllowedNumbers": ["+18015550001", "+18015550002"],
  "BlockedNumbers": ["+18015559999"]
}
```

```json Response
{
  "FilterId": "CFID-05c3d6d2-21c2-4fab-8c7c-12746cad1499",
  "SubscriberId": "TSUID-…",
  "Phone": "+18015551234",
  "AllowedNumbers": ["+18015550001", "+18015550002"],
  "BlockedNumbers": ["+18015559999"],
  "ApplyToInbound": true,
  "ApplyToOutbound": true,
  "BlockUnknownNumbers": false,
  "BlockInternational": false
}
```

Manage entries incrementally:

**Endpoint:** `POST /v1.0/subscribers/call-filter/allowed-numbers/add`

```json Request
{
  "SubscriberId": "TSUID-…",
  "CallFilterId": "CFID-…",
  "Numbers": ["+15555555555"]
}
```

```json Response
{
  "FilterId": "CFID-05c3d6d2-21c2-4fab-8c7c-12746cad1499",
  "SubscriberId": "TSUID-…",
  "AllowedNumbers": ["+18015550001", "+18015550002", "+15555555555"]
}
```

**Endpoint:** `POST /v1.0/subscribers/call-filter/blocked-numbers/add`

```json Request
{
  "SubscriberId": "TSUID-…",
  "CallFilterId": "CFID-…",
  "Numbers": ["+15555556666"]
}
```

```json Response
{
  "FilterId": "CFID-05c3d6d2-21c2-4fab-8c7c-12746cad1499",
  "SubscriberId": "TSUID-…",
  "BlockedNumbers": ["+18015559999", "+15555556666"]
}
```

> 🚧 **Warning**
>
> **Voice Filter Levels — future release for SIP.** The Call Filter API can accept `CHILD` / `ADOLESCENT` / `TEENAGER` as `FilterMode` values, but voice-level filtering for these modes is not enabled for MVNOs today. For now, voice = allow + block only.

### 10.3 SMS — Allow / Block + Filter Levels

**Endpoint:** `POST /v1.0/subscribers/message-filter`

For SMS, in addition to allow/block, MVNOs can apply a **Filter Level**: `CHILD`, `ADOLESCENT`, or `TEENAGER`. These set a graded sensitivity baseline that Telegent applies on top of your custom allow/block lists.

```json Request
{
  "SubscriberId": "TSUID-…",
  "Phone": "+18015551234",
  "FilterMode": "ACTIVE",
  "AllowedContacts": ["+18015550001"],
  "BlockedContacts": ["+18015559999"],
  "ApplyToInbound": true,
  "ApplyToOutbound": true,
  "BlockLinks": true,
  "BlockMedia": true
}
```

```json Response
{
  "FilterId": "MFID-7435d672-a2d0-451e-ab62-45499f5bc7a1",
  "SubscriberId": "TSUID-…",
  "Phone": "+18015551234",
  "FilterMode": "ACTIVE",
  "AllowedContacts": ["+18015550001"],
  "BlockedContacts": ["+18015559999"],
  "ApplyToInbound": true,
  "ApplyToOutbound": true,
  "BlockLinks": true,
  "BlockMedia": true,
  "BlockUnknownNumbers": false
}
```

Manage lists incrementally:

**Endpoint:** `POST /v1.0/subscribers/message-filter/allowed-contacts/add`

```json Request
{
  "SubscriberId": "TSUID-…",
  "MessageFilterId": "MFID-…",
  "Contacts": ["+15555555555"]
}
```

```json Response
{
  "FilterId": "MFID-7435d672-a2d0-451e-ab62-45499f5bc7a1",
  "SubscriberId": "TSUID-…",
  "AllowedContacts": ["+18015550001", "+15555555555"]
}
```

**Endpoint:** `POST /v1.0/subscribers/message-filter/blocked-contacts/add`

```json Request
{
  "SubscriberId": "TSUID-…",
  "MessageFilterId": "MFID-…",
  "Contacts": ["+15555556666"]
}
```

```json Response
{
  "FilterId": "MFID-7435d672-a2d0-451e-ab62-45499f5bc7a1",
  "SubscriberId": "TSUID-…",
  "BlockedContacts": ["+18015559999", "+15555556666"]
}
```

### SMS Filter Levels

| Level | Description |
|---|---|
| `CHILD` | Most restrictive. Strong blocking on adult content, links, and unknown senders. |
| `ADOLESCENT` | Moderate. Blocks the worst categories but allows most everyday messaging. |
| `TEENAGER` | Lightest of the three. Filters extreme content; otherwise hands-off. |

---

---

## 11. Error Codes

Every Telegent API response includes an HTTP status code. The table below covers every code the platform returns, what it means, and the most common cause.

| Code | Name | Meaning |
|---|---|---|
| `200` | Success | The request was accepted and processed. The response body contains the result. |
| `400` | Bad Request | The request payload is malformed, missing a required field, or contains an invalid value. Check the response body for details on which field failed validation. |
| `401` | Unauthorized | No Bearer token was provided, or the token is expired or invalid. Re-authenticate via `POST /v1.0/oauth2/tokens` and retry with a fresh token. |
| `403` | Forbidden | The token is valid but does not have permission to perform this action. This is most often a scope mismatch — the token was issued for a different `ApiEndpoint`. |
| `404` | Not Found | The resource identified by the ID in your request does not exist, or it belongs to a different Account. Verify the ID and the `AccountId`. |
| `405` | Method Not Allowed | You used the wrong HTTP method for this endpoint (e.g. `GET` on a `POST`-only route). Check the endpoint definition in the API Reference. |
| `408` | Request Timeout | The server did not receive a complete request within the timeout window. This is typically a network issue — retry with exponential backoff. |
| `429` | Too Many Requests | Your account has exceeded the rate limit. Slow your request cadence and wait before retrying. The response may include a `Retry-After` header. |
| `500` | Server Error | An unexpected error occurred on the Telegent platform. If the error persists, contact [support@telegent.com](mailto:support@telegent.com) with the request details and timestamp. |
| `503` | Service Unavailable | The API is temporarily unavailable, typically during maintenance or a platform incident. Retry after a short delay. |
| `504` | Gateway Timeout | An upstream service did not respond in time. Treat this the same as `408` — retry with backoff. If it recurs, check the Telegent status page. |

> 👍 **Tip**
>
> **Retry strategy.** For transient errors (`408`, `429`, `500`, `503`, `504`), implement exponential backoff — start at 1 second, double on each retry, and cap at 30 seconds. Do not retry `400`, `401`, `403`, or `404` automatically; those require a code or credential fix, not a retry.

---

> 📘 **Note**
>
> This document is a living guide. When in doubt, the OpenAPI spec at [docs.telegent.com](https://docs.telegent.com) is the source of truth. The Postman collection "Telegent Core APIs.json" is a great companion — every endpoint above is in there.
