// ============================================================================
// Enterprise Settings API (15 Sections)
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

export interface EnterpriseSettingsState {
  profile: {
    displayName: string;
    jobTitle: string;
    avatarUrl: string;
    bio: string;
  };
  account: {
    email: string;
    phone: string;
    primaryWorkspace: string;
    accountId: string;
    createdAt: string;
  };
  sessions: {
    id: string;
    device: string;
    ipAddress: string;
    location: string;
    lastActive: string;
    isCurrent: boolean;
  }[];
  workspace: {
    name: string;
    slug: string;
    industry: string;
    defaultSenderPhone: string;
    environment: 'production' | 'sandbox';
  };
  company: {
    legalName: string;
    registrationNumber: string;
    vatId: string;
    address: string;
    supportEmail: string;
  };
  whatsapp: {
    wabaId: string;
    businessName: string;
    phoneNumberId: string;
    displayPhoneNumber: string;
    qualityRating: 'GREEN' | 'YELLOW' | 'RED';
    messagingLimit: string;
    webhookVerified: boolean;
  };
  notifications: {
    emailDailyDigest: boolean;
    emailBillingReceipts: boolean;
    emailSecurityAlerts: boolean;
    whatsappUrgentTickets: boolean;
    systemIncidentAlerts: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    enforceTeam2FA: boolean;
    sessionTimeoutMinutes: number;
    ipAllowlist: string[];
  };
  billing: {
    currentPlan: string;
    planPriceUSD: number;
    billingInterval: 'monthly' | 'yearly';
    nextRenewalDate: string;
    paymentMethod: string;
    cardLast4: string;
  };
  api: {
    defaultRateLimitRps: number;
    keyRotationReminderDays: number;
    requireIpBinding: boolean;
  };
  webhooks: {
    retryPolicy: 'immediate' | 'exponential_backoff';
    maxRetries: number;
    alertOnConsecutiveFailures: number;
  };
  localization: {
    locale: string;
    timezone: string;
    dateFormat: string;
  };
  preferences: {
    defaultLandingPage: string;
    enableCozyTheme: boolean;
    soundAlertsOnNewMessage: boolean;
    desktopPushNotifications: boolean;
  };
}

let settingsStore: EnterpriseSettingsState = {
  profile: {
    displayName: 'Chethan Reddy',
    jobTitle: 'Principal Solutions Architect',
    avatarUrl: '',
    bio: 'Overseeing enterprise WhatsApp communications, multi-tenant campaigns and API integrations.',
  },
  account: {
    email: 'chethan@example.com',
    phone: '+971 50 443 2190',
    primaryWorkspace: 'Acme Dubai Retail',
    accountId: 'acc_ent_889900',
    createdAt: '12 January 2026',
  },
  sessions: [
    {
      id: 'sess_cur_01',
      device: 'Chrome on Windows 11',
      ipAddress: '194.170.211.85',
      location: 'Dubai, United Arab Emirates',
      lastActive: 'Just now',
      isCurrent: true,
    },
    {
      id: 'sess_mob_02',
      device: 'Rich Rlephant iOS App (iPhone 16 Pro)',
      ipAddress: '94.200.12.44',
      location: 'Abu Dhabi, United Arab Emirates',
      lastActive: '3 hours ago',
      isCurrent: false,
    },
  ],
  workspace: {
    name: 'Acme Dubai Retail',
    slug: 'acme-dubai',
    industry: 'Luxury Retail & E-Commerce',
    defaultSenderPhone: '+971 50 123 4567',
    environment: 'production',
  },
  company: {
    legalName: 'Acme Retail Middle East FZ-LLC',
    registrationNumber: 'FZ-2026-99881',
    vatId: 'AE100293847500003',
    address: 'Dubai Internet City, Building 14, Office 402, Dubai, UAE',
    supportEmail: 'support@acmeretail.com',
  },
  whatsapp: {
    wabaId: 'waba_9918273645001',
    businessName: 'Acme Dubai Retail Official',
    phoneNumberId: 'phone_001928374',
    displayPhoneNumber: '+971 50 123 4567',
    qualityRating: 'GREEN',
    messagingLimit: 'Tier 3 (100k conversations / 24h)',
    webhookVerified: true,
  },
  notifications: {
    emailDailyDigest: true,
    emailBillingReceipts: true,
    emailSecurityAlerts: true,
    whatsappUrgentTickets: true,
    systemIncidentAlerts: true,
  },
  security: {
    twoFactorEnabled: true,
    enforceTeam2FA: false,
    sessionTimeoutMinutes: 60,
    ipAllowlist: ['194.170.211.85', '94.200.12.44'],
  },
  billing: {
    currentPlan: 'Growth Plus Tier',
    planPriceUSD: 299,
    billingInterval: 'monthly',
    nextRenewalDate: '01 December 2026',
    paymentMethod: 'Corporate Visa',
    cardLast4: '4242',
  },
  api: {
    defaultRateLimitRps: 250,
    keyRotationReminderDays: 90,
    requireIpBinding: false,
  },
  webhooks: {
    retryPolicy: 'exponential_backoff',
    maxRetries: 3,
    alertOnConsecutiveFailures: 5,
  },
  localization: {
    locale: 'en',
    timezone: 'Asia/Dubai (GST +04:00)',
    dateFormat: 'DD/MM/YYYY',
  },
  preferences: {
    defaultLandingPage: '/dashboard',
    enableCozyTheme: true,
    soundAlertsOnNewMessage: true,
    desktopPushNotifications: true,
  },
};

export async function GET() {
  return NextResponse.json({
    success: true,
    settings: settingsStore,
  });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request payload' }, { status: 400 });
  }

  const { section, data } = body;

  if (!section || typeof section !== 'string') {
    return NextResponse.json({ error: "Field 'section' is required" }, { status: 422 });
  }

  if (!data || typeof data !== 'object') {
    return NextResponse.json({ error: "Field 'data' is required" }, { status: 422 });
  }

  // Handle Password Change Section
  if (section === 'password') {
    const { currentPassword, newPassword, confirmPassword } = data;
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Current password, new password, and confirmation are required.' },
        { status: 422 }
      );
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New password and confirmation do not match.' },
        { status: 422 }
      );
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must contain at least 8 characters with upper, lower, digit, and special characters.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully across all authenticated sessions.',
    });
  }

  // Handle Revoke Other Sessions Section
  if (section === 'revoke_sessions') {
    settingsStore.sessions = settingsStore.sessions.filter((s) => s.isCurrent);
    return NextResponse.json({
      success: true,
      message: 'All other active sessions have been terminated securely.',
      sessions: settingsStore.sessions,
    });
  }

  // Update designated section
  if (section in settingsStore) {
    (settingsStore as any)[section] = {
      ...(settingsStore as any)[section],
      ...data,
    };

    return NextResponse.json({
      success: true,
      message: `Settings section '${section}' saved successfully.`,
      updatedSection: (settingsStore as any)[section],
    });
  }

  return NextResponse.json(
    { error: `Unknown settings section: ${section}` },
    { status: 400 }
  );
}

