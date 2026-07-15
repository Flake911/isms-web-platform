'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select,
  TextArea, ConfirmDialog, Breadcrumbs, CommentsPanel, toast,
} from '@/components/ui';
import {
  AlertTriangle, Plus, Shield, Zap, Eye, Edit2, Trash2,
  Download, FileText, Search, X, User, Link2, Radio, Tag,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { useAuth } from '@/context/AuthContext';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface ThreatEntry {
  id: string; title: string; source?: string; description?: string;
  severity: string; relevance: string; linkedRisks?: string;
  linkedControls?: string; status: string;
  createdAt: string; updatedAt: string;
}

const EMPTY = {
  title: '', source: '', description: '', severity: 'Medium',
  relevance: 'High', linkedRisks: '', linkedControls: '', status: 'Active',
};

function sevCfg(s: string) {
  if (s === 'Critical') return { color: 'text-danger',     bg: 'bg-danger/10',     bar: 'bg-danger',   dot: 'bg-danger' };
  if (s === 'High')     return { color: 'text-warning',    bg: 'bg-warning/10',    bar: 'bg-warning',  dot: 'bg-warning' };
  if (s === 'Medium')   return { color: 'text-primary',    bg: 'bg-primary/10',    bar: 'bg-primary',  dot: 'bg-primary' };
  return                       { color: 'text-text-muted', bg: 'bg-surface-light', bar: 'bg-success',  dot: 'bg-success' };
}

function statusCfg(s: string) {
  if (s === 'Mitigated')  return { color: 'text-success',    bg: 'bg-success/10',    dot: 'bg-success' };
  if (s === 'Monitoring') return { color: 'text-warning',    bg: 'bg-warning/10',    dot: 'bg-warning' };
  if (s === 'Active')     return { color: 'text-danger',     bg: 'bg-danger/10',     dot: 'bg-danger' };
  return                         { color: 'text-text-muted', bg: 'bg-surface-light', dot: 'bg-text-muted/30' };
}

function PanelField({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-3">
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
        <Icon className="w-3 h-3" />{label}
      </p>
      <p className={`text-sm font-medium leading-snug ${value ? 'text-text-primary' : 'text-text-muted/40'}`}>
        {value || '—'}
      </p>
    </div>
  );
}

export default function ThreatsPage() {
  const { user } = useAuth();
  const [items, setItems]           = useState<ThreatEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm]             = useState(EMPTY);
  const [selected, setSelected]     = useState<ThreatEntry | null>(null);
  const [search, setSearch]         = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus]     = useState('');

  const load = useCallback(async () => {
    try { setItems(await apiGet('/threats')); } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => items.filter(t => {
    const q = search.toLowerCase();
    const matchQ = !q || t.title.toLowerCase().includes(q) || (t.source || '').toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q);
    const matchSev = !filterSeverity || t.severity === filterSeverity;
    const matchSt  = !filterStatus  || t.status === filterStatus;
    return matchQ && matchSev && matchSt;
  }), [items, search, filterSeverity, filterStatus]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (item: ThreatEntry) => {
    setEditingId(item.id);
    setForm({ title: item.title, source: item.source || '', description: item.description || '', severity: item.severity, relevance: item.relevance, linkedRisks: item.linkedRisks || '', linkedControls: item.linkedControls || '', status: item.status });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      if (editingId) await apiPut(`/threats/${editingId}`, form);
      else await apiPost('/threats', form);
      setShowModal(false); load(); toast('Threat saved', 'success');
    } catch (err: any) { toast(err?.message || 'Failed to save', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/threats/${id}`); load(); toast('Threat deleted', 'success'); if (selected?.id === id) setSelected(null); }
    catch (err: any) { toast(err?.message || 'Failed to delete', 'error'); }
  };

  const active = items.filter(i => i.status === 'Active').length;
  const critical = items.filter(i => i.severity === 'Critical').length;
  const monitoring = items.filter(i => i.status === 'Monitoring').length;
  const mitigated = items.filter(i => i.status === 'Mitigated').length;

  return (
    <AccessGuard page="threats">
      <div className="animate-fade-in">
        <Breadcrumbs items={[{ label: 'Threat Intelligence' }]} />
        <PageHeader
          title="Threat Intelligence"
          subtitle="A.5.7 — Collecting, analysing and actioning threat information"
          icon={<AlertTriangle className="w-4 h-4" />}
          action={
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => exportToCSV(items, 'threats', [
                { key: 'title', label: 'Threat' }, { key: 'source', label: 'Source' },
                { key: 'severity', label: 'Severity' }, { key: 'relevance', label: 'Relevance' }, { key: 'status', label: 'Status' },
              ])}><Download className="w-3.5 h-3.5" /> CSV</Button>
              <Button variant="ghost" onClick={() => exportToPDF('Threat Intelligence', 'A.5.7', items, [
                { key: 'title', label: 'Threat' }, { key: 'source', label: 'Source' },
                { key: 'severity', label: 'Severity' }, { key: 'status', label: 'Status' },
              ])}><FileText className="w-3.5 h-3.5" /> PDF</Button>
              <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Threat</Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger">
          <StatsCard title="Active Threats" value={active} icon={<AlertTriangle className="w-4 h-4 text-danger" />} iconBg="bg-danger-light" />
          <StatsCard title="Critical" value={critical} icon={<Zap className="w-4 h-4 text-danger" />} iconBg="bg-danger-light" />
          <StatsCard title="Monitoring" value={monitoring} icon={<Eye className="w-4 h-4 text-warning" />} iconBg="bg-warning-light" />
          <StatsCard title="Mitigated" value={mitigated} icon={<Shield className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input className="bg-transparent text-sm flex-1 outline-none text-text-primary placeholder:text-text-muted/50"
              placeholder="Search threat, source, description…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')}><X className="w-3 h-3 text-text-muted hover:text-text-primary" /></button>}
          </div>
          <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Severities</option>
            <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Statuses</option>
            <option>Active</option><option>Monitoring</option><option>Mitigated</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-text-muted text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No threats recorded" description="Track cybersecurity threats, sources, relevance, and link to risks and controls."
            icon={<AlertTriangle className="w-7 h-7 text-danger/40" />}
            action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Threat</Button>} />
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg/50">
                  {['', 'Threat', 'Source', 'Severity', 'Relevance', 'Status', ''].map((h, i) =>
                    <th key={i} className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const sc  = sevCfg(t.severity);
                  const stc = statusCfg(t.status);
                  return (
                    <tr key={t.id}
                      onClick={() => setSelected(t)}
                      className="border-b border-border/40 last:border-0 cursor-pointer transition-colors group hover:bg-surface-light/50">
                      <td className="pl-3 pr-0 py-3 w-1">
                        <div className={`w-1 h-8 rounded-full ${sc.bar}`} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-text-primary">{t.title}</p>
                        {t.description && <p className="text-xs text-text-muted truncate mt-0.5 max-w-xs">{t.description}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">{t.source || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{t.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${t.relevance === 'High' ? 'bg-danger/10 text-danger' : t.relevance === 'Medium' ? 'bg-warning/10 text-warning' : 'bg-surface-light text-text-muted'}`}>
                          {t.relevance}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${stc.bg} ${stc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${stc.dot}`} />{t.status}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => openEdit(t)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setConfirmDelete(t.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-2.5 border-t border-border/50 bg-bg/30">
              <span className="text-[11px] text-text-muted">{filtered.length} of {items.length} threat{items.length !== 1 ? 's' : ''} — click any row to view details</span>
            </div>
          </div>
        )}

        {/* Detail Side Panel */}
        {selected && (() => {
          const sc  = sevCfg(selected.severity);
          const stc = statusCfg(selected.status);
          const sevHex = selected.severity === 'Critical' ? '#ef4444'
            : selected.severity === 'High'     ? '#f59e0b'
            : selected.severity === 'Medium'   ? '#6366f1'
            : '#10b981';
          return (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
              <div className="fixed top-0 right-0 w-[560px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel overflow-hidden" style={{ maxHeight: '100vh' }}>

                {/* Severity accent bar */}
                <div className="h-1 w-full flex-shrink-0" style={{ background: sevHex }} />

                {/* Header */}
                <div className="px-6 py-5 border-b border-border bg-bg/60 flex items-start justify-between gap-4 flex-shrink-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{selected.severity}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${stc.bg} ${stc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${stc.dot}`} />{selected.status}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${selected.relevance === 'High' ? 'bg-danger/10 text-danger border border-danger/20' : selected.relevance === 'Medium' ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-surface-light text-text-muted border border-border'}`}>
                        {selected.relevance} Relevance
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-text-primary leading-snug">{selected.title}</h2>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-6 py-4 space-y-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>

                  {/* Description */}
                  {selected.description && (
                    <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Eye className="w-3 h-3" />Description
                      </p>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                    </div>
                  )}

                  {/* Fields grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <PanelField icon={Radio}         label="Source"    value={selected.source} />
                    <PanelField icon={Tag}           label="Relevance" value={selected.relevance} />
                  </div>

                  {/* Linked risks / controls */}
                  {(selected.linkedRisks || selected.linkedControls) && (
                    <div className="grid grid-cols-2 gap-3">
                      {selected.linkedRisks && (
                        <div className="bg-danger/5 rounded-xl border border-danger/15 p-4">
                          <p className="text-[10px] font-semibold text-danger uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" />Linked Risks
                          </p>
                          <p className="text-sm text-text-secondary leading-relaxed">{selected.linkedRisks}</p>
                        </div>
                      )}
                      {selected.linkedControls && (
                        <div className="bg-success/5 rounded-xl border border-success/15 p-4">
                          <p className="text-[10px] font-semibold text-success uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Shield className="w-3 h-3" />Linked Controls
                          </p>
                          <p className="text-sm text-text-secondary leading-relaxed">{selected.linkedControls}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comments */}
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                    <CommentsPanel module="threats" recordId={selected.id} apiGet={apiGet} apiPost={apiPost} apiDelete={apiDelete} user={user} />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-bg/60 flex gap-3 flex-shrink-0">
                  <button onClick={() => openEdit(selected)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all">
                    <Edit2 className="w-4 h-4" /> Edit Threat
                  </button>
                  <button onClick={() => setConfirmDelete(selected.id)}
                    className="px-5 py-2.5 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-all text-sm font-medium flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </>
          );
        })()}

        {/* Modal */}
        <Modal open={showModal} onClose={() => setShowModal(false)}
          title={editingId ? 'Edit Threat' : 'Add Threat'} size="lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input label="Threat Title *" placeholder="e.g. Ransomware campaign targeting healthcare"
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <Input label="Source" placeholder="e.g. CERT advisory, vendor bulletin, pen test"
              value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))} />
            <TextArea label="Description" rows={2} placeholder="Describe the threat"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Severity" value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))}>
                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
              </Select>
              <Select label="Relevance" value={form.relevance} onChange={e => setForm(p => ({ ...p, relevance: e.target.value }))}>
                <option>High</option><option>Medium</option><option>Low</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Linked Risks" placeholder="e.g. RSK-001, RSK-002" value={form.linkedRisks} onChange={e => setForm(p => ({ ...p, linkedRisks: e.target.value }))} />
              <Input label="Linked Controls" placeholder="e.g. A.8.7, A.8.8" value={form.linkedControls} onChange={e => setForm(p => ({ ...p, linkedControls: e.target.value }))} />
            </div>
            <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option>Active</option><option>Monitoring</option><option>Mitigated</option>
            </Select>
            <div className="flex gap-2 pt-2">
              <Button type="submit">{editingId ? 'Update' : 'Save'}</Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)}
          onConfirm={() => { if (confirmDelete) { handleDelete(confirmDelete); setConfirmDelete(null); } }} />
      </div>
    </AccessGuard>
  );
}
