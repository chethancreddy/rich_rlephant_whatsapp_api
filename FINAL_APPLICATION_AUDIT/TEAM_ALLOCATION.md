# TEAM ALLOCATION & ENGINEERING ROLES MATRIX
## Rich Rlephant Marketing Whatsapp API – SaaS Platform Audit

| Date: 2026-11-08 | Scope: Master System Audit & Production Readiness | Product: Rich Rlephant Marketing Whatsapp API |
|---|---|---|

---

## 1. Executive Leadership & Engineering Management

### 1.1 Engineering Manager
- **Accountabilities:** Overall delivery governance, bug prioritization, cross-squad sprint tracking, daily standups, code review adherence, deployment approval coordination.
- **Assigned Responsibilities:**
  - Lead sprint tracking across UI/UX, Backend, Meta Cloud API, Messaging Queue, Shared Inbox, and DevOps.
  - Coordinate bug fixing and sign off on acceptance criteria for all 10 E2E scenarios.
  - Enforce zero-tolerance policy against hardcoded mock data in customer environments.

### 1.2 Technical Architect
- **Accountabilities:** End-to-end platform architecture, multi-tenant isolation, cryptographic key management, API design, scalability boundaries.
- **Assigned Responsibilities:**
  - Audit database schema across Neon PostgreSQL and Supabase Row Level Security (RLS).
  - Architect HMAC-SHA256 session signature verification and PBKDF2 credential vaulting.
  - Approve Meta Embedded Signup OAuth callback architecture and webhook ingestion pipeline.

---

## 2. Software Engineering Squad (6 Dedicated Engineers)

| Engineer | Title & Domain | Key Deliverables & Responsibilities |
|---|---|---|
| **SE 01** | **Frontend & UI/UX Specialist** | • Eliminate hardcoded testing numbers (`+971 50 123 4567`, `+971 50 987 6543`) from all customer views.<br>• Implement dynamic empty states for 0-record workspaces across Dashboard, Contacts, Campaigns, Inbox, Templates, and Settings.<br>• Build the Neo-Brutalist 3-step onboarding card (*Welcome to [Workspace Name]*). |
| **SE 02** | **Backend & Authentication Specialist** | • Implement PBKDF2 password hashing with 100k iterations and per-user salt.<br>• Enforce progressive brute-force lockout (5 attempts $\rightarrow$ 15-minute freeze).<br>• Create Web-Crypto signed session cookies (`rlep_session`) and mandatory 6-digit MFA for Super Admin. |
| **SE 03** | **Meta Integration Specialist** | • Implement official Meta Cloud API v21.0 webhook receiver at `/api/webhooks/meta` with `hub.verify_token` challenge.<br>• Secure inbound webhook ingestion with raw-body `X-Hub-Signature-256` HMAC-SHA256 validation.<br>• Complete Meta Embedded Signup OAuth token exchange and WABA association. |
| **SE 04** | **Campaign & Messaging Specialist** | • Implement Campaign Eligibility Gate enforcing affirmative opt-in consent and suppression registry checking (`STOP` keyword).<br>• Enforce Meta-approved template matching before queue submission.<br>• Implement anti-ban pacing algorithms (e.g., 60-120 msg/min) and delivery status state machine. |
| **SE 05** | **Shared Inbox & API Specialist** | • Build shared team inbox with real-time Neon PostgreSQL conversation persistence.<br>• Enforce Meta 24-hour customer service window tracking with automatic freeform lock.<br>• Implement agent collision detection, internal team handover notes, and public REST API key scoping. |
| **SE 06** | **DevOps & Security Specialist** | • Audit Vercel edge runtime middleware for OWASP security headers (CSP, HSTS, X-Frame-Options).<br>• Verify AES-256-GCM vault encryption for Meta access tokens and developer API secrets.<br>• Audit environment variables, automated database backups, and zero-leak production logs. |

---

## 3. Data Engineering Squad (2 Dedicated Engineers)

| Engineer | Title & Domain | Key Deliverables & Responsibilities |
|---|---|---|
| **DE 01** | **Database Architecture & Security** | • Audit all 12 Supabase/Neon migrations from `001_core_tenancy_and_auth.sql` to `012_production_auth_and_security.sql`.<br>• Enforce foreign key constraints, cascading rules, and tenant ownership indexes (`tenant_id`).<br>• Verify Row Level Security (RLS) isolation ensuring Customer A cannot query Customer B records. |
| **DE 02** | **Data Quality & Test Data Cleanup** | • Investigate database for development seed records, fake phone numbers, and demo contacts.<br>• Isolate test tenant records to sandboxed test suites without polluting production customer workspaces.<br>• Verify that registered production accounts (e.g. `chethan@drfitveda.com`) start with genuine 0-metric empty states. |

---

## 4. Quality Assurance & Security Audit Squad (4 Dedicated Leads)

| QA Lead | Focus Area | Verification Criteria |
|---|---|---|
| **QA Lead 01** | **Functional & E2E Testing** | Complete execution of 136 automated unit and E2E test suites across 26 modules (`scripts/test-runner.mjs`). |
| **QA Lead 02** | **Security & Access Control** | IDOR testing, RLS bypass attempts, privilege escalation checks between Agent, Manager, Workspace Admin, and Super Admin. |
| **QA Lead 03** | **Meta API Compliance** | Message template formatting rules, variable sequence validation, webhook signature tampering rejection. |
| **QA Lead 04** | **Mobile & Cross-Browser** | Responsive layout validation on iOS Safari, Android Chrome, and Desktop Viewports (375px - 1440px). |

