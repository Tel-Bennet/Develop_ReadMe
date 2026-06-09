---
title: Knowledge Bank
slug: knowledge-bank
excerpt: Internal reference for AI assistant context — not linked in navigation.
hidden: true
---

# Telegent mPaaS API — Knowledge Bank

This file is an internal knowledge reference used to provide accurate, context-aware answers. It is not linked in the navigation.

---

## Platform Overview

**Telegent mPaaS** (Mobile Platform as a Service) is a REST API platform that enables businesses to provision, manage, and communicate over mobile phone numbers. Core capabilities include:

- Provisioning MVNO and IoT phone numbers
- Sending and receiving SMS/MMS messages
- Configuring voice routing
- Managing subscribers and account hierarchies
- Setting data usage limits for IoT/MVNO numbers
- AI Guardian parental/enterprise controls for calls and messages

**API Base URL:** `https://api.telegent.com/v1.0`  
**Auth:** Bearer token (OAuth2) via `POST /v1.0/oauth2/tokens`  
**Format:** All requests and responses use `application/json`

---

## Authentication

### How it works
Every API call requires an `Authorization: Bearer <token>` header. Tokens are obtained by calling `POST /v1.0/oauth2/tokens` with your `AccountKey`, `AccountSecret`, and optionally an `ApiEndpoint` to scope the token.

### ApiEndpoint scoping
The `ApiEndpoint` field restricts the token to a specific endpoint URL for security. A token scoped to `/v1.0/numbers/provision` cannot be used to call `/v1.0/message/outbound`. This means you generate a separate token for each endpoint you intend to call.

### Token fields
- `AccountKey` — Your account's unique key (format: `DID-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- `AccountSecret` — Your account's secret credential
- `ApiEndpoint` — Scopes the token to a specific endpoint URL. Although listed as optional in the schema, always include it — omitting it returns `"The ApiEndpoint field is required."`

### Token expiry
The response includes a `tokenExpiry` field (format: `MM/DD/YYYY HH:MM:SS AM/PM`). When a token expires, re-authenticate with the same credentials to get a fresh token. There is no refresh token mechanism — always re-authenticate from scratch.

### Token response fields
- `token` — The Bearer token string to use in the `Authorization` header
- `successful` — `true` if authentication succeeded
- `tokenExpiry` — Expiry datetime of the token

---

## ID Conventions

| Prefix | Type |
|---|---|
| `DID-` | Distributor ID / Account Key |
| `AID-` | Account ID |
| `TSUID-` | Subscriber ID |
| `NID-` / `TNID-` | Phone Number ID (used interchangeably) |
| `MRID-` | Message Route ID |
| `CRID-` | Voice (Call) Route ID |
| `PID-` | Package ID or Product ID |
| `PIID-` | Package Item ID |
| `SUB-` | Subscription ID |
| `MFID-` | Message Filter ID |
| `CFID-` | Call Filter ID |
| `WID-` | Workgroup ID |
| `WAID-` | Workgroup Activity ID |
| `SID-` | Schedule ID |
| `JNUOID-` | Number Order ID |
| `TMID-` | Message ID |
| `TCID-` / `JCID-` | Campaign ID |
| `HMI-` | Header Manipulation ID |

---

## Phone Number Format

All phone numbers in the API must be in **E.164 format**: `+<country_code><number>` with no spaces, dashes, or parentheses.

Examples:
- US: `+18015551234`
- UK: `+442071234567`

This applies to the `To`, `From`, `Owner`, `PhoneNumbers`, `PortInNumber`, and all other phone number fields.

---

## Number Types

### NumberType (provisioning/availability)
- `"mvno"` — Full-featured mobile number. Supports both `a2p` and `p2p` message types. Supports voice, SMS/MMS.
- `"iot"` — IoT/data-focused number. Supports `p2p` only. Cannot be provisioned with `a2p` MessageType. Supports data usage controls.

> VoIP is no longer a supported number type. It has been removed from all enums and examples.

> Note: The `/numbers/availability` endpoint uses `"mobile"` as a search parameter value, but the `/numbers/provision` endpoint uses `"mvno"` or `"iot"`. These are different enums for different endpoints.

### NumberType × MessageType compatibility

| NumberType | Allowed MessageType | Notes |
|---|---|---|
| `mvno` | `a2p` or `p2p` | Use `mvno` for A2P/automated messaging |
| `iot` | `p2p` only | `iot` with `a2p` will be rejected |

### Classification (numbers/update)
- `"MVNO"` — Standard mobile virtual network operator number
- `"IoT"` — Internet of Things device number

### ProductType (provisioning)
Exactly four supported values — the API may accept other strings without validation but only these four are processed correctly on the backend:
- `"Sms-Only"` — SMS/MMS messaging only
- `"Data-Only"` — Data connectivity only
- `"Sms+Data"` — SMS/MMS and data
- `"Sms+Data+Voice"` — Full service: SMS/MMS, data, and voice

### MessageType
- `"a2p"` — Application-to-Person (automated/bulk messaging). Only available with `mvno` NumberType.
- `"p2p"` — Person-to-Person (standard conversational messaging). Available with both `mvno` and `iot`.

---

## Phone Number Lifecycle

1. **Check availability** → `POST /numbers/availability` — search by AreaCode or ZipCode
2. **Provision** → `POST /numbers/provision` — purchase and activate the number
3. **Update** → `POST /numbers/update` — change routes, capabilities, subscriber assignment
4. **Status change** → `POST /numbers/status` — activate, cancel, park, swap, replace, or swap-sim
5. **Port in** → `POST /numbers/portin` — transfer a number from another carrier
6. **Port out** → `POST /numbers/portout` — release a number to another carrier

### Provision payload reference

```json
POST /v1.0/numbers/provision
{
  "NumberType":           "mvno",
  "MessageType":          "p2p",
  "MessageEnabled":       true,
  "VoiceEnabled":         false,
  "MessageRouteId":       "MRID-...",
  "VoiceRouteId":         "CRID-...",
  "AreaCode":             "201",
  "ZipCode":              "08701",
  "ICCID":                "8901240397...",
  "ProductType":          "Sms+Data+Voice",
  "AssignedSubscriberId": "TSUID-..."
}
```

`ICCID` and `AssignedSubscriberId` are optional. `AreaCode` is tried first; `ZipCode` is the fallback if no numbers are available in that area code. `MessageEnabled` and `VoiceEnabled` must always be included as booleans — the API currently returns success when they are omitted, but that behavior should not be relied on.

### StatusChange values
- `activate` — Bring a parked/inactive number live
- `cancel` — Deactivate a number permanently
- `park` — Suspend a number without cancelling (number is held but inactive)
- `swap` — Replace number with a new one from the same area code
- `replace` — Replace number with a new one from any area (use AreaCode/ZipCode to specify)
- `swap-sim` — Swap the SIM card (ICCID) on an existing number without changing the number

### MSISDN swap payload reference

```json
POST /v1.0/numbers/status
{
  "StatusChange":  "swap",
  "EffectiveDate": "5/13/2026",
  "PhoneNumbers":  [{ "Number": "+1XXXXXXXXXX" }]
}
```

If the response says `"Number-swap is currently unavailable"` or `"MSISDN swap API endpoint is offline"`, the endpoint is in maintenance — retry later or contact support.

### eSIM QR code retrieval

- If the eSIM was deleted from the device but the number has not been cancelled, the original QR code is still valid. Retrieve it via the Number Details endpoint and rescan.
- If a fresh QR code is needed, perform a SIM swap via `POST /numbers/status` with `"StatusChange": "swap-sim"` — this provisions a new eSIM and returns a new QR code.

### Clearing a SIM's status

If a SIM needs to be returned to an available state:

```json
POST /v1.0/sims/clear-status
{ "ICCID": "89012403971123456789" }
```

### Number availability response fields
- `ResultsTotal` — Total count of available numbers in the searched area
- `AvailableNumberAreas` — Array of areas where numbers are available
- `NGP` — Number Gateway Provider (the underlying carrier/network providing the number)
- `AreaCode` — Area code where numbers are available
- `Zipcode` — Zip code where numbers are available

### Provision response fields
- `OrderId` (`JNUOID-`) — Use this to track provisioning status via `GET /numbers/order`
- `OrderStatus` — `"Complete"` or `"Pending"`. If Pending, poll the order endpoint.
- `PhoneNumberAssigned` — The E.164 phone number that was assigned
- `PhoneNumberId` (`NID-`) — The number's unique ID for future API calls
- `QRCode` — A URL to a QR code image for eSIM provisioning (IoT numbers). The QR code encodes the LPA (Local Profile Assistant) activation string for scanning by an eSIM-capable device.
- `ICCID` — SIM card identifier assigned to the number

---

## Messaging

### Message Routes — field reference

Message routes define how inbound and outbound messages are handled. Every number must have a message route.

**Inbound webhook (what Telegent calls when a message arrives):**
- `MessageUrl` — Your webhook URL for inbound messages
- `MessageUrlMethod` — HTTP method (`POST` or `GET`)
- `MessageAuthenticationType` — Auth method Telegent uses when calling your webhook: `"Basic"`, `"Bearer"`, or `"None"`
- `MessageUsername` / `MessagePasswordToken` — Credentials for Basic or Bearer auth on the inbound webhook

**Outbound callback (what Telegent calls for delivery receipts):**
- `CallbackMessageUrl` — Your webhook URL for delivery status callbacks
- `CallbackMessageUrlMethod` — HTTP method for the callback
- `CallbackMessageAuthenticationType` — Auth method for the callback webhook
- `CallbackMessageUsername` / `CallbackMessagePasswordToken` — Credentials for callback webhook

**Bypass flags:**
- `InboundBypass` — `true` to skip inbound message processing (Telegent will not call your webhook for inbound messages)
- `OutboundBypass` — `true` to skip outbound delivery callbacks

**Other fields:**
- `IntelligentRouteEnabled` — Activates AI-powered dynamic routing logic
- `MessageRouteEnabled` — Enables/disables the route entirely
- `AccountId` — Required when a distributor is creating routes for a sub-account

### Common pitfalls

- **Wrong URL path:** The outbound message endpoint uses the **singular** noun: `POST /v1.0/message/outbound`. Using `messages` (plural) will not work.
- **Updating a message filter:** Use `POST /subscribers/message-filter/update` to change an existing filter — do not create a new one. If you see `"Duplicate filter found for the same subscriber and phone number"`, a duplicate exists in the system even if the read API doesn't return it. Open a support ticket to have it cleared manually.

### Sending a message — field reference

`POST /message/outbound`

- `To` — Array of recipient objects: `[{"Number": "+18015551234"}]`. Supports multiple recipients.
- `From` — The provisioned Telegent number sending the message (E.164 format)
- `Owner` — The number that "owns" this message thread (usually same as `From`)
- `Body` — The text body of the message
- `CampaignId` — Optional campaign identifier (`JCID-` / `TCID-` prefix) for grouping messages in reporting
- `MmsMedia` — Array of media URL objects for MMS: `[{"MediaUrl": "https://..."}]`
- `MmsBase64` — Array of base64-encoded media objects: `[{"Base64": "...", "BaseType": "image/jpeg"}]`

Supported `BaseType` values for MmsBase64: `image/jpeg`, `image/png`, `image/gif`, `audio/wav`, `video/mpg`, and other standard MIME types.

### Message response fields
- `MessageId` (`TMID-`) — Unique ID for tracking delivery status
- `Status` — `"Queued"` immediately after submission
- `Cost` — Per-message cost
- `MessageType` — `"sms"` or `"mms"` (determined by whether media was included)

### Message search
`POST /message/search` — Search message history. Useful for auditing and delivery confirmation when a `TMID` is not available.

---

## Voice Routing

### Voice Routes — field reference

`POST /voice/routes`

**Route types (`RouteType`):**
- `"Trunk"` — SIP trunk routing. Calls are delivered to your SIP infrastructure using IP/port configuration.
- `"Webhook"` — HTTP webhook routing. Telegent calls your URL with call event data for programmatic IVR.

**Webhook fields (used when RouteType is Webhook or for call events):**
- `VoiceUrl` / `VoiceUrlMethod` — Webhook for inbound call events
- `VoiceAuthenticationType` — Auth method: `"Basic"`, `"Bearer"`, or `"None"`
- `VoiceUsername` / `VoicePasswordToken` — Credentials for voice webhook
- `CallbackVoiceUrl` / `CallbackVoiceUrlMethod` — Webhook for call status callbacks

**SIP trunk fields (used when RouteType is Trunk):**
- `TrunkIp1` / `TrunkIp2` — Primary and secondary SIP trunk IP addresses
- `TrunkPort1` / `TrunkPort2` — SIP ports (commonly `5060` for UDP/TCP, `5061` for TLS)
- `TrunkTransport1` / `TrunkTransport2` — Transport protocol: `"UDP"`, `"TCP"`, or `"TLS"`
- `TrunkUri1` / `TrunkUri2` — SIP URI for the trunk endpoints
- `TrunkEnabled1` / `TrunkEnabled2` — Enable/disable each trunk leg
- `Trunk1Priority` / `Trunk2Priority` — Failover priority (lower = higher priority)
- `Trunk1Weight` / `Trunk2Weight` — Load balancing weight

**Advanced SIP options:**
- `IpWhitelist` — Array of IP objects allowed to send SIP traffic: `[{"IpAddress": "1.2.3.4"}]`
- `EnableSipRefer` — Enable SIP REFER for call transfers
- `TransferCallerId` — Caller ID handling on transfer: `"Transferee"` or `"Transferor"`
- `SymmetricRtp` — Enable symmetric RTP for NAT traversal
- `EnableTrpSecureTrunk` — Enable TRP secure trunking
- `EnablePstnTransfer` — Allow PSTN call transfers
- `CnamLookup` — Enable CNAM (Caller Name) lookups
- `TerminationUriSubdomain` — Subdomain for termination URI
- `EnableCallStreaming` — Enable real-time call audio streaming
- `WssUri` — WebSocket Secure URI for call streaming: `wss://...`
- `HeaderManipulation` — HMI identifier for SIP header manipulation rules

### Workgroups — field reference

Workgroups define groups of agents or endpoints for intelligent call distribution.

`POST /workgroups`

**Core fields:**
- `Name` — Workgroup label
- `TelegentPhone` — The Telegent phone number assigned to this workgroup
- `Type` — Distribution type:
  - `"IVR"` — Interactive Voice Response menu
  - `"simultaneous"` — Ring all agents at the same time
  - `"round-robin"` — Distribute calls evenly across agents in sequence
- `CallOrder` — Order in which activities (agents) are attempted
- `WaitBetween` — Seconds to wait between ring attempts

**Announcements:**
- `AnnouncementText` — Text-to-speech announcement played to callers
- `AnnouncementUrl` — URL to an audio file to play as an announcement

**Caller ID:**
- `CallerIdType` — How the caller ID is presented to agents: `"original"`, `"workgroup"`, etc.
- `CallerIdName` — Custom caller ID name

**Recording:**
- `RecordCalls` — `true` to record all calls through this workgroup
- `TranscribeRecordings` — `true` to auto-transcribe recorded calls
- `AiRecording` — Enable AI analysis of call recordings

**Scheduling:**
- `ScheduleId` — Attach a schedule (SID) to control when the workgroup is active
- `TimeZone` — Time zone for schedule evaluation
- `OffHoursType` — What happens when outside scheduled hours: `"voicemail"`, `"redirect"`, `"workgroup"`
- `OffHoursId` — ID of the resource used for off-hours handling
- `OnHoursType` — Behaviour during scheduled hours
- `OnHoursId` — ID of the resource for on-hours handling
- `HoldMusicId` — ID of the hold music to play

**Extension:**
- `InternalExtension` — Internal extension number for direct routing

### Workgroup Activities — field reference

Activities are the individual agents or endpoints within a workgroup.

`POST /workgroups/activity`

- `WorkgroupId` (`WID-`) — The workgroup this activity belongs to
- `DigitOrder` — The order/priority of this agent in the queue
- `PhoneNumber` — The phone number of the agent to ring (E.164)
- `Type` — Activity type: `"phone"`, `"workgroup"`, `"user"`
- `ReferenceWorkgroupId` — If Type is `"workgroup"`, the nested workgroup to route to
- `ReferenceUserId` — If Type is `"user"`, the user ID
- `SmsNotification` — `true` to send the agent an SMS when a call is assigned
- `EmailNotification` — `true` to email the agent when a call is assigned

### Schedules — field reference

Schedules define time windows for voice routing rules.

`POST /schedules`

Schedules are attached to workgroups via `ScheduleId` to control active hours, holidays, and time-of-day routing. Retrieve all account schedules via `GET /account/schedules`.

---

## Data Usage (IoT Numbers)

### Set limits → `POST /numbers/data-usage`

Configure notify, throttle, and hard cap thresholds. The `PhoneNumbers` field accepts an array of E.164 numbers to apply limits to multiple numbers at once.

Fields:
- `ValueUnit` — `"KB"`, `"MB"`, `"GB"`, or `"TB"`
- `NotifyValue` — Usage level that triggers a notification
- `ThrottleValue` — Usage level that triggers speed throttling
- `ThrottleSpeed` — Speed after throttling: `"64-kbps"`, `"128-kbps"`, `"256-kbps"`, `"512-kbps"`, `"1-mbps"`, `"5-mbps"`, `"20-mbps"`, `"50-mbps"`, `"100-mbps"`
- `LimitValue` — Hard data cap (connection is blocked above this)
- `PhoneNumbers` — Array of E.164 numbers to apply settings to

**Important:** Values must be in ascending order: `NotifyValue < ThrottleValue < LimitValue`. All three must be distinct positive integers.

### Get settings → `POST /numbers/data-usage/settings`
Returns current data usage configuration per number: `NotifyValue`, `LimitValue`, `ThrottleValue`, `ThrottleSpeed`.

### Get real-time usage → `POST /numbers/data-usage/info`
Returns live data usage stats: `Used`, `Remaining`, `Status`, `CurrentBehavior`.

Both read endpoints accept a `PhoneNumbers` array of `{ "Number": "+1XXXXXXXXXX" }` entries and support querying multiple numbers in one call.

### Configure monthly renewal cycle → `POST /numbers/data-usage/update-renewal-info`

Controls the day a line's usage resets, auto-renew behaviour, and allows an immediate usage reset.

```json
POST /v1.0/numbers/data-usage/update-renewal-info
{
  "PhoneNumbers": [{ "Number": "+18014730876" }],
  "ResetUsage":   true,
  "AutoRenew":    true,
  "PeriodType":   "M",
  "PeriodValue":  1,
  "RenewalDay":   1
}
```

- `PeriodType`: `"M"` for monthly, `"W"` for weekly
- `RenewalDay`: 1–31 for monthly, 1–7 for weekly
- `ResetUsage: true` zeros out current usage immediately without waiting for the cycle
- The usage cycle is anchored to the **per-number** `RenewalDay` — it is **not** a global calendar 1st-of-month reset

If a line is not resetting at the expected time, verify that `AutoRenew` is `true` and `RenewalDay` is set correctly via this endpoint.

---

## Subscribers

Subscribers are end-users assigned to phone numbers.

### Roles
- `"Subscriber"` — Standard end user
- `"Manager"` — Can manage subscriber accounts under the same account
- `"Account Admin"` — Full account-level access

### Create subscriber fields
- `Name` — Full name of the subscriber
- `Email` — Must be unique across the entire platform (not just within an account)
- `PhoneNumbers` — Array of E.164 phone numbers to associate (optional at creation)
- `Role` — One of the roles above
- `Password` — Subscriber login password
- `AccountId` — The AID of the account this subscriber belongs to

### Subscriber transfer
`POST /subscribers/transfer` — Moves a subscriber between accounts or distributors. Useful for reseller workflows where a subscriber moves between managed accounts.

### Known issue: "Phone number does not belong to account"

Create Subscriber may return `"Phone number does not belong to account"` for a number that is Active on the same account. This is an open issue. When it occurs, open a support ticket and include:
- `TransactionLogId`
- `AccountId`
- `TNID`
- Exact request body

> ⚠️ Root cause and standing workaround are not yet conclusively documented. Confirm with engineering before advising customers on a resolution.

---

## AI Guardian

AI Guardian is the intelligent monitoring and filtering system for subscriber calls and messages. It consists of three layered capabilities:

### 1. Guardian Features (master on/off switch)

`POST /subscribers/guardian-features`

- `SubscriberId` — The subscriber to configure
- `EnableIntelligentGuardianCalls` — `true` to enable AI monitoring for calls
- `EnableIntelligentGuardianMessages` — `true` to enable AI monitoring for messages

This must be enabled before call filters or message filters take effect.

### 2. Guardian Relationships (parent-child linking)

`POST /subscribers/guardians/relation`

Establishes a supervisory link between a parent (guardian) subscriber and a child subscriber. Once linked, the parent's filters and rules apply to the child's communications.

Fields:
- `ParentSubscriberId` — TSUID of the guardian/parent subscriber
- `ChildSubscriberId` — TSUID of the child subscriber being monitored
- `Relation` — The relationship type (e.g., `"parent"`, `"guardian"`)

Retrieve relations via:
- `GET /subscribers/guardians/relation/parent` — Get the child's parent
- `GET /subscribers/guardians/relation/child` — Get all children of a parent

Remove a relation via `POST /subscribers/guardians/relation/delete`.

### 3. Message Filters

`POST /subscribers/message-filter`

Controls what messages a subscriber can send and receive.

**Key fields:**
- `SubscriberId` — The subscriber to filter
- `Phone` — The phone number the filter applies to (E.164)
- `FilterMode` — Overall filter behaviour:
  - `"ACTIVE"` — Rules are enforced; violating messages are blocked
  - `"MONITOR_ONLY"` — Log only; no blocking occurs
  - `"INACTIVE"` — Filter is disabled
- `AllowedContacts` — Array of phone numbers explicitly allowed
- `BlockedContacts` — Array of phone numbers to block
- `KeywordFilter` — Array of keywords that trigger filtering
- `NotificationPhones` — Array of numbers to notify when a filter is triggered
- `ApplyToOutbound` — `true` to apply filter rules to outbound messages
- `ApplyToInbound` — `true` to apply filter rules to inbound messages
- `BlockUnknownNumbers` — `true` to block messages from numbers not in the allowed list
- `BlockLinks` — `true` to block messages containing URLs
- `BlockMedia` — `true` to block MMS media messages

Manage allowed/blocked contact lists:
- `POST /subscribers/message-filter/allowed-contacts/add`
- `POST /subscribers/message-filter/allowed-contacts/remove`
- `POST /subscribers/message-filter/blocked-contacts/add`
- `POST /subscribers/message-filter/blocked-contacts/remove`
- `GET /subscribers/message-filter/keywords` — Retrieve keyword filter list

### 4. Call Filters

`POST /subscribers/call-filter`

Controls which calls a subscriber can make and receive.

**Key fields:**
- `SubscriberId` — The subscriber to filter
- `Phone` — The phone number the filter applies to (E.164)
- `FilterMode` — Filter behaviour:
  - `"WHITELIST"` — Only allow calls from/to numbers in the allowed list
  - `"BLACKLIST"` — Block calls from/to numbers in the blocked list
  - `"CHILD"` — Preset mode for young children with strict restrictions
  - `"TEENAGER"` — Preset mode for teenagers with moderate restrictions
  - `"ADOLESCENT"` — Preset mode with light age-appropriate restrictions
- `AllowedNumbers` — Array of phone numbers explicitly allowed
- `BlockedNumbers` — Array of phone numbers to block
- `EnableTranscription` — `true` to transcribe all calls
- `KeywordFilter` — Array of keywords that trigger an action when spoken
- `TranscriptionAction` — What to do when a keyword is detected (e.g., alert, block)
- `WarningMessage` — Message played to the caller when a call is flagged
- `NotificationPhones` — Array of numbers to notify when a filter triggers
- `ApplyToOutbound` / `ApplyToInbound` — Apply rules to outbound/inbound calls
- `BlockUnknownNumbers` — Block calls from unrecognized numbers
- `BlockInternational` — Block all international calls
- `RecordFlaggedCalls` — Record calls that trigger a keyword or rule
- `TimeRestrictions` — Define time windows when calling is restricted

Manage allowed/blocked number lists:
- `POST /subscribers/call-filter/allowed-numbers/add`
- `POST /subscribers/call-filter/allowed-numbers/remove`
- `POST /subscribers/call-filter/blocked-numbers/add`
- `POST /subscribers/call-filter/blocked-numbers/remove`
- `GET /subscribers/call-filter/keywords` — Retrieve keyword filter list

---

## Account Hierarchy

```
Aggregator (Telegent)
  └── Distributor (DID-)
        └── Account (AID-)
              └── Subscriber (TSUID-)
                    └── Phone Number (NID-)
```

- **Distributor** accounts use the `AccountId` field in route, subscriber, and subscription requests to scope actions to a specific sub-account.
- **Direct accounts** (non-distributor) typically omit `AccountId` — the API infers it from the authenticated credentials.
- Retrieve all accounts under a distributor: `GET /distributor/accounts`
- Retrieve all subscribers under a distributor: `GET /distributor/subscribers`

---

## Services, Products, and Packages

These three entities form the billing/service bundling hierarchy.

### Services
The most granular unit. A **service** represents a single billable item.

`POST /services`
- `ServiceName` — Label for the service
- `Cost` — Unit cost
- `Monthly` — `true` if this is a monthly recurring service

### Products
A **product** groups one or more services into an orderable SKU.

`POST /products`
- `SKU` — Product code
- `Description` — Human-readable description
- `Type` — Product category (e.g., `"mvno"`, `"iot"`)
- `SubType` — Sub-category
- `Cost` — Product price
- `BillingFrequency` — How often billing occurs

### Packages
A **package** bundles products together into an offering for subscribers.

`POST /packages`
- `PackageName` — Name of the package
- `Description` — Description
- `SubscriberId` — Optional: scope the package to a specific subscriber
- `Type` — Package type
- `Price` — Total package price
- `Monthly` — `true` for monthly recurring
- `PackageItems` — Array of package items (products) included

### Package Items
Individual line items within a package. Manage via:
- `POST /packages/items/add`
- `POST /packages/items/update`
- `POST /packages/items/delete`
- `GET /packages/items`

### Subscriptions
A **subscription** links a subscriber, a phone number, and a package together to activate services.

`POST /subscriptions`
- `SubscriberId` — TSUID of the subscriber
- `TNID` — Phone number ID (NID) to associate
- `ICCID` — SIM card identifier (if applicable)
- `PackageId` — PID of the package to subscribe to
- `Type` — Subscription category label (e.g., `"mvno"`, `"iot"`)

Payload reference for assigning a subscriber to a package:

```json
POST /v1.0/subscriptions
{
  "SubscriberId": "TSUID-...",
  "TNID":         "NID-...",
  "ICCID":        "8901240397...",
  "PackageId":    "PID-...",
  "Type":         "mvno"
}
```

### Cancelling a subscription

`POST /subscriptions/delete` is the correct endpoint to cancel an active subscription. There is no separate deactivate or suspend — deletion is the only cancellation path.

After a successful delete, the same ICCID can be reused in a new subscription.

### Number Reactivation (within 30 days of cancellation)

`POST /numbers/reactivation` — Reactivates a recently cancelled number without reprovisioning it, preserving the original MSISDN ↔ ICCID relationship. Only valid within **30 days** of cancellation.

Use this when a subscriber cancels and then wants to resume service on the same number and SIM. If more than 30 days have passed, a new `/numbers/provision` call is required.

### Parking vs. cancelling a number

- **Park** (`POST /numbers/status` with `"StatusChange": "park"`) — Suspends the number without releasing it. The MSISDN and ICCID are retained and the number can be reactivated. Use this when the number may be needed again.
- **Cancel / delete subscription** — Permanently removes the MSISDN and ICCID association. If the number is wanted for future use, park it instead of cancelling.

---

## Port-In Process

1. **Check eligibility** → `POST /numbers/portin/eligibility` — confirm the number can be ported before submitting
2. **Submit port-in** → `POST /numbers/portin` — initiate the transfer
3. **Update port-in** → `POST /numbers/portin/update` — correct or update the port-in request
4. **Cancel port-in** → `POST /numbers/portin/cancel` — cancel a pending port-in
5. **Track status** → `GET /numbers/order` — poll using the OrderId returned from step 2

Required fields for port-in:
- `PortInNumber` — The E.164 number being ported
- `ICCID` — SIM card for the ported number
- `CurrentCarrierName` — The losing carrier
- `CurrentAccountNumber` — Account number with the losing carrier
- `CurrentAccountPassword` — Account PIN/password with the losing carrier
- `TargetPortinClassification` — `"mvno"` or `"iot"`
- `SubscriberName` — Name on the losing carrier account
- `CurrentBillingAddress` — Full billing address (Street1, Street2, City, State, Zip)

### Port-In status state machine

| Status | Meaning |
|---|---|
| `Pending` | Submitted; waiting for losing carrier acknowledgment |
| `InProgress` | Losing carrier acknowledged; processing |
| `ResolutionRequired` | Losing carrier returned a recoverable error (PIN mismatch, account info, billing address); `portin/update` is valid in this state |
| `Complete` | Port successfully completed |
| `Cancelled` | Port was cancelled; number is freed |

**Endpoint transition rules:**
- `portin/update` — valid when status is `Pending`, `InProgress`, or `ResolutionRequired`. Not valid after `Complete` or `Cancelled`.
- `portin/cancel` — valid in most states; moves the order to `Cancelled`.
- `/portin` (new request) — only valid when no active port-in exists for the MSISDN (i.e. after a successful cancel or if no prior order exists).

> Numbers are not locked by Telegent or T-Mobile when a port-in fails. In most cases, the losing carrier simply hasn't released the number yet — the customer needs to contact them directly.

### Correctable vs. hard failures

**Correctable failures** (use `portin/update` against the same OrderId):
- Wrong losing-carrier name, account number, PIN, or billing address mismatch
- Error codes: `1P-Other` (name/account/PIN/address), `6B` (T-Mobile transfer PIN issues)
- Calling `portin/update` with corrected fields transitions the order back to `Pending` and resubmits it to the losing carrier.

**Hard rejections** (use `portin/cancel`, then resolve with the losing carrier):
- Account holds, group plan restrictions, recently-activated number restrictions
- `portin/update` will not help — the underlying issue is with the losing carrier, not the submission data.
- After cancel is confirmed, the customer resolves the issue with their carrier, then a fresh `/portin` request can be submitted.

### Canonical recovery flow (failed port-in)

1. Poll `GET /numbers/order` with the `OrderId` to confirm current status.
2. **If the failure is correctable** — call `POST /numbers/portin/update` against the same `OrderId` with corrected fields. Do not create a new port-in request.
3. **If the failure is a hard rejection** — call `POST /numbers/portin/cancel`, wait for `Cancelled` status, have the customer resolve the issue with their losing carrier, then submit a fresh `POST /numbers/portin`.
4. **If both Update and Cancel return `GENS-0041` ("No Port-In request found")** despite the order appearing active — this is a stuck state requiring manual backend intervention. Open a support ticket with the MSISDN, the `OrderId`, and the exact error responses from both Update and Cancel.

---

## Port-Out Process

`POST /numbers/portout`

Initiate the release of a Telegent number to another carrier.

Fields:
- `PortOutNumber` — E.164 number to port out
- `PortOutPIN` — Security PIN authorising the port-out

---

## Rate Limits

- **Standard tier:** 50 requests per minute
- **Enterprise tier:** Custom limits — contact Telegent support

If you exceed the rate limit, you will receive a `429 Too Many Requests` response. Implement exponential backoff before retrying.

---

## Error Codes & Troubleshooting

### HTTP status codes

| Code | Meaning | Common cause |
|---|---|---|
| `400 Bad Request` | Invalid request body or missing required fields | Check field names, data types, and required fields |
| `401 Unauthorized` | Token missing, expired, or scoped to wrong endpoint | Re-authenticate; verify `ApiEndpoint` matches the called endpoint |
| `403 Forbidden` | Valid token but insufficient permissions | The authenticated account lacks access to this resource |
| `404 Not Found` | Resource ID does not exist | Check the ID prefix and verify the resource was created |
| `422 Unprocessable Entity` | Request is well-formed but semantically invalid | Business rule violation — see error message for detail |
| `429 Too Many Requests` | Rate limit exceeded | Back off and retry; check rate limits |
| `500 Internal Server Error` | Server-side error | Retry; contact support if persistent |

### Common error messages and fixes

**"401 Unauthorized"**  
Token is expired or scoped to a different endpoint. Re-authenticate with `POST /v1.0/oauth2/tokens` and pass the correct `ApiEndpoint` matching the endpoint you are calling.

**"MessageRouteId is required"**  
A message route must exist before you can provision a number. Call `POST /message/routes` first, save the `MessageRouteId` (MRID), then retry provisioning.

**"Email already exists"**  
Subscriber emails must be unique across the entire platform. Use a different email address or look up the existing subscriber.

**"Phone number already in use"**  
The number was claimed between your availability check and provision attempt. Run `POST /numbers/availability` again to find a different number.

**"Invalid AccountId"**  
The `AccountId` (AID) provided does not exist or does not belong to the authenticated distributor. Verify the AID with your Telegent representative.

**"NotifyValue must be less than ThrottleValue"**  
Data usage values must be in strict ascending order: `NotifyValue < ThrottleValue < LimitValue`. Adjust the values accordingly.

**Order status "Pending"**  
Number provisioning is asynchronous. Poll `GET /numbers/order` using the `OrderId` (JNUOID) until `OrderStatus` returns `"Complete"`.

---

## Common Questions

**Q: Why am I getting a 401 Unauthorized?**  
A: Your token may be expired or scoped to a different endpoint. Re-authenticate and ensure `ApiEndpoint` in your auth request matches the exact endpoint you are calling.

**Q: What's the difference between mvno and iot number types?**  
A: MVNO supports both A2P and P2P messaging and full voice capabilities. IoT supports P2P messaging and data only — it cannot be used for A2P messaging or voice calls.

**Q: How do I send an MMS message?**  
A: Use `POST /message/outbound` with either `MmsMedia` (an array of media URLs) or `MmsBase64` (base64-encoded media with MIME type) in addition to `To`, `From`, and `Body`.

**Q: Can I reuse a message route across multiple numbers?**  
A: Yes. Assign the same `MessageRouteId` (MRID) when provisioning or updating multiple numbers.

**Q: What does IntelligentRouteEnabled do?**  
A: It activates AI-powered dynamic routing logic for the route, enabling context-aware call or message handling beyond static rules.

**Q: How do I assign a number to a subscriber?**  
A: Set `AssignedSubscriberId` when provisioning (`POST /numbers/provision`) or update it later via `POST /numbers/update`. You can also link them through a subscription (`POST /subscriptions`).

**Q: What is the ICCID field?**  
A: The ICCID (Integrated Circuit Card Identifier) is the SIM card's unique serial number. Required for IoT numbers and SIM swap operations. For eSIM provisioning, use the `QRCode` field returned in the provision response.

**Q: Why does data usage throttling not work?**  
A: Ensure `NotifyValue < ThrottleValue < LimitValue` and that all three values are distinct positive integers in the same `ValueUnit`. Also confirm `ThrottleSpeed` is set.

**Q: Do I need a separate token for each API endpoint?**  
A: Yes, if you use `ApiEndpoint` scoping (recommended). Each token is scoped to the URL you pass in `ApiEndpoint`. You need a new token for each distinct endpoint you call.

**Q: What is the QRCode field in the provision response?**  
A: It is a URL to a QR code image for eSIM provisioning. The QR code encodes the LPA (Local Profile Assistant) string that an eSIM-capable device scans to activate the SIM profile. Relevant for IoT numbers with eSIM support.

**Q: How do I port a number in from another carrier?**  
A: First run `POST /numbers/portin/eligibility` to confirm the number is portable. Then submit `POST /numbers/portin` with the losing carrier details, billing address, and SIM information. Track the status with `GET /numbers/order` using the returned `OrderId`.

**Q: What is the difference between InboundBypass and OutboundBypass on a message route?**  
A: `InboundBypass: true` means Telegent will not call your webhook when a message is received (inbound messages are dropped/ignored). `OutboundBypass: true` means Telegent will not send delivery receipt callbacks to your `CallbackMessageUrl` after sending outbound messages.

**Q: Can I send to multiple recipients in one API call?**  
A: Yes. The `To` field in `POST /message/outbound` is an array: `[{"Number": "+18015551234"}, {"Number": "+18019876543"}]`.

**Q: What is the difference between a Service, Product, and Package?**  
A: Services are individual billable items (the most granular unit). Products group one or more services into an orderable SKU. Packages bundle products into a subscriber-facing offering. Subscriptions link a subscriber + phone number + package together to activate access.

**Q: How do I set up parental controls for a child subscriber?**  
A: Three steps: (1) Enable AI Guardian on the child subscriber via `POST /subscribers/guardian-features`. (2) Create a guardian relationship linking the parent to the child via `POST /subscribers/guardians/relation`. (3) Create message and/or call filters on the child subscriber via `POST /subscribers/message-filter` and `POST /subscribers/call-filter`.

**Q: What is the difference between WHITELIST and BLACKLIST call filter modes?**  
A: WHITELIST allows only calls from numbers explicitly in the `AllowedNumbers` list — all other callers are blocked. BLACKLIST blocks only the numbers in the `BlockedNumbers` list — all others are allowed.

**Q: What are workgroup activities?**  
A: Activities are the individual agents or ring targets within a workgroup. Each activity has a `DigitOrder` (priority/sequence), a `PhoneNumber` to ring, and a `Type` (phone, workgroup, or user). For IVR workgroups, the `DigitOrder` corresponds to the digit the caller presses.

**Q: How do I configure on-hours vs off-hours routing in a workgroup?**  
A: Attach a `ScheduleId` to the workgroup. Then set `OnHoursType` / `OnHoursId` for behaviour when the schedule is active, and `OffHoursType` / `OffHoursId` for behaviour outside scheduled hours. Types include `"voicemail"`, `"redirect"`, and `"workgroup"`.

**Q: How do I look up a message after it was sent?**  
A: Use `POST /message/details` with the `MessageId` (TMID) for a single message, or `POST /message/search` to query message history by date range, number, or status.

**Q: What phone number format does the API require?**  
A: All phone numbers must be in E.164 format: `+<country_code><number>`. Example: `+18015551234` for a US number. No spaces, dashes, or parentheses.

**Q: Are MessageEnabled and VoiceEnabled required when provisioning?**  
A: Yes — always include both as booleans. The API currently returns success when they are omitted, but that behavior is not guaranteed and should not be relied on.

**Q: How do I retrieve or regenerate an eSIM QR code?**  
A: If the eSIM was deleted from the device but the number has not been cancelled, the original QR code is still valid — retrieve it via the Number Details endpoint and rescan. If you need a fresh QR code, perform a SIM swap via `POST /numbers/status` with `"StatusChange": "swap-sim"`.

**Q: How do I reset a SIM so it's available again?**  
A: Call `POST /v1.0/sims/clear-status` with `{ "ICCID": "..." }`.

**Q: How do I check data usage and renewal settings for a number?**  
A: Use `POST /numbers/data-usage/info` for live usage stats (Used, Remaining, CurrentBehavior) and `POST /numbers/data-usage/settings` for the configured thresholds (NotifyValue, LimitValue, ThrottleValue, ThrottleSpeed). Both accept a `PhoneNumbers` array.

**Q: Why isn't a line resetting usage at the start of the month?**  
A: The usage cycle resets on the per-number `RenewalDay`, not on the calendar 1st of month. Check that `AutoRenew` is `true` and `RenewalDay` is set correctly via `POST /numbers/data-usage/update-renewal-info`. To force an immediate reset, include `"ResetUsage": true` in the same call.

**Q: How do I get CDRs?**  
A: CDRs can be delivered via webhook, email, or both. Voice and SMS CDRs are in separate files. T-Mobile currently delivers CDRs to Telegent hourly. Contact support to configure delivery preferences.

**Q: Where are release notes published?**  
A: In the Telegent Console under Home → Release Notes, and in your customer Slack channel with each release.

**Q: How do I cancel an active subscription?**  
A: Use `POST /subscriptions/delete`. This is the only cancellation path — there is no separate deactivate or suspend endpoint. The same ICCID can be reused in a new subscription after deletion.

**Q: A subscriber cancelled but wants to come back on the same number. Do I need to reprovision?**  
A: No — use the Number Reactivation endpoint (`POST /numbers/reactivation`) to restore the number without reprovisioning, preserving the original MSISDN ↔ ICCID relationship. This is only valid within **30 days** of cancellation. After 30 days, a new provision is required.

**Q: What is the difference between cancelling a number and parking it?**  
A: Parking (`POST /numbers/status` with `"StatusChange": "park"`) suspends the number while retaining the MSISDN and ICCID — the number can be reactivated later. Cancelling (or deleting the subscription) permanently removes the MSISDN and ICCID association. If there is any chance the number will be needed again, park it rather than cancel.

**Q: A port-in failed. Should I create a new port-in request or update the existing one?**  
A: It depends on the failure type. For correctable failures (wrong account number, PIN, billing address, carrier name), call `POST /numbers/portin/update` against the same `OrderId` with the corrected fields — do not create a new request. The order will resubmit to the losing carrier. For hard rejections (account holds, carrier restrictions), call `POST /numbers/portin/cancel`, have the customer resolve the issue with their carrier, then submit a fresh `POST /numbers/portin`.

**Q: What port-in statuses are there, and which endpoints are valid in each?**  
A: The full status set is: `Pending` → `InProgress` → `ResolutionRequired` → `Complete` / `Cancelled`. `portin/update` is valid in Pending, InProgress, and ResolutionRequired. `portin/cancel` is valid in most states. A new `/portin` request is only valid when no active port-in exists for that MSISDN.

**Q: Both portin/update and portin/cancel are returning GENS-0041 "No Port-In request found" but the order is still showing as active. What do I do?**  
A: This is a stuck state requiring manual backend intervention. Open a support ticket and include the MSISDN, the `OrderId`, and the exact error responses from both endpoints.

---

## Releases and CDRs

### Release notifications
Release notes are posted to the **Telegent Console** (Home → Release Notes) and shared in your customer Slack channel with each release.

### CDR delivery
CDRs (Call Detail Records) can be delivered three ways: webhook endpoint, email, or both. Voice and SMS CDRs are separated into different files. T-Mobile currently delivers CDRs to Telegent every hour; a project is in flight to reduce that to every 15 minutes.

---

## Support

For help, visit: [https://support.telegent.com/support/home](https://support.telegent.com/support/home)
