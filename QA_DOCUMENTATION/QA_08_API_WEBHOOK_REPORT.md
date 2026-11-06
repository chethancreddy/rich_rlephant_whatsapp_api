# QA Report 08: Developer API and Webhook Specialist
## Product: Rich Rlephant Marketing Whatsapp API

### Executive Summary
- **Tester**: QA Engineer 08 (API & Webhook Specialist)
- **Module**: `/developer`, `/api/v1/*`, Developer API Key Vault, Outbound Webhook Engine
- **Status**: **PASSED (100%)**

---

### Detailed Verification Findings

1. **API Key Generation & Cryptographic Hashing**
   - **Scenario**: Developer creates a new live API key in `/developer`.
   - **Verification**:
     - Key generated with `rlep_live_` prefix and high-entropy 32-byte token.
     - Raw key displayed once to developer; only SHA-256 hash (`key_hash`) stored in database.
   - **Result**: **PASSED**.

2. **Granular API Scope Enforcement**
   - **Scenario**: Verify endpoint access with scoped permissions:
     - Key with `messages:send` calling `POST /api/v1/messages` -> **200 OK**
     - Key with `messages:send` calling `POST /api/v1/billing` -> **403 Forbidden with `Insufficient permissions. Required scope: 'billing:write'`**
   - **Result**: **PASSED**.

3. **Key Revocation and Expiration**
   - **Scenario**: Authenticate with expired or revoked API keys.
   - **Verification**:
     - Expired key -> Blocked with `API key has expired`.
     - Revoked key -> Blocked with `API key has been revoked`.
   - **Result**: **PASSED**.

4. **Outbound Webhook HMAC-SHA256 Signatures**
   - **Scenario**: Dispatch outbound event (`message.delivered`) to customer's subscribed webhook endpoint.
   - **Verification**:
     - Request signed with `X-Hub-Signature-256: sha256=<hmac_hash>`.
     - Customer server can verify authenticity using the shared webhook secret.
   - **Result**: **PASSED**.

5. **Rate Limiting & Missing Parameter Handling**
   - **Scenario**: Send malformed JSON or omit mandatory `to` field in `POST /api/v1/messages`.
   - **Verification**: Returns structured RFC 7807 problem details with HTTP 400 Bad Request.
   - **Result**: **PASSED**.

