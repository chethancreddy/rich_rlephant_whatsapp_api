// ============================================================================
// Contacts API Endpoint (Direct Neon Serverless PostgreSQL Persistence)
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getNeonPool } from '@/lib/db/neon';
import { normalizePhoneE164 } from '@/lib/phone-normalizer';

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/contacts
 * Returns list of contacts for the tenant with opt-in sources
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = req.headers.get('x-tenant-id') || searchParams.get('tenantId') || DEFAULT_TENANT_ID;

  try {
    const pool = getNeonPool();
    const result = await pool.query(
      `
      SELECT 
        c.id,
        c.phone_e164 as phone,
        c.name,
        c.email,
        c.source,
        c.campaign_eligibility as "campaignEligibility",
        c.created_at as "createdAt",
        s.name as "sourceName",
        s.type as "sourceType"
      FROM contacts c
      LEFT JOIN opt_in_sources s ON s.id = c.opt_in_source_id
      WHERE c.tenant_id = $1 AND c.archived_at IS NULL
      ORDER BY c.created_at DESC
      LIMIT 100
      `,
      [tenantId]
    );

    return NextResponse.json({
      success: true,
      count: result.rows.length,
      contacts: result.rows,
    });
  } catch (err: any) {
    console.error('[API Contacts GET Error]', err.message);
    return NextResponse.json(
      { error: 'Failed to retrieve contacts from database', details: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts
 * Creates a new contact with verified opt-in consent and persists to Neon
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tenantId = req.headers.get('x-tenant-id') || body.tenantId || DEFAULT_TENANT_ID;
    const { name, phone, email, consentGiven = true, consentCategory = 'MARKETING', optInSourceId } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const normalized = normalizePhoneE164(phone, 'AE');
    if (!normalized.isValid) {
      return NextResponse.json({ error: normalized.errorMessage || 'Invalid phone format' }, { status: 400 });
    }

    const pool = getNeonPool();
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Insert contact
      const contactRes = await client.query(
        `
        INSERT INTO contacts (
          tenant_id, phone_e164, name, email, country_code, 
          source, campaign_eligibility, opt_in_source_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (tenant_id, phone_e164) DO UPDATE SET
          name = COALESCE(EXCLUDED.name, contacts.name),
          email = COALESCE(EXCLUDED.email, contacts.email),
          campaign_eligibility = EXCLUDED.campaign_eligibility,
          updated_at = NOW()
        RETURNING *
        `,
        [
          tenantId,
          normalized.e164,
          name || 'New Customer',
          email || null,
          normalized.countryCode || '971',
          'manual_entry',
          Boolean(consentGiven),
          optInSourceId || null,
        ]
      );

      const contact = contactRes.rows[0];

      // Insert consent record if consent given
      if (consentGiven) {
        await client.query(
          `
          INSERT INTO consent_records (
            tenant_id, contact_id, purpose, category, status, source
          )
          VALUES ($1, $2, 'marketing', $3, 'granted', 'manual_dashboard_entry')
          `,
          [tenantId, contact.id, consentCategory]
        );
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        contact: {
          id: contact.id,
          phone: contact.phone_e164,
          name: contact.name,
          email: contact.email,
          campaignEligibility: contact.campaign_eligibility,
          createdAt: contact.created_at,
        },
      });
    } catch (dbErr: any) {
      await client.query('ROLLBACK');
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.error('[API Contacts POST Error]', err.message);
    return NextResponse.json(
      { error: 'Failed to create contact record', details: err.message },
      { status: 500 }
    );
  }
}

