// ============================================================================
// Billing & Usage Summary Endpoint
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { calculateTenantInvoice } from '@/lib/services/billing-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || 'tenant_demo_1';
  const plan = (searchParams.get('plan') as any) || 'growth';

  // Sample aggregated usage for current billing cycle
  const mockUsage = {
    tenantId,
    planTier: plan,
    activeContactsCount: 28450, // 3,450 over included 25,000
    messageUsage: [
      { countryCode: 'AE', category: 'marketing' as const, count: 12500 },
      { countryCode: 'AE', category: 'utility' as const, count: 4200 },
      { countryCode: 'IN', category: 'marketing' as const, count: 45000 },
      { countryCode: 'IN', category: 'utility' as const, count: 8500 },
      { countryCode: 'US', category: 'service' as const, count: 1200 },
    ],
  };

  const invoice = calculateTenantInvoice(mockUsage);

  return NextResponse.json({
    success: true,
    invoice,
    cyclePeriod: {
      start: '2026-11-01T00:00:00Z',
      end: '2026-11-30T23:59:59Z',
    },
  });
}

