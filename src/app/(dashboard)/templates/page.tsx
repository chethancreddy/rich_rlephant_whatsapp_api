'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  RefreshCw,
  PlusCircle,
  CheckCircle2,
  Clock,
  Eye,
  Copy,
  Trash2,
  Smartphone,
  AlertTriangle,
  Send,
  X,
  ExternalLink,
  Sliders,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface TemplateItem {
  id: string;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED';
  headerType: 'NONE' | 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO';
  headerText?: string;
  bodyText: string;
  footerText?: string;
  buttons: string[];
  variableCount: number;
  sampleValues: string[];
  rejectionReason?: string;
  syncedAt: string;
}

const INITIAL_TEMPLATES: TemplateItem[] = [];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>(INITIAL_TEMPLATES);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);

  // Fetch templates from API
  useEffect(() => {
    fetch('/api/templates')
      .then((res) => res.json())
      .then((data) => {
        if (data.templates && Array.isArray(data.templates)) {
          setTemplates(data.templates);
        }
      })
      .catch(() => {});
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/templates/sync', { method: 'POST' });
      const data = await res.json();
      if (data.templates && Array.isArray(data.templates)) {
        setTemplates(data.templates);
      }
    } catch {
      // fallback
    } finally {
      setIsSyncing(false);
    }
  };

  // Builder Form State
  const [templateName, setTemplateName] = useState('');
  const [category, setCategory] = useState<'MARKETING' | 'UTILITY' | 'AUTHENTICATION'>('MARKETING');
  const [language, setLanguage] = useState('en');
  const [headerType, setHeaderType] = useState<'NONE' | 'TEXT' | 'IMAGE' | 'DOCUMENT'>('NONE');
  const [headerText, setHeaderText] = useState('');
  const [bodyText, setBodyText] = useState('Hello {{1}}, we have a special update regarding {{2}}.');
  const [footerText, setFooterText] = useState('Reply STOP to unsubscribe');
  const [sampleValues, setSampleValues] = useState<string[]>(['Customer', 'Your Account']);
  const [buttons, setButtons] = useState<Array<{ type: string; text: string; url?: string }>>([
    { type: 'QUICK_REPLY', text: 'Confirm' },
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  // Detect variable count from body text
  const detectedVariables = Array.from(bodyText.matchAll(/\{\{(\d+)\}\}/g));

  const handleAddVariable = () => {
    const nextVarNumber = detectedVariables.length + 1;
    setBodyText((prev) => `${prev} {{${nextVarNumber}}}`);
    setSampleValues((prev) => [...prev, `Sample ${nextVarNumber}`]);
  };

  const handleSampleValueChange = (index: number, val: string) => {
    const updated = [...sampleValues];
    updated[index] = val;
    setSampleValues(updated);
  };

  // Live formatted body with samples for mobile preview
  const getPreviewBodyText = () => {
    let text = bodyText;
    detectedVariables.forEach((m, idx) => {
      const sample = sampleValues[idx] || `[Variable {{${m[1]}}}]`;
      text = text.replace(m[0], sample);
    });
    return text;
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate name
    if (!/^[a-z0-9_]{1,512}$/.test(templateName)) {
      setFormError('Template name must contain only lowercase alphanumeric characters and underscores (e.g. promo_order_v1).');
      return;
    }

    if (!bodyText.trim()) {
      setFormError('Body text is required.');
      return;
    }

    const newTmpl: TemplateItem = {
      id: `tmpl_${Date.now()}`,
      name: templateName,
      category,
      language,
      status: 'PENDING',
      headerType,
      headerText: headerType === 'TEXT' ? headerText : undefined,
      bodyText,
      footerText: footerText.trim() || undefined,
      buttons: buttons.map((b) => `${b.text} (${b.type})`),
      variableCount: detectedVariables.length,
      sampleValues,
      syncedAt: 'Just now',
    };

    setTemplates([newTmpl, ...templates]);
    setIsBuilderOpen(false);
    // Reset form
    setTemplateName('');
    setHeaderText('');
    setBodyText('Hello {{1}}, we have a special update regarding {{2}}.');
  };

  const handleDuplicate = (tmpl: TemplateItem) => {
    const duplicated: TemplateItem = {
      ...tmpl,
      id: `tmpl_${Date.now()}`,
      name: `${tmpl.name}_copy`,
      status: 'PENDING',
      rejectionReason: undefined,
      syncedAt: 'Just now',
    };
    setTemplates([duplicated, ...templates]);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#202020] tracking-tight">Meta Message Templates</h2>
          <p className="text-xs text-[#202020]/70 mt-1">
            Build, test, and synchronize WhatsApp message templates directly with Meta WhatsApp Business Cloud API.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="md"
            className="gap-2"
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync from Meta'}
          </Button>

          <Button
            variant="primary"
            size="md"
            className="gap-2"
            onClick={() => setIsBuilderOpen(true)}
          >
            <PlusCircle className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white border-2 border-[#202020] rounded-[24px] p-8 shadow-xs">
            <div className="max-w-md mx-auto flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-[#BED0F7]/30 border-2 border-[#202020] flex items-center justify-center mb-4">
                <FileText className="w-7 h-7 text-[#202020]" />
              </div>
              <h3 className="text-base font-bold text-[#202020] mb-1">No Meta Templates Synced</h3>
              <p className="text-xs text-[#202020]/70 mb-5 text-center leading-relaxed">
                Connect your WhatsApp Business Account and synchronize approved Meta templates, or submit new templates for Meta review directly from the builder.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsBuilderOpen(true)}
                  className="gap-2 font-bold"
                >
                  <PlusCircle className="w-4 h-4" />
                  Create Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="gap-2 font-bold"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync from Meta
                </Button>
              </div>
            </div>
          </div>
        ) : (
          templates.map((tmpl) => (
          <Card key={tmpl.id} className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#202020] font-mono">{tmpl.name}</span>
                    <span className="text-[10px] bg-[#F4EFE7] border border-[#202020] text-[#202020] px-2 py-0.5 rounded-full uppercase font-bold">
                      {tmpl.language}
                    </span>
                  </div>
                  <span className="text-xs text-[#202020]/60 block mt-1 font-semibold">
                    Category: <strong>{tmpl.category}</strong>
                  </span>
                </div>

                <Badge
                  variant={
                    tmpl.status === 'APPROVED' ? 'green' : tmpl.status === 'PENDING' ? 'yellow' : 'red'
                  }
                  size="sm"
                  className="gap-1.5"
                >
                  {tmpl.status === 'APPROVED' ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#065f46]" />
                  ) : tmpl.status === 'PENDING' ? (
                    <Clock className="h-3.5 w-3.5 text-[#854d0e]" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-[#b91c1c]" />
                  )}
                  {tmpl.status}
                </Badge>
              </div>

              {/* Rejection Alert Banner */}
              {tmpl.status === 'REJECTED' && tmpl.rejectionReason && (
                <div className="mt-3 p-3 bg-[#fee2e2] border-2 border-[#b91c1c] rounded-[18px] text-[11px] text-[#7f1d1d] font-medium flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-[#b91c1c] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Rejection Feedback from Meta:</span>
                    <span>{tmpl.rejectionReason}</span>
                  </div>
                </div>
              )}

              {/* Message Bubble Preview */}
              <div className="mt-4 p-4 bg-[#F9F6F1] border-2 border-[#202020] rounded-[22px]">
                {tmpl.headerText && (
                  <h4 className="font-bold text-xs text-[#202020] pb-1.5 border-b border-[#D8D0C4] mb-2 font-serif">
                    {tmpl.headerText}
                  </h4>
                )}
                <p className="text-xs text-[#202020] leading-relaxed font-sans font-medium">
                  {tmpl.bodyText}
                </p>
                {tmpl.footerText && (
                  <p className="text-[10px] text-[#202020]/60 mt-2 font-medium">
                    {tmpl.footerText}
                  </p>
                )}

                {tmpl.buttons && tmpl.buttons.length > 0 && (
                  <div className="mt-3 pt-3 border-t-2 border-[#D8D0C4] flex flex-wrap gap-2">
                    {tmpl.buttons.map((btn) => (
                      <span
                        key={btn}
                        className="text-[10px] font-bold bg-white border-2 border-[#202020] text-[#202020] px-3 py-1 rounded-[14px]"
                      >
                        {btn}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Card Controls */}
            <div className="mt-5 pt-3 border-t-2 border-[#F4EFE7] flex items-center justify-between text-xs text-[#202020]/60">
              <span className="font-medium">Synced: {tmpl.syncedAt}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDuplicate(tmpl)}
                  className="p-1 hover:text-[#72A4F2] text-[#202020] transition-colors"
                  title="Duplicate Template"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(tmpl.id)}
                  className="p-1 hover:text-[#E35A4F] text-[#202020] transition-colors"
                  title="Delete Template"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        ))
      )}
      </div>

      {/* TEMPLATE BUILDER & LIVE MOBILE PREVIEW MODAL */}
      {isBuilderOpen && (
        <div className="fixed inset-0 bg-[#202020]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border-2 border-[#202020] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b-2 border-[#202020] flex items-center justify-between bg-[#F9F6F1]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[12px] bg-[#72A4F2] border-1.5 border-[#202020] flex items-center justify-center text-[#202020]">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-[#202020]">
                    In-Dashboard Meta Template Builder
                  </h3>
                  <p className="text-[11px] text-[#202020]/60">
                    Construct approved WhatsApp templates with real-time Meta validation and live phone mockup
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBuilderOpen(false)}
                className="text-lg font-black text-[#202020]/60 hover:text-black p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Left Builder Form + Right Live Mobile Mockup */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x-2 divide-[#202020]">
              {/* Left Column: Form */}
              <form onSubmit={handleCreateTemplate} className="p-6 space-y-4 text-xs">
                {formError && (
                  <div className="p-3 bg-[#fee2e2] border-2 border-[#b91c1c] rounded-[16px] text-[11px] text-[#7f1d1d] font-bold">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="font-bold text-[#202020] block mb-1">
                    Template Name * <span className="font-normal text-[#202020]/60">(lowercase, numbers, underscores)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. order_delivery_update_v1"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] font-mono font-medium focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] font-bold focus:outline-none"
                    >
                      <option value="MARKETING">MARKETING</option>
                      <option value="UTILITY">UTILITY</option>
                      <option value="AUTHENTICATION">AUTHENTICATION</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Language *</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] font-bold focus:outline-none"
                    >
                      <option value="en">English (en)</option>
                      <option value="ar">Arabic (ar)</option>
                      <option value="hi">Hindi (hi)</option>
                      <option value="ur">Urdu (ur)</option>
                    </select>
                  </div>
                </div>

                {/* Header Config */}
                <div className="pt-2 border-t border-[#D8D0C4]">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#202020]">Header (Optional)</label>
                    <select
                      value={headerType}
                      onChange={(e) => setHeaderType(e.target.value as any)}
                      className="text-[11px] bg-[#F4EFE7] border border-[#202020] rounded-[12px] px-2 py-0.5 font-bold"
                    >
                      <option value="NONE">None</option>
                      <option value="TEXT">Text Header</option>
                      <option value="IMAGE">Image Media</option>
                      <option value="DOCUMENT">Document PDF</option>
                    </select>
                  </div>
                  {headerType === 'TEXT' && (
                    <input
                      type="text"
                      maxLength={60}
                      placeholder="e.g. Important Account Notification"
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#F9F6F1] border-2 border-[#202020] rounded-[14px] mt-1 text-xs"
                    />
                  )}
                </div>

                {/* Body Content */}
                <div className="pt-2 border-t border-[#D8D0C4]">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#202020]">Body Content *</label>
                    <button
                      type="button"
                      onClick={handleAddVariable}
                      className="text-[10px] font-bold bg-[#BED0F7] hover:bg-[#72A4F2] text-[#202020] px-2.5 py-1 rounded-[12px] border border-[#202020] transition-colors"
                    >
                      + Add {'{{' + (detectedVariables.length + 1) + '}}'}
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={bodyText}
                    onChange={(e) => setBodyText(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] text-xs font-medium focus:outline-none"
                  />
                </div>

                {/* Sample Values for Variables */}
                {detectedVariables.length > 0 && (
                  <div className="p-3 bg-[#F4EFE7]/50 border-2 border-[#202020] rounded-[18px] space-y-2">
                    <span className="font-bold text-[11px] text-[#202020] block">
                      Sample Values (Meta Required for Approval)
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {detectedVariables.map((m, idx) => (
                        <div key={m[0]}>
                          <span className="text-[10px] font-mono font-bold text-[#202020]/70 block mb-0.5">
                            Variable {m[0]}:
                          </span>
                          <input
                            type="text"
                            required
                            placeholder={`Sample for ${m[0]}`}
                            value={sampleValues[idx] || ''}
                            onChange={(e) => handleSampleValueChange(idx, e.target.value)}
                            className="w-full px-2.5 py-1 bg-white border border-[#202020] rounded-[10px] text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Text */}
                <div>
                  <label className="font-bold text-[#202020] block mb-1">Footer Text (Optional)</label>
                  <input
                    type="text"
                    maxLength={60}
                    placeholder="e.g. Reply STOP to opt out"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#F9F6F1] border-2 border-[#202020] rounded-[14px] text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D8D0C4]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBuilderOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" className="gap-1.5">
                    <Send className="h-3.5 w-3.5" />
                    Submit to Meta for Approval
                  </Button>
                </div>
              </form>

              {/* Right Column: Live WhatsApp Mobile Mockup */}
              <div className="p-6 bg-[#F4EFE7]/40 flex flex-col items-center justify-center">
                <div className="text-center mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#202020]/60 flex items-center justify-center gap-1.5">
                    <Smartphone className="h-3.5 w-3.5" />
                    Live WhatsApp Client Preview
                  </span>
                </div>

                {/* Phone Mockup Frame */}
                <div className="w-[300px] bg-[#EFEAE2] rounded-[36px] border-4 border-[#202020] shadow-xl overflow-hidden flex flex-col p-3">
                  {/* WhatsApp Header Bar */}
                  <div className="bg-[#075e54] text-white px-3 py-2 rounded-t-[20px] flex items-center gap-2 -mx-3 -mt-3 mb-3">
                    <div className="w-6 h-6 rounded-full bg-[#25d366] text-[#075e54] flex items-center justify-center font-bold text-[10px]">
                      R
                    </div>
                    <div>
                      <span className="font-bold text-xs block leading-tight">Rich Rlephant Business</span>
                      <span className="text-[9px] opacity-80 block">Official Business Account</span>
                    </div>
                  </div>

                  {/* Chat Bubble Container */}
                  <div className="bg-white rounded-[18px] rounded-tl-xs p-3.5 border-1.5 border-[#202020] shadow-xs text-xs space-y-2">
                    {/* Media / Header Mockup */}
                    {headerType === 'TEXT' && headerText && (
                      <h4 className="font-bold text-xs text-[#202020] font-serif border-b border-[#E5E0D8] pb-1">
                        {headerText}
                      </h4>
                    )}
                    {headerType === 'IMAGE' && (
                      <div className="w-full h-24 bg-[#BED0F7] rounded-[12px] border border-[#202020] flex items-center justify-center text-[10px] font-bold text-[#202020]">
                        📸 Image Header Preview
                      </div>
                    )}

                    {/* Body Text with Live Variable Replacement */}
                    <p className="text-xs text-[#202020] leading-relaxed whitespace-pre-wrap font-sans">
                      {getPreviewBodyText()}
                    </p>

                    {/* Footer */}
                    {footerText && (
                      <p className="text-[10px] text-[#202020]/50 pt-1">
                        {footerText}
                      </p>
                    )}

                    {/* Buttons */}
                    {buttons.length > 0 && (
                      <div className="pt-2 border-t border-[#E5E0D8] space-y-1.5">
                        {buttons.map((btn) => (
                          <div
                            key={btn.text}
                            className="w-full py-1.5 text-center text-[11px] font-bold text-[#00a884] bg-[#F9F6F1] border border-[#202020] rounded-[10px]"
                          >
                            {btn.text}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="text-right text-[9px] text-[#202020]/40 font-medium">
                      12:45 PM ✓✓
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
