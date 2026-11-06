// ============================================================================
// Shared Team Inbox & Collision Control Service
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { calculateServiceWindow } from '../service-window.ts';
import type { MessagingProvider, SendMessageInput } from '../meta-adapter/provider.ts';
import { MockMessagingProvider } from '../meta-adapter/mock-provider.ts';

export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'closed';

export interface ConversationLock {
  conversationId: string;
  agentId: string;
  agentName: string;
  lockedAt: number;
  expiresAt: number; // Lock TTL (typically 2 minutes of inactivity)
}

export interface ConversationThread {
  id: string;
  tenantId: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  phoneNumberId: string;
  status: ConversationStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedUserId?: string;
  assignedUserName?: string;
  teamId?: string;
  teamName?: string;
  lastCustomerMessageAt?: string;
  lastMessagePreview?: string;
}

export interface InternalNote {
  id: string;
  conversationId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

// In-memory agent collision locks for low-latency active session control
const activeLocks = new Map<string, ConversationLock>();
const LOCK_TTL_MS = 2 * 60 * 1000; // 2 minutes

export class InboxService {
  private provider: MessagingProvider;

  constructor(provider?: MessagingProvider) {
    this.provider = provider || new MockMessagingProvider();
  }

  /**
   * Acquires a collision lock for an agent opening a conversation
   * Returns whether lock was acquired or is held by another agent
   */
  acquireLock(conversationId: string, agentId: string, agentName: string): {
    acquired: boolean;
    lockedBy?: string;
    expiresInSeconds: number;
  } {
    const now = Date.now();
    const existing = activeLocks.get(conversationId);

    // If lock exists and hasn't expired and belongs to someone else
    if (existing && existing.expiresAt > now && existing.agentId !== agentId) {
      return {
        acquired: false,
        lockedBy: existing.agentName,
        expiresInSeconds: Math.ceil((existing.expiresAt - now) / 1000),
      };
    }

    // Acquire or refresh lock
    const lock: ConversationLock = {
      conversationId,
      agentId,
      agentName,
      lockedAt: now,
      expiresAt: now + LOCK_TTL_MS,
    };
    activeLocks.set(conversationId, lock);

    return {
      acquired: true,
      expiresInSeconds: Math.ceil(LOCK_TTL_MS / 1000),
    };
  }

  /**
   * Releases an agent's lock when leaving the chat
   */
  releaseLock(conversationId: string, agentId: string): boolean {
    const existing = activeLocks.get(conversationId);
    if (existing && existing.agentId === agentId) {
      activeLocks.delete(conversationId);
      return true;
    }
    return false;
  }

  /**
   * Checks current lock state
   */
  getLock(conversationId: string): ConversationLock | null {
    const now = Date.now();
    const existing = activeLocks.get(conversationId);
    if (existing && existing.expiresAt > now) {
      return existing;
    }
    activeLocks.delete(conversationId);
    return null;
  }

  /**
   * Sends an agent reply to a customer thread with strict 24h window compliance
   */
  async sendReply(
    conversation: ConversationThread,
    messageBody: string,
    agentId: string,
    templateName?: string,
    messageType: 'text' | 'audio' | 'template' = 'text',
    mediaUrl?: string
  ): Promise<{
    success: boolean;
    providerMessageId?: string;
    requiresTemplate?: boolean;
    error?: string;
  }> {
    const windowStatus = calculateServiceWindow(conversation.lastCustomerMessageAt);

    // Policy Rule: If service window is expired, free-form message is strictly blocked
    if (!windowStatus.isActive && !templateName) {
      return {
        success: false,
        requiresTemplate: true,
        error: 'Customer-service window expired (24 hours). An approved Meta template is required.',
      };
    }

    const messageInput: SendMessageInput = {
      phoneNumberId: conversation.phoneNumberId,
      to: conversation.contactPhone,
      type: templateName ? 'template' : messageType,
      category: templateName ? 'MARKETING' : 'SERVICE',
      text: templateName || messageType === 'audio' ? undefined : { body: messageBody },
      mediaUrl: messageType === 'audio' ? (mediaUrl || 'https://audio.rich-rlephant.com/voicenote.ogg') : undefined,
      template: templateName
        ? {
            name: templateName,
            language: 'en',
            components: [],
          }
        : undefined,
    };

    const result = await this.provider.sendMessage(messageInput, 'vault_token');

    if (!result.success) {
      return {
        success: false,
        error: result.error?.message || 'Failed to dispatch reply via Meta Cloud API',
      };
    }

    return {
      success: true,
      providerMessageId: result.providerMessageId,
    };
  }
}
