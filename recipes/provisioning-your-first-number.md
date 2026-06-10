---
title: Provisioning your first number
description: Recipe Description
hidden: false
recipe:
  color: '#018FF4'
  icon: 📱
---
```json JSON
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

# Create a new account

<!-- json@ -->

You will need an account for your numbers to live under. This is the first step and may already be done so confirm whether or not you have an account. Generate a bearer token and then provide that for authentication.

# Create a message route

<!-- json@ -->

All numbers will require a message route to be provisioned. If a voice route is wanted to enable calling then after provisioning the message navigate to the voice route or it can be done after provisioning the number.

# Provision a number

<!-- json@ -->

At this point you can provision a number and assign it to the account you created. Put in the desired information in the fields and then it will provide a random number for you.

# Create a subscriber

<!-- json@ -->

Create a subscriber to have the phone number that you have provisioned, you will provide the AccountId that you previously created.