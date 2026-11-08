// ============================================================================
// Batch Contacts CSV Import API with Consent Proof (Neon DB Persisted)
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { normalizePhoneE164 } from '@/lib/phone-normalizer';
import { getNeonPool } from '@/lib/db/neon';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

export interface ImportContactRow {
  phone: string;
  name?: string;
  email?: string;
  tags?: string[];
  consentGiven: boolean;
  consentPurpose?: 'marketing' | 'utility' | 'transactional';
  consentSource?: string;
  noticeVersion?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contacts, defaultCountryCode = 'AE', tenantId: reqTenantId } = body;
    const tenantId = req.headers.get('x-tenant-id') || reqTenantId || DEFAULT_TENANT_ID;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { error: 'Contacts list is required and must not be empty' },
        { status: 400 }
      );
    }

    let importedCount = 0;
    let eligibleCount = 0;
    let ineligibleCount = 0;
    let invalidPhoneCount = 0;
    const errors: Array<{ row: number; phone: string; error: string }> = [];

    const processedRows = [];

    for (let i = 0; i < contacts.length; i++) {
      const row: ImportContactRow = contacts[i];
      const normalized = normalizePhoneE164(row.phone, defaultCountryCode);

      if (!normalized.isValid) {
        invalidPhoneCount++;
        errors.push({
          row: i + 1,
          phone: row.phone,
          error: normalized.errorMessage || 'Invalid phone format',
        });
        continue;
      }

      // Consent determination
      const isEligible = Boolean(row.consentGiven);
      if (isEligible) {
        eligibleCount++;
      } else {
        ineligibleCount++;
      }

      importedCount++;
      processedRows.push({
        phone_e164: normalized.e164,
        country_code: normalized.countryCode || defaultCountryCode,
        name: row.name || '',
        email: row.email || '',
        campaign_eligibility: isEligible,
        consent_record: isEligible
          ? {
              channel: 'whatsapp',
              purpose: row.consentPurpose || 'marketing',
              source: row.consentSource || 'csv_bulk_import',
              notice_version: row.noticeVersion || 'v1.0',
              captured_at: new Date().toISOString(),
              status: 'granted',
            }
          : null,
      });
    }

    // Persist processed rows into Neon Serverless PostgreSQL
    if (processedRows.length > 0) {
      try {
        const pool = getNeonPool();
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          for (const item of processedRows) {
            const insRes = await client.query(
              `
              INSERT INTO contacts (
                tenant_id, phone_e164, name, email, country_code, source, campaign_eligibility
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7)
              ON CONFLICT (tenant_id, phone_e164) DO UPDATE SET
                name = COALESCE(NULLIF(EXCLUDED.name, ''), contacts.name),
                email = COALESCE(NULLIF(EXCLUDED.email, ''), contacts.email),
                campaign_eligibility = EXCLUDED.campaign_eligibility,
                updated_at = NOW()
              RETURNING id
              `,
              [
                tenantId,
                item.phone_e164,
                item.name,
                item.email,
                item.country_code,
                'csv_bulk_import',
                item.campaign_eligibility,
              ]
            );

            if (item.campaign_eligibility && insRes.rows[0]) {
              await client.query(
                `
                INSERT INTO consent_records (
                  tenant_id, contact_id, purpose, category, status, source
                )
                VALUES ($1, $2, 'marketing', 'MARKETING', 'granted', $3)
                `,
                [tenantId, insRes.rows[0].id, item.consent_record?.source || 'csv_bulk_import']
              );
            }
          }
          await client.query('COMMIT');
        } catch (dbErr) {
          await client.query('ROLLBACK');
          console.error('[Neon Batch Import Warning]', dbErr);
        } finally {
          client.release();
        }
      } catch (poolErr) {
        console.error('[Neon Pool Connect Warning]', poolErr);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total_rows: contacts.length,
        imported: importedCount,
        campaign_eligible: eligibleCount,
        ineligible_missing_consent: ineligibleCount,
        invalid_phone_formats: invalidPhoneCount,
      },
      errors: errors.slice(0, 20),
      sample: processedRows.slice(0, 5),
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || 'Failed to process bulk contacts' },
      { status: 500 }
    );
  }
}

