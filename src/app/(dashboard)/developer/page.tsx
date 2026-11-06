'use client';

import React, { useState } from 'react';
import {
  Code2,
  Key,
  Webhook,
  FileCode,
  Copy,
  PlusCircle,
  ShieldCheck,
  Check,
  AlertTriangle,
  Trash2,
  Lock,
  Eye,
  CheckCircle2,
  Send,
  RefreshCw,
  ExternalLink,
  Play,
  Activity,
  Layers,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked';
  expiresAt: string;
}

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: string[];
  status: 'active' | 'disabled' | 'failing';
  createdAt: string;
  lastTriggered: string;
  failureCount: number;
}

const INITIAL_API_KEYS: ApiKeyItem[] = [
  {
    id: 'key_001',
    name: 'Production Backend Integration',
    prefix: 'rlep_live_8f92',
    scopes: ['messages:send', 'contacts:write'],
    createdAt: '14 Oct 2026',
    lastUsed: 'Just now',
    status: 'active',
    expiresAt: 'No expiration',
  },
  {
    id: 'key_002',
    name: 'Zendesk CRM Connector',
    prefix: 'rlep_live_3c71',
    scopes: ['messages:send', 'contacts:read', 'templates:read'],
    createdAt: '28 Oct 2026',
    lastUsed: 'Yesterday',
    status: 'active',
    expiresAt: '90 days (26 Jan 2027)',
  },
];

const INITIAL_WEBHOOKS: WebhookItem[] = [
  {
    id: 'wh_001',
    name: 'Customer CRM Sync (HubSpot)',
    url: 'https://api.acmeretail.com/webhooks/rich-rlephant',
    secret: 'whsec_8f2a91b4c3e7d56012',
    events: ['message.delivered', 'message.read', 'customer.inbound_reply'],
    status: 'active',
    createdAt: '12 Oct 2026',
    lastTriggered: '10 mins ago',
    failureCount: 0,
  },
  {
    id: 'wh_002',
    name: 'Compliance & Opt-Out Stream',
    url: 'https://compliance.acmeretail.com/webhooks/opt-out',
    secret: 'whsec_99a8b7c6d5e4f3a2b1',
    events: ['contact.opted_out'],
    status: 'active',
    createdAt: '20 Oct 2026',
    lastTriggered: '2 hours ago',
    failureCount: 0,
  },
];

export default function DeveloperPage() {
  const [activeTab, setActiveTab] = useState<'keys' | 'webhooks' | 'sandbox'>('keys');

  // Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(INITIAL_API_KEYS);
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [revealedSecret, setRevealedSecret] = useState<{ name: string; key: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [expiration, setExpiration] = useState('never');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'messages:send',
    'contacts:read',
  ]);

  // Webhooks State
  const [webhooks, setWebhooks] = useState<WebhookItem[]>(INITIAL_WEBHOOKS);
  const [isAddWebhookModalOpen, setIsAddWebhookModalOpen] = useState(false);
  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [selectedWebhookEvents, setSelectedWebhookEvents] = useState<string[]>([
    'message.delivered',
    'message.read',
  ]);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<any | null>(null);

  // Sandbox State
  const [sandboxEndpoint, setSandboxEndpoint] = useState<string>('/api/v1/messages');
  const [sandboxPayload, setSandboxPayload] = useState<string>(
    JSON.stringify(
      {
        to: '+971501234567',
        type: 'template',
        template: {
          name: 'welcome_package_v1',
          language: { code: 'en_US' },
          components: [],
        },
      },
      null,
      2
    )
  );
  const [sandboxResponse, setSandboxResponse] = useState<{
    status: number;
    latencyMs: number;
    body: any;
  } | null>(null);
  const [isSendingSandbox, setIsSendingSandbox] = useState(false);

  // Helper Methods
  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  const toggleWebhookEvent = (ev: string) => {
    setSelectedWebhookEvents((prev) =>
      prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]
    );
  };

  const generateRandomHex = (bytes: number) => {
    const chars = '0123456789abcdef';
    let res = '';
    for (let i = 0; i < bytes * 2; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
    }
    return res;
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    if (selectedScopes.length === 0) {
      alert('Please select at least one permission scope for this API key.');
      return;
    }

    const tokenHex = generateRandomHex(16);
    const fullToken = `rlep_live_${tokenHex}`;
    const prefix = `rlep_live_${tokenHex.slice(0, 4)}`;

    const newKey: ApiKeyItem = {
      id: `key_${Date.now()}`,
      name: keyName.trim(),
      prefix,
      scopes: [...selectedScopes],
      createdAt: 'Today',
      lastUsed: 'Never used',
      status: 'active',
      expiresAt:
        expiration === '30'
          ? '30 days'
          : expiration === '90'
          ? '90 days'
          : expiration === '365'
          ? '1 year'
          : 'No expiration',
    };

    setApiKeys([newKey, ...apiKeys]);
    setIsCreateKeyModalOpen(false);
    setRevealedSecret({ name: keyName.trim(), key: fullToken });
    setKeyName('');
  };

  const handleRevokeKey = (id: string) => {
    if (window.confirm('Are you sure you want to revoke this API key? Applications using this token will be disconnected immediately.')) {
      setApiKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k))
      );
    }
  };

  const handleCopySecret = (keyText: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(keyText);
    }
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookName.trim() || !webhookUrl.trim()) return;
    if (selectedWebhookEvents.length === 0) {
      alert('Please select at least one event topic to subscribe to.');
      return;
    }

    const secretHex = generateRandomHex(12);
    const newWh: WebhookItem = {
      id: `wh_${Date.now()}`,
      name: webhookName.trim(),
      url: webhookUrl.trim(),
      secret: `whsec_${secretHex}`,
      events: [...selectedWebhookEvents],
      status: 'active',
      createdAt: 'Today',
      lastTriggered: 'Never triggered',
      failureCount: 0,
    };

    setWebhooks([newWh, ...webhooks]);
    setIsAddWebhookModalOpen(false);
    setWebhookName('');
    setWebhookUrl('');
  };

  const handleDeleteWebhook = (id: string) => {
    if (window.confirm('Delete this webhook endpoint? Event delivery to this URL will cease immediately.')) {
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
    }
  };

  const handleTestWebhook = async (wh: WebhookItem) => {
    setTestingWebhookId(wh.id);
    setTestResult(null);

    try {
      const res = await fetch('/api/developer/webhooks/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: wh.url,
          secret: wh.secret,
          eventType: wh.events[0] || 'message.delivered',
        }),
      });
      const data = await res.json();
      setTestResult({ ...data, webhookName: wh.name });
    } catch (err: any) {
      setTestResult({
        success: false,
        statusCode: 500,
        error: err.message,
        webhookName: wh.name,
      });
    } finally {
      setTestingWebhookId(null);
    }
  };

  const handleRunSandbox = async () => {
    setIsSendingSandbox(true);
    setSandboxResponse(null);

    const startTime = Date.now();
    try {
      let parsedPayload: any = {};
      try {
        parsedPayload = JSON.parse(sandboxPayload);
      } catch {
        alert('Invalid JSON in Sandbox Payload');
        setIsSendingSandbox(false);
        return;
      }

      const res = await fetch(sandboxEndpoint, {
        method: sandboxEndpoint.includes('contacts') && parsedPayload.phone ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer rlep_live_demo_secret_key_8f92',
          'Idempotency-Key': `idemp_${Date.now()}`,
        },
        body: ['POST'].includes(sandboxEndpoint.includes('contacts') && parsedPayload.phone ? 'POST' : 'GET')
          ? JSON.stringify(parsedPayload)
          : undefined,
      });

      const body = await res.json();
      setSandboxResponse({
        status: res.status,
        latencyMs: Date.now() - startTime,
        body,
      });
    } catch (err: any) {
      setSandboxResponse({
        status: 500,
        latencyMs: Date.now() - startTime,
        body: { error: err.message || 'Network request failed' },
      });
    } finally {
      setIsSendingSandbox(false);
    }
  };

  const curlExample = `curl -X POST https://api.rich-rlephant.com/api/v1/messages \\
  -H "Authorization: Bearer rlep_live_8f92..." \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: idemp_${Date.now()}" \\
  -d '{
    "to": "+971501234567",
    "type": "template",
    "template": {
      "name": "welcome_package_v1",
      "language": { "code": "en_US" },
      "components": []
    }
  }'`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b-2 border-[#202020]">
        <div>
          <h1 className="text-2xl font-serif font-black tracking-tight text-[#202020]">
            Developer & REST API Gateway
          </h1>
          <p className="text-xs text-[#202020]/70 mt-1">
            Programmatic WhatsApp Business API access, cryptographically secured API keys, outbound webhooks, and live sandbox.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex bg-[#F4EFE7] p-1 rounded-[20px] border-2 border-[#202020] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('keys')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[16px] text-xs font-bold transition-all ${
              activeTab === 'keys'
                ? 'bg-[#72A4F2] text-white shadow-xs'
                : 'text-[#202020] hover:bg-white/60'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            API Keys
          </button>
          <button
            onClick={() => setActiveTab('webhooks')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[16px] text-xs font-bold transition-all ${
              activeTab === 'webhooks'
                ? 'bg-[#72A4F2] text-white shadow-xs'
                : 'text-[#202020] hover:bg-white/60'
            }`}
          >
            <Webhook className="h-3.5 w-3.5" />
            Webhooks
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-[16px] text-xs font-bold transition-all ${
              activeTab === 'sandbox'
                ? 'bg-[#72A4F2] text-white shadow-xs'
                : 'text-[#202020] hover:bg-white/60'
            }`}
          >
            <Play className="h-3.5 w-3.5" />
            Live Sandbox & Docs
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: API KEYS
         ========================================================================= */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-serif font-bold text-[#202020]">API Authentication Keys</h2>
              <p className="text-xs text-[#202020]/60">Tokens hashed with SHA-256 at rest; secrets only shown once upon creation.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateKeyModalOpen(true)}
              className="gap-2 font-bold"
            >
              <PlusCircle className="h-4 w-4" />
              Create New API Key
            </Button>
          </div>

          <Card title="Active API Keys" subtitle="Bearer tokens authenticated for REST v1 endpoints">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F9F6F1] text-[#202020] uppercase font-bold border-b-2 border-[#202020]">
                  <tr>
                    <th className="py-3 px-4">Key Name</th>
                    <th className="py-3 px-4">Token Prefix</th>
                    <th className="py-3 px-4">Scopes</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4">Expires</th>
                    <th className="py-3 px-4">Last Used</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F4EFE7]">
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-[#F9F6F1]/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#202020]">{key.name}</td>
                      <td className="py-3.5 px-4 font-mono font-medium text-[#202020]/70">
                        {key.prefix}...
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {key.scopes.map((s) => (
                            <span
                              key={s}
                              className="text-[10px] bg-[#F4EFE7] border border-[#202020] text-[#202020] px-2 py-0.5 rounded-full font-mono font-bold"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#202020]/60 font-medium">{key.createdAt}</td>
                      <td className="py-3.5 px-4 text-[#202020]/60 font-medium">{key.expiresAt}</td>
                      <td className="py-3.5 px-4 text-[#065f46] font-bold">{key.lastUsed}</td>
                      <td className="py-3.5 px-4">
                        {key.status === 'active' ? (
                          <Badge variant="green" size="sm">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="red" size="sm">
                            Revoked
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {key.status === 'active' ? (
                          <button
                            onClick={() => handleRevokeKey(key.id)}
                            className="text-[#E35A4F] hover:underline font-bold text-xs cursor-pointer"
                          >
                            Revoke
                          </button>
                        ) : (
                          <span className="text-[#202020]/40 font-bold text-xs">Revoked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* cURL Example Card */}
          <Card
            title="Quick Integration: Send WhatsApp Template Message"
            subtitle="cURL Example with Idempotency-Key and Bearer Auth"
          >
            <div className="relative">
              <div className="bg-[#202020] text-white rounded-[22px] p-6 font-mono text-xs overflow-x-auto border-2 border-[#202020]">
                <pre className="text-[#9CBDF5]">{curlExample}</pre>
              </div>
              <button
                onClick={() => {
                  if (navigator?.clipboard) {
                    navigator.clipboard.writeText(curlExample);
                  }
                  setCopiedCurl(true);
                  setTimeout(() => setCopiedCurl(false), 2500);
                }}
                className="absolute top-4 right-4 px-3 py-1.5 bg-white text-[#202020] border-2 border-[#202020] rounded-[14px] text-xs font-bold flex items-center gap-1.5 hover:bg-[#F4EFE7] transition-all cursor-pointer shadow-xs"
              >
                {copiedCurl ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#065f46]" />
                    <span className="text-[#065f46]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy cURL</span>
                  </>
                )}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          TAB 2: OUTBOUND WEBHOOKS
         ========================================================================= */}
      {activeTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-serif font-bold text-[#202020]">Outbound Event Webhooks</h2>
              <p className="text-xs text-[#202020]/60">Receive real-time HTTPS push notifications signed with HMAC-SHA256 (`X-Hub-Signature-256`).</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddWebhookModalOpen(true)}
              className="gap-2 font-bold"
            >
              <PlusCircle className="h-4 w-4" />
              Register Webhook
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {webhooks.map((wh) => (
              <div
                key={wh.id}
                className="bg-white rounded-[24px] border-2 border-[#202020] p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[12px] bg-[#F4EFE7] border-2 border-[#202020] flex items-center justify-center text-[#72A4F2]">
                      <Webhook className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[#202020]">{wh.name}</h3>
                      <p className="font-mono text-xs text-[#202020]/70">{wh.url}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={wh.status === 'active' ? 'green' : 'red'} size="sm">
                      {wh.status === 'active' ? 'Active & Healthy' : 'Disabled'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestWebhook(wh)}
                      disabled={testingWebhookId === wh.id}
                      className="gap-1.5 text-xs font-bold"
                    >
                      {testingWebhookId === wh.id ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Activity className="h-3.5 w-3.5 text-[#065f46]" />
                      )}
                      Test Ping
                    </Button>
                    <button
                      onClick={() => handleDeleteWebhook(wh.id)}
                      className="p-1.5 text-[#E35A4F] hover:bg-[#F9F6F1] rounded-[10px] transition-colors cursor-pointer"
                      title="Delete Webhook"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F4EFE7] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#202020]/60">Subscribed Topics:</span>
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map((ev) => (
                        <span
                          key={ev}
                          className="px-2 py-0.5 bg-[#F9F6F1] border border-[#202020] rounded-full text-[10px] font-mono font-bold"
                        >
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[#202020]/60 text-[11px]">
                    <span>Secret: <code className="font-mono bg-[#F9F6F1] px-1.5 py-0.5 rounded border border-[#202020]/30">{wh.secret.slice(0, 10)}...</code></span>
                    <span>Last triggered: <strong>{wh.lastTriggered}</strong></span>
                    <span>Failures: <strong>{wh.failureCount}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Test Ping Live Inspection Banner */}
          {testResult && (
            <div className="bg-[#202020] text-white rounded-[24px] border-2 border-[#202020] p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {testResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-[#34d399]" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-[#E35A4F]" />
                  )}
                  <h4 className="font-serif font-bold text-sm">
                    Test Ping Delivery Result ({testResult.webhookName})
                  </h4>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="bg-white/20 px-2 py-0.5 rounded">Status: {testResult.statusCode}</span>
                  <span className="bg-white/20 px-2 py-0.5 rounded">Latency: {testResult.latencyMs}ms</span>
                  <button
                    onClick={() => setTestResult(null)}
                    className="text-white/60 hover:text-white text-xs ml-2"
                  >
                    ✕ Dismiss
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-white/60 block mb-1">Headers Dispatched:</span>
                  <pre className="bg-black/50 p-3 rounded-[14px] text-[11px] overflow-x-auto text-[#9CBDF5]">
                    {JSON.stringify(testResult.headersSent, null, 2)}
                  </pre>
                </div>
                <div>
                  <span className="text-white/60 block mb-1">Server Response Body:</span>
                  <pre className="bg-black/50 p-3 rounded-[14px] text-[11px] overflow-x-auto text-[#34d399]">
                    {testResult.responseBody || testResult.error}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: LIVE SANDBOX & INTERACTIVE DOCS
         ========================================================================= */}
      {activeTab === 'sandbox' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-serif font-bold text-[#202020]">REST API Interactive Sandbox</h2>
              <p className="text-xs text-[#202020]/60">Execute live REST requests against the platform and inspect real headers, timing, and responses.</p>
            </div>
            <a
              href="/api/docs/openapi.json"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F4EFE7] border-2 border-[#202020] rounded-[16px] text-xs font-bold text-[#202020] hover:bg-[#72A4F2] hover:text-white transition-all"
            >
              <FileCode className="h-3.5 w-3.5" />
              Download OpenAPI 3.0 Spec
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Request Builder */}
            <div className="lg:col-span-6 space-y-4">
              <Card title="Request Composer" subtitle="Send live API commands with Bearer Authentication">
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Target Endpoint</label>
                    <select
                      value={sandboxEndpoint}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSandboxEndpoint(val);
                        if (val === '/api/v1/messages') {
                          setSandboxPayload(
                            JSON.stringify(
                              {
                                to: '+971501234567',
                                type: 'template',
                                template: {
                                  name: 'welcome_package_v1',
                                  language: { code: 'en_US' },
                                  components: [],
                                },
                              },
                              null,
                              2
                            )
                          );
                        } else if (val === '/api/v1/contacts') {
                          setSandboxPayload(
                            JSON.stringify(
                              {
                                phone: '+971509876543',
                                firstName: 'Zayd',
                                lastName: 'Al-Hashemi',
                                consentStatus: 'opted_in',
                                consentSource: 'checkout_form',
                                tags: ['vip', 'dubai-retail'],
                              },
                              null,
                              2
                            )
                          );
                        } else if (val === '/api/v1/templates') {
                          setSandboxPayload('// GET endpoint - no request body required');
                        }
                      }}
                      className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] font-bold font-mono text-xs focus:outline-none"
                    >
                      <option value="/api/v1/messages">POST /api/v1/messages (Dispatch Message)</option>
                      <option value="/api/v1/contacts">POST /api/v1/contacts (Register Contact)</option>
                      <option value="/api/v1/templates">GET /api/v1/templates (List Approved Templates)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#202020] block mb-1">Request Body (JSON)</label>
                    <textarea
                      rows={9}
                      value={sandboxPayload}
                      onChange={(e) => setSandboxPayload(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#202020] text-[#9CBDF5] border-2 border-[#202020] rounded-[16px] font-mono text-xs focus:outline-none leading-relaxed"
                    />
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleRunSandbox}
                    disabled={isSendingSandbox}
                    className="w-full gap-2 font-bold"
                  >
                    {isSendingSandbox ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Execute Request
                  </Button>
                </div>
              </Card>
            </div>

            {/* Response Inspector */}
            <div className="lg:col-span-6 space-y-4">
              <Card title="Live Response Inspector" subtitle="Status code, latency, and returned JSON payload">
                {sandboxResponse ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F4EFE7]">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={sandboxResponse.status < 300 ? 'green' : 'red'}
                          size="md"
                        >
                          HTTP {sandboxResponse.status}
                        </Badge>
                        <span className="font-bold text-[#202020]">
                          {sandboxResponse.status < 300 ? 'OK / Created' : 'Client/Server Error'}
                        </span>
                      </div>
                      <span className="font-mono text-[#065f46] font-bold">
                        {sandboxResponse.latencyMs} ms
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-[#202020]/70 block mb-1 text-[11px] uppercase">
                        Response Body:
                      </span>
                      <pre className="bg-[#202020] text-[#34d399] p-4 rounded-[18px] font-mono text-xs overflow-x-auto max-h-[300px] border-2 border-[#202020] leading-relaxed">
                        {JSON.stringify(sandboxResponse.body, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 text-center text-[#202020]/50 space-y-2">
                    <Play className="h-8 w-8 mx-auto text-[#72A4F2] opacity-60" />
                    <p className="text-xs font-medium">Click &apos;Execute Request&apos; to view live response output.</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: CREATE API KEY
         ========================================================================= */}
      {isCreateKeyModalOpen && (
        <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border-2 border-[#202020] max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-[#72A4F2]" />
                <h3 className="font-serif font-bold text-base text-[#202020]">
                  Create New API Key
                </h3>
              </div>
              <button
                onClick={() => setIsCreateKeyModalOpen(false)}
                className="text-lg font-black text-[#202020]/60 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateKey} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-[#202020] block mb-1">
                  Key Description / Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shopify Storefront Sync"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">Expiration Period</label>
                <select
                  value={expiration}
                  onChange={(e) => setExpiration(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none font-bold"
                >
                  <option value="never">No Expiration (Standard)</option>
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                  <option value="365">1 Year</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-2">
                  Permission Scopes *
                </label>
                <div className="space-y-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[20px] p-3.5">
                  {[
                    {
                      id: 'messages:send',
                      label: 'messages:send',
                      desc: 'Dispatch template and free-form messages to WhatsApp',
                    },
                    {
                      id: 'contacts:read',
                      label: 'contacts:read',
                      desc: 'Query verified contact profiles and consent records',
                    },
                    {
                      id: 'contacts:write',
                      label: 'contacts:write',
                      desc: 'Create and update contacts with consent proof',
                    },
                    {
                      id: 'templates:read',
                      label: 'templates:read',
                      desc: 'Fetch approved Meta message templates and components',
                    },
                    {
                      id: 'webhooks:manage',
                      label: 'webhooks:manage',
                      desc: 'Register and manage real-time delivery event webhooks',
                    },
                  ].map((scope) => (
                    <label
                      key={scope.id}
                      className="flex items-start gap-2.5 cursor-pointer hover:bg-white/60 p-1.5 rounded-[12px] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedScopes.includes(scope.id)}
                        onChange={() => toggleScope(scope.id)}
                        className="mt-0.5 rounded border-[#202020] text-[#72A4F2] focus:ring-[#72A4F2] h-4 w-4"
                      />
                      <div>
                        <span className="font-mono font-bold text-xs text-[#202020] block">
                          {scope.label}
                        </span>
                        <span className="text-[11px] text-[#202020]/60">{scope.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateKeyModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="font-bold">
                  Generate Key
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ONE-TIME SECRET REVEAL
         ========================================================================= */}
      {revealedSecret && (
        <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border-2 border-[#202020] max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-[#ecfdf5] border-2 border-[#202020] flex items-center justify-center text-[#065f46]">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#202020]">
                  API Key Created Successfully
                </h3>
                <p className="text-xs text-[#202020]/60">{revealedSecret.name}</p>
              </div>
            </div>

            <div className="p-3 bg-[#fee2e2] border-2 border-[#E35A4F] rounded-[18px] text-xs text-[#991b1b] flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Important:</strong> Copy your secret API key now. For security reasons,
                this token will <strong>never be shown again</strong> once you close this window.
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#202020]/70 uppercase">
                Your Secret Token:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={revealedSecret.key}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[16px] font-mono text-xs text-[#202020] font-bold select-all"
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleCopySecret(revealedSecret.key)}
                  className="gap-1.5 shrink-0 font-bold"
                >
                  {copiedKey ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => setRevealedSecret(null)}
                className="w-full font-bold"
              >
                I have saved my secret key
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ADD WEBHOOK ENDPOINT
         ========================================================================= */}
      {isAddWebhookModalOpen && (
        <div className="fixed inset-0 bg-[#202020]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border-2 border-[#202020] max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#202020]">
              <div className="flex items-center gap-2">
                <Webhook className="h-5 w-5 text-[#72A4F2]" />
                <h3 className="font-serif font-bold text-base text-[#202020]">
                  Register Webhook Destination
                </h3>
              </div>
              <button
                onClick={() => setIsAddWebhookModalOpen(false)}
                className="text-lg font-black text-[#202020]/60 hover:text-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWebhook} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="font-bold text-[#202020] block mb-1">
                  Destination Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production CRM Delivery Listener"
                  value={webhookName}
                  onChange={(e) => setWebhookName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-1">
                  Target HTTPS URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://api.yourdomain.com/webhooks/whatsapp"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[18px] focus:outline-none font-mono text-xs"
                />
                <p className="text-[11px] text-[#202020]/60 mt-1">
                  Must be an active HTTPS server capable of accepting POST requests and validating HMAC signatures.
                </p>
              </div>

              <div>
                <label className="font-bold text-[#202020] block mb-2">
                  Event Subscriptions *
                </label>
                <div className="space-y-2 bg-[#F9F6F1] border-2 border-[#202020] rounded-[20px] p-3.5">
                  {[
                    { id: 'message.sent', label: 'message.sent', desc: 'Fires when message is accepted by Meta Cloud API' },
                    { id: 'message.delivered', label: 'message.delivered', desc: 'Recipient phone received the message (double grey check)' },
                    { id: 'message.read', label: 'message.read', desc: 'Recipient opened the message (double blue check)' },
                    { id: 'message.failed', label: 'message.failed', desc: 'Message delivery failed or dropped by carrier' },
                    { id: 'customer.inbound_reply', label: 'customer.inbound_reply', desc: 'Inbound WhatsApp text or voice note from customer' },
                    { id: 'contact.opted_out', label: 'contact.opted_out', desc: 'Customer replied STOP or opted out of communications' },
                  ].map((ev) => (
                    <label
                      key={ev.id}
                      className="flex items-start gap-2.5 cursor-pointer hover:bg-white/60 p-1.5 rounded-[12px] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedWebhookEvents.includes(ev.id)}
                        onChange={() => toggleWebhookEvent(ev.id)}
                        className="mt-0.5 rounded border-[#202020] text-[#72A4F2] focus:ring-[#72A4F2] h-4 w-4"
                      />
                      <div>
                        <span className="font-mono font-bold text-xs text-[#202020] block">
                          {ev.label}
                        </span>
                        <span className="text-[11px] text-[#202020]/60">{ev.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddWebhookModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="font-bold">
                  Register Destination
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
