---
title: API Quick Start Guide
excerpt: 'Complete walkthrough: From authentication to your first working setup'
hidden: false
slug: quick-start-guide
---
## Overview

This guide walks you through the complete process of setting up your first Telegent number, configuring messaging and voice routes, and creating a subscriber. By the end, you'll have sent your first test message!

> 📘 **Note**
>
> **What You'll Build:**
>
> - Authenticate with the API
> - Set up message and voice routing
> - Provision a phone number
> - Create a subscriber
> - Send a test message

## Prerequisites

- **[API Credentials](#)** — You'll need an `AccountKey` and `AccountSecret` from your Telegent representative

- **[API Tool](#)** — Postman, cURL, or any HTTP client for making API requests

***

## Step 1: Authenticate

All API calls require a Bearer token. Get yours first by authenticating with your credentials.

**API Call:** `POST /v1.0/oauth2/tokens`

```json Request Body
{
  "AccountKey": "YOUR_ACCOUNT_KEY",
  "AccountSecret": "YOUR_ACCOUNT_SECRET",
  "ApiEndpoint": "https://api.telegent.com/v1.0/numbers/provision"
}
```

**Response:**

```json
{
  "token": "abcdeghijklmnopqrstuvwxyz...................",
  "successful": true,
  "tokenExpiry": "05/02/2025 06:36:13 PM"
}
```

> 📘 **Note**
>
> `ApiEndpoint` scopes the token to a specific endpoint URL for security. Generate a separate token for each endpoint you call.

> ✅ **Success**
>
> **Save this token!** You'll need it in the `Authorization: Bearer` header for all subsequent requests.

***

## Step 2: Create Message Route

Message routes define how SMS/MMS messages are delivered to your system. This is **required** for ALL subscribers.

**API Call:** `POST /v1.0/message/routes`

```json Request
{
  "RouteName": "Main SMS Webhook",
  "MessageUrl": "https://apiendpoint.com",
  "MessageUrlMethod": "POST",
  "MessageRouteEnabled": true,
  "MessageAuthenticationType": "Basic",
  "MessageUsername": "admin",
  "MessagePasswordToken": "passwordORbearerToken",
  "CallbackMessageUrl": "https://apiendpoint.com",
  "CallbackMessageUrlMethod": "POST",
  "CallbackMessageAuthenticationType": "Basic",
  "CallbackMessageUsername": "admin",
  "CallbackMessagePasswordToken": "password",
  "InboundBypass": true,
  "OutboundBypass": true,
  "IntelligentRouteEnabled": true,
  "AccountId": "AID-eab92510-1040-45a5-bb9c-0bad9272f89d"
}
```

```json Response
{
  "MessageRouteId": "MRID-ad0ff867-57dc-4aeb-80e9-9d18349080e9",
  "AccountId": "DID-eab92510-1040-45a5-bb9c-0bad927SDY878W",
  "RouteName": "Main SMS Webhook",
  "MessageUrl": "https://apiendpoint.com",
  "MessageUrlMethod": "POST",
  "MessageRouteEnabled": false,
  "MessageAuthenticationType": "Basic",
  "MessageUsername": "admin",
  "MessagePasswordToken": "passwordORbearerToken",
  "CallbackMessageUrl": "https://apiendpoint.com",
  "CallbackMessageUrlMethod": "POST",
  "CallbackMessageAuthenticationType": "Basic",
  "CallbackMessageUsername": "admin",
  "CallbackMessagePasswordToken": "password"
}
```

> ✅ **Success**
>
> `Save the MessageRouteId` (also called MRID) - required for number provisioning.

> 🚧 **Warning**
>
> Without a message route, you cannot provision numbers! Make sure this is set up before moving to Step 4.

***

## Step 3: Create Voice Route (Optional - MVNO Only)

Voice routes define where inbound calls are directed. Only required if you're offering voice services.

**API Call:** `POST /v1.0/voice/routes`

```json Request
{
  "RouteName": "Main SIP Trunk",
  "RouteType": "Trunk",
  "VoiceUrl": "https://domain.com",
  "VoiceUrlMethod": "POST",
  "VoiceAuthenticationType": "Basic",
  "VoiceUsername": "admin",
  "VoicePasswordToken": "passwordORbearerToken",
  "CallbackVoiceUrl": "https://apiendpoint.com",
  "CallbackVoiceUrlMethod": "POST",
  "TrunkIp1": "20.87.87.87",
  "TrunkIp2": "20.87.87.86",
  "TrunkPort1": "5061",
  "TrunkPort2": "5060",
  "TrunkTransport1": "UDP",
  "TrunkTransport2": "TCP",
  "TrunkUri1": "https://pstn.joonto.com",
  "TrunkUri2": "https://pstn2.joonto.com",
  "TrunkEnabled1": true,
  "TrunkEnabled2": false,
  "Trunk1Priortiy": 10,
  "Trunk1Weight": 10,
  "Trunk2Priortiy": 20,
  "Trunk2Weight": 20,
  "HeaderManipulation": "HMI8802029",
  "EnableSipRefer": true,
  "TransferCallerId": "Transferee/Transferor",
  "SymmetricRtp": true,
  "EnableTrpSecureTrunk": true,
  "EnablePstnTransfer": true,
  "IpWhitelist": [{"IpAddress": "20.20.10.10"}, {"IpAddress": "20.20.10.20"}],
  "CnamLookup": true,
  "TerminationUriSubdomain": "client",
  "EnableCallStreaming": true,
  "WssUri": "wss://192.67.88.2",
  "IntelligentRouteEnabled": true,
  "RouteEnabled": true,
  "AccountId": "AID-1e8939ab-3f3c-4db1-89d7-956d80fd793j"
}
```

```json Response
{
  "CallRouteId": "CRID-509de94f-79cc-429b-a317-2102654dabbb",
  "AccountId": "DID-1e8939ab-3f3c-4db1-89d7-956d80fd793j",
  "RouteName": "Main SIP Trunk",
  "RouteType": "Trunk",
  "VoiceUrl": "https://domain.com",
  "VoiceUrlMethod": "POST",
  "TrunkIp1": "20.87.87.87",
  "TrunkIp2": "20.87.87.86",
  "TrunkPort1": "5061",
  "TrunkPort2": "5060",
  "TrunkTransport1": "UDP",
  "TrunkTransport2": "TCP",
  "TrunkUri1": "https://pstn.joonto.com",
  "TrunkUri2": "https://pstn2.joonto.com",
  "TrunkEnabled1": true,
  "TrunkEnabled2": false,
  "Trunk1Priortiy": 10,
  "Trunk1Weight": 10,
  "Trunk2Priortiy": 20,
  "Trunk2Weight": 20,
  "HeaderManipulation": "HMI8802029",
  "EnableSipRefer": true,
  "TransferCallerId": "Transferee/Transferor",
  "SymmetricRtp": true,
  "EnableTrpSecureTrunk": true,
  "EnablePstnTransfer": true,
  "CnamLookup": true,
  "TerminationUriSubdomain": "client",
  "EnableCallStreaming": true,
  "WssUri": "wss://192.67.88.2",
  "IntelligentRouteEnabled": true,
  "RouteEnabled": true,
  "IpWhiteList": []
}
```

> ✅ **Success**
>
> `Save the CallRouteId` (also called CRID) if you created one.

***

## Step 4: Check Available Phone Numbers

Before provisioning a number, check what's available in your desired area. This endpoint returns a count of available numbers and the areas where they're available.

**API Call:** `POST /v1.0/numbers/availability`

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
  "ZipCode": "",
  "PageNumber": 1,
  "ResultsTotal": 7700,
  "AvailableNumberAreas": [
    {
      "NGP": "SAG",
      "AreaCode": 993,
      "Zipcode": "00601"
    },
    {
      "NGP": "AGP",
      "AreaCode": 787,
      "Zipcode": "00601"
    }
  ]
}
```

### Field Notes

### NumberType

`"mobile"` — note: when **provisioning** a number, the valid values are `"mvno"` or `"iot"`

### MessageType

`"a2p"` or `"p2p"`

### AreaCode & ZipCode

- **AreaCode**: 3-digit area code (leave blank `""` for all available area codes and zipcodes)
  - **ZipCode**: 5-digit zip code (if area code unavailable, system looks at zipcode)

  - **Note**: You can input both, but AreaCode searches first if included. If both are blank/NULL, randomized results are returned.

### PageNumber

Pagination limits 10,000 per page

### Response Fields

- **ResultsTotal**: Total count of available numbers in the searched area
- **AvailableNumberAreas**: Array of areas with available numbers
- **NGP**: Number Gateway Provider
- **AreaCode**: Area code where numbers are available
- **Zipcode**: Zip code where numbers are available

> ✅ **Success**
>
> Review the `ResultsTotal` count to confirm numbers are available in your desired area before provisioning.

***

## Step 5: Create Subscriber

Create the end user who will use the phone number.

**API Call:** `POST /v1.0/subscribers/create`

```json Request
{
  "Name": "Jerome User 4",
  "Email": "jerome4@joonto.com",
  "PhoneNumbers": ["+1234567890"],
  "Role": "Subscriber",
  "Password": "1234567890",
  "AccountId": "AID-eab92510-1040-45a5-bb9c-0bad9272f89d"
}
```

```json Response
{
  "SubscriberId": "TSUID-90c644ff-7f70-4587-a27e-d1d45bde7528",
  "Name": "Jerome User 4",
  "Email": "jerome4@joonto.com",
  "PhoneNumbers": ["+1234567890"],
  "Role": "Subscriber",
  "Account": {
    "AccountId": "AID-eab92510-1040-45a5-bb9c-0bad9272f89d",
    "CompanyName": "Telegent Account"
  }
}
```

> ✅ **Success**
>
> `Save the SubscriberId`

***

## Step 6: Provision Phone Number

Now provision a phone number in your desired area.

**API Call:** `POST /v1.0/numbers/provision`

```json Request
{
  "NumberType": "iot",
  "MessageType": "p2p",
  "MessageEnabled": true,
  "VoiceEnabled": false,
  "DataEnabled": true,
  "MessageRouteId": "MRID-73af1e73-d7b3-4696-bdd9-5b407c96fc8a",
  "VoiceRouteId": "CRID-4dec6beb-3985-444b-8c06-8baa70dc145",
  "AreaCode": "201",
  "ZipCode": "84043",
  "ICCID": "8901240397190195850",
  "ProductType": "Sms+Data",
  "AssignedSubscriberId": "TSUID-1234567999"
}
```

```json Response
{
  "OrderDate": "2025-10-29T12:36:19.338438+00:00",
  "OrderId": "JNUOID-76ba71a8-d7a6-4489-b695-1ad363b8d596",
  "OrderStatus": "Complete",
  "PhoneNumberAssigned": "+18016025346",
  "PhoneNumberId": "NID-8bdf915a-ef65-46c9-8c66-96c98d42d9ca",
  "QRCode": "https://quickchart.io/qr?text=LPA:1$T-MOBILE.IDEMIA.IO$LX9G1-Q12VI-CIIWA-WAQIN",
  "ZipCode": "84603",
  "ICCID": "12345678900987654321",
  "ErrorMessage": null,
  "SubscriberId": "TSUID-ac59a1f8-36b6-42cc-b124-c2aa29f7e3d2"
}
```

> ✅ **Success**
>
> `Save the PhoneNumberAssigned and PhoneNumberId` for the next step.

> 📘 **Note**
>
> `ProductType` options: `Sms-Only`, `Data-Only`, `Sms+Data`, `Sms+Data+Voice`. `ICCID` and `AssignedSubscriberId` are optional.

***

## Step 7: Test Your Setup

Send a test SMS message to verify everything is working.

**API Call:** `POST /v1.0/message/outbound`

```json Request Body
{
  "To": [{"Number": "+18015737111"}],
  "From": "+18018018011",
  "Body": "Hello there!!!"
}
```

**Response:**

```json
{
  "MessageId": "TMID-00348008102307aK01",
  "Direction": "Outbound",
  "Type": "p2p",
  "Cost": 0.0045,
  "Status": "Queued",
  "To": [{"Number": "+18015737111"}],
  "From": "+18018018011",
  "Body": "Hello there!!!",
  "CreatedOn": "16:45:59 MST 2025-01-23"
}
```

***

## 🎉 Success!

You've completed your first setup! You now have:

#### Authenticated

✅ Successfully authenticated with the API

#### Routes Configured

✅ Message and Voice routes configured

#### Number Provisioned

✅ A phone number provisioned

#### Subscriber Active

✅ A subscriber with an active number

#### Message Sent

✅ A test message sent

***

## What's Next?

Now that you have the basics working, explore these advanced features:

- **[Add Data Limits](/reference/numbers)** — Set data caps or throttling for IoT and mobile data plans

- **[Port-In Numbers](/reference/numbers)** — Transfer phone numbers from other carriers

- **[Create Packages](/reference/packages)** — Build service plans to offer to customers

- **[Subscriptions](/reference/subscriptions)** — Create subscription-based billing

***

## Key Concepts

### Phone Number Formats

All phone numbers use **E.164 format**: `+<country_code><number>`

```
Examples:
- US: `+18015551234`
- UK: `+442071234567`
```

### Message Types

- **A2P** (Application-to-Person): Business messaging to consumers
  - **P2P** (Person-to-Person): Individual messaging between users

### Number Classifications

- **MVNO**: Mobile virtual network operator numbers (full mobile service)
  - **IoT**: Internet of Things capable numbers (data-focused)

### Token Scoping

Each token is scoped to a specific `ApiEndpoint` URL for security. Generate a separate token for each endpoint you call. Tokens expire at the time specified in `tokenExpiry` — request a new one using the same credentials when expired.

***

## Common Issues & Solutions

### 401 Unauthorized

**Solution:** Check that your Bearer token is correct and included in the Authorization header.

### MessageRouteId is required

**Solution:** You must create a Message Route (Step 3) before provisioning numbers. Message routes are required for ALL subscribers.

### Phone number already in use

**Solution:** The number you selected was claimed by another user. Check availability again and select a different number.

### Email already exists

**Solution:** Each subscriber email must be unique across the entire platform. Try a different email address.

### Invalid AccountId

**Solution:** Make sure you're using the correct AccountId provided by your Telegent representative.

***

## API Base URL

All endpoints use this base URL:

```
https://api.telegent.com/v1.0
```

**Example full endpoint:**

```
https://api.telegent.com/v1.0/subscribers/create
```

***

## Rate Limits

- **Standard tier**: 50 requests per minute
- **Enterprise tier**: Contact support for custom limits

***

## Need Help?

- **[Full Documentation](/reference/getting-started)** — Complete API reference with all endpoints

- **[Support](https://support.telegent.com/support/home)** — Visit our support portal for help and resources

***

> 📘 **Note**
>
> **Last Updated:** April 27, 2026

<br />
