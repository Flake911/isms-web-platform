'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select, TextArea, ConfirmDialog, Breadcrumbs, DueDateBadge, CommentsPanel, toast } from '@/components/ui';
import { ClipboardCheck, Plus, CheckCircle, Clock, Trash2, Edit2, Download, FileText, Search, X, AlertTriangle, Calendar, User, Layers, XCircle, BookOpen, Flag } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { useAuth } from '@/context/AuthContext';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface Audit {
  id: string; title: string; scope?: string; auditor?: string;
  status: string; type: string; findings?: string;
  startDate?: string | null; endDate?: string | null;
  createdAt: string; updatedAt: string;
}

const EMPTY = {
  title: '', scope: '', auditor: '', status: 'Planned',
  type: 'Internal', findings: '',
  startDate: '', endDate: '',
};

const statusCfg = (s: string) => {
  if (s === 'Completed')   return { color: 'text-success',      bg: 'bg-success/10',  dot: 'bg-success' };
  if (s === 'In Progress') return { color: 'text-primary',      bg: 'bg-primary/10',  dot: 'bg-primary' };
  if (s === 'Cancelled')   return { color: 'text-text-muted',   bg: 'bg-surface-light', dot: 'bg-text-muted' };
  return                          { color: 'text-warning',      bg: 'bg-warning/10',  dot: 'bg-warning' };
};

const typeCfg = (t: string) => {
  if (t === 'Certification')  return 'bg-primary/10 text-primary border-primary/20';
  if (t === 'External')       return 'bg-accent/10 text-accent border-accent/20';
  if (t === 'Surveillance')   return 'bg-warning/10 text-warning border-warning/20';
  return                             'bg-surface-light text-text-secondary border-border/50';
};

function PanelField({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value?: string | null; accent?: string }) {
  return (
    <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-3">
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
        <Icon className="w-3 h-3" />{label}
      </p>
      <p className={`text-sm font-medium leading-snug ${value ? (accent || 'text-text-primary') : 'text-text-muted/40'}`}>{value || '—'}</p>
    </div>
  );
}

const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

export default function AuditsPage() {
  const { user } = useAuth();
  const [items, setItems]               = useState<Audit[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selected, setSelected]         = useState<Audit | null>(null);
  const [form, setForm]                 = useState<typeof EMPTY>(EMPTY);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType]     = useState('');

  const fetch_ = useCallback(async () => {
    try { setItems(await apiGet('/audits')); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch_(); }, [fetch_]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (a: Audit) => {
    setEditingId(a.id);
    setForm({
      title: a.title, scope: a.scope || '', auditor: a.auditor || '',
      status: a.status || 'Planned', type: a.type || 'Internal',
      findings: a.findings || '',
      startDate: a.startDate ? a.startDate.split('T')[0] : '',
      endDate: a.endDate ? a.endDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.title.trim()) return;
    const payload: any = {
      ...form,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate:   form.endDate   ? new Date(form.endDate).toISOString()   : null,
    };
    try {
      if (editingId) await apiPut(`/audits/${editingId}`, payload);
      else await apiPost('/audits', payload);
      setShowModal(false); fetch_(); toast('Audit saved', 'success');
      if (selected?.id === editingId) setSelected(null);
    } catch (e: any) { toast(e?.message || 'Failed to save audit', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/audits/${id}`); fetch_(); toast('Audit deleted', 'success');
      if (selected?.id === id) setSelected(null);
    } catch (e: any) { toast(e?.message || 'Failed to delete', 'error'); }
  };

  const f = (k: string) => (e: React.ChangeEvent<any>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const filtered = useMemo(() => items.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.title.toLowerCase().includes(q) || (a.auditor || '').toLowerCase().includes(q) || (a.scope || '').toLowerCase().includes(q);
    const matchStatus = !filterStatus || a.status === filterStatus;
    const matchType   = !filterType   || a.type === filterType;
    return matchSearch && matchStatus && matchType;
  }), [items, search, filterStatus, filterType]);

  const csvCols = [
    { key: 'title', label: 'Title' }, { key: 'type', label: 'Type' },
    { key: 'auditor', label: 'Auditor' }, { key: 'status', label: 'Status' },
    { key: 'startDate', label: 'Start' }, { key: 'endDate', label: 'End' },
  ];

  return (
    <AccessGuard page="audits">
    <div className="animate-fade-in">
      <Breadcrumbs items={[{ label: 'Audit Management' }]} />
      <PageHeader
        title="Audit Management"
        subtitle="Clause 9.2 — Internal Audit Program"
        icon={<ClipboardCheck className="w-4 h-4" />}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => exportToCSV(items, 'audits', csvCols)}><Download className="w-3.5 h-3.5" /> CSV</Button>
            <Button variant="ghost" onClick={() => exportToPDF('Audit Management', 'Clause 9.2', items, csvCols)}><FileText className="w-3.5 h-3.5" /> PDF</Button>
            <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Schedule Audit</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6 stagger">
        <StatsCard title="Total"       value={items.length}                                           icon={<ClipboardCheck className="w-4 h-4 text-text-muted" />}  iconBg="bg-surface-light" />
        <StatsCard title="Planned"     value={items.filter(a => a.status === 'Planned').length}       icon={<Clock className="w-4 h-4 text-warning" />}              iconBg="bg-warning/10" />
        <StatsCard title="In Progress" value={items.filter(a => a.status === 'In Progress').length}   icon={<Layers className="w-4 h-4 text-primary" />}             iconBg="bg-primary/10" />
        <StatsCard title="Completed"   value={items.filter(a => a.status === 'Completed').length}     icon={<CheckCircle className="w-4 h-4 text-success" />}        iconBg="bg-success/10" />
        <StatsCard title="Certification" value={items.filter(a => a.type === 'Certification').length} icon={<Flag className="w-4 h-4 text-primary" />}              iconBg="bg-primary/10" />
      </div>

      {/* Search & Filters */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 flex-1 min-w-[200px] bg-bg border border-border rounded-lg hover:border-border-light focus-within:border-primary/50 transition-all">
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none border-none focus:ring-0 min-w-0"
              placeholder="Search audits, auditors, scope..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-text-muted hover:text-danger" /></button>}
          </div>
          <select className="px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary hover:border-border-light focus:outline-none focus:border-primary/50 transition-all"
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option>Planned</option><option>In Progress</option><option>Completed</option><option>Cancelled</option>
          </select>
          <select className="px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary hover:border-border-light focus:outline-none focus:border-primary/50 transition-all"
            value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option>Internal</option><option>External</option><option>Certification</option><option>Surveillance</option>
          </select>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-text-muted text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState title="No audits scheduled" description="Plan and track internal and external audits against your ISMS as required by ISO 27001:2022 Clause 9.2." icon={<ClipboardCheck className="w-7 h-7 text-primary/30" />} action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Schedule Audit</Button>} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">No audits match your filters.</div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-bg/50">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Audit</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Type</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Auditor</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Start Date</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">End Date</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const sc = statusCfg(a.status);
                return (
                  <tr key={a.id} onClick={() => setSelected(a)}
                    className="border-b border-border/40 last:border-0 hover:bg-surface-light/50 transition-colors cursor-pointer group">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text-primary">{a.title}</p>
                      {a.scope && <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{a.scope}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-md border ${typeCfg(a.type)}`}>{a.type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${sc.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        <span className={`text-[11px] font-semibold ${sc.color}`}>{a.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">{a.auditor || '—'}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{fmt(a.startDate) || '—'}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{fmt(a.endDate) || '—'}</td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEdit(a)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setConfirmDelete(a.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-border/50 bg-bg/30">
            <span className="text-[11px] text-text-muted">{filtered.length} of {items.length} audit{items.length !== 1 ? 's' : ''} — click any row to view details</span>
          </div>
        </div>
      )}

      {/* Detail Side Panel */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
          <div className="fixed top-0 right-0 max-h-screen w-[640px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel">
            <div className="h-1 w-full bg-gradient-to-r from-primary to-accent shrink-0" />
            <div className="px-7 py-5 border-b border-border bg-bg/60 flex items-start justify-between gap-4 shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-md border ${typeCfg(selected.type)}`}>{selected.type}</span>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusCfg(selected.status).bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg(selected.status).dot}`} />
                    <span className={`text-[11px] font-semibold ${statusCfg(selected.status).color}`}>{selected.status}</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-text-primary leading-snug">{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-7 pt-5 pb-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <PanelField icon={User}     label="Auditor"    value={selected.auditor} />
                <PanelField icon={Calendar} label="Start Date" value={fmt(selected.startDate)} />
                <PanelField icon={Calendar} label="End Date"   value={fmt(selected.endDate)} />
              </div>
              {selected.scope && (
                <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><Layers className="w-3 h-3" />Audit Scope</p>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.scope}</p>
                </div>
              )}
              {selected.findings && (
                <div className="bg-warning/5 rounded-xl border border-warning/20 p-4">
                  <p className="text-[10px] font-semibold text-warning uppercase tracking-wider mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" />Findings</p>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.findings}</p>
                </div>
              )}
              <CommentsPanel module="audits" recordId={selected.id} apiGet={apiGet} apiPost={apiPost} apiDelete={apiDelete} user={user} />
            </div>
            <div className="flex items-center gap-2 px-6 py-4 border-t border-border flex-shrink-0">
              <Button onClick={() => openEdit(selected)} className="flex-1 justify-center"><Edit2 className="w-3.5 h-3.5" /> Edit Audit</Button>
              <button onClick={() => setConfirmDelete(selected.id)} className="px-4 py-2 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-all text-sm font-medium flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Audit' : 'Schedule Audit'} size="lg">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Audit Title *" placeholder="e.g. Annual Internal ISMS Audit 2026" value={form.title} onChange={f('title')} required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" value={form.type} onChange={f('type')}>
              <option>Internal</option><option>External</option><option>Certification</option><option>Surveillance</option>
            </Select>
            <Select label="Status" value={form.status} onChange={f('status')}>
              <option>Planned</option><option>In Progress</option><option>Completed</option><option>Cancelled</option>
            </Select>
          </div>
          <Input label="Lead Auditor" placeholder="Name of the lead auditor" value={form.auditor} onChange={f('auditor')} />
          <TextArea label="Audit Scope" rows={2} placeholder="What systems, processes, and clauses are in scope?" value={form.scope} onChange={f('scope')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.startDate} onChange={f('startDate')} />
            <Input label="End Date"   type="date" value={form.endDate}   onChange={f('endDate')} />
          </div>
          <TextArea label="Findings" rows={3} placeholder="Key findings, nonconformities, and observations..." value={form.findings} onChange={f('findings')} />
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">{editingId ? 'Save Changes' : 'Schedule Audit'}</Button>
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:bg-surface-light transition-all">Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} title="Delete Audit" message="Are you sure you want to delete this audit?"
        onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete); setConfirmDelete(null); }}
        onClose={() => setConfirmDelete(null)} />
    </div>
    </AccessGuard>
  );
}
