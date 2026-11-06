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

export default function DeveloperPage() {
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(INITIAL_API_KEYS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [revealedSecret, setRevealedSecret] = useState<{
    name: string;
    key: string;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Form State
  const [keyName, setKeyName] = useState('');
  const [expiration, setExpiration] = useState('never');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'messages:send',
    'contacts:read',
  ]);

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
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

    // Generate cryptographic secret token
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
    setIsCreateModalOpen(false);
    setKeyName('');
    setSelectedScopes(['messages:send', 'contacts:read']);

    // Show one-time secret reveal dialog
    setRevealedSecret({
      name: newKey.name,
      key: fullToken,
    });
  };

  const handleRevokeKey = (id: string) => {
    const target = apiKeys.find((k) => k.id === id);
    if (!target) return;

    if (
      confirm(
        `Are you sure you want to revoke "${target.name}" (${target.prefix}...)? Any external integration using this key will immediately be rejected.`
      )
    ) {
      setApiKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, status: 'revoked' } : k))
      );
    }
  };

  const handleCopySecret = (keyText: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(keyText);
    }
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const activePrefix = apiKeys.find((k) => k.status === 'active')?.prefix || 'rlep_live_sample';

  const curlExample = `curl -X POST "https://api.richrlephant.com/v1/messages" \\
  -H "Authorization: Bearer ${revealedSecret?.key || `${activePrefix}...`}" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order-confirmation-9827" \\
  -d '{
    "phone_number_id": "phone_01JEXAMPLE",
    "to": "+971501234567",
    "type": "template",
    "template": {
      "name": "order_confirmation",
      "language": "en",
      "components": [
        {
          "type": "body",
          "parameters": [
            { "type": "text", "text": "ORD-9827" },
            { "type": "text", "text": "AED 250.00" }
          ]
        }
      ]
    }
  }'`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-[#202020] tracking-tight">
            Developer & Public REST API
          </h2>
          <p className="text-xs text-[#202020]/70 mt-1">
            Integrate your CRM, ERP, and backend services with our authenticated versioned REST API.
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="gap-2 font-bold"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusCircle className="h-4 w-4" />
          Create New API Key
        </Button>
      </div>

      {/* API Keys Table */}
      <Card title="Active API Keys" subtitle="Bearer tokens hashed with SHA-256 in storage">
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
                        className="text-[#E35A4F] hover:underline font-bold text-xs"
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

      {/* Code Sample */}
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

      {/* MODAL 1: CREATE API KEY */}
      {isCreateModalOpen && (
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
                onClick={() => setIsCreateModalOpen(false)}
                className="text-lg font-black text-[#202020]/60 hover:text-black"
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
                  onClick={() => setIsCreateModalOpen(false)}
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

      {/* MODAL 2: ONE-TIME SECRET REVEAL */}
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
    </div>
  );
}
