// ============================================================================
// Public Developer REST API: Message Templates (v1)
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest } from '@/lib/services/api-auth';

export async function GET(req: NextRequest) {
  const auth = await authenticateApiRequest(req, 'templates:read');
  if (!auth.valid) {
    return NextResponse.json(
      { error: auth.error, code: 'AUTH_FAILED' },
      { status: auth.statusCode || 401 }
    );
  }

  const mockTemplates = [
    {
      id: 'tpl_welcome_dubai',
      name: 'welcome_package_v1',
      category: 'MARKETING',
      language: 'en_US',
      status: 'APPROVED',
      components: [
        { type: 'HEADER', format: 'TEXT', text: 'Welcome to Rich Rlephant' },
        { type: 'BODY', text: 'Hello {{1}}, your business account is ready to send campaigns.' },
        { type: 'FOOTER', text: 'Reply STOP to opt out' },
      ],
    },
    {
      id: 'tpl_order_update',
      name: 'order_status_update',
      category: 'UTILITY',
      language: 'en_US',
      status: 'APPROVED',
      components: [
        { type: 'BODY', text: 'Your order #{{1}} has been confirmed and is on its way.' },
      ],
    },
    {
      id: 'tpl_auth_otp',
      name: 'auth_verification_code',
      category: 'AUTHENTICATION',
      language: 'en_US',
      status: 'APPROVED',
      components: [
        { type: 'BODY', text: '{{1}} is your verification code. Valid for 10 minutes.' },
      ],
    },
  ];

  return NextResponse.json({
    success: true,
    total: mockTemplates.length,
    templates: mockTemplates,
  });
}

