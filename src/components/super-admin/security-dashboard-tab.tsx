'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  UserX,
  UserCheck,
  KeyRound,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Clock,
  Laptop,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const SecurityDashboardTab: React.FC = () => {
  const [data, setData] = useState<{
    stats: {
      activeSessions: number;
      activeUsers: number;
      suspendedUsers: number;
      lockedAccounts: number;
      mfaEnforced: boolean;
    };
    events: any[];
    sessions: any[];
    users: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/security');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load security metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (payload: { action: string; userId?: string; sessionId?: string }) => {
    const key = `${payload.action}_${payload.userId || payload.sessionId}`;
    setActionLoading(key);
    try {
      const res = await fetch('/api/super-admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const resJson = await res.json();
      if (resJson.success) {
        await loadData();
      } else {
        alert(resJson.error || 'Action failed');
      }
    } catch {
      alert('Network error executing security action');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredEvents = (data?.events || []).filter((e) => {
    const matchesSeverity = severityFilter === 'all' || e.severity === severityFilter;
    const matchesSearch =
      searchTerm === '' ||
      e.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.userEmail && e.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.ipAddress && e.ipAddress.includes(searchTerm));
    return matchesSeverity && matchesSearch;
  });

  if (loading && !data) {
    return (
      <Card className="p-8 text-center bg-white border-2 border-[#202020] rounded-[20px]">
        <div className="w-8 h-8 border-4 border-[#72A4F2] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-[#202020]">Querying cryptographic audit logs and live sessions...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Health KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 text-xs">
        <Card className="p-5 bg-white border-2 border-[#202020] rounded-[18px] shadow-[4px_4px_0px_#202020]">
          <div className="flex items-center justify-between">
            <span className="text-[#202020]/60 uppercase font-bold text-[10px] tracking-wider">
              Active Sessions
            </span>
            <Laptop className="h-4 w-4 text-[#72A4F2]" />
          </div>
          <div className="text-2xl font-black font-serif text-[#202020] mt-1">
            {data?.stats.activeSessions || 0}
          </div>
          <span className="text-[#065f46] block mt-1 font-bold text-[11px]">
            Server-tracked &amp; revocable
          </span>
        </Card>

        <Card className="p-5 bg-white border-2 border-[#202020] rounded-[18px] shadow-[4px_4px_0px_#202020]">
          <div className="flex items-center justify-between">
            <span className="text-[#202020]/60 uppercase font-bold text-[10px] tracking-wider">
              Account Lockouts
            </span>
            <Lock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black font-serif text-[#202020] mt-1">
            {data?.stats.lockedAccounts || 0}
          </div>
          <span className="text-[#202020]/60 block mt-1 font-medium text-[11px]">
            Brute-force progressive defense
          </span>
        </Card>

        <Card className="p-5 bg-white border-2 border-[#202020] rounded-[18px] shadow-[4px_4px_0px_#202020]">
          <div className="flex items-center justify-between">
            <span className="text-[#202020]/60 uppercase font-bold text-[10px] tracking-wider">
              Suspended Accounts
            </span>
            <UserX className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-2xl font-black font-serif text-red-600 mt-1">
            {data?.stats.suspendedUsers || 0}
          </div>
          <span className="text-[#202020]/60 block mt-1 font-medium text-[11px]">
            {data?.stats.activeUsers || 0} active users permitted
          </span>
        </Card>

        <Card className="p-5 bg-white border-2 border-[#202020] rounded-[18px] shadow-[4px_4px_0px_#202020]">
          <div className="flex items-center justify-between">
            <span className="text-[#202020]/60 uppercase font-bold text-[10px] tracking-wider">
              Privileged MFA Status
            </span>
            <ShieldCheck className="h-4 w-4 text-[#065f46]" />
          </div>
          <div className="text-2xl font-black font-serif text-[#065f46] mt-1">
            Mandatory
          </div>
          <span className="text-[#065f46] block mt-1 font-bold text-[11px]">
            100% Super Admin Coverage
          </span>
        </Card>
      </div>

      {/* Account Security Management */}
      <Card
        title="User Account Security & Access Suspension Control"
        subtitle="Manage progressive brute-force lockouts, verify email statuses, and suspend or restore user accounts"
      >
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#F9F6F1] text-[#202020] uppercase font-bold border-b-2 border-[#202020]">
              <tr>
                <th className="py-3 px-4">User Identity</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Email Status</th>
                <th className="py-3 px-4">Failed Attempts</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Security Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE7]">
              {(data?.users || []).map((u) => {
                const isLocked = u.lockedUntil && new Date(u.lockedUntil) > new Date();
                return (
                  <tr key={u.id} className="hover:bg-[#F9F6F1]/50">
                    <td className="py-3.5 px-4 font-bold text-[#202020]">
                      {u.displayName}
                      <span className="block text-[10px] font-mono font-normal text-[#202020]/50">
                        {u.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      {u.isSuperAdmin ? (
                        <Badge variant="charcoal" size="sm">super_admin</Badge>
                      ) : (
                        <Badge variant="blue" size="sm">{u.role || 'agent'}</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-[#065f46] font-bold">
                          <CheckCircle2Icon className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                          <AlertTriangle className="h-3.5 w-3.5" /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {isLocked ? (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold">
                          LOCKED ({u.failedAttempts} attempts)
                        </span>
                      ) : (
                        <span>{u.failedAttempts || 0} / 5</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {u.status === 'suspended' ? (
                        <Badge variant="red" size="sm">Suspended</Badge>
                      ) : (
                        <Badge variant="green" size="sm">Active</Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      {isLocked && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction({ action: 'unlock_account', userId: u.id })}
                          disabled={actionLoading === `unlock_account_${u.id}`}
                          className="text-[11px] font-bold text-amber-700 border-amber-600 bg-amber-50"
                        >
                          <Unlock className="h-3 w-3 mr-1" /> Unlock
                        </Button>
                      )}
                      {u.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction({ action: 'suspend_user', userId: u.id })}
                          disabled={actionLoading === `suspend_user_${u.id}`}
                          className="text-[11px] font-bold text-red-600 border-red-500 hover:bg-red-50"
                        >
                          <UserX className="h-3 w-3 mr-1" /> Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction({ action: 'reactivate_user', userId: u.id })}
                          disabled={actionLoading === `reactivate_user_${u.id}`}
                          className="text-[11px] font-bold text-green-700 border-green-600 hover:bg-green-50"
                        >
                          <UserCheck className="h-3 w-3 mr-1" /> Reactivate
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Active Server Sessions */}
      <Card
        title="Live Server-Managed User Sessions"
        subtitle="Cryptographically verified active sessions across customer workspaces and administrative portals"
      >
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#F9F6F1] text-[#202020] uppercase font-bold border-b-2 border-[#202020]">
              <tr>
                <th className="py-3 px-4">Session User</th>
                <th className="py-3 px-4">Workspace</th>
                <th className="py-3 px-4">Role &amp; MFA</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Revoke Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE7]">
              {(data?.sessions || []).map((s) => (
                <tr key={s.id} className="hover:bg-[#F9F6F1]/50">
                  <td className="py-3 px-4 font-bold">
                    {s.userName || s.userEmail}
                    <span className="block text-[10px] text-[#202020]/50 font-normal">{s.userEmail}</span>
                  </td>
                  <td className="py-3 px-4 font-medium">{s.tenantName || 'Global Platform'}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-[11px] uppercase mr-2">{s.role}</span>
                    {s.isMfaVerified && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        MFA OK
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px]">{s.ipAddress || '127.0.0.1'}</td>
                  <td className="py-3 px-4 text-[#202020]/60">
                    {new Date(s.lastActiveAt).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAction({ action: 'revoke_session', sessionId: s.id })}
                      disabled={actionLoading === `revoke_session_${s.id}`}
                      className="text-[11px] font-bold text-red-600 border-red-500 hover:bg-red-50"
                    >
                      Revoke
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Security & Audit Events Stream */}
      <Card
        title="Real-Time Security Events & Audit Trail"
        subtitle="Chronological stream of logins, lockouts, token dispatches, and privilege checks"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#202020]">Severity Filter:</span>
            {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-[10px] font-mono text-[10px] font-bold uppercase border border-[#202020] transition-colors ${
                  severityFilter === sev
                    ? 'bg-[#202020] text-[#72A4F2]'
                    : 'bg-white text-[#202020]/70 hover:bg-[#F9F6F1]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-[#202020]/50" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by event or IP..."
              className="pl-8 pr-3 py-1.5 rounded-[10px] border border-[#202020] text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#72A4F2]"
            />
          </div>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#F9F6F1] text-[#202020] uppercase font-bold border-b-2 border-[#202020]">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Event Type</th>
                <th className="py-2.5 px-4">Severity</th>
                <th className="py-2.5 px-4">User / Subject</th>
                <th className="py-2.5 px-4">IP Address</th>
                <th className="py-2.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4EFE7]">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#202020]/50 italic">
                    No security events found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.slice(0, 30).map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#F9F6F1]/50">
                    <td className="py-2.5 px-4 font-mono text-[11px] text-[#202020]/60 whitespace-nowrap">
                      {new Date(ev.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-mono font-bold text-[#202020]">
                      {ev.eventType}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          ev.severity === 'critical'
                            ? 'bg-red-600 text-white'
                            : ev.severity === 'high'
                            ? 'bg-red-100 text-red-800'
                            : ev.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {ev.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-medium">
                      {ev.userEmail || (ev.details && ev.details.email) || 'Anonymous'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px]">
                      {ev.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[10px] text-[#202020]/70 max-w-xs truncate">
                      {JSON.stringify(ev.details || {})}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

function CheckCircle2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

