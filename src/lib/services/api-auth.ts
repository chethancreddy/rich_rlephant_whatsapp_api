// ============================================================================
// Developer API Authentication & Scope Enforcement Service
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { hashApiKey } from '../crypto-vault.ts';

export interface ApiKeyRecord {
  id: string;
  tenant_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  scopes: string[];
  revoked_at: string | null;
  expires_at: string | null;
  last_used_at?: string | null;
}

export interface ApiAuthResult {
  valid: boolean;
  tenantId?: string;
  scopes?: string[];
  keyId?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Validates an incoming developer API key against stored hash and scope requirements
 */
export async function validateApiKey(
  rawKey: string,
  requiredScope?: string,
  mockStore?: ApiKeyRecord[]
): Promise<ApiAuthResult> {
  if (!rawKey || typeof rawKey !== 'string') {
    return {
      valid: false,
      error: 'UNAUTHORIZED: Missing or malformed API key',
      statusCode: 401,
    };
  }

  const trimmed = rawKey.trim();
  if (!trimmed.startsWith('rlep_live_') && !trimmed.startsWith('rlep_test_')) {
    return {
      valid: false,
      error: 'UNAUTHORIZED: Invalid API key format. Expected prefix rlep_live_ or rlep_test_',
      statusCode: 401,
    };
  }

  const computedHash = hashApiKey(trimmed);

  let keyRecord: ApiKeyRecord | undefined;

  if (mockStore) {
    keyRecord = mockStore.find(k => k.key_hash === computedHash);
  } else {
    // In production, query the Supabase database using service-role or elevated client
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key';
      const client = createClient(supabaseUrl, serviceRoleKey);

      const { data, error } = await client
        .from('api_keys')
        .select('*')
        .eq('key_hash', computedHash)
        .single();

      if (!error && data) {
        keyRecord = data as ApiKeyRecord;
      }
    } catch {
      // Fallback if database client fails to load
    }
  }

  if (!keyRecord) {
    return {
      valid: false,
      error: 'UNAUTHORIZED: Invalid or unknown API key',
      statusCode: 401,
    };
  }

  if (keyRecord.revoked_at) {
    return {
      valid: false,
      error: 'UNAUTHORIZED: This API key has been revoked',
      statusCode: 401,
    };
  }

  if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
    return {
      valid: false,
      error: 'UNAUTHORIZED: This API key has expired',
      statusCode: 401,
    };
  }

  if (requiredScope) {
    const hasScope = keyRecord.scopes.includes('*') || keyRecord.scopes.includes(requiredScope);
    if (!hasScope) {
      return {
        valid: false,
        error: `FORBIDDEN: Insufficient permissions. Required scope: '${requiredScope}'. Granted: [${keyRecord.scopes.join(', ')}]`,
        statusCode: 403,
      };
    }
  }

  return {
    valid: true,
    tenantId: keyRecord.tenant_id,
    scopes: keyRecord.scopes,
    keyId: keyRecord.id,
  };
}

/**
 * Parses and verifies authorization header from incoming HTTP request
 */
export async function authenticateApiRequest(
  request: Request,
  requiredScope?: string,
  mockStore?: ApiKeyRecord[]
): Promise<ApiAuthResult> {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader) {
    return {
      valid: false,
      error: 'UNAUTHORIZED: Missing Authorization header. Provide `Bearer rlep_...`',
      statusCode: 401,
    };
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return {
      valid: false,
      error: 'UNAUTHORIZED: Malformed Authorization header. Expected format `Bearer <api_key>`',
      statusCode: 401,
    };
  }

  return validateApiKey(parts[1], requiredScope, mockStore);
}

