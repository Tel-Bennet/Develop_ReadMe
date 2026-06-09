---
title: Postman Collection
slug: index
excerpt: Download the full Telegent mPaaS API collection and start testing in Postman in minutes.
category: Download Postman
order: 0
x-mintlify-group: Postman Collection
x-mintlify-icon: download
---

The Telegent mPaaS Postman Collection gives you all 121 API endpoints pre-configured and organized, so you can authenticate and start making real API calls without writing a single line of code.

<a
  href="/telegent-postman-collection.json"
  download="telegent-postman-collection.json"
  style={{display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '8px', marginBottom: '24px', padding: '10px 20px', backgroundColor: '#6aa4ff', color: '#fff', borderRadius: '6px', fontWeight: '600', textDecoration: 'none', fontSize: '14px'}}
>
  ↓ Download Postman Collection
</a>

---

## What's included

- **121 endpoints** across 16 folders — Numbers, Message, Voice, Accounts, Subscribers, AI Guardian, and more
- **Bearer auth pre-configured** at the collection level — set your token once and every request inherits it
- **Pre-filled request bodies** pulled directly from the API spec so you're not starting from scratch
- **Environment variable placeholders** — `{{base_url}}` and `{{token}}` ready to fill in

---

## How to import

  
#### Download the collection

Click the **Download Postman Collection** button above. Your browser will save `telegent-postman-collection.json` to your machine.

  
#### Import into Postman

Open Postman, click **Import** (top left), then drag and drop the downloaded file or click **Upload Files** to select it. The collection will appear in your sidebar under **Collections**.

  
#### Create an environment

In Postman, go to **Environments → Add** and create a new environment with these two variables:

    | Variable | Value |
    |---|---|
    | `base_url` | `https://api.telegent.com/v1.0` |
    | `token` | Your Bearer token from the Authentication endpoint |

    Select the environment from the dropdown in the top right corner.

  
#### Get your Bearer token

Before calling any other endpoint, run the **Get Token** request in the **OAuth2** folder. Use your `AccountKey` and `AccountSecret` as the request body. Copy the token from the response and paste it into your `token` environment variable.

  
#### Make your first call

You're ready. Open any folder, select an endpoint, and hit **Send**. All requests will automatically use your `base_url` and `token`.

---

## Keeping the collection up to date

The collection is regenerated automatically whenever the API spec is updated. To get the latest version, simply return to this page and download again — then re-import into Postman using the same steps above.

> 📘 **Note**
>
> Need help or have questions? Contact [support@telegent.com](mailto:support@telegent.com)
