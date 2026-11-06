// ============================================================================
// Public Developer REST API: Contact Management (v1)
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest } from '@/lib/services/api-auth';
import { normalizePhoneNumber } from '@/lib/phone-normalizer';

export async function POST(req: NextRequest) {
  const auth = await authenticateApiRequest(req, 'contacts:write');
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error, code: 'AUTH_FAILED' },
      { status: auth.statusCode || 401 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request body' }, { status: 400 });
  }

  const { phone, firstName, lastName, email, consentStatus, consentSource, tags } = body;

  if (!phone) {
    return NextResponse.json({ error: "Field 'phone' is required" }, { status: 422 });
  }

  const phoneRes = normalizePhoneNumber(phone);
  if (!phoneRes.isValid) {
    return NextResponse.json(
      { error: `Invalid phone number: ${phoneRes.error}` },
      { status: 422 }
    );
  }

  // Validate consent status
  const normalizedConsent = consentStatus === 'opted_out' ? 'opted_out' : 'opted_in';

  const contactRecord = {
    id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    tenantId: auth.tenantId,
    phone: phoneRes.e164,
    firstName: firstName || '',
    lastName: lastName || '',
    email: email || '',
    consentStatus: normalizedConsent,
    consentSource: consentSource || 'public_api_v1',
    tags: Array.isArray(tags) ? tags : [],
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(
    {
      success: true,
      contact: contactRecord,
    },
    { status: 201 }
  );
}

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, 'contacts:read');
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error, code: 'AUTH_FAILED' },
      { status: auth.statusCode || 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const phone = searchParams.get('phone');

  // Sample contacts matching tenant
  const mockContacts = [
    {
      id: 'cnt_001',
      tenantId: auth.tenantId,
      phone: '+971501234567',
      firstName: 'Fatima',
      lastName: 'Al-Mansoor',
      consentStatus: 'opted_in',
      tags: ['vip', 'dubai-retail'],
    },
    {
      id: 'cnt_002',
      tenantId: auth.tenantId,
      phone: '+919876543210',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      consentStatus: 'opted_in',
      tags: ['enterprise-lead'],
    },
  ];

  const filtered = phone
    ? mockContacts.filter(c => c.phone.includes(phone))
    : mockContacts;

  return NextResponse.json({
    success: true,
    total: filtered.length,
    contacts: filtered,
  });
}

