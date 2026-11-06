'use client';

import React, { useState } from 'react';
import {
  Send,
  PlusCircle,
  Play,
  Pause,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Filter,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function CampaignsPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [preflightPassed, setPreflightPassed] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Launch Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#202020] tracking-tight">Bulk Campaign Engine</h2>
          <p className="text-xs text-[#202020]/70 mt-1">
            Scalable, policy-compliant bulk message dispatch via Meta Cloud API with preflight consent barriers.
          </p>
        </div>
        <Button variant="primary" size="md" className="gap-2" onClick={() => setShowWizard(true)}>
          <PlusCircle className="h-4 w-4" />
          Create New Campaign
        </Button>
      </div>

      {/* Campaign Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <Card className="p-5">
          <span className="text-[11px] font-bold text-[#202020]/60 uppercase tracking-wider">Active Campaigns</span>
          <div className="text-2xl font-black font-serif text-[#202020] mt-1">2 Sending</div>
          <span className="text-[10px] text-[#065f46] font-bold mt-1 block">60 msgs/min pacer active</span>
        </Card>
        <Card className="p-5">
          <span className="text-[11px] font-bold text-[#202020]/60 uppercase tracking-wider">Submitted to Meta</span>
          <div className="text-2xl font-black font-serif text-[#202020] mt-1">128,450</div>
          <span className="text-[10px] text-[#202020]/70 font-semibold mt-1 block">99.2% Meta accepted</span>
        </Card>
        <Card className="p-5">
          <span className="text-[11px] font-bold text-[#202020]/60 uppercase tracking-wider">Blocked by Preflight</span>
          <div className="text-2xl font-black font-serif text-[#854d0e] mt-1">4,120</div>
          <span className="text-[10px] text-[#202020]/70 font-semibold mt-1 block">Protected quality score</span>
        </Card>
        <Card className="p-5">
          <span className="text-[11px] font-bold text-[#202020]/60 uppercase tracking-wider">Suppression Opt-Outs</span>
          <div className="text-2xl font-black font-serif text-[#991b1b] mt-1">350</div>
          <span className="text-[10px] text-[#202020]/70 font-semibold mt-1 block">Instantly suppressed</span>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card title="Campaign Operations" subtitle="Manage scheduled, active and completed broadcast campaigns">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9F6F1] text-[#202020] uppercase font-bold border-b-2 border-[#202020]">
              <tr>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Template</th>
                <th className="py-3 px-4">Audience</th>
                <th className="py-3 px-4">Delivery Status</th>
                <th className="py-3 px-4">Pacing</th>
                <th className="py-3 px-4">Estimated Spend</th>
                <th className="py-3 px-4 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE7]">
              <tr className="hover:bg-[#F9F6F1]/50">
                <td className="py-4 px-4 font-bold text-[#202020]">
                  UAE National Day Special
                  <span className="block text-[10px] text-[#202020]/50 font-normal">Created by Chethan Reddy</span>
                </td>
                <td className="py-4 px-4">
                  <span className="font-mono text-[11px] bg-[#F4EFE7] border border-[#202020] px-2 py-0.5 rounded font-bold text-[#202020]">
                    uae_national_day_promo
                  </span>
                  <span className="block text-[10px] text-[#065f46] font-bold mt-1">Approved (Marketing)</span>
                </td>
                <td className="py-4 px-4">
                  <span className="font-bold text-[#202020]">10,000</span>
                  <span className="block text-[10px] text-[#202020]/60">Dubai Retail Segment</span>
                </td>
                <td className="py-4 px-4">
                  <Badge variant="yellow" size="sm" className="gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#854d0e] animate-pulse"></span>
                    Sending (4,820 / 10,000)
                  </Badge>
                </td>
                <td className="py-4 px-4 text-[#202020] font-semibold">80 msg/min</td>
                <td className="py-4 px-4 font-bold text-[#202020]">$84.50</td>
                <td className="py-4 px-4 text-right space-x-2">
                  <button className="p-1.5 bg-[#F4EFE7] border border-[#202020] rounded-lg text-[#854d0e] hover:bg-[#BED0F7]" title="Pause Campaign">
                    <Pause className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 bg-[#fee2e2] border border-[#202020] rounded-lg text-[#991b1b] hover:bg-rose-200" title="Cancel Campaign">
                    <XCircle className="h-4 w-4" />
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-[#F9F6F1]/50">
                <td className="py-4 px-4 font-bold text-[#202020]">
                  Order Confirmation Digest
                  <span className="block text-[10px] text-[#202020]/50 font-normal">Triggered via REST API</span>
                </td>
                <td className="py-4 px-4">
                  <span className="font-mono text-[11px] bg-[#F4EFE7] border border-[#202020] px-2 py-0.5 rounded font-bold text-[#202020]">
                    order_confirmation
                  </span>
                  <span className="block text-[10px] text-[#0369a1] font-bold mt-1">Approved (Utility)</span>
                </td>
                <td className="py-4 px-4">
                  <span className="font-bold text-[#202020]">1,250</span>
                  <span className="block text-[10px] text-[#202020]/60">E-Commerce Orders</span>
                </td>
                <td className="py-4 px-4">
                  <Badge variant="green" size="sm">Completed (100%)</Badge>
                </td>
                <td className="py-4 px-4 text-[#202020] font-semibold">Adaptive</td>
                <td className="py-4 px-4 font-bold text-[#202020]">$18.75</td>
                <td className="py-4 px-4 text-right">
                  <span className="text-xs font-bold text-[#202020] hover:text-[#72A4F2] underline cursor-pointer">
                    Report
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Preflight Modal / Campaign Creation Wizard */}
      {showWizard && (
        <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-2xl w-full overflow-hidden border-2 border-[#202020]">
            <div className="px-8 py-5 border-b-2 border-[#202020] flex items-center justify-between bg-[#F9F6F1]">
              <div>
                <h3 className="text-lg font-bold font-serif text-[#202020]">New WhatsApp Bulk Campaign</h3>
                <p className="text-xs text-[#202020]/70 mt-0.5">Configure parameters, verify audience consent and review preflight</p>
              </div>
              <button onClick={() => setShowWizard(false)} className="text-[#202020] hover:text-black font-black text-xl">
                ✕
              </button>
            </div>

            <div className="p-8 space-y-5 text-xs">
              <div>
                <label className="font-bold text-[#202020] block mb-1.5">Campaign Name</label>
                <input
                  type="text"
                  defaultValue="Black Friday UAE Early Access"
                  className="w-full p-3 border-2 border-[#202020] rounded-[18px] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#72A4F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-[#202020] block mb-1.5">Sender WhatsApp Number</label>
                  <select className="w-full p-3 border-2 border-[#202020] rounded-[18px] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#72A4F2] bg-white">
                    <option>+971 50 123 4567 (Acme Retail Dubai - Tier 10K)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#202020] block mb-1.5">Message Template (Approved Only)</label>
                  <select className="w-full p-3 border-2 border-[#202020] rounded-[18px] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#72A4F2] bg-white">
                    <option>seasonal_sale_2026 (en) - Marketing</option>
                  </select>
                </div>
              </div>

              {/* Preflight Breakdown Box */}
              <div className="p-5 bg-[#F9F6F1] border-2 border-[#202020] rounded-[24px] space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold font-serif text-sm text-[#202020] flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#065f46]" />
                    Automated Recipient Eligibility Preflight
                  </span>
                  <Badge variant={preflightPassed ? 'green' : 'yellow'} size="sm">
                    {preflightPassed ? 'Preflight Passed' : 'Verification Required'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 bg-white rounded-[16px] border-2 border-[#202020]">
                    <span className="text-[10px] text-[#202020]/60 uppercase font-bold block">Selected</span>
                    <span className="font-black font-serif text-base text-[#202020]">5,000</span>
                  </div>
                  <div className="p-3 bg-[#ecfdf5] rounded-[16px] border-2 border-[#202020]">
                    <span className="text-[10px] text-[#065f46] uppercase font-bold block">Eligible</span>
                    <span className="font-black font-serif text-base text-[#065f46]">4,620</span>
                  </div>
                  <div className="p-3 bg-[#fee2e2] rounded-[16px] border-2 border-[#202020]">
                    <span className="text-[10px] text-[#991b1b] uppercase font-bold block">No Consent</span>
                    <span className="font-black font-serif text-base text-[#991b1b]">320</span>
                  </div>
                  <div className="p-3 bg-[#fef9c3] rounded-[16px] border-2 border-[#202020]">
                    <span className="text-[10px] text-[#854d0e] uppercase font-bold block">Suppressed</span>
                    <span className="font-black font-serif text-base text-[#854d0e]">60</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#202020]/70 font-medium">
                  Policy Safeguard: 380 unqualified recipients will be automatically excluded prior to submission to protect your Meta phone number quality score.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-[#202020] font-semibold">
                  Estimated Meta pass-through charge: <strong className="font-bold font-serif text-sm">$39.27 USD</strong>
                </div>
                <div className="space-x-2">
                  {!preflightPassed ? (
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => setPreflightPassed(true)}
                    >
                      Run Preflight Gate
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="md"
                      className="gap-2"
                      onClick={() => {
                        alert('Campaign queued into transactional outbox with durable worker pacing.');
                        setShowWizard(false);
                      }}
                    >
                      <Send className="h-3.5 w-3.5" />
                      Confirm & Queue Launch
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
