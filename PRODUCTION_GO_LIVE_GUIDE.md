# Production Go-Live & Operational Guide
## Rich Rlephant Marketing Whatsapp API

This guide provides the official operations procedure for taking the **Rich Rlephant Marketing Whatsapp API** live for commercial customers.

---

## 1. System Architecture Overview

```
                                      [ Public Internet ]
                                               │
                                 ┌─────────────┴─────────────┐
                                 │   Landing Page (Public)   │
                                 │   /  /privacy-policy /terms│
                                 └─────────────┬─────────────┘
                                               │
                                 ┌─────────────▼─────────────┐
                                 │   Next.js Edge Middleware │
                                 │   src/middleware.ts       │
                                 │  - HMAC-SHA256 Token Verify
                                 │  - CSP & Security Headers │
                                 └───────┬───────────┬───────┘
                                         │           │
                 ┌───────────────────────┘           └───────────────────────┐
                 │ (Customer Cookie)                                         │ (Privileged Admin + MFA)
                 ▼                                                           ▼
    ┌─────────────────────────┐                                 ┌─────────────────────────┐
    │   Customer Workspace    │                                 │   Super Admin Portal    │
    │  - Shared Team Inbox    │                                 │  - Security Dashboard   │
    │  - Campaigns & Contacts │                                 │  - Plan & Tenant Control│
    │  - Template Builder     │                                 │  - Audit Logs & Sessions│
    └────────────┬────────────┘                                 └────────────┬────────────┘
                 │                                                           │
                 └─────────────────────────┬─────────────────────────────────┘
                                           │
                                ┌──────────▼──────────┐
                                │ Neon PostgreSQL DB  │
                                │  - 41 Tables        │
                                │  - Strict Tenancy   │
                                └─────────────────────┘
```

---

## 2. Default Provisioned Credentials

### Super Admin Privileged Account
- **Portal URL:** `/super-admin/login`
- **Email:** `admin@rich-rlephant.com`
- **Initial Password:** `Admin@RichRlephant2026!`
- **MFA Step:** Dispatches a 6-digit challenge code to the session. Enter code on `/super-admin/mfa`.

### Customer Workspace Admin (Demo Account)
- **Portal URL:** `/login`
- **Email:** `demo@rich-rlephant.com`
- **Initial Password:** `Demo@RichRlephant2026!`
- **Assigned Tenant:** `Acme Dubai Retail` (`00000000-0000-0000-0000-000000000001`)

---

## 3. Transitioning to Permanent Meta Cloud API Credentials

1. Open **[Meta Business Suite](https://business.facebook.com)** &rarr; **Business Settings**.
2. Navigate to **Users &rarr; System Users** &rarr; create a system user named `rich-rlephant-api-admin`.
3. Assign assets: Select your WhatsApp Business Account and Grant Full Control.
4. Click **Generate New Token**:
   - Token Expiration: **Never**.
   - Check permissions:
     - `whatsapp_business_messaging`
     - `whatsapp_business_management`
5. Copy token and configure as `META_ACCESS_TOKEN` in Vercel Project Settings.
6. Under **Step 2. Production setup** in Meta Developer Portal, attach your official commercial phone number (replaces the `+1 555` test number).
