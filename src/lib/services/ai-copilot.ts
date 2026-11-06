// ============================================================================
// AI Copilot & Tenant-Isolated Knowledge Base Service
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { calculateServiceWindow, type ServiceWindowStatus } from '../service-window.ts';

export type DetectedIntent =
  | 'greeting'
  | 'opt_out'
  | 'pricing'
  | 'support'
  | 'human_handover'
  | 'faq'
  | 'general';

export interface KnowledgeChunk {
  id: string;
  tenant_id: string;
  source_title: string;
  content: string;
  keywords: string[];
}

export interface ConversationMessageContext {
  id: string;
  sender: 'customer' | 'agent' | 'system';
  body: string;
  createdAt: string;
}

export interface ReplySuggestionResult {
  suggestedReply: string;
  confidenceScore: number;
  detectedIntent: DetectedIntent;
  serviceWindow: ServiceWindowStatus;
  canSendFreeform: boolean;
  requiresTemplate: boolean;
  policyNotes: string[];
  referencedKnowledgeSources: string[];
}

export interface ConversationSummaryResult {
  conversationId: string;
  customerIntent: string;
  keyTopicsDiscussed: string[];
  resolutionStatus: 'resolved' | 'pending_followup' | 'requires_human_attention';
  recommendedNextAction: string;
  generatedAt: string;
}

/**
 * Classifies the customer message intent based on semantic patterns
 */
export function detectMessageIntent(messageText: string): DetectedIntent {
  const clean = messageText.trim().toLowerCase();

  if (/\b(stop|unsubscribe|cancel|quit|optout|opt-out|arret)\b/i.test(clean)) {
    return 'opt_out';
  }

  if (/(human|agent|representative|person|talk to someone|manager|live support)/i.test(clean)) {
    return 'human_handover';
  }

  if (/(price|pricing|cost|how much|fee|quote|rates|subscription|plan)/i.test(clean)) {
    return 'pricing';
  }

  if (/(problem|issue|broken|not working|error|bug|help|fail|urgent)/i.test(clean)) {
    return 'support';
  }

  if (/^(hi|hello|hey|good morning|good afternoon|good evening|salam|namaste)/i.test(clean)) {
    return 'greeting';
  }

  if (/(how to|where is|when do|policy|hours|location|address|refund|terms)/i.test(clean)) {
    return 'faq';
  }

  return 'general';
}

/**
 * Retrieves knowledge chunks strictly scoped to the tenant with keyword relevance scoring
 */
export function retrieveTenantKnowledge(
  tenantId: string,
  query: string,
  knowledgeBase: KnowledgeChunk[],
  maxResults: number = 3
): KnowledgeChunk[] {
  // CRITICAL SECURITY GUARDRAIL: Strict tenant filter to prevent data leakage across tenants
  const tenantChunks = knowledgeBase.filter(c => c.tenant_id === tenantId);
  const queryTokens = query.toLowerCase().split(/\W+/).filter(t => t.length > 2);

  if (queryTokens.length === 0) {
    return [];
  }

  // Score chunks by keyword matches
  const scored = tenantChunks.map(chunk => {
    let score = 0;
    const contentLower = chunk.content.toLowerCase();

    for (const token of queryTokens) {
      if (chunk.keywords.some(k => k.toLowerCase() === token)) {
        score += 3;
      }
      if (contentLower.includes(token)) {
        score += 1;
      }
    }

    return { chunk, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.chunk);
}

/**
 * Generates an AI reply draft with strict policy guardrails and service window checks
 */
export function generateReplySuggestion(params: {
  tenantId: string;
  customerName: string;
  lastCustomerMessage: string;
  lastCustomerInboundAt: string | null;
  conversationHistory: ConversationMessageContext[];
  knowledgeBase: KnowledgeChunk[];
}): ReplySuggestionResult {
  const {
    tenantId,
    customerName,
    lastCustomerMessage,
    lastCustomerInboundAt,
    knowledgeBase,
  } = params;

  // 1. Service window evaluation
  const serviceWindow = calculateServiceWindow(lastCustomerInboundAt);
  const canSendFreeform = serviceWindow.isActive;
  const requiresTemplate = !serviceWindow.isActive;

  // 2. Intent detection
  const intent = detectMessageIntent(lastCustomerMessage);

  // 3. Knowledge retrieval strictly within tenant bounds
  const matchedChunks = retrieveTenantKnowledge(tenantId, lastCustomerMessage, knowledgeBase);
  const referencedSources = matchedChunks.map(c => c.source_title);

  const policyNotes: string[] = [];

  if (requiresTemplate) {
    policyNotes.push('ALERT: 24-hour service window is closed. Free-form text cannot be delivered by Meta. You must select an approved WhatsApp template to re-engage.');
  }

  if (intent === 'opt_out') {
    policyNotes.push('COMPLIANCE NOTE: Customer has indicated intent to opt out. Message sending will be suppressed in compliance with Meta anti-spam policies.');
  }

  // 4. Formulate response draft based on knowledge & intent
  let suggestedReply = '';
  let confidence = 0.85;

  if (intent === 'opt_out') {
    suggestedReply = `You have been unsubscribed from updates. Reply START at any time to re-subscribe.`;
    confidence = 0.99;
  } else if (intent === 'human_handover') {
    suggestedReply = `Hello ${customerName}, I am connecting you with one of our specialized support agents right now. Please hold on!`;
    confidence = 0.95;
  } else if (matchedChunks.length > 0) {
    const primarySnippet = matchedChunks[0].content;
    suggestedReply = `Hello ${customerName}! Regarding your question: ${primarySnippet} Please let us know if you need any additional details.`;
    confidence = 0.92;
  } else if (intent === 'greeting') {
    suggestedReply = `Hello ${customerName}! Thank you for reaching out to us. How can we assist you today?`;
    confidence = 0.90;
  } else if (intent === 'pricing') {
    suggestedReply = `Hello ${customerName}, our pricing plans are tailored to your business volume. Would you like us to share our product catalog or connect you with a sales advisor?`;
    confidence = 0.82;
  } else {
    suggestedReply = `Hello ${customerName}, thank you for your message. We are reviewing your inquiry and will provide a full answer shortly.`;
    confidence = 0.75;
  }

  return {
    suggestedReply,
    confidenceScore: confidence,
    detectedIntent: intent,
    serviceWindow,
    canSendFreeform,
    requiresTemplate,
    policyNotes,
    referencedKnowledgeSources: referencedSources,
  };
}

/**
 * Produces a concise structured summary of the conversation for team handoff
 */
export function summarizeConversation(
  conversationId: string,
  messages: ConversationMessageContext[]
): ConversationSummaryResult {
  if (messages.length === 0) {
    return {
      conversationId,
      customerIntent: 'No messages exchanged',
      keyTopicsDiscussed: [],
      resolutionStatus: 'resolved',
      recommendedNextAction: 'No action required',
      generatedAt: new Date().toISOString(),
    };
  }

  const customerMessages = messages.filter(m => m.sender === 'customer');
  const lastCustomerMsg = customerMessages[customerMessages.length - 1]?.body || '';
  const intent = detectMessageIntent(lastCustomerMsg);

  const topics: string[] = [];
  if (intent === 'pricing') topics.push('Pricing & Subscription Quotes');
  if (intent === 'support') topics.push('Technical Support & Troubleshooting');
  if (intent === 'human_handover') topics.push('Escalation to Live Specialist');
  if (intent === 'opt_out') topics.push('Unsubscribe Request');
  if (topics.length === 0) topics.push('General Inquiry & Customer Communication');

  let resolution: 'resolved' | 'pending_followup' | 'requires_human_attention' = 'resolved';
  let nextAction = 'Archive conversation';

  if (intent === 'human_handover') {
    resolution = 'requires_human_attention';
    nextAction = 'Assign to senior support agent for live intervention';
  } else if (intent === 'pricing' || intent === 'support') {
    resolution = 'pending_followup';
    nextAction = 'Send follow-up details within business hours';
  } else if (intent === 'opt_out') {
    resolution = 'resolved';
    nextAction = 'Confirm opt-out record updated in suppression list';
  }

  return {
    conversationId,
    customerIntent: `Customer expressed ${intent} intent with recent inquiry: "${lastCustomerMsg.slice(0, 80)}"`,
    keyTopicsDiscussed: topics,
    resolutionStatus: resolution,
    recommendedNextAction: nextAction,
    generatedAt: new Date().toISOString(),
  };
}
