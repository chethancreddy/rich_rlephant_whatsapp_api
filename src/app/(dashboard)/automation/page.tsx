'use client';

import React, { useState } from 'react';
import {
  Workflow,
  PlusCircle,
  Zap,
  ArrowRight,
  UserCheck,
  Tag,
  MessageSquare,
  Clock,
  Play,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VisualWorkflowBuilder } from '@/components/automation/visual-workflow-builder';

export default function AutomationPage() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#202020] tracking-tight">Automation & Chatbot Flows</h2>
          <p className="text-xs text-[#202020]/70 mt-1">
            Event-driven journeys, auto-replies, keyword triggers and seamless human agent handover.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="gap-2"
          onClick={() => setIsBuilderOpen(true)}
        >
          <PlusCircle className="h-4 w-4" />
          Create Automation Flow
        </Button>
      </div>

      {/* Visual Journey Overview */}
      <Card title="Active Journeys" subtitle="Monitored workflows running in background daemon">
        <div className="space-y-5">
          {/* Journey 1 */}
          <div className="p-5 border-2 border-[#202020] rounded-[24px] bg-[#F9F6F1] transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold font-serif text-base text-[#202020]">Inbound Welcome & FAQ Bot</span>
                  <Badge variant="green" size="sm">Published (v3)</Badge>
                </div>
                <p className="text-xs text-[#202020]/70 mt-1 font-medium">
                  Triggered when a customer messages outside business hours or sends greetings.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 bg-white text-xs"
                onClick={() => setIsBuilderOpen(true)}
              >
                Edit Flow Canvas
              </Button>
            </div>

            {/* Step Pipeline Visualization */}
            <div className="mt-5 flex items-center gap-2 overflow-x-auto py-2 text-xs">
              <div className="bg-white border-2 border-[#202020] px-4 py-2 rounded-[18px] font-bold flex items-center gap-2 text-[#202020]">
                <Zap className="h-4 w-4 text-[#854d0e]" />
                Keyword: "hi", "hello"
              </div>
              <ArrowRight className="h-4 w-4 text-[#202020] shrink-0" />
              <div className="bg-white border-2 border-[#202020] px-4 py-2 rounded-[18px] font-bold flex items-center gap-2 text-[#202020]">
                <Clock className="h-4 w-4 text-[#0369a1]" />
                Check 24h Window
              </div>
              <ArrowRight className="h-4 w-4 text-[#202020] shrink-0" />
              <div className="bg-white border-2 border-[#202020] px-4 py-2 rounded-[18px] font-bold flex items-center gap-2 text-[#202020]">
                <MessageSquare className="h-4 w-4 text-[#065f46]" />
                Reply Interactive Menu
              </div>
              <ArrowRight className="h-4 w-4 text-[#202020] shrink-0" />
              <div className="bg-white border-2 border-[#202020] px-4 py-2 rounded-[18px] font-bold flex items-center gap-2 text-[#202020]">
                <UserCheck className="h-4 w-4 text-[#72A4F2]" />
                Handover on "agent"
              </div>
            </div>
          </div>

          {/* Journey 2 */}
          <div className="p-5 border-2 border-[#202020] rounded-[24px] bg-[#F9F6F1] transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold font-serif text-base text-[#202020]">Stop / Unsubscribe Handler</span>
                  <Badge variant="green" size="sm">Published (v1)</Badge>
                </div>
                <p className="text-xs text-[#202020]/70 mt-1 font-medium">
                  Compliance trigger: Instantly adds contact to suppression registry upon receiving STOP.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 bg-white text-xs"
                onClick={() => setIsBuilderOpen(true)}
              >
                Edit Flow Canvas
              </Button>
            </div>

            <div className="mt-5 flex items-center gap-2 overflow-x-auto py-2 text-xs">
              <div className="bg-white border-2 border-[#202020] px-4 py-2 rounded-[18px] font-bold flex items-center gap-2 text-[#991b1b]">
                <Zap className="h-4 w-4 text-[#E35A4F]" />
                Keyword: "STOP", "UNSUBSCRIBE"
              </div>
              <ArrowRight className="h-4 w-4 text-[#202020] shrink-0" />
              <div className="bg-white border-2 border-[#202020] px-4 py-2 rounded-[18px] font-bold flex items-center gap-2 text-[#202020]">
                <Tag className="h-4 w-4 text-[#E35A4F]" />
                Insert Suppression Entry
              </div>
              <ArrowRight className="h-4 w-4 text-[#202020] shrink-0" />
              <div className="bg-white border-2 border-[#202020] px-4 py-2 rounded-[18px] font-bold flex items-center gap-2 text-[#202020]">
                <MessageSquare className="h-4 w-4 text-[#202020]" />
                Send Confirmation Text
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Visual Workflow Builder Modal Canvas */}
      <VisualWorkflowBuilder
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
      />
    </div>
  );
}
