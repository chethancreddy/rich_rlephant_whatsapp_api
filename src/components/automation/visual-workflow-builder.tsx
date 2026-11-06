'use client';

import React, { useState } from 'react';
import {
  Zap,
  Clock,
  MessageSquare,
  UserCheck,
  Tag,
  ArrowRight,
  PlusCircle,
  Play,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WorkflowNode } from '@/lib/services/automation-engine';

interface VisualWorkflowBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VisualWorkflowBuilder: React.FC<VisualWorkflowBuilderProps> = ({
  isOpen,
  onClose,
}) => {
  const [flowName, setFlowName] = useState('New Customer Welcome Journey');
  const [triggerKeywords, setTriggerKeywords] = useState('hi, hello, menu');
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: 'node_1',
      type: 'trigger',
      title: 'Inbound Keyword Trigger',
      config: { keywords: ['hi', 'hello', 'menu'] },
      nextStepId: 'node_2',
    },
    {
      id: 'node_2',
      type: 'condition',
      title: '24h Customer Service Window Check',
      config: { checkType: 'is_service_window_active' },
      conditionBranches: {
        trueNextStepId: 'node_3',
        falseNextStepId: 'node_4',
      },
    },
    {
      id: 'node_3',
      type: 'action_send_message',
      title: 'Send Interactive Welcome Menu',
      config: { text: 'Welcome to Rich Rlephant! Please select: 1 for Orders, 2 for Support.' },
      nextStepId: 'node_5',
    },
    {
      id: 'node_4',
      type: 'action_send_message',
      title: 'Send Re-engagement Template',
      config: { templateName: 'customer_reengagement' },
      nextStepId: 'node_5',
    },
    {
      id: 'node_5',
      type: 'handover',
      title: 'Escalate to Support Agent on "human"',
      config: { reason: 'User requested live human agent assistance' },
    },
  ]);

  const [testResult, setTestResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleTestFlow = async () => {
    try {
      const res = await fetch('/api/automation/flows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flow: {
            id: 'flow_test',
            tenantId: 't1',
            name: flowName,
            status: 'published',
            triggerKeywords: triggerKeywords.split(',').map((k) => k.trim()),
            nodes,
          },
          context: {
            flowId: 'flow_test',
            contactId: 'c_test',
            contactPhone: '+971501234567',
            contactTags: ['VIP'],
            lastCustomerMessageAt: new Date().toISOString(),
            inboundText: 'hello',
            logs: [],
          },
        }),
      });

      const data = await res.json();
      setTestResult(data.result);
    } catch {
      alert('Failed to simulate flow execution');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden border-2 border-[#202020]">
        {/* Header */}
        <div className="px-8 py-4.5 border-b-2 border-[#202020] flex items-center justify-between bg-[#F9F6F1] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                className="text-base font-bold font-serif text-[#202020] bg-transparent border-b-2 border-[#202020] focus:outline-none"
              />
              <Badge variant="blue" size="sm">Editor Canvas</Badge>
            </div>
            <p className="text-xs text-[#202020]/60 mt-0.5 font-sans">
              Visual node-based journey builder with automated policy compliance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="gap-1.5" onClick={handleTestFlow}>
              <Play className="h-3.5 w-3.5" />
              Test Run
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                alert('Journey saved and published to durable background worker!');
                onClose();
              }}
            >
              <Save className="h-3.5 w-3.5" />
              Publish Journey
            </Button>
            <button onClick={onClose} className="p-2 text-[#202020] font-black text-xl ml-2">
              ✕
            </button>
          </div>
        </div>

        {/* Canvas Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Visual Steps Column */}
          <div className="flex-1 bg-[#F4EFE7]/40 p-8 overflow-y-auto space-y-6">
            <div className="max-w-2xl mx-auto space-y-4">
              {nodes.map((node, index) => {
                const isTrigger = node.type === 'trigger';
                const isCondition = node.type === 'condition';
                const isHandover = node.type === 'handover';

                return (
                  <div key={node.id} className="relative">
                    <div className="p-5 bg-white border-2 border-[#202020] rounded-[24px] shadow-xs">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-[12px] border-1.5 border-[#202020] flex items-center justify-center ${
                              isTrigger
                                ? 'bg-[#72A4F2] text-[#202020]'
                                : isCondition
                                ? 'bg-[#fef9c3] text-[#854d0e]'
                                : isHandover
                                ? 'bg-[#BED0F7] text-[#202020]'
                                : 'bg-[#ecfdf5] text-[#065f46]'
                            }`}
                          >
                            {isTrigger && <Zap className="h-4 w-4" />}
                            {isCondition && <Clock className="h-4 w-4" />}
                            {isHandover && <UserCheck className="h-4 w-4" />}
                            {!isTrigger && !isCondition && !isHandover && <MessageSquare className="h-4 w-4" />}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#202020]/60 tracking-wider">
                              Step {index + 1} • {node.type.replace('_', ' ')}
                            </span>
                            <h4 className="text-sm font-bold font-serif text-[#202020]">{node.title}</h4>
                          </div>
                        </div>
                        <button
                          onClick={() => setNodes(nodes.filter((n) => n.id !== node.id))}
                          className="text-[#E35A4F] hover:text-rose-700 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Node Config Preview */}
                      <div className="mt-3 p-3 bg-[#F9F6F1] border border-[#202020] rounded-[16px] text-xs font-mono text-[#202020]">
                        {isTrigger && <span>Keywords: {triggerKeywords}</span>}
                        {isCondition && <span>Check: {node.config.checkType}</span>}
                        {isHandover && <span>Handover Reason: {node.config.reason}</span>}
                        {!isTrigger && !isCondition && !isHandover && (
                          <span>{node.config.text || `Template: ${node.config.templateName}`}</span>
                        )}
                      </div>
                    </div>

                    {/* Connector Arrow */}
                    {index < nodes.length - 1 && (
                      <div className="h-6 flex items-center justify-center">
                        <div className="w-0.5 h-full bg-[#202020]"></div>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="pt-2 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-white"
                  onClick={() => {
                    const newNode: WorkflowNode = {
                      id: `node_${Date.now()}`,
                      type: 'action_send_message',
                      title: 'Follow-Up WhatsApp Reply',
                      config: { text: 'How else may we assist you today?' },
                    };
                    setNodes([...nodes, newNode]);
                  }}
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Journey Action Node
                </Button>
              </div>
            </div>
          </div>

          {/* Test Runner / Debug Logs Sidebar */}
          {testResult && (
            <div className="w-80 border-l-2 border-[#202020] bg-white p-6 flex flex-col shrink-0 text-xs">
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
                <h4 className="font-bold font-serif text-sm">Execution Simulator</h4>
                <Badge variant={testResult.status === 'completed' ? 'green' : 'blue'} size="sm">
                  {testResult.status}
                </Badge>
              </div>

              <div className="flex-1 overflow-y-auto mt-4 space-y-2">
                <span className="text-[10px] font-bold text-[#202020]/60 uppercase tracking-wider block">
                  Simulation Steps:
                </span>
                {testResult.logs.map((log: string, idx: number) => (
                  <div key={idx} className="p-2.5 bg-[#F9F6F1] border border-[#202020] rounded-[12px] font-mono text-[11px]">
                    {log}
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t-2 border-[#202020]">
                <Button variant="secondary" size="sm" className="w-full" onClick={() => setTestResult(null)}>
                  Close Simulator
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

