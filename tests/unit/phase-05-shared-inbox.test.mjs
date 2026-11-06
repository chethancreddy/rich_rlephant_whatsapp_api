// ============================================================================
// Phase 5 Test Suite: Shared Team Inbox, Collision Control & Multi-View Routing
// QA Engineer 07 (Shared Inbox & Voice Notes) & QA Engineer 08 (Chat Routing)
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  InboxService,
  filterInboxConversations,
  bulkUpdateReadStatus,
  CANNED_RESPONSES,
} from '../../src/lib/services/inbox-service.ts';

test('Phase 5: Shared Team Inbox & Agent Operations (QA-07 & QA-08)', async (t) => {
  const sampleConversations = [
    {
      id: 'chat_01',
      name: 'Tariq Mansoor',
      phone: '+971504432190',
      lastMessage: 'Can you please confirm my delivery window for order #9821?',
      unread: 1,
      assignedTo: 'Chethan Reddy',
      team: 'Customer Support',
      status: 'open',
      isArchived: false,
      isGroup: false,
    },
    {
      id: 'chat_02',
      name: 'Fatima Al Zaabi',
      phone: '+971528876543',
      lastMessage: 'Thank you, that solved my issue!',
      unread: 0,
      assignedTo: 'Sarah Jenkins',
      team: 'Customer Support',
      status: 'resolved',
      isArchived: false,
      isGroup: false,
    },
    {
      id: 'chat_03',
      name: 'Rahul Sharma',
      phone: '+971551239876',
      lastMessage: 'STOP',
      unread: 0,
      assignedTo: 'Automated System',
      team: 'Compliance',
      status: 'pending',
      isArchived: false,
      isGroup: false,
    },
    {
      id: 'chat_04',
      name: 'Elena Rostova',
      phone: '+971569988771',
      lastMessage: 'What is the bulk pricing for 500 units?',
      unread: 2,
      assignedTo: 'Unassigned',
      team: 'Sales Desk',
      status: 'open',
      isArchived: false,
      isGroup: false,
    },
    {
      id: 'chat_05',
      name: 'VIP Client Advisory Group',
      phone: '+971500000000',
      lastMessage: 'Q4 Product roadmap announcement posted',
      unread: 0,
      assignedTo: 'Chethan Reddy',
      team: 'Sales Desk',
      status: 'open',
      isArchived: false,
      isGroup: true,
    },
    {
      id: 'chat_06',
      name: 'Old Inactive Chat',
      phone: '+971501112233',
      lastMessage: 'Archived dialogue from last month',
      unread: 0,
      assignedTo: 'Chethan Reddy',
      team: 'Customer Support',
      status: 'closed',
      isArchived: true,
      isGroup: false,
    },
  ];

  await t.test('TC-P5-001: 9 Inbox Views & Search Filtering', () => {
    // 1. All active (excludes resolved/closed and archived)
    const allActive = filterInboxConversations(sampleConversations, { view: 'all' });
    assert.equal(allActive.length, 4); // chat_01, chat_03, chat_04, chat_05

    // 2. Unread
    const unread = filterInboxConversations(sampleConversations, { view: 'unread' });
    assert.equal(unread.length, 2); // chat_01, chat_04

    // 3. Read
    const read = filterInboxConversations(sampleConversations, { view: 'read' });
    assert.equal(read.length, 2); // chat_03, chat_05

    // 4. Assigned to me (Chethan Reddy)
    const assignedToMe = filterInboxConversations(sampleConversations, {
      view: 'assigned_to_me',
      currentAgentName: 'Chethan Reddy',
    });
    assert.equal(assignedToMe.length, 2); // chat_01, chat_05

    // 5. Unassigned
    const unassigned = filterInboxConversations(sampleConversations, { view: 'unassigned' });
    assert.equal(unassigned.length, 2); // chat_03 (Automated System), chat_04 (Unassigned)

    // 6. My team (Customer Support)
    const myTeam = filterInboxConversations(sampleConversations, {
      view: 'my_team',
      currentDepartment: 'Customer Support',
    });
    assert.equal(myTeam.length, 2); // chat_01, chat_02 (not archived)

    // 7. Groups
    const groups = filterInboxConversations(sampleConversations, { view: 'groups' });
    assert.equal(groups.length, 1);
    assert.equal(groups[0].id, 'chat_05');

    // 8. Archived
    const archived = filterInboxConversations(sampleConversations, { view: 'archived' });
    assert.equal(archived.length, 1);
    assert.equal(archived[0].id, 'chat_06');

    // 9. Closed / Resolved
    const closed = filterInboxConversations(sampleConversations, { view: 'closed' });
    assert.equal(closed.length, 2); // chat_02, chat_06

    // Search Query filter
    const searched = filterInboxConversations(sampleConversations, {
      view: 'all',
      searchQuery: 'pricing',
    });
    assert.equal(searched.length, 1);
    assert.equal(searched[0].id, 'chat_04');
  });

  await t.test('TC-P5-002: Bulk Read / Unread Status Mutation', () => {
    const targetIds = ['chat_01', 'chat_04'];

    // Mark as read
    const afterRead = bulkUpdateReadStatus(sampleConversations, targetIds, true);
    const chat1AfterRead = afterRead.find((c) => c.id === 'chat_01');
    const chat4AfterRead = afterRead.find((c) => c.id === 'chat_04');
    assert.equal(chat1AfterRead?.unread, 0);
    assert.equal(chat4AfterRead?.unread, 0);

    // Mark as unread
    const afterUnread = bulkUpdateReadStatus(sampleConversations, ['chat_02'], false);
    const chat2AfterUnread = afterUnread.find((c) => c.id === 'chat_02');
    assert.equal(chat2AfterUnread?.unread, 1);
  });

  await t.test('TC-P5-003: Agent Collision Locking & Concurrency Control', () => {
    const inbox = new InboxService();
    const convId = 'conv_collision_test_99';

    // Agent 1 acquires lock
    const lock1 = inbox.acquireLock(convId, 'agent_01', 'Agent Sarah');
    assert.equal(lock1.acquired, true);

    // Agent 2 attempts to acquire lock while locked by Agent 1
    const lock2 = inbox.acquireLock(convId, 'agent_02', 'Agent Tariq');
    assert.equal(lock2.acquired, false);
    assert.equal(lock2.lockedBy, 'Agent Sarah');

    // Agent 1 releases lock
    const released = inbox.releaseLock(convId, 'agent_01');
    assert.equal(released, true);

    // Agent 2 can now acquire the lock
    const lock2Retry = inbox.acquireLock(convId, 'agent_02', 'Agent Tariq');
    assert.equal(lock2Retry.acquired, true);
  });

  await t.test('TC-P5-004: Canned Responses Snippets Dictionary', () => {
    assert.ok(CANNED_RESPONSES.length >= 5);
    const shortcuts = CANNED_RESPONSES.map((c) => c.shortcut);
    assert.ok(shortcuts.includes('/greet'));
    assert.ok(shortcuts.includes('/hours'));
    assert.ok(shortcuts.includes('/location'));
    assert.ok(shortcuts.includes('/refund'));
    assert.ok(shortcuts.includes('/delivery'));

    for (const item of CANNED_RESPONSES) {
      assert.ok(item.shortcut.startsWith('/'));
      assert.ok(item.title.length > 0);
      assert.ok(item.content.length > 10);
    }
  });

  await t.test('TC-P5-005: 24-Hour Service Window Policy Enforcement on Replies', async () => {
    const inbox = new InboxService();

    // 1. Conversation with message received 10 minutes ago (Active window)
    const activeConv = {
      id: 'thread_active',
      tenantId: 'tenant_test',
      contactId: 'ct_01',
      contactName: 'Active User',
      contactPhone: '+971501234567',
      phoneNumberId: 'phone_001',
      status: 'open',
      priority: 'normal',
      lastCustomerMessageAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    };

    const reply1 = await inbox.sendReply(activeConv, 'Hello, how can I help you?', 'agent_01');
    assert.equal(reply1.success, true);
    assert.ok(reply1.providerMessageId);

    // 2. Conversation with message received 25 hours ago (Expired window)
    const expiredConv = {
      id: 'thread_expired',
      tenantId: 'tenant_test',
      contactId: 'ct_02',
      contactName: 'Dormant User',
      contactPhone: '+971509876543',
      phoneNumberId: 'phone_001',
      status: 'open',
      priority: 'normal',
      lastCustomerMessageAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    };

    // Free-form reply blocked
    const replyExpiredFreeform = await inbox.sendReply(expiredConv, 'Following up on your issue', 'agent_01');
    assert.equal(replyExpiredFreeform.success, false);
    assert.equal(replyExpiredFreeform.requiresTemplate, true);
    assert.ok(replyExpiredFreeform.error?.includes('24 hours'));

    // Approved template allowed
    const replyExpiredTemplate = await inbox.sendReply(
      expiredConv,
      'Re-engagement',
      'agent_01',
      're_engagement_reminder'
    );
    assert.equal(replyExpiredTemplate.success, true);
  });
});
