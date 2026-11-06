// ============================================================================
// Batch Contacts CSV Import API with Consent Proof
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { normalizePhoneE164 } from '@/lib/phone-normalizer';

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
    const { contacts, defaultCountryCode = 'AE' } = body;

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

    return NextResponse.json({
      success: true,
      summary: {
        total_rows: contacts.length,
        imported: importedCount,
        campaign_eligible: eligibleCount,
        ineligible_missing_consent: ineligibleCount,
        invalid_phone_formats: invalidPhoneCount,
      },
      errors: errors.slice(0, 20), // return up to 20 error details
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

