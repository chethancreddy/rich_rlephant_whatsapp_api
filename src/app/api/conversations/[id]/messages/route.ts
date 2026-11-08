// ============================================================================
// Real-Time Conversation Messages & Meta Cloud API Reply Dispatch
// Brand: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getNeonPool } from '@/lib/db/neon';

/**
 * GET Conversation Message Thread
 * Fetches all ordered chronological messages for the active conversation canvas
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pool = getNeonPool();

    // Query all messages for this conversation joined with payload content
    const result = await pool.query(
      `
      SELECT 
        m.id,
        m.conversation_id as "conversationId",
        m.direction,
        m.message_type as type,
        COALESCE(cm.body, m.category, 'Message') as text,
        cm.media_url as "audioUrl",
        m.status,
        m.error_message as "errorMessage",
        COALESCE(m.sent_at, m.created_at) as "time",
        m.created_at
      FROM messages m
      LEFT JOIN conversation_messages cm ON cm.message_id = m.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
      `,
      [id]
    );

    const messages = result.rows.map((row) => {
      const dateObj = row.time ? new Date(row.time) : new Date(row.created_at);
      const timeFormatted = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return {
        id: row.id,
        conversationId: row.conversationId,
        sender: row.direction === 'inbound' ? 'customer' : 'agent',
        type: row.type || 'text',
        text: row.text,
        audioUrl: row.audioUrl || undefined,
        time: timeFormatted,
        status: row.status || 'delivered',
        errorMessage: row.errorMessage || undefined,
      };
    });

    return NextResponse.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err: any) {
    console.error('[API Conversation Messages GET Error]', err.message);
    return NextResponse.json(
      { error: 'Failed to fetch conversation messages', details: err.message },
      { status: 500 }
    );
  }
}

/**
 * POST Send Agent Reply via Official Meta Cloud API
 * Validates 24-hour service window and dispatches directly to recipient
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const body = await req.json();
    const { messageBody, templateName, messageType = 'text', mediaUrl } = body;

    if (!messageBody && !templateName && messageType !== 'audio') {
      return NextResponse.json(
        { error: 'messageBody, templateName, or audio voice note is required' },
        { status: 400 }
      );
    }

    const pool = getNeonPool();

    // 1. Fetch conversation, contact phone, and phone number details
    const convRes = await pool.query(
      `
      SELECT 
        c.id,
        c.tenant_id,
        c.contact_id,
        c.phone_number_id,
        c.service_window_expires_at,
        co.phone_e164,
        co.name as contact_name,
        p.phone_number_id as meta_phone_id,
        p.display_phone_number
      FROM conversations c
      JOIN contacts co ON co.id = c.contact_id
      JOIN phone_numbers p ON p.id = c.phone_number_id
      WHERE c.id = $1
      LIMIT 1
      `,
      [conversationId]
    );

    if (convRes.rows.length === 0) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const conv = convRes.rows[0];
    const tenantId = conv.tenant_id;
    const contactId = conv.contact_id;
    const phoneRowId = conv.phone_number_id;
    const metaPhoneId = conv.meta_phone_id || process.env.META_PHONE_NUMBER_ID || '1452097831319023';
    const recipientPhone = (conv.phone_e164 || '').replace(/\D/g, '');

    // 2. Check 24-hour customer service window
    const now = new Date();
    const windowExpiry = conv.service_window_expires_at ? new Date(conv.service_window_expires_at) : null;
    const isWindowActive = windowExpiry ? windowExpiry > now : false;

    if (!isWindowActive && !templateName) {
      return NextResponse.json(
        {
          error: 'Customer service window expired (24h). Approved Meta template required to re-engage.',
          requires_template: true,
        },
        { status: 403 }
      );
    }

    // 3. Dispatch to Official Meta Cloud API (v21.0)
    let metaProviderMessageId = `wamid.local_${Date.now()}`;
    const metaAccessToken = process.env.META_ACCESS_TOKEN;

    if (metaAccessToken && metaPhoneId && recipientPhone) {
      const payload: Record<string, any> = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone,
      };

      if (templateName) {
        payload.type = 'template';
        payload.template = {
          name: templateName,
          language: { code: 'en_US' },
        };
      } else if (messageType === 'audio') {
        let audioMediaId = body.mediaId;

        // If audioBase64 provided, upload binary directly to Meta Media API
        if (!audioMediaId && body.audioBase64) {
          try {
            const cleanBase64 = body.audioBase64.replace(/^data:audio\/\w+(?:;\s*codecs=[^;]+)?;base64,/, '');
            const audioBuffer = Buffer.from(cleanBase64, 'base64');

            const formData = new FormData();
            const audioBlob = new Blob([audioBuffer], { type: 'audio/ogg' });
            formData.append('file', audioBlob, 'voice_note.ogg');
            formData.append('type', 'audio/ogg');
            formData.append('messaging_product', 'whatsapp');

            const mediaUploadRes = await fetch(
              `https://graph.facebook.com/v21.0/${metaPhoneId}/media`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${metaAccessToken}`,
                },
                body: formData,
              }
            );

            const mediaData = await mediaUploadRes.json();
            if (mediaUploadRes.ok && mediaData?.id) {
              audioMediaId = mediaData.id;
            } else {
              console.error('[Meta Media Upload Error]', mediaData);
            }
          } catch (uploadErr) {
            console.error('[Audio Buffer Upload Exception]', uploadErr);
          }
        }

        if (audioMediaId) {
          payload.type = 'audio';
          payload.audio = {
            id: audioMediaId,
          };
        } else if (mediaUrl) {
          payload.type = 'audio';
          payload.audio = {
            link: mediaUrl,
          };
        }
      } else {
        payload.type = 'text';
        payload.text = {
          preview_url: false,
          body: messageBody,
        };
      }

      try {
        const metaRes = await fetch(
          `https://graph.facebook.com/v21.0/${metaPhoneId}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${metaAccessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        const metaData = await metaRes.json();
        if (metaRes.ok && metaData.messages?.[0]?.id) {
          metaProviderMessageId = metaData.messages[0].id;
        } else {
          console.warn('[Meta Dispatch Warning]', metaData);
          if (metaData?.error?.message) {
            return NextResponse.json(
              { error: metaData.error.message, code: metaData.error.code },
              { status: 400 }
            );
          }
        }
      } catch (metaErr: any) {
        console.error('[Meta Cloud API Fetch Error]', metaErr);
      }
    }

    // 4. Persist outbound message in database
    const msgRes = await pool.query(
      `
      INSERT INTO messages (
        tenant_id, conversation_id, contact_id, phone_number_id,
        direction, message_type, category, provider_message_id,
        status, submitted_at, sent_at
      )
      VALUES ($1, $2, $3, $4, 'outbound', $5, $6, $7, 'sent', NOW(), NOW())
      RETURNING id
      `,
      [
        tenantId,
        conversationId,
        contactId,
        phoneRowId,
        templateName ? 'template' : messageType,
        templateName ? 'MARKETING' : 'SERVICE',
        metaProviderMessageId,
      ]
    );

    const messageId = msgRes.rows[0]?.id;

    // 6. Update conversation last message preview
    const previewText =
      messageType === 'audio'
        ? '🎤 Voice Note'
        : messageBody || (templateName ? `[Template: ${templateName}]` : 'Message');

    // 5. Store message payload body
    if (messageId) {
      await pool.query(
        `
        INSERT INTO conversation_messages (tenant_id, conversation_id, message_id, body, media_url)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [tenantId, conversationId, messageId, previewText, mediaUrl || null]
      );
    }
    await pool.query(
      `
      UPDATE conversations
      SET 
        last_message_preview = $2,
        last_message_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
      `,
      [conversationId, previewText]
    );

    return NextResponse.json({
      success: true,
      message_id: messageId,
      conversation_id: conversationId,
      provider_message_id: metaProviderMessageId,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[API Conversation Messages POST Error]', err.message);
    return NextResponse.json(
      { error: err.message || 'Failed to dispatch reply' },
      { status: 500 }
    );
  }
}
