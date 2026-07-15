'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select,
  TextArea, ConfirmDialog, Breadcrumbs, CommentsPanel, toast,
} from '@/components/ui';
import {
  Scale, Plus, CheckCircle, Clock, XCircle, Trash2, Edit2,
  Download, FileText, Search, X, Shield, User, BookOpen,
  AlertCircle, FileCheck, Link2, Activity,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { useAuth } from '@/context/AuthContext';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface Compliance {
  id: string; clause: string; requirement: string; status: string;
  evidence: string; owner: string; notes: string;
  createdAt: string; updatedAt: string;
}

const EMPTY = { clause: '', requirement: '', status: 'Not Started', evidence: '', owner: '', notes: '' };

function statusCfg(s: string) {
  if (s === 'Compliant')     return { color: 'text-success',    bg: 'bg-success/10',    border: 'border-success/30',    dot: 'bg-success' };
  if (s === 'In Progress')   return { color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/30',    dot: 'bg-primary' };
  if (s === 'Non-Compliant') return { color: 'text-danger',     bg: 'bg-danger/10',     border: 'border-danger/30',     dot: 'bg-danger' };
  return                            { color: 'text-text-muted', bg: 'bg-surface-light', border: 'border-border',        dot: 'bg-text-muted/30' };
}

function PanelField({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value?: string | null; accent?: string }) {
  return (
    <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-3">
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
        <Icon className="w-3 h-3" />{label}
      </p>
      <p className={`text-sm font-medium leading-snug ${value ? (accent || 'text-text-primary') : 'text-text-muted/40'}`}>
        {value || '—'}
      </p>
    </div>
  );
}

const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function CompliancePage() {
  const { user } = useAuth();
  const [items, setItems]           = useState<Compliance[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm]             = useState(EMPTY);
  const [selected, setSelected]     = useState<Compliance | null>(null);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = useCallback(async () => {
    try { setItems(await apiGet('/compliance')); } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => items.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.clause.toLowerCase().includes(q) || c.requirement.toLowerCase().includes(q) || (c.owner || '').toLowerCase().includes(q);
    const matchS = !filterStatus || c.status === filterStatus;
    return matchQ && matchS;
  }), [items, search, filterStatus]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (c: Compliance) => {
    setEditingId(c.id);
    setForm({ clause: c.clause, requirement: c.requirement || '', status: c.status || 'Not Started', evidence: c.evidence || '', owner: c.owner || '', notes: c.notes || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clause.trim()) return;
    try {
      if (editingId) await apiPut(`/compliance/${editingId}`, form);
      else await apiPost('/compliance', form);
      setShowModal(false); load(); toast('Requirement saved', 'success');
    } catch (err: any) { toast(err?.message || 'Failed to save', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/compliance/${id}`); load(); toast('Requirement deleted', 'success'); if (selected?.id === id) setSelected(null); }
    catch (err: any) { toast(err?.message || 'Failed to delete', 'error'); }
  };

  const total = items.length;
  const compliant = items.filter(c => c.status === 'Compliant').length;
  const inProgress = items.filter(c => c.status === 'In Progress').length;
  const nonCompliant = items.filter(c => c.status === 'Non-Compliant').length;

  return (
    <AccessGuard page="compliance">
      <div className="animate-fade-in">
        <Breadcrumbs items={[{ label: 'Compliance Tracking' }]} />
        <PageHeader
          title="Compliance Tracking"
          subtitle="ISO 27001 — Clause-level compliance status and evidence"
          icon={<Activity className="w-4 h-4" />}
          action={
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => exportToCSV(items, 'compliance', [
                { key: 'clause', label: 'Clause' }, { key: 'requirement', label: 'Requirement' },
                { key: 'status', label: 'Status' }, { key: 'owner', label: 'Owner' },
              ])}><Download className="w-3.5 h-3.5" /> CSV</Button>
              <Button variant="ghost" onClick={() => exportToPDF('Compliance Tracking', 'ISO 27001 Compliance Status', items, [
                { key: 'clause', label: 'Clause' }, { key: 'requirement', label: 'Requirement' },
                { key: 'status', label: 'Status' }, { key: 'owner', label: 'Owner' },
              ])}><FileText className="w-3.5 h-3.5" /> PDF</Button>
              <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Requirement</Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger">
          <StatsCard title="Total Requirements" value={total} icon={<Scale className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
          <StatsCard title="Compliant" value={compliant} icon={<CheckCircle className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
          <StatsCard title="In Progress" value={inProgress} icon={<Clock className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
          <StatsCard title="Non-Compliant" value={nonCompliant} icon={<XCircle className="w-4 h-4 text-danger" />} iconBg="bg-danger-light" />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input className="bg-transparent text-sm flex-1 outline-none text-text-primary placeholder:text-text-muted/50"
              placeholder="Search clause, requirement, owner…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')}><X className="w-3 h-3 text-text-muted hover:text-text-primary" /></button>}
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Statuses</option>
            <option>Not Started</option><option>In Progress</option>
            <option>Compliant</option><option>Non-Compliant</option>
          </select>
        </div>

        {/* Table — full width */}
        {loading ? (
          <div className="text-center py-16 text-text-muted text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No requirements found" description="Add compliance requirements to track ISO 27001 clause adherence."
            icon={<Scale className="w-7 h-7 text-primary/40" />}
            action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Requirement</Button>} />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Clause', 'Requirement', 'Status', 'Owner', 'Evidence', ''].map(h =>
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wider bg-bg/50">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const sc = statusCfg(c.status);
                  const active = selected?.id === c.id;
                  return (
                    <tr key={c.id}
                      onClick={() => setSelected(active ? null : c)}
                      className={`border-b border-border/50 last:border-0 cursor-pointer transition-colors group ${active ? 'bg-primary/5' : 'hover:bg-surface-light/50'}`}>
                      <td className="px-4 py-3 text-sm font-mono text-primary font-semibold whitespace-nowrap">{c.clause}</td>
                      <td className="px-4 py-3 text-sm text-text-primary max-w-xs">
                        <p className="truncate">{c.requirement}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${sc.bg} ${sc.color} border ${sc.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">{c.owner || '—'}</td>
                      <td className="px-4 py-3 text-sm text-text-muted max-w-[160px] truncate">{c.evidence || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all justify-end">
                          <button onClick={e => { e.stopPropagation(); openEdit(c); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-info-light transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); setConfirmDelete(c.id); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger-light transition-all">
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
              <span className="text-[11px] text-text-muted">{filtered.length} of {total} requirement{total !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* ── Detail Side Panel (slide-in) ── */}
        {selected && (() => {
          const sc = statusCfg(selected.status);
          return (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
              <div className="fixed top-0 right-0 w-[560px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel overflow-hidden" style={{ maxHeight: '100vh' }}>
                {/* Status accent bar */}
                <div className={`h-1 w-full flex-shrink-0 ${sc.dot}`} />

                {/* Header */}
                <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-border">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-mono font-bold text-primary bg-primary/8 px-2 py-0.5 rounded mb-2 inline-block border border-primary/20">
                        {selected.clause}
                      </span>
                      <h2 className="text-base font-bold text-text-primary leading-snug mt-1">{selected.requirement}</h2>
                    </div>
                    <button onClick={() => setSelected(null)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${sc.bg} ${sc.color} border ${sc.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{selected.status}
                  </span>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-6 py-4 space-y-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                  <div className="grid grid-cols-2 gap-2.5">
                    <PanelField icon={User}      label="Owner"   value={selected.owner} />
                    <PanelField icon={Scale}     label="Created" value={fmt(selected.createdAt)} />
                    <PanelField icon={Clock}     label="Updated" value={fmt(selected.updatedAt)} />
                    <PanelField icon={Link2}     label="Evidence Ref" value={selected.evidence} />
                  </div>

                  {selected.evidence && (
                    <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-3">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <FileCheck className="w-3 h-3" /> Evidence
                      </p>
                      <p className="text-sm text-text-primary leading-relaxed">{selected.evidence}</p>
                    </div>
                  )}

                  {selected.notes && (
                    <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-3">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" /> Notes
                      </p>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.notes}</p>
                    </div>
                  )}

                  <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-3">
                    <CommentsPanel module="compliance" recordId={selected.id} apiGet={apiGet} apiPost={apiPost} apiDelete={apiDelete} user={user} />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 flex items-center gap-2 px-6 py-3 border-t border-border">
                  <Button onClick={() => openEdit(selected)} className="flex-1 justify-center">
                    <Edit2 className="w-3.5 h-3.5" /> Edit Requirement
                  </Button>
                  <Button variant="secondary" onClick={() => setConfirmDelete(selected.id)}
                    className="text-danger hover:text-danger hover:bg-danger/10 hover:border-danger/30">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </div>
            </>
          );
        })()}

        {/* Modal */}
        <Modal open={showModal} onClose={() => setShowModal(false)}
          title={editingId ? 'Edit Requirement' : 'Add Compliance Requirement'} size="lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input label="Clause / Reference *" placeholder="e.g. GDPR Art. 32, ISO 27001 A.5.31"
              value={form.clause} onChange={e => setForm(p => ({ ...p, clause: e.target.value }))} />
            <TextArea label="Requirement" rows={2} placeholder="Describe the requirement"
              value={form.requirement} onChange={e => setForm(p => ({ ...p, requirement: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option>Not Started</option><option>In Progress</option>
                <option>Compliant</option><option>Non-Compliant</option>
              </Select>
              <Input label="Owner" placeholder="Responsible person"
                value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} />
            </div>
            <Input label="Evidence" placeholder="Link or reference to evidence"
              value={form.evidence} onChange={e => setForm(p => ({ ...p, evidence: e.target.value }))} />
            <TextArea label="Notes" rows={2} placeholder="Additional notes"
              value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
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
