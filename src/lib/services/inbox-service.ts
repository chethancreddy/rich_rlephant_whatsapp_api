// ============================================================================
// Phase 5: Shared Team Inbox, Collision Control & Multi-View Service
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { calculateServiceWindow } from '../service-window.ts';
import type { MessagingProvider, SendMessageInput } from '../meta-adapter/provider.ts';
import { MockMessagingProvider } from '../meta-adapter/mock-provider.ts';

export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'closed';

export type InboxView =
  | 'all'
  | 'unread'
  | 'read'
  | 'assigned_to_me'
  | 'unassigned'
  | 'my_team'
  | 'groups'
  | 'archived'
  | 'closed';

export type DepartmentName =
  | 'Customer Support'
  | 'Sales Desk'
  | 'Compliance'
  | 'Technical Operations';

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
  teamName?: DepartmentName;
  lastCustomerMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount?: number;
  isArchived?: boolean;
  isGroup?: boolean;
}

export interface InternalNote {
  id: string;
  conversationId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface CannedResponse {
  id: string;
  shortcut: string; // e.g. /greet
  title: string;
  content: string;
  department?: DepartmentName;
}

export const CANNED_RESPONSES: CannedResponse[] = [
  {
    id: 'can_001',
    shortcut: '/greet',
    title: 'Warm Welcome & Greeting',
    content: 'Hello! Welcome to Rich Rlephant Support. How can we assist you today?',
  },
  {
    id: 'can_002',
    shortcut: '/hours',
    title: 'Operating Hours',
    content: 'Our support desk is open Monday to Saturday from 9:00 AM to 8:00 PM GST.',
  },
  {
    id: 'can_003',
    shortcut: '/location',
    title: 'Store & Office Location',
    content: 'Our flagship Dubai showroom is located at Dubai Marina Promenade, Building 4.',
  },
  {
    id: 'can_004',
    shortcut: '/refund',
    title: 'Exchange & Refund Policy',
    content: 'Items can be exchanged within 14 days of purchase with original receipt and packaging.',
  },
  {
    id: 'can_005',
    shortcut: '/delivery',
    title: 'Delivery Window Information',
    content: 'Standard UAE deliveries take 24–48 hours. Express same-day delivery is available for orders placed before 12 PM.',
  },
];

// In-memory agent collision locks for low-latency active session control
const activeLocks = new Map<string, ConversationLock>();
const LOCK_TTL_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Filter conversations by view, department, and search query
 */
export function filterInboxConversations<T extends {
  id: string;
  name: string;
  phone: string;
  lastMessage: string;
  unread: number;
  assignedTo: string;
  team: string;
  status: string;
  isArchived?: boolean;
  isGroup?: boolean;
}>(
  conversations: T[],
  options: {
    view: InboxView;
    currentAgentName?: string;
    currentDepartment?: string;
    departmentFilter?: string;
    searchQuery?: string;
  }
): T[] {
  const {
    view = 'all',
    currentAgentName = 'Chethan Reddy',
    currentDepartment = 'Customer Support',
    departmentFilter = 'all',
    searchQuery = '',
  } = options;

  return conversations.filter((chat) => {
    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        chat.name.toLowerCase().includes(q) ||
        chat.phone.includes(q) ||
        chat.lastMessage.toLowerCase().includes(q);
      if (!matches) return false;
    }

    // 2. Department Filter
    if (departmentFilter !== 'all' && chat.team !== departmentFilter) {
      return false;
    }

    // 3. Views
    switch (view) {
      case 'unread':
        return chat.unread > 0 && !chat.isArchived && chat.status !== 'closed' && chat.status !== 'resolved';
      case 'read':
        return chat.unread === 0 && !chat.isArchived && chat.status !== 'closed' && chat.status !== 'resolved';
      case 'assigned_to_me':
        return chat.assignedTo === currentAgentName && !chat.isArchived;
      case 'unassigned':
        return (chat.assignedTo === 'Unassigned' || chat.assignedTo === 'Automated System') && !chat.isArchived;
      case 'my_team':
        return chat.team === currentDepartment && !chat.isArchived;
      case 'groups':
        return Boolean(chat.isGroup) && !chat.isArchived;
      case 'archived':
        return Boolean(chat.isArchived);
      case 'closed':
        return chat.status === 'closed' || chat.status === 'resolved';
      case 'all':
      default:
        return !chat.isArchived && chat.status !== 'closed' && chat.status !== 'resolved';
    }
  });
}

/**
 * Bulk updates read/unread status of multiple conversations
 */
export function bulkUpdateReadStatus<T extends { id: string; unread: number }>(
  conversations: T[],
  conversationIds: string[],
  markRead: boolean
): T[] {
  return conversations.map((c) => {
    if (conversationIds.includes(c.id)) {
      return { ...c, unread: markRead ? 0 : 1 };
    }
    return c;
  });
}

export class InboxService {
  private provider: MessagingProvider;

  constructor(provider?: MessagingProvider) {
    this.provider = provider || new MockMessagingProvider();
  }

  /**
   * Acquires a collision lock for an agent opening a conversation
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
