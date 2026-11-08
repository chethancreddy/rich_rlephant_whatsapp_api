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
  ChevronLeft,
  Check,
  CheckCircle2,
  Users,
  Smartphone,
  FileText,
  Sliders,
  Calendar,
  Sparkles,
  BarChart3,
  X,
  Info,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { MessageCategory } from '@/types/domain';
import {
  CampaignRecord,
  VariableMappingItem,
  getCampaigns,
  createCampaign,
  pauseCampaign,
  resumeCampaign,
  cancelCampaign,
  calculateCampaignCostUSD,
} from '@/lib/services/campaign-wizard-service';

interface ApprovedTemplate {
  id: string;
  name: string;
  category: MessageCategory;
  language: string;
  header?: string;
  body: string;
  footer?: string;
  variables: string[];
}

const APPROVED_TEMPLATES: ApprovedTemplate[] = [
  {
    id: 'tmpl_001',
    name: 'seasonal_sale_2026',
    category: 'MARKETING',
    language: 'en',
    header: 'Exclusive Special Offer',
    body: 'Hello {{1}}! Enjoy our exclusive VIP offer with 25% off. Use code {{2}} at checkout. Valid until Sunday.',
    footer: 'Reply STOP to opt out',
    variables: ['{{1}}', '{{2}}'],
  },
  {
    id: 'tmpl_002',
    name: 'uae_national_day_promo',
    category: 'MARKETING',
    language: 'en',
    header: 'Celebrate UAE National Day',
    body: 'Greetings {{1}}! In celebration of UAE National Day, enjoy special privileges with promo code {{2}}.',
    footer: 'Reply STOP to unsubscribe',
    variables: ['{{1}}', '{{2}}'],
  },
  {
    id: 'tmpl_003',
    name: 'order_status_update',
    category: 'UTILITY',
    language: 'en',
    header: 'Delivery Notification',
    body: 'Dear {{1}}, order #{{2}} is currently out for delivery and will arrive shortly.',
    footer: 'Customer Support Helpdesk',
    variables: ['{{1}}', '{{2}}'],
  },
  {
    id: 'tmpl_004',
    name: 'appointment_reminder',
    category: 'UTILITY',
    language: 'en',
    header: 'Appointment Confirmation',
    body: 'Hello {{1}}, your upcoming appointment is scheduled for {{2}}. Please reply 1 to confirm.',
    footer: 'Thank you for choosing us',
    variables: ['{{1}}', '{{2}}'],
  },
];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>(getCampaigns('tenant_default'));
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedReportCampaign, setSelectedReportCampaign] = useState<CampaignRecord | null>(null);

  // Wizard Form State
  const [campaignName, setCampaignName] = useState('');
  const [category, setCategory] = useState<MessageCategory>('MARKETING');
  const [senderPhone, setSenderPhone] = useState('+971 50 123 4567');
  const [audienceSource, setAudienceSource] = useState('all_opted_in');
  const [audienceTag, setAudienceTag] = useState('VIP');

  // Selected Template
  const [selectedTemplate, setSelectedTemplate] = useState<ApprovedTemplate>(APPROVED_TEMPLATES[0]);

  // Variable Mappings
  const [variableMappings, setVariableMappings] = useState<Record<number, VariableMappingItem>>({
    1: { variableNumber: 1, sourceField: 'name', fallbackValue: 'Valued Customer' },
    2: { variableNumber: 2, sourceField: 'static_value', staticValue: 'VIP25', fallbackValue: 'SPECIAL25' },
  });

  // Schedule & Pacing
  const [dispatchTiming, setDispatchTiming] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledDateTime, setScheduledDateTime] = useState('2026-11-08T14:00');
  const [pacingRate, setPacingRate] = useState<number>(60);

  // Audience Preflight calculations for wizard
  const totalAudienceSelected = 5000;
  const eligibleRecipientsCount = 4620;
  const missingConsentCount = 320;
  const suppressedCount = 60;
  const estimatedCost = calculateCampaignCostUSD(eligibleRecipientsCount, category);

  const handleNextStep = () => {
    if (wizardStep === 1 && !campaignName.trim()) {
      alert('Please enter a campaign name before continuing.');
      return;
    }
    setWizardStep((prev) => Math.min(6, prev + 1));
  };

  const handlePrevStep = () => {
    setWizardStep((prev) => Math.max(1, prev - 1));
  };

  const handleLaunchCampaign = () => {
    const mappingsArray = Object.values(variableMappings);

    const res = createCampaign({
      tenantId: 'tenant_default',
      name: campaignName.trim(),
      category,
      senderPhone,
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      language: selectedTemplate.language,
      variableMappings: mappingsArray,
      audienceFilter: {
        optInSourceId: audienceSource,
        tag: audienceTag,
      },
      pacingMessagesPerMinute: pacingRate,
      scheduledAt: dispatchTiming === 'scheduled' ? scheduledDateTime : undefined,
      createdBy: 'Chethan Reddy',
    });

    if (res.success && res.campaign) {
      setCampaigns([res.campaign, ...campaigns]);
      setShowWizard(false);
      resetWizard();
      alert(`Campaign "${res.campaign.name}" has passed preflight and been committed to the outbox queue!`);
    } else {
      alert(res.error || 'Failed to schedule campaign');
    }
  };

  const resetWizard = () => {
    setWizardStep(1);
    setCampaignName('');
    setCategory('MARKETING');
    setSelectedTemplate(APPROVED_TEMPLATES[0]);
  };

  const handlePause = (id: string) => {
    const res = pauseCampaign('tenant_default', id);
    if (res.success) {
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'PAUSED' } : c)));
    }
  };

  const handleResume = (id: string) => {
    const res = resumeCampaign('tenant_default', id);
    if (res.success) {
      setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'SENDING' } : c)));
    }
  };

  const handleCancel = (id: string) => {
    if (confirm('Are you sure you want to cancel this campaign? All remaining queued messages will be aborted.')) {
      const res = cancelCampaign('tenant_default', id);
      if (res.success) {
        setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: 'CANCELLED' } : c)));
      }
    }
  };

  // Preview formatted text with variables replaced
  const getRenderedPreviewText = () => {
    let text = selectedTemplate.body;
    text = text.replace('{{1}}', 'Tariq Mansoor');
    text = text.replace('{{2}}', variableMappings[2]?.staticValue || 'VIP25');
    return text;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Launch Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#202020] tracking-tight">
            Bulk Campaign Engine
          </h2>
          <p className="text-xs text-[#202020]/70 mt-1">
            Scalable, policy-compliant bulk message dispatch via Meta Cloud API with preflight consent barriers.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="gap-2 font-bold shadow-xs"
          onClick={() => {
            resetWizard();
            setShowWizard(true);
          }}
        >
          <PlusCircle className="h-4 w-4" />
          Create New Campaign
        </Button>
      </div>

      {/* Campaign Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <Card className="p-5">
          <span className="text-[11px] font-bold text-[#202020]/60 uppercase tracking-wider">
            Active Campaigns
          </span>
          <div className="text-2xl font-black font-serif text-[#202020] mt-1">
            {campaigns.filter((c) => c.status === 'SENDING').length} Sending
          </div>
          <span className="text-[10px] text-[#065f46] font-bold mt-1 block">
            Durable transactional pacer active
          </span>
        </Card>
        <Card className="p-5">
          <span className="text-[11px] font-bold text-[#202020]/60 uppercase tracking-wider">
            Eligible Dispatched
          </span>
          <div className="text-2xl font-black font-serif text-[#202020] mt-1">
            {campaigns.reduce((acc, c) => acc + c.sentCount, 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-[#202020]/70 font-semibold mt-1 block">
            99.4% Meta delivery rate
          </span>
        </Card>
        <Card className="p-5">
          <span className="text-[11px] font-bold text-[#202020]/60 uppercase tracking-wider">
            Preflight Gate Blocked
          </span>
          <div className="text-2xl font-black font-serif text-[#854d0e] mt-1">
            {campaigns.reduce((acc, c) => acc + c.excludedCount, 0).toLocaleString()}
          </div>
          <span className="text-[10px] text-[#065f46] font-semibold mt-1 block">
            Shielded sender quality rating
          </span>
        </Card>
        <Card className="p-5">
          <span className="text-[11px] font-bold text-[#202020]/60 uppercase tracking-wider">
            Suppressed Opt-Outs
          </span>
          <div className="text-2xl font-black font-serif text-[#991b1b] mt-1">
            350
          </div>
          <span className="text-[10px] text-[#202020]/70 font-semibold mt-1 block">
            Enforced do-not-contact gate
          </span>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card
        title="Campaign Operations"
        subtitle="Manage queued, active, paused, and completed broadcast campaigns"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F9F6F1] text-[#202020] uppercase font-bold border-b-2 border-[#202020]">
              <tr>
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Template & Category</th>
                <th className="py-3 px-4">Audience</th>
                <th className="py-3 px-4">Delivery Status</th>
                <th className="py-3 px-4">Pacing</th>
                <th className="py-3 px-4">Estimated Spend</th>
                <th className="py-3 px-4 text-right">Actions & Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE7]">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-[#BED0F7]/30 border-2 border-[#202020] flex items-center justify-center mb-4">
                        <Send className="w-7 h-7 text-[#202020]" />
                      </div>
                      <h3 className="text-base font-bold text-[#202020] mb-1">No Broadcast Campaigns Launched</h3>
                      <p className="text-xs text-[#202020]/70 mb-5 text-center leading-relaxed">
                        Launch compliant WhatsApp marketing or utility broadcasts with pre-approved Meta templates, variable personalization, and anti-ban pacing.
                      </p>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowWizard(true)}
                        className="gap-2 font-bold"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Create First Campaign
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                campaigns.map((camp) => {
                const percent =
                  camp.eligibleRecipients > 0
                    ? Math.round((camp.sentCount / camp.eligibleRecipients) * 100)
                    : 0;

                return (
                  <tr key={camp.id} className="hover:bg-[#F9F6F1]/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-[#202020]">
                      {camp.name}
                      <span className="block text-[10px] text-[#202020]/50 font-normal">
                        Created by {camp.createdBy}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-[11px] bg-[#F4EFE7] border border-[#202020] px-2 py-0.5 rounded font-bold text-[#202020]">
                        {camp.templateName}
                      </span>
                      <span className="block text-[10px] text-[#065f46] font-bold mt-1">
                        Approved ({camp.category})
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-bold text-[#202020]">
                        {camp.eligibleRecipients.toLocaleString()}
                      </span>
                      <span className="block text-[10px] text-[#202020]/60">
                        {camp.excludedCount > 0
                          ? `(${camp.excludedCount} excluded)`
                          : 'Full eligible audience'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1.5 min-w-[140px]">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span>
                            {camp.status === 'SENDING' ? (
                              <Badge variant="yellow" size="sm" className="gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#854d0e] animate-pulse"></span>
                                Sending ({percent}%)
                              </Badge>
                            ) : camp.status === 'PAUSED' ? (
                              <Badge variant="charcoal" size="sm">
                                Paused
                              </Badge>
                            ) : camp.status === 'COMPLETED' ? (
                              <Badge variant="green" size="sm">
                                Completed (100%)
                              </Badge>
                            ) : camp.status === 'QUEUED' ? (
                              <Badge variant="blue" size="sm">
                                Queued
                              </Badge>
                            ) : (
                              <Badge variant="red" size="sm">
                                Cancelled
                              </Badge>
                            )}
                          </span>
                          <span className="text-[#202020]/60 font-mono">
                            {camp.sentCount} / {camp.eligibleRecipients}
                          </span>
                        </div>
                        <div className="w-full bg-[#E5DFD5] h-1.5 rounded-full overflow-hidden border border-[#202020]/20">
                          <div
                            className={`h-full transition-all duration-300 ${
                              camp.status === 'COMPLETED'
                                ? 'bg-[#065f46]'
                                : camp.status === 'CANCELLED'
                                ? 'bg-[#991b1b]'
                                : 'bg-[#72A4F2]'
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[#202020] font-semibold">
                      {camp.pacingMessagesPerMinute} msg/min
                    </td>
                    <td className="py-4 px-4 font-bold text-[#202020]">
                      ${camp.estimatedCostUSD.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {camp.status === 'SENDING' && (
                          <button
                            onClick={() => handlePause(camp.id)}
                            className="p-1.5 bg-[#F4EFE7] border border-[#202020] rounded-[10px] text-[#854d0e] hover:bg-[#BED0F7]"
                            title="Pause Campaign Delivery"
                          >
                            <Pause className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {camp.status === 'PAUSED' && (
                          <button
                            onClick={() => handleResume(camp.id)}
                            className="p-1.5 bg-[#ecfdf5] border border-[#202020] rounded-[10px] text-[#065f46] hover:bg-[#d1fae5]"
                            title="Resume Campaign Delivery"
                          >
                            <Play className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {(camp.status === 'SENDING' || camp.status === 'PAUSED' || camp.status === 'QUEUED') && (
                          <button
                            onClick={() => handleCancel(camp.id)}
                            className="p-1.5 bg-[#fee2e2] border border-[#202020] rounded-[10px] text-[#991b1b] hover:bg-[#fecaca]"
                            title="Cancel Campaign"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedReportCampaign(camp)}
                          className="px-2 py-1 text-xs font-bold text-[#202020] hover:text-[#72A4F2] underline"
                        >
                          Report
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL 1: MULTI-STEP CAMPAIGN WIZARD */}
      {showWizard && (
        <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-3xl w-full overflow-hidden border-2 border-[#202020] animate-in zoom-in-95 duration-200">
            {/* Wizard Header */}
            <div className="px-8 py-5 border-b-2 border-[#202020] flex items-center justify-between bg-[#F9F6F1]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#72A4F2] text-[#202020] font-black text-xs flex items-center justify-center border border-[#202020]">
                    {wizardStep}
                  </span>
                  <h3 className="text-base font-bold font-serif text-[#202020]">
                    Bulk Campaign Engine Wizard
                  </h3>
                </div>
                <p className="text-[11px] text-[#202020]/70 mt-0.5">
                  Step {wizardStep} of 6:{' '}
                  {wizardStep === 1
                    ? 'Campaign Info'
                    : wizardStep === 2
                    ? 'Audience Selection & Opt-In Verification'
                    : wizardStep === 3
                    ? 'Meta Template Selection'
                    : wizardStep === 4
                    ? 'Dynamic Variable Mapping'
                    : wizardStep === 5
                    ? 'Message Preview & Cost Estimation'
                    : 'Schedule, Pacing & Launch'}
                </p>
              </div>
              <button
                onClick={() => setShowWizard(false)}
                className="text-[#202020]/60 hover:text-black font-black text-xl"
              >
                ✕
              </button>
            </div>

            {/* Stepper Progress Bar */}
            <div className="grid grid-cols-6 border-b-2 border-[#202020] text-center text-[10px] font-bold bg-white">
              {['1. Info', '2. Audience', '3. Template', '4. Variables', '5. Preview', '6. Schedule'].map(
                (stepLabel, idx) => {
                  const stepNum = idx + 1;
                  const isCurrent = wizardStep === stepNum;
                  const isDone = wizardStep > stepNum;

                  return (
                    <div
                      key={stepLabel}
                      className={`py-2 border-r border-[#D8D0C4] last:border-none ${
                        isCurrent
                          ? 'bg-[#72A4F2] text-[#202020]'
                          : isDone
                          ? 'bg-[#ecfdf5] text-[#065f46]'
                          : 'bg-[#F9F6F1] text-[#202020]/50'
                      }`}
                    >
                      {stepLabel}
                    </div>
                  );
                }
              )}
            </div>

            {/* Wizard Body Content */}
            <div className="p-8 space-y-5 text-xs max-h-[65vh] overflow-y-auto">
              {/* STEP 1: CAMPAIGN INFO */}
              {wizardStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Campaign Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dubai Weekend VIP Flash Sale"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="w-full p-3 border-2 border-[#202020] rounded-[18px] text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#72A4F2] bg-[#F9F6F1]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-[#202020] block mb-1">Campaign Purpose *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as MessageCategory)}
                        className="w-full p-3 border-2 border-[#202020] rounded-[18px] text-xs font-bold focus:outline-none bg-[#F9F6F1]"
                      >
                        <option value="MARKETING">Marketing (Promotions, Offers, Sales)</option>
                        <option value="UTILITY">Utility (Order updates, Accounts, Alerts)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-[#202020] block mb-1">Sender WhatsApp Number *</label>
                      <select
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        className="w-full p-3 border-2 border-[#202020] rounded-[18px] text-xs font-bold focus:outline-none bg-[#F9F6F1]"
                      >
                        <option value="+971 50 123 4567">+971 50 123 4567 (Acme Retail Dubai - Tier 10K)</option>
                        <option value="+971 50 111 2233">+971 50 111 2233 (Alpha Real Estate - Tier 100K)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: AUDIENCE SELECTION & OPT-IN PREFLIGHT */}
              {wizardStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-[#202020] block mb-1">Audience Opt-In Source</label>
                      <select
                        value={audienceSource}
                        onChange={(e) => setAudienceSource(e.target.value)}
                        className="w-full p-3 border-2 border-[#202020] rounded-[18px] text-xs font-bold focus:outline-none bg-[#F9F6F1]"
                      >
                        <option value="all_opted_in">All Verified Opt-In Audiences</option>
                        <option value="website_checkout">Website Checkout Checkbox</option>
                        <option value="in_store_qr">In-Store QR Code Scan</option>
                        <option value="vip_lead_form">VIP Lead Generation Form</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-[#202020] block mb-1">Filter by Tag</label>
                      <select
                        value={audienceTag}
                        onChange={(e) => setAudienceTag(e.target.value)}
                        className="w-full p-3 border-2 border-[#202020] rounded-[18px] text-xs font-bold focus:outline-none bg-[#F9F6F1]"
                      >
                        <option value="VIP">VIP Segment</option>
                        <option value="Retail">Retail Shoppers</option>
                        <option value="Dubai Marina">Dubai Marina Residents</option>
                        <option value="Enterprise">Enterprise Leads</option>
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
                      <Badge variant="green" size="sm">
                        Preflight Verified
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="p-3 bg-white rounded-[16px] border-2 border-[#202020]">
                        <span className="text-[10px] text-[#202020]/60 uppercase font-bold block">Selected</span>
                        <span className="font-black font-serif text-base text-[#202020]">
                          {totalAudienceSelected.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 bg-[#ecfdf5] rounded-[16px] border-2 border-[#202020]">
                        <span className="text-[10px] text-[#065f46] uppercase font-bold block">Eligible</span>
                        <span className="font-black font-serif text-base text-[#065f46]">
                          {eligibleRecipientsCount.toLocaleString()}
                        </span>
                      </div>
                      <div className="p-3 bg-[#fee2e2] rounded-[16px] border-2 border-[#202020]">
                        <span className="text-[10px] text-[#991b1b] uppercase font-bold block">No Consent</span>
                        <span className="font-black font-serif text-base text-[#991b1b]">
                          {missingConsentCount}
                        </span>
                      </div>
                      <div className="p-3 bg-[#fef9c3] rounded-[16px] border-2 border-[#202020]">
                        <span className="text-[10px] text-[#854d0e] uppercase font-bold block">Suppressed</span>
                        <span className="font-black font-serif text-base text-[#854d0e]">
                          {suppressedCount}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#202020]/80 font-medium leading-relaxed">
                      Policy Barrier: <strong>{missingConsentCount + suppressedCount} unqualified recipients</strong> will be automatically excluded before contacting Meta to safeguard your phone number quality rating.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 3: META TEMPLATE SELECTION */}
              {wizardStep === 3 && (
                <div className="space-y-4">
                  <label className="font-bold text-[#202020] block">
                    Select Approved Meta Message Template:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {APPROVED_TEMPLATES.map((tmpl) => {
                      const isSelected = selectedTemplate.id === tmpl.id;
                      return (
                        <div
                          key={tmpl.id}
                          onClick={() => setSelectedTemplate(tmpl)}
                          className={`p-4 rounded-[20px] border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#202020] bg-[#BED0F7]/40 shadow-xs'
                              : 'border-[#202020]/40 bg-[#F9F6F1] hover:border-[#202020]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-[#202020]">
                              {tmpl.name}
                            </span>
                            <Badge variant={tmpl.category === 'MARKETING' ? 'green' : 'blue'} size="sm">
                              {tmpl.category}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-[#202020]/70 mt-2 line-clamp-2 font-medium">
                            {tmpl.body}
                          </p>
                          <div className="mt-2 text-[10px] text-[#202020]/60 font-semibold">
                            Variables: {tmpl.variables.join(', ')} • Language: {tmpl.language}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 4: VARIABLE MAPPING */}
              {wizardStep === 4 && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px]">
                    <span className="font-bold text-xs text-[#202020] block">
                      Template: <code>{selectedTemplate.name}</code> ({selectedTemplate.variables.length} parameters)
                    </span>
                    <p className="text-[11px] text-[#202020]/60 mt-0.5">
                      Map dynamic recipient contact attributes to template placeholders.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {selectedTemplate.variables.map((v, idx) => {
                      const varNum = idx + 1;
                      const mapping = variableMappings[varNum] || {
                        variableNumber: varNum,
                        sourceField: varNum === 1 ? 'name' : 'static_value',
                        fallbackValue: 'Valued Customer',
                      };

                      return (
                        <div
                          key={v}
                          className="p-4 bg-white border-2 border-[#202020] rounded-[20px] grid grid-cols-1 sm:grid-cols-3 gap-3 items-center"
                        >
                          <div>
                            <span className="font-mono font-black text-sm text-[#202020] bg-[#BED0F7] px-2 py-0.5 rounded border border-[#202020]">
                              {v}
                            </span>
                            <span className="text-[11px] text-[#202020]/60 block mt-1 font-semibold">
                              Parameter {varNum}
                            </span>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-[#202020]/60 uppercase block mb-1">
                              Source Field
                            </label>
                            <select
                              value={mapping.sourceField}
                              onChange={(e) =>
                                setVariableMappings({
                                  ...variableMappings,
                                  [varNum]: { ...mapping, sourceField: e.target.value as any },
                                })
                              }
                              className="w-full p-2 text-xs border border-[#202020] rounded-[12px] bg-[#F9F6F1] font-bold"
                            >
                              <option value="name">Contact Full Name</option>
                              <option value="phone">Contact Phone Number</option>
                              <option value="email">Contact Email</option>
                              <option value="static_value">Static Custom Value</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-[#202020]/60 uppercase block mb-1">
                              Fallback Value
                            </label>
                            <input
                              type="text"
                              value={mapping.fallbackValue}
                              onChange={(e) =>
                                setVariableMappings({
                                  ...variableMappings,
                                  [varNum]: { ...mapping, fallbackValue: e.target.value },
                                })
                              }
                              placeholder="Default value if empty"
                              className="w-full p-2 text-xs border border-[#202020] rounded-[12px] bg-[#F9F6F1] font-medium"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 5: MESSAGE PREVIEW & COST ESTIMATION */}
              {wizardStep === 5 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* WhatsApp Chat Preview */}
                  <div className="border-2 border-[#202020] rounded-[24px] overflow-hidden bg-[#EFEAE2]">
                    <div className="bg-[#075E54] text-white p-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                        R
                      </div>
                      <span className="font-bold text-xs">Rich Rlephant Business</span>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="bg-white rounded-[16px] rounded-tl-xs p-3 shadow-xs border border-[#D8D0C4] space-y-1.5 max-w-[90%]">
                        {selectedTemplate.header && (
                          <div className="font-bold text-xs text-[#202020]">
                            {selectedTemplate.header}
                          </div>
                        )}
                        <p className="text-xs text-[#202020] leading-relaxed">
                          {getRenderedPreviewText()}
                        </p>
                        {selectedTemplate.footer && (
                          <div className="text-[10px] text-[#202020]/60">
                            {selectedTemplate.footer}
                          </div>
                        )}
                        <div className="text-[9px] text-[#202020]/50 text-right">
                          12:30 PM • ✓✓
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Cost Breakdown */}
                  <div className="space-y-4">
                    <div className="p-5 bg-[#F9F6F1] border-2 border-[#202020] rounded-[24px] space-y-3">
                      <span className="font-bold font-serif text-sm text-[#202020] block">
                        Estimated Meta Cloud API Spend
                      </span>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-[#202020]/70">Eligible Recipients:</span>
                          <strong className="font-bold text-[#202020]">
                            {eligibleRecipientsCount.toLocaleString()}
                          </strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#202020]/70">Meta Rate ({category}):</span>
                          <strong className="font-bold text-[#202020]">
                            {category === 'MARKETING' ? '$0.038 / AED 0.14' : '$0.015 / AED 0.055'}
                          </strong>
                        </div>
                        <div className="pt-2 border-t-2 border-[#D8D0C4] flex justify-between items-baseline">
                          <span className="font-bold text-sm text-[#202020]">Total Projected Cost:</span>
                          <span className="text-xl font-black font-serif text-[#065f46]">
                            ${estimatedCost.toFixed(2)} USD
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-[#ecfdf5] border-2 border-[#065f46] rounded-[18px] text-[11px] text-[#065f46] font-bold">
                      ✓ Zero platform markup. Transparent Meta conversation pass-through billing.
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: SCHEDULE & DISPATCH CONFIGURATION */}
              {wizardStep === 6 && (
                <div className="space-y-4">
                  {/* Dispatch Timing */}
                  <div>
                    <label className="font-bold text-[#202020] block mb-1.5">
                      Dispatch Schedule
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`p-3.5 rounded-[18px] border-2 cursor-pointer flex items-center gap-2.5 ${
                          dispatchTiming === 'immediate'
                            ? 'bg-[#BED0F7]/40 border-[#202020]'
                            : 'bg-[#F9F6F1] border-[#202020]/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="dispatch"
                          checked={dispatchTiming === 'immediate'}
                          onChange={() => setDispatchTiming('immediate')}
                        />
                        <span className="font-bold text-xs text-[#202020]">Send Immediately</span>
                      </label>

                      <label
                        className={`p-3.5 rounded-[18px] border-2 cursor-pointer flex items-center gap-2.5 ${
                          dispatchTiming === 'scheduled'
                            ? 'bg-[#BED0F7]/40 border-[#202020]'
                            : 'bg-[#F9F6F1] border-[#202020]/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="dispatch"
                          checked={dispatchTiming === 'scheduled'}
                          onChange={() => setDispatchTiming('scheduled')}
                        />
                        <span className="font-bold text-xs text-[#202020]">Schedule for Later</span>
                      </label>
                    </div>

                    {dispatchTiming === 'scheduled' && (
                      <div className="mt-3">
                        <input
                          type="datetime-local"
                          value={scheduledDateTime}
                          onChange={(e) => setScheduledDateTime(e.target.value)}
                          className="w-full p-2.5 border-2 border-[#202020] rounded-[16px] text-xs font-bold bg-[#F9F6F1]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Pacing Speed */}
                  <div>
                    <label className="font-bold text-[#202020] block mb-1.5">
                      Transactional Outbox Pacing / Rate Limit
                    </label>
                    <select
                      value={pacingRate}
                      onChange={(e) => setPacingRate(Number(e.target.value))}
                      className="w-full p-3 border-2 border-[#202020] rounded-[18px] text-xs font-bold bg-[#F9F6F1]"
                    >
                      <option value={60}>Adaptive Pacing (60 msgs/min) - Recommended</option>
                      <option value={30}>Conservative Pacing (30 msgs/min) - Reduced load</option>
                      <option value={120}>High-Throughput Pacing (120 msgs/min) - Enterprise tier</option>
                    </select>
                  </div>

                  {/* Final Summary Card */}
                  <div className="p-4 bg-[#F9F6F1] border-2 border-[#202020] rounded-[20px] space-y-1.5 text-[11px]">
                    <div className="font-bold text-xs text-[#202020]">Preflight Verification Gate Passed:</div>
                    <div className="text-[#065f46] font-bold">✓ {eligibleRecipientsCount.toLocaleString()} Opted-in recipients confirmed</div>
                    <div className="text-[#065f46] font-bold">✓ Meta Template "{selectedTemplate.name}" verified as APPROVED</div>
                    <div className="text-[#065f46] font-bold">✓ Transactional outbox with zero duplicate delivery guarantee</div>
                  </div>
                </div>
              )}
            </div>

            {/* Wizard Navigation Footer */}
            <div className="px-8 py-4 border-t-2 border-[#202020] flex items-center justify-between bg-[#F9F6F1]">
              <Button
                variant="outline"
                size="md"
                disabled={wizardStep === 1}
                onClick={handlePrevStep}
                className="gap-1.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              <div className="space-x-2">
                {wizardStep < 6 ? (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleNextStep}
                    className="gap-1.5 font-bold"
                  >
                    Next Step
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleLaunchCampaign}
                    className="gap-2 font-bold"
                  >
                    <Send className="h-4 w-4" />
                    Confirm & Launch Campaign
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DETAILED CAMPAIGN REPORT */}
      {selectedReportCampaign && (
        <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border-2 border-[#202020] max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#72A4F2]" />
                <div>
                  <h3 className="font-serif font-bold text-base text-[#202020]">
                    {selectedReportCampaign.name}
                  </h3>
                  <p className="text-[11px] text-[#202020]/60">
                    Template: <code>{selectedReportCampaign.templateName}</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReportCampaign(null)}
                className="text-lg font-black text-[#202020]/60 hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-3 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px]">
                <span className="text-[10px] text-[#202020]/60 uppercase font-bold block">Sent</span>
                <span className="text-lg font-black font-serif text-[#202020]">
                  {selectedReportCampaign.sentCount.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-[#ecfdf5] border-2 border-[#202020] rounded-[18px]">
                <span className="text-[10px] text-[#065f46] uppercase font-bold block">Delivered</span>
                <span className="text-lg font-black font-serif text-[#065f46]">
                  {selectedReportCampaign.deliveredCount.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-[#BED0F7]/40 border-2 border-[#202020] rounded-[18px]">
                <span className="text-[10px] text-[#202020] uppercase font-bold block">Read</span>
                <span className="text-lg font-black font-serif text-[#202020]">
                  {selectedReportCampaign.readCount.toLocaleString()}
                </span>
              </div>
              <div className="p-3 bg-[#fee2e2] border-2 border-[#202020] rounded-[18px]">
                <span className="text-[10px] text-[#991b1b] uppercase font-bold block">Failed</span>
                <span className="text-lg font-black font-serif text-[#991b1b]">
                  {selectedReportCampaign.failedCount}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#202020]/60">Pacing Speed:</span>
                <span className="font-bold text-[#202020]">{selectedReportCampaign.pacingMessagesPerMinute} msgs/min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#202020]/60">Estimated Meta Charge:</span>
                <span className="font-bold text-[#202020]">${selectedReportCampaign.estimatedCostUSD.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#202020]/60">Delivery Status:</span>
                <span className="font-bold text-[#065f46]">{selectedReportCampaign.status}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setSelectedReportCampaign(null)}
              className="w-full font-bold"
            >
              Close Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
