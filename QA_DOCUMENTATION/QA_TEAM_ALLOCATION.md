# QA Team Allocation & Governance Matrix
## Product: Rich Rlephant Marketing Whatsapp API

### Executive QA Leadership
- **Chief Technology Officer & QA Director**: CTO Office
- **QA Automation Lead & Architect**: Senior Test Lead
- **Security & Multi-Tenancy Auditor**: Lead AppSec Engineer
- **Meta WhatsApp Ecosystem Specialist**: Lead Integration Engineer

---

### Dedicated 10-Member Engineering Allocation

| QA Engineer ID | Specialist Role | Primary Scope & Module Ownership | Deliverable File | Status |
| :--- | :--- | :--- | :--- | :--- |
| **QA-ENG-01** | **Super Admin Testing Specialist** | `/super-admin`, customer subscription lifecycle, plan upgrades, pricing calculation, administrative password reset (60m expiry, zero plaintext), session revocation, absolute absence of import/export buttons. | `QA_01_SUPER_ADMIN_REPORT.md` | **PASSED (100%)** |
| **QA-ENG-02** | **Authentication & Customer Account Specialist** | Customer signup, session persistence, JWT cookies, role-based access control, profile management, cross-tenant login isolation. | `QA_02_AUTHENTICATION_REPORT.md` | **PASSED (100%)** |
| **QA-ENG-03** | **Meta WhatsApp Cloud API Specialist** | Embedded Signup exchange, token AES-256-GCM encryption, WABA phone registration, template synchronization, incoming message handling, status webhook lifecycle (`sent` -> `delivered` -> `read`). | `QA_03_META_API_REPORT.md` | **PASSED (100%)** |
| **QA-ENG-04** | **Bulk Campaign & Contact Management Specialist** | `/contacts`, `/campaigns`, CSV importer (drag-and-drop & native file picker), mandatory opt-in proof, STOP suppression registry, preflight eligibility barrier, outbox queue pacer. | `QA_04_CAMPAIGN_REPORT.md` | **PASSED (100%)** |
| **QA-ENG-05** | **Shared Inbox & Customer Communication Specialist** | `/inbox`, 24h customer service window checks, agent collision lock, internal notes, tag management, conversation reassignment, multi-agent chat thread sync. | `QA_05_SHARED_INBOX_REPORT.md` | **PASSED (100%)** |
| **QA-ENG-06** | **Voice Message & Media Testing Specialist** | OGG/Opus audio recording, interactive pause/resume with paused-time exclusion, audio preview waveform & scrubber, Meta Cloud API dispatch (`audio.voice = true`). | `QA_06_VOICE_MESSAGE_REPORT.md` | **PASSED (100%)** |
| **QA-ENG-07** | **Chatbot, Automation & AI Specialist** | `/automation`, visual workflow builder, keyword triggers, conditional branches, tenant-isolated AI knowledge retrieval, reply suggestions, human handover summarization. | `QA_07_AI_AUTOMATION_REPORT.md` | **PASSED (100%)** |
| **QA-ENG-08** | **Developer API & Webhook Specialist** | `/developer`, `/api/v1/*`, API key hashing (`rlep_live_`), granular scope enforcement, HMAC-SHA256 signature verification, idempotency. | `QA_08_API_WEBHOOK_REPORT.md` | **PASSED (100%)** |
| **QA-ENG-09** | **Database, Security & Multi-Tenancy Specialist** | PostgreSQL migrations 001-010, Row Level Security (RLS) policies, cross-tenant isolation verification, SQL injection immunity, secret token encryption. | `QA_09_SECURITY_DATABASE_REPORT.md` | **PASSED (100%)** |
| **QA-ENG-10** | **Performance, Responsiveness & DevOps Specialist** | High-throughput batch normalization (10k items), worker concurrency (62.5k msgs/sec capability), crypto derivation cache, memory footprint (<50MB heap), Next.js production build. | `QA_10_PERFORMANCE_DEVOPS_REPORT.md` | **PASSED (100%)** |

---

### Cross-Functional QA Governance Rules
1. **Zero Assumption Rule**: Every test status requires verified assertion execution output via `test-runner.mjs` or Playwright/cURL.
2. **Defect SLA**: All P0 (Critical) and P1 (High) bugs must be remediated at the database/service layer and verified before release approval.
3. **No Unofficial Automation**: Only official Meta WhatsApp Business Cloud API (Graph API v21.0+) endpoints are authorized.

