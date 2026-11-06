# Master Test Plan
## Product: Rich Rlephant Marketing Whatsapp API

### 1. Strategy & Scope
The test strategy establishes complete verification across all layers of the **Rich Rlephant Marketing Whatsapp API** enterprise SaaS platform:
- **Presentation Layer**: Next.js 15 App Router pages, responsive mobile navigation, Cozy Creator UI (`#72A4F2` sky blue, `#202020` core ink, 2px borders, rounded corners).
- **Domain Services**: Multi-tenant isolation, 24h customer service window checks, campaign preflight eligibility, outbox rate pacing, AI reply copilot, subscription provisioning.
- **Integration Layer**: Official Meta WhatsApp Business Cloud API (Graph API v21.0), Webhooks, Developer Public REST APIs.
- **Persistence & Security Layer**: PostgreSQL database schemas (001-010), Supabase RLS, AES-256-GCM token encryption, SHA-256 API key hashing.

---

### 2. Test Environments & Tooling
- **Runtime Test Harness**: Node.js v24 Test Runner with `--experimental-strip-types`.
- **E2E & Load Harness**: `scripts/test-runner.mjs` orchestrating 18 test suites across unit, security, E2E, and load benchmarks.
- **Production Server**: Next.js production build (`next build` & `next start`) executing on port 3000.
- **Test Baseline**: Controlled mock messaging provider (`MockMessagingProvider`), sandboxed tenant scopes (`tenant_alpha`, `tenant_beta`), and synthetic phone numbers.

---

### 3. Quality Gates for Production Release Approval
1. **Critical User Journeys**: E2E-001 through E2E-010 must execute with 100% pass rate.
2. **Severity Threshold**: 0 open P0 (Critical) and 0 open P1 (High) bugs.
3. **Multi-Tenancy Guardrail**: Complete absence of cross-tenant data leakage verified across database, API, and UI queries.
4. **Meta WhatsApp Compliance**: Strict 24h customer service window enforcement; mandatory opt-in proof before campaign dispatch; voice notes dispatched with `audio.voice = true`.
5. **Super Admin Guardrail**: Complete removal of bulk import/export controls from `/super-admin`.
6. **Performance Standard**: Sub-100ms crypto latency, >10,000 phone normalizations in under 250ms, <300MB node heap footprint.

