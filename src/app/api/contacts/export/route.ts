// ============================================================================
// API Route: /api/contacts/export
// Product: Rich Rlephant Marketing Whatsapp API
// Phase 2 Implementation: Fix CSV Export & Support All, Filtered, Selected
// ============================================================================

import { NextResponse } from 'next/server';
import { hasPermission } from '@/lib/services/permissions-service';

// Mock contacts registry for export streaming (backed by Supabase in production)
const BASE_EXPORT_CONTACTS = [
  {
    id: 'ct_001',
    name: 'Tariq Mansoor',
    phone: '+971504432190',
    email: 'tariq@example.ae',
    consentStatus: 'OPTED_IN',
    consentProof: 'Checkout Checkbox v1.2',
    source: 'Website Checkout Checkbox',
    tags: 'VIP; Dubai Marina; Retail',
    createdAt: '2026-10-12',
  },
  {
    id: 'ct_002',
    name: 'Sarah Al Hashmi',
    phone: '+971559821102',
    email: 'sarah@example.ae',
    consentStatus: 'OPTED_IN',
    consentProof: 'Store QR Code v2.0',
    source: 'Retail Store QR Code Opt-In',
    tags: 'Retail; Gold Tier',
    createdAt: '2026-10-18',
  },
  {
    id: 'ct_003',
    name: 'Rahul Sharma',
    phone: '+919876543210',
    email: 'rahul@example.com',
    consentStatus: 'OPTED_IN',
    consentProof: 'Inbound Support Consent',
    source: 'Customer Support Inbound Request',
    tags: 'Wholesale; India Desk',
    createdAt: '2026-10-25',
  },
  {
    id: 'ct_004',
    name: 'Fatima Al Zaabi',
    phone: '+971529821102',
    email: 'fatima@example.ae',
    consentStatus: 'OPTED_IN',
    consentProof: 'Web Form v1.0',
    source: 'Website Checkout Checkbox',
    tags: 'Retail; Sharjah',
    createdAt: '2026-10-28',
  },
  {
    id: 'ct_005',
    name: 'John Doe',
    phone: '+14155552671',
    email: 'john@example.com',
    consentStatus: 'OPTED_IN',
    consentProof: 'API Inbound Consent',
    source: 'Customer Support Inbound Request',
    tags: 'International; USA',
    createdAt: '2026-11-01',
  },
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      scope = 'all', // 'all' | 'filtered' | 'selected'
      selectedIds = [],
      filterTag = '',
      searchQuery = '',
      userRole = 'workspace_admin',
    } = body;

    // RBAC Security Guard: Super Admin and Agent cannot export contacts
    if (userRole === 'super_admin') {
      return NextResponse.json(
        { error: 'FORBIDDEN: Super Admin is strictly prohibited from exporting tenant customer contact files.' },
        { status: 403 }
      );
    }

    if (!hasPermission(userRole, 'contacts:export')) {
      return NextResponse.json(
        { error: 'FORBIDDEN: Agents and unprivileged roles cannot export customer contact files.' },
        { status: 403 }
      );
    }

    let exportSet = [...BASE_EXPORT_CONTACTS];

    // Filter by Scope
    if (scope === 'selected' && Array.isArray(selectedIds) && selectedIds.length > 0) {
      exportSet = exportSet.filter((c) => selectedIds.includes(c.id));
    } else if (scope === 'filtered') {
      if (filterTag) {
        exportSet = exportSet.filter((c) => c.tags.toLowerCase().includes(filterTag.toLowerCase()));
      }
      if (searchQuery) {
        exportSet = exportSet.filter(
          (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.phone.includes(searchQuery) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }

    if (exportSet.length === 0) {
      return NextResponse.json(
        { error: 'No contact records match the specified export criteria.' },
        { status: 400 }
      );
    }

    // Generate CSV Output conforming to Meta E.164 requirements
    const headers = [
      'Contact ID',
      'Full Name',
      'Phone (E.164)',
      'Email',
      'Consent Status',
      'Consent Proof / Notice',
      'Opt-In Source',
      'Tags',
      'Created Date',
    ];

    const rows = exportSet.map((c) => [
      `"${c.id}"`,
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      `"${c.consentStatus}"`,
      `"${c.consentProof}"`,
      `"${c.source}"`,
      `"${c.tags}"`,
      `"${c.createdAt}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `rich_rlephant_contacts_${scope}_${timestamp}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Exported-Count': String(exportSet.length),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

