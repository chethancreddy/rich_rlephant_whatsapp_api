// ============================================================================
// Visual Chatbot & Automation Journey Engine
// Product: Rich Rlephant Marketing Whatsapp API
// ============================================================================

import { calculateServiceWindow } from '../service-window.ts';

export type NodeType =
  | 'trigger'
  | 'condition'
  | 'action_send_message'
  | 'action_tag_contact'
  | 'action_assign_team'
  | 'action_suppress'
  | 'delay'
  | 'handover'
  | 'end';

export interface WorkflowNode {
  id: string;
  type: NodeType;
  title: string;
  config: Record<string, any>;
  nextStepId?: string;
  conditionBranches?: {
    trueNextStepId: string;
    falseNextStepId: string;
  };
}

export interface AutomationFlowDefinition {
  id: string;
  tenantId: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  triggerKeywords: string[];
  nodes: WorkflowNode[];
}

export interface ExecutionContext {
  flowId: string;
  contactId: string;
  contactPhone: string;
  contactTags: string[];
  lastCustomerMessageAt?: string;
  inboundText: string;
  logs: string[];
}

export interface ExecutionResult {
  runId: string;
  status: 'completed' | 'handed_over' | 'delayed' | 'failed';
  finalStepId: string;
  handoverReason?: string;
  actionDispatched?: string;
  logs: string[];
}

export class AutomationEngine {
  /**
   * Evaluates if an inbound text matches any published automation flow triggers
   */
  matchesTrigger(flow: AutomationFlowDefinition, text: string): boolean {
    if (flow.status !== 'published') return false;
    const cleanText = text.trim().toLowerCase();
    return flow.triggerKeywords.some((kw) => cleanText === kw.toLowerCase() || cleanText.startsWith(kw.toLowerCase() + ' '));
  }

  /**
   * Executes a flow from the trigger node through sequential actions
   */
  executeFlow(
    flow: AutomationFlowDefinition,
    context: ExecutionContext,
    startNodeId?: string
  ): ExecutionResult {
    let currentNodeId: string | undefined = startNodeId || flow.nodes[0]?.id;
    const logs = [...context.logs];

    let currentIteration = 0;
    const MAX_STEPS = 50; // Prevent infinite loops

    while (currentNodeId && currentIteration < MAX_STEPS) {
      currentIteration++;
      const node = flow.nodes.find((n) => n.id === currentNodeId);
      if (!node) {
        logs.push(`Node ${currentNodeId} not found. Terminating flow.`);
        break;
      }

      logs.push(`Executing Step: ${node.title} (${node.type})`);

      // 1. Handover Node
      if (node.type === 'handover') {
        const reason = node.config.reason || 'Escalated to human agent via automation';
        logs.push(`Handover triggered: ${reason}`);
        return {
          runId: `run_${Date.now()}`,
          status: 'handed_over',
          finalStepId: node.id,
          handoverReason: reason,
          logs,
        };
      }

      // 2. Condition Node
      if (node.type === 'condition') {
        const checkType = node.config.checkType;
        let isMatch = false;

        if (checkType === 'is_service_window_active') {
          const windowStatus = calculateServiceWindow(context.lastCustomerMessageAt);
          isMatch = windowStatus.isActive;
          logs.push(`Service window check: ${isMatch ? 'Active' : 'Expired'}`);
        } else if (checkType === 'has_tag') {
          isMatch = context.contactTags.includes(node.config.targetTag);
          logs.push(`Tag check for '${node.config.targetTag}': ${isMatch}`);
        }

        currentNodeId = isMatch
          ? node.conditionBranches?.trueNextStepId
          : node.conditionBranches?.falseNextStepId;
        continue;
      }

      // 3. Send Message Action Node
      if (node.type === 'action_send_message') {
        const windowStatus = calculateServiceWindow(context.lastCustomerMessageAt);
        if (!windowStatus.isActive && !node.config.templateName) {
          logs.push('Policy Barrier: Free-form message blocked because 24h window expired.');
          // Divert or stop
        } else {
          logs.push(`Message queued: ${node.config.text || node.config.templateName}`);
        }
      }

      // 4. Contact Suppression Action Node
      if (node.type === 'action_suppress') {
        logs.push(`Contact ${context.contactPhone} added to suppression registry`);
      }

      // 5. Delay Node
      if (node.type === 'delay') {
        logs.push(`Flow paused for ${node.config.delayMinutes} minutes.`);
        return {
          runId: `run_${Date.now()}`,
          status: 'delayed',
          finalStepId: node.id,
          logs,
        };
      }

      // 6. End Node
      if (node.type === 'end') {
        logs.push('Journey completed successfully.');
        break;
      }

      currentNodeId = node.nextStepId;
    }

    return {
      runId: `run_${Date.now()}`,
      status: 'completed',
      finalStepId: currentNodeId || 'end',
      logs,
    };
  }
}
