'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select, TextArea, ConfirmDialog, Breadcrumbs, DueDateBadge, CommentsPanel, toast } from '@/components/ui';
import { Wrench, Plus, CheckCircle, Clock, Trash2, Edit2, AlertTriangle, Download, FileText, Search, X, User, Calendar, Bug, Shield, Layers, Activity, Repeat } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { useAuth } from '@/context/AuthContext';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface CAPA {
  id: string; title: string; type: string; source?: string;
  description?: string; rootCause?: string; action?: string;
  status: string; owner?: string;
  dueDate?: string | null; closedAt?: string | null;
  createdAt: string; updatedAt: string;
}

const EMPTY = {
  title: '', type: 'Corrective', source: 'Audit Finding',
  description: '', rootCause: '', action: '',
  status: 'Open', owner: '', dueDate: '', closedAt: '',
};

const SOURCES = ['Audit Finding', 'Incident', 'Management Review', 'Risk Assessment', 'Vulnerability', 'Customer Complaint', 'Regulatory Requirement', 'Internal Observation'];

const typeCfg = (t: string) =>
  t === 'Corrective' ? { color: 'text-danger',  bg: 'bg-danger/10',  border: 'border-danger/30'  }
                     : { color: 'text-primary',  bg: 'bg-primary/10', border: 'border-primary/30' };

const statusCfg = (s: string) => {
  if (s === 'Closed')      return { color: 'text-success',    bg: 'bg-success/10',  dot: 'bg-success' };
  if (s === 'In Progress') return { color: 'text-primary',    bg: 'bg-primary/10',  dot: 'bg-primary' };
  if (s === 'Open')        return { color: 'text-warning',    bg: 'bg-warning/10',  dot: 'bg-warning' };
  return                          { color: 'text-text-muted', bg: 'bg-surface-light', dot: 'bg-text-muted' };
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
const isOverdue = (d?: string | null, status?: string) => d && status !== 'Closed' && new Date(d) < new Date();

export default function CapaPage() {
  const { user } = useAuth();
  const [items, setItems]               = useState<CAPA[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selected, setSelected]         = useState<CAPA | null>(null);
  const [form, setForm]                 = useState<typeof EMPTY>(EMPTY);
  const [search, setSearch]             = useState('');
  const [filterType, setFilterType]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetch_ = useCallback(async () => {
    try { setItems(await apiGet('/capa')); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch_(); }, [fetch_]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (c: CAPA) => {
    setEditingId(c.id);
    setForm({
      title: c.title, type: c.type || 'Corrective', source: c.source || 'Audit Finding',
      description: c.description || '', rootCause: c.rootCause || '', action: c.action || '',
      status: c.status || 'Open', owner: c.owner || '',
      dueDate:  c.dueDate  ? c.dueDate.split('T')[0]  : '',
      closedAt: c.closedAt ? c.closedAt.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.title.trim()) return;
    const payload: any = {
      ...form,
      dueDate:  form.dueDate  ? new Date(form.dueDate).toISOString()  : null,
      closedAt: form.closedAt ? new Date(form.closedAt).toISOString() : null,
    };
    try {
      if (editingId) await apiPut(`/capa/${editingId}`, payload);
      else await apiPost('/capa', payload);
      setShowModal(false); fetch_(); toast('CAPA saved', 'success');
      if (selected?.id === editingId) setSelected(null);
    } catch (e: any) { toast(e?.message || 'Failed to save CAPA', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/capa/${id}`); fetch_(); toast('CAPA deleted', 'success');
      if (selected?.id === id) setSelected(null);
    } catch (e: any) { toast(e?.message || 'Failed to delete', 'error'); }
  };

  const f = (k: string) => (e: React.ChangeEvent<any>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const filtered = useMemo(() => items.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || (c.owner || '').toLowerCase().includes(q) || (c.source || '').toLowerCase().includes(q);
    const matchType   = !filterType   || c.type === filterType;
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  }), [items, search, filterType, filterStatus]);

  const overdueCount = items.filter(c => isOverdue(c.dueDate, c.status)).length;
  const csvCols = [
    { key: 'title', label: 'Title' }, { key: 'type', label: 'Type' },
    { key: 'source', label: 'Source' }, { key: 'status', label: 'Status' },
    { key: 'owner', label: 'Owner' }, { key: 'dueDate', label: 'Due Date' },
  ];

  return (
    <AccessGuard page="capa">
    <div className="animate-fade-in">
      <Breadcrumbs items={[{ label: 'CAPA' }]} />
      <PageHeader
        title="CAPA"
        subtitle="Clause 10.1–10.2 — Corrective & Preventive Actions"
        icon={<Repeat className="w-4 h-4" />}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => exportToCSV(items, 'capa_register', csvCols)}><Download className="w-3.5 h-3.5" /> CSV</Button>
            <Button variant="ghost" onClick={() => exportToPDF('CAPA Register', 'Clause 10.1–10.2', items, csvCols)}><FileText className="w-3.5 h-3.5" /> PDF</Button>
            <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> New CAPA</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6 stagger">
        <StatsCard title="Total"       value={items.length}                                            icon={<Wrench className="w-4 h-4 text-text-muted" />}         iconBg="bg-surface-light" />
        <StatsCard title="Open"        value={items.filter(c => c.status === 'Open').length}           icon={<Clock className="w-4 h-4 text-warning" />}             iconBg="bg-warning/10" />
        <StatsCard title="In Progress" value={items.filter(c => c.status === 'In Progress').length}    icon={<Activity className="w-4 h-4 text-primary" />}          iconBg="bg-primary/10" />
        <StatsCard title="Overdue"     value={overdueCount}                                            icon={<AlertTriangle className={`w-4 h-4 ${overdueCount > 0 ? 'text-danger' : 'text-text-muted'}`} />} iconBg={overdueCount > 0 ? 'bg-danger/10' : 'bg-surface-light'} />
        <StatsCard title="Closed"      value={items.filter(c => c.status === 'Closed').length}         icon={<CheckCircle className="w-4 h-4 text-success" />}       iconBg="bg-success/10" />
      </div>

      {/* Search & Filters */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 flex-1 min-w-[200px] bg-bg border border-border rounded-lg hover:border-border-light focus-within:border-primary/50 transition-all">
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none border-none focus:ring-0 min-w-0"
              placeholder="Search CAPAs, owners, sources..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-text-muted hover:text-danger" /></button>}
          </div>
          <select className="px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary hover:border-border-light focus:outline-none focus:border-primary/50 transition-all"
            value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option>Corrective</option><option>Preventive</option>
          </select>
          <select className="px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary hover:border-border-light focus:outline-none focus:border-primary/50 transition-all"
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option>Open</option><option>In Progress</option><option>Closed</option>
          </select>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-text-muted text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState title="No CAPAs recorded" description="Track corrective and preventive actions arising from audits, incidents, risks, and management reviews." icon={<Wrench className="w-7 h-7 text-primary/30" />} action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> New CAPA</Button>} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">No CAPAs match your filters.</div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-bg/50">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">CAPA Title</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-24">Type</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-36">Source</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Owner</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Due Date</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const tc = typeCfg(c.type);
                const sc = statusCfg(c.status);
                return (
                  <tr key={c.id} onClick={() => setSelected(c)}
                    className="border-b border-border/40 last:border-0 hover:bg-surface-light/50 transition-colors cursor-pointer group">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text-primary">{c.title}</p>
                      {c.description && <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{c.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${tc.bg} ${tc.border} ${tc.color}`}>{c.type}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{c.source || '—'}</td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${sc.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        <span className={`text-[11px] font-semibold ${sc.color}`}>{c.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">{c.owner || '—'}</td>
                    <td className="px-4 py-3">
                      {c.dueDate ? <DueDateBadge date={c.dueDate} /> : <span className="text-text-muted/30 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setConfirmDelete(c.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-border/50 bg-bg/30">
            <span className="text-[11px] text-text-muted">{filtered.length} of {items.length} CAPA{items.length !== 1 ? 's' : ''} — click any row to view details</span>
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
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${typeCfg(selected.type).bg} ${typeCfg(selected.type).border} ${typeCfg(selected.type).color}`}>{selected.type}</span>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusCfg(selected.status).bg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg(selected.status).dot}`} />
                    <span className={`text-xs font-semibold ${statusCfg(selected.status).color}`}>{selected.status}</span>
                  </div>
                  {isOverdue(selected.dueDate, selected.status) && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-danger/10 text-danger animate-pulse">Overdue</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-text-primary leading-snug">{selected.title}</h2>
                {selected.source && <p className="text-xs text-text-muted mt-1">Source: {selected.source}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-7 pt-5 pb-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <PanelField icon={User}     label="Owner"       value={selected.owner} />
                <PanelField icon={Calendar} label="Due Date"    value={fmt(selected.dueDate)} accent={isOverdue(selected.dueDate, selected.status) ? 'text-danger font-semibold' : undefined} />
                {selected.closedAt && <PanelField icon={CheckCircle} label="Closed Date" value={fmt(selected.closedAt)} accent="text-success" />}
              </div>
              {selected.description && (
                <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><Layers className="w-3 h-3" />Description</p>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                </div>
              )}
              {selected.rootCause && (
                <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><Bug className="w-3 h-3" />Root Cause Analysis</p>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.rootCause}</p>
                </div>
              )}
              {selected.action && (
                <div className="bg-success/5 rounded-xl border border-success/20 p-4">
                  <p className="text-[10px] font-semibold text-success uppercase tracking-wider mb-2 flex items-center gap-1.5"><Shield className="w-3 h-3" />Action Taken / Planned</p>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.action}</p>
                </div>
              )}
              <CommentsPanel module="capa" recordId={selected.id} apiGet={apiGet} apiPost={apiPost} apiDelete={apiDelete} user={user} />
            </div>
            <div className="flex items-center gap-2 px-6 py-4 border-t border-border flex-shrink-0">
              <Button onClick={() => openEdit(selected)} className="flex-1 justify-center"><Edit2 className="w-3.5 h-3.5" /> Edit CAPA</Button>
              <button onClick={() => setConfirmDelete(selected.id)} className="px-4 py-2 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-all text-sm font-medium flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit CAPA' : 'New CAPA'} size="lg">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="CAPA Title *" placeholder="Brief description of the action" value={form.title} onChange={f('title')} required />
          <div className="grid grid-cols-3 gap-3">
            <Select label="Type" value={form.type} onChange={f('type')}>
              <option>Corrective</option><option>Preventive</option>
            </Select>
            <Select label="Status" value={form.status} onChange={f('status')}>
              <option>Open</option><option>In Progress</option><option>Closed</option>
            </Select>
            <Select label="Source" value={form.source} onChange={f('source')}>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </Select>
          </div>
          <TextArea label="Description" rows={2} placeholder="What issue or opportunity triggered this CAPA?" value={form.description} onChange={f('description')} />
          <TextArea label="Root Cause Analysis" rows={2} placeholder="What is the root cause of the nonconformity?" value={form.rootCause} onChange={f('rootCause')} />
          <TextArea label="Corrective / Preventive Action" rows={2} placeholder="What actions are being taken to address this?" value={form.action} onChange={f('action')} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Owner" placeholder="Responsible person" value={form.owner} onChange={f('owner')} />
            <Input label="Due Date" type="date" value={form.dueDate} onChange={f('dueDate')} />
            <Input label="Closed Date" type="date" value={form.closedAt} onChange={f('closedAt')} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">{editingId ? 'Save Changes' : 'Save CAPA'}</Button>
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:bg-surface-light transition-all">Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} title="Delete CAPA" message="Are you sure you want to delete this CAPA?"
        onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete); setConfirmDelete(null); }}
        onClose={() => setConfirmDelete(null)} />
    </div>
    </AccessGuard>
  );
}
