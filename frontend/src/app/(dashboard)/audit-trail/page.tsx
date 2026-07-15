'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, StatsCard, Breadcrumbs } from '@/components/ui';
import { History, Shield, Edit2, Trash2, Plus, Filter, FileArchive } from 'lucide-react';
import { apiGet } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';

interface AuditEntry { id: string; userId: string; userEmail: string; action: string; module: string; recordId: string; recordName: string; oldValues: string; newValues: string; createdAt: string; }

const actionColors: Record<string, string> = {
  CREATE: 'bg-success-light text-success',
  UPDATE: 'bg-info-light text-primary-light',
  DELETE: 'bg-danger-light text-danger',
  LOGIN: 'bg-warning-light text-warning',
};
const actionIcons: Record<string, any> = { CREATE: Plus, UPDATE: Edit2, DELETE: Trash2 };

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterModule) params.set('module', filterModule);
      if (filterAction) params.set('action', filterAction);
      params.set('take', '200');
      setLogs(await apiGet(`/audit-logs?${params.toString()}`));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [filterModule, filterAction]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const modules = [...new Set(logs.map(l => l.module))].sort();

  return (
    <AccessGuard page="settings">
    <div className="animate-fade-in">
      <Breadcrumbs items={[{ label: 'Audit Trail' }]} />
      <PageHeader title="Audit Trail" subtitle="A.8.15 — Complete activity log — who changed what, when" icon={<FileArchive className="w-4 h-4" />} />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6 stagger">
        <StatsCard title="Total Events" value={logs.length} icon={<History className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
        <StatsCard title="Creates" value={logs.filter(l => l.action === 'CREATE').length} icon={<Plus className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
        <StatsCard title="Updates" value={logs.filter(l => l.action === 'UPDATE').length} icon={<Edit2 className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
        <StatsCard title="Deletes" value={logs.filter(l => l.action === 'DELETE').length} icon={<Trash2 className="w-4 h-4 text-danger" />} iconBg="bg-danger-light" />
      </div>
      <div className="flex gap-2 mb-4">
        <select value={filterModule} onChange={e => setFilterModule(e.target.value)} className="px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary hover:border-border-light transition-all">
          <option value="">All Modules</option>
          {modules.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary hover:border-border-light transition-all">
          <option value="">All Actions</option>
          <option value="CREATE">Create</option><option value="UPDATE">Update</option><option value="DELETE">Delete</option>
        </select>
      </div>
      {loading ? <div className="text-center py-16 text-text-muted text-sm">Loading audit logs...</div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase bg-bg/50 w-44">Timestamp</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase bg-bg/50 w-48">User</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase bg-bg/50 w-24">Action</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase bg-bg/50 w-28">Module</th>
                <th className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase bg-bg/50">Record</th>
              </tr></thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-text-muted">No audit logs yet. Activity will be recorded as users make changes.</td></tr>
                ) : logs.map(l => {
                  const Icon = actionIcons[l.action] || Shield;
                  return (
                    <tr key={l.id} className="border-b border-border/50 last:border-0 hover:bg-surface-light/50 transition-colors">
                      <td className="px-4 py-2.5 text-xs text-text-muted font-mono">{new Date(l.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-sm text-text-primary">{l.userEmail || 'System'}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium ${actionColors[l.action] || 'bg-surface-light text-text-muted'}`}>
                          <Icon className="w-3 h-3" />{l.action}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-text-secondary capitalize">{l.module}</td>
                      <td className="px-4 py-2.5 text-sm text-text-primary">{l.recordName || l.recordId || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-border/50 bg-bg/30"><span className="text-[11px] text-text-muted">{logs.length} events</span></div>
        </div>
      )}
    </div>
    </AccessGuard>
  );
}
