// ============================================================================
// Transactional Email Service (MSG91 / Mailer91 Integration)
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

export interface SendEmailParams {
  toEmail: string;
  toName: string;
  subject?: string;
  templateType: 'verification' | 'password_reset' | 'account_notification' | 'subscription_notification';
  variables: Record<string, string | number>;
}

export async function sendTransactionalEmail(params: SendEmailParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const authKey = process.env.MSG91_AUTH_KEY;
  const domain = process.env.MSG91_DOMAIN || 'drfitveda.com';
  const fromEmail = process.env.MSG91_FROM_EMAIL || `support@${domain}`;
  const fromName = process.env.MSG91_FROM_NAME || 'Rich Rlephant Support';
  const templateId = process.env.MSG91_EMAIL_TEMPLATE_ID || 'global_otp_1622';

  if (!authKey) {
    console.warn('[Email Service] MSG91_AUTH_KEY is not configured. Email suppressed.');
    return { success: false, error: 'Email service credentials not configured.' };
  }

  const payload = {
    recipients: [
      {
        to: [
          {
            email: params.toEmail,
            name: params.toName,
          },
        ],
        variables: {
          name: params.toName,
          company: 'Rich Rlephant Marketing Whatsapp API',
          ...params.variables,
        },
      },
    ],
    from: {
      email: fromEmail,
      name: fromName,
    },
    domain,
    template_id: templateId,
  };

  try {
    const res = await fetch('https://control.msg91.com/api/v5/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authkey: authKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (res.ok && data.status === 'success') {
      return { success: true, messageId: data.data?.unique_id };
    } else {
      return { success: false, error: data.message || JSON.stringify(data.errors) || 'Email failed to send' };
    }
  } catch (err: any) {
    console.error('[Email Service] Failed to send transactional email:', err.message);
    return { success: false, error: err.message };
  }
}

