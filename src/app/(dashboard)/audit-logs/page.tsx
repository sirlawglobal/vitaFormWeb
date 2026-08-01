'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScrollText, ShieldAlert, Terminal, RefreshCw, Loader2, Wifi, WifiOff } from 'lucide-react';
import { formatDate, extractDataArray } from '@/lib/utils';
import { SystemAuditLog } from '@/types';
import { adminApi } from '@/lib/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<SystemAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data: any = await adminApi.getAuditLogs();
      const liveData = extractDataArray(data);
      setLogs(liveData);
      setIsLive(true);
    } catch (err: any) {
      console.warn('[AuditLogs] Live fetch failed:', err);
      setIsLive(false);
      setErrorMsg(err.message || '401 Unauthorized (Auth Token required)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100">System Audit Stream</h1>
            {isLive ? (
              <Badge status="active" className="gap-1">
                <Wifi className="h-3 w-3" /> Live Backend
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-slate-400 border-slate-700 bg-slate-800/50">
                <WifiOff className="h-3 w-3" /> Offline
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracking admin actions from <code className="text-emerald-400 font-mono">https://vitaformapi-tx0e.onrender.com/api/v1/admin/audit-logs</code>
          </p>
        </div>
        <button 
          onClick={fetchAuditLogs}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-slate-700 hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Fetching Live...' : 'Refresh Stream'}</span>
        </button>
      </div>

      {errorMsg && !isLive && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300 flex items-center justify-between">
          <span><strong>Notice:</strong> Endpoint returned <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono">{errorMsg}</code>. Please sign in with an admin account to view live audit logs.</span>
        </div>
      )}

      {/* Log Feed Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-4 font-sans">Timestamp</th>
                <th className="py-3.5 px-4 font-sans">Admin User</th>
                <th className="py-3.5 px-4 font-sans">Action</th>
                <th className="py-3.5 px-4 font-sans">Target Resource</th>
                <th className="py-3.5 px-4 font-sans">Execution Details</th>
                <th className="py-3.5 px-4 font-sans text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">{formatDate(log.timestamp)}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-400">{log.adminEmail || (log as any).userEmail || 'System'}</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-200 border border-slate-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-200 font-semibold">{log.resource || (log as any).entity || 'N/A'}</td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">{log.details || JSON.stringify((log as any).meta || '')}</td>
                  <td className="py-3.5 px-4 text-right text-slate-500 text-[11px]">{log.ipAddress || (log as any).ip || '127.0.0.1'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
