# Production Deployment & Environment Checklist
## Rich Rlephant Marketing Whatsapp API
**DevOps Engineer & Security Architecture Sign-Off**  
**Date:** 2026-11-08  

---

## 1. Pre-Deployment Configuration Checklist

- [x] **Database Migrations:** All 12 SQL migrations applied cleanly to Neon PostgreSQL (`001` through `012`).
- [x] **Authentication Engine:** Dual-factor Super Admin, Customer Registration, Login, and Password Recovery compiled and tested.
- [x] **Edge Security Middleware:** `src/middleware.ts` configured and verified.
- [x] **HTTP Security Headers:** CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff injected.
- [x] **Meta Cloud API Webhook:** Verified on live Vercel endpoint `https://rich-rlephant-whatsapp-api.vercel.app/api/webhooks/meta`.
- [x] **Meta Webhook Subscription:** Subscribed to `messages` event field in Meta Developer Dashboard.
- [x] **Legal Compliance:** Meta-compliant Privacy Policy (`/privacy-policy`) and Terms of Service (`/terms`) published.
- [x] **Automated Test Suite:** 136 / 136 tests passing (100%).
- [x] **Production Build:** Next.js 15 production build compiled with 0 errors across 60 routes.

---

## 2. Vercel Environment Variables Matrix

Configure the following variables in **Vercel Project Settings &rarr; Environment Variables**:

| Variable Name | Environment | Production Value / Description | Required |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Production, Preview | `postgresql://neondb_owner:npg_pk6gIFE3PiSX@ep-long-poetry-beapdx7x-pooler.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require` | YES |
| `APP_ENCRYPTION_KEY` | Production | 64-character hexadecimal master secret (e.g. `0123456789abcdef0123456789abcdef...`) | YES |
| `META_PHONE_NUMBER_ID` | Production | `1452097831319023` | YES |
| `META_WABA_ID` | Production | `2173616099891608` | YES |
| `META_WEBHOOK_VERIFY_TOKEN` | Production | `rich_rlephant_verify_2026` | YES |
| `META_APP_ID` | Production | Found in Meta Portal &rarr; App settings &rarr; Basic | YES |
| `META_APP_SECRET` | Production | Found in Meta Portal &rarr; App settings &rarr; Basic &rarr; Show | YES |
| `META_ACCESS_TOKEN` | Production | Permanent System User Token with `whatsapp_business_messaging` | YES |
| `CRON_SECRET` | Production | High-entropy secret for authenticating Vercel Cron worker | YES |

---

## 3. Post-Deployment Verification (Smoke Testing)
1. Navigate to main domain `https://rich-rlephant-whatsapp-api.vercel.app` &rarr; verify public landing page.
2. Click "Log In" &rarr; confirm redirected to `/login`.
3. Try opening `/dashboard` directly without cookie &rarr; confirm redirected to `/login`.
4. Sign in as demo customer (`demo@rich-rlephant.com`) &rarr; confirm workspace loads with contacts.
5. Open `/super-admin/login` &rarr; sign in with admin credentials &rarr; enter 6-digit MFA &rarr; confirm access to Security Management tab.

