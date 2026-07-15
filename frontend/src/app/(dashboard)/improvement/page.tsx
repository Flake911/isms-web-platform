'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select,
  TextArea, ConfirmDialog, Breadcrumbs, CommentsPanel, DueDateBadge, toast,
} from '@/components/ui';
import {
  TrendingUp, Plus, Lightbulb, CheckCircle, FileText, Edit2, Trash2,
  Download, Search, X, User, Calendar, Tag, AlertTriangle,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { useAuth } from '@/context/AuthContext';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface ImpEntry {
  id: string; source: string; description?: string; owner?: string;
  priority: string; status: string; benefits?: string; dueDate?: string | null;
  createdAt: string; updatedAt: string;
}

const EMPTY = {
  source: 'Audit Finding', description: '', owner: '', priority: 'Medium',
  status: 'Open', benefits: '', dueDate: '',
};

function priorityCfg(p: string) {
  if (p === 'High')   return { color: 'text-danger',     bg: 'bg-danger/10',     border: 'border-danger/30',     dot: 'bg-danger' };
  if (p === 'Medium') return { color: 'text-warning',    bg: 'bg-warning/10',    border: 'border-warning/30',    dot: 'bg-warning' };
  return                     { color: 'text-text-muted', bg: 'bg-surface-light', border: 'border-border',        dot: 'bg-text-muted/30' };
}

function statusCfg(s: string) {
  if (s === 'Closed' || s === 'Implemented') return { color: 'text-success',    bg: 'bg-success/10',    dot: 'bg-success' };
  if (s === 'In Progress')                   return { color: 'text-primary',    bg: 'bg-primary/10',    dot: 'bg-primary' };
  return                                            { color: 'text-warning',    bg: 'bg-warning/10',    dot: 'bg-warning' };
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

const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function ImprovementPage() {
  const { user } = useAuth();
  const [items, setItems]           = useState<ImpEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm]             = useState(EMPTY);
  const [selected, setSelected]     = useState<ImpEntry | null>(null);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const load = useCallback(async () => {
    try { setItems(await apiGet('/improvements')); } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => items.filter(i => {
    const q = search.toLowerCase();
    const matchQ = !q || (i.description || '').toLowerCase().includes(q) || (i.owner || '').toLowerCase().includes(q) || i.source.toLowerCase().includes(q);
    const matchS = !filterStatus || i.status === filterStatus;
    const matchP = !filterPriority || i.priority === filterPriority;
    return matchQ && matchS && matchP;
  }), [items, search, filterStatus, filterPriority]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (item: ImpEntry) => {
    setEditingId(item.id);
    setForm({
      source: item.source, description: item.description || '', owner: item.owner || '',
      priority: item.priority, status: item.status, benefits: item.benefits || '',
      dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null };
    try {
      if (editingId) await apiPut(`/improvements/${editingId}`, payload);
      else await apiPost('/improvements', payload);
      setShowModal(false); load(); toast('Improvement saved', 'success');
    } catch (err: any) { toast(err?.message || 'Failed to save', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/improvements/${id}`); load(); toast('Improvement deleted', 'success'); if (selected?.id === id) setSelected(null); }
    catch (err: any) { toast(err?.message || 'Failed to delete', 'error'); }
  };

  const total = items.length;
  const open = items.filter(i => i.status === 'Open').length;
  const inProgress = items.filter(i => i.status === 'In Progress').length;
  const completed = items.filter(i => i.status === 'Closed' || i.status === 'Implemented').length;

  return (
    <AccessGuard page="improvement">
      <div className="animate-fade-in">
        <Breadcrumbs items={[{ label: 'Continual Improvement' }]} />
        <PageHeader
          title="Continual Improvement"
          subtitle="Clause 10.1 — Improvement register from audits, incidents, and reviews"
          icon={<TrendingUp className="w-4 h-4" />}
          action={
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => exportToCSV(items, 'improvements', [
                { key: 'source', label: 'Source' }, { key: 'description', label: 'Description' },
                { key: 'owner', label: 'Owner' }, { key: 'priority', label: 'Priority' }, { key: 'status', label: 'Status' },
              ])}><Download className="w-3.5 h-3.5" /> CSV</Button>
              <Button variant="ghost" onClick={() => exportToPDF('Continual Improvement', 'Clause 10.1', items, [
                { key: 'source', label: 'Source' }, { key: 'description', label: 'Description' },
                { key: 'priority', label: 'Priority' }, { key: 'status', label: 'Status' },
              ])}><FileText className="w-3.5 h-3.5" /> PDF</Button>
              <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Item</Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger">
          <StatsCard title="Total Items" value={total} icon={<TrendingUp className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
          <StatsCard title="Open" value={open} icon={<Lightbulb className="w-4 h-4 text-warning" />} iconBg="bg-warning-light" />
          <StatsCard title="In Progress" value={inProgress} icon={<FileText className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
          <StatsCard title="Completed" value={completed} icon={<CheckCircle className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input className="bg-transparent text-sm flex-1 outline-none text-text-primary placeholder:text-text-muted/50"
              placeholder="Search description, owner, source…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')}><X className="w-3 h-3 text-text-muted hover:text-text-primary" /></button>}
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Statuses</option>
            <option>Open</option><option>In Progress</option>
            <option>Implemented</option><option>Closed</option>
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Priorities</option>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-text-muted text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No improvements yet" description="Track improvements from audits, incidents, reviews, or suggestions."
            icon={<TrendingUp className="w-7 h-7 text-primary/40" />}
            action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Improvement</Button>} />
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg/50">
                  {['Source', 'Description', 'Owner', 'Priority', 'Due Date', 'Status', ''].map(h =>
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const pc = priorityCfg(item.priority);
                  const sc = statusCfg(item.status);
                  return (
                    <tr key={item.id}
                      onClick={() => setSelected(item)}
                      className="border-b border-border/40 last:border-0 cursor-pointer transition-colors group hover:bg-surface-light/50">
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">{item.source}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-primary max-w-xs truncate">{item.description || '—'}</td>
                      <td className="px-4 py-3 text-sm text-text-muted">{item.owner || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full ${pc.bg} ${pc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />{item.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {item.dueDate ? <DueDateBadge date={item.dueDate} /> : <span className="text-sm text-text-muted/40">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => openEdit(item)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setConfirmDelete(item.id)}
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
              <span className="text-[11px] text-text-muted">{filtered.length} of {total} item{total !== 1 ? 's' : ''} — click any row to view details</span>
            </div>
          </div>
        )}

        {/* Detail Side Panel */}
        {selected && (() => {
          const pc = priorityCfg(selected.priority);
          const sc = statusCfg(selected.status);
          const priorityHex = selected.priority === 'High' ? '#ef4444'
            : selected.priority === 'Medium' ? '#f59e0b'
            : '#6b7280';
          return (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
              <div className="fixed top-0 right-0 w-[560px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel overflow-hidden" style={{ maxHeight: '100vh' }}>

                {/* Priority accent bar */}
                <div className="h-1 w-full flex-shrink-0" style={{ background: priorityHex }} />

                {/* Header */}
                <div className="px-6 py-5 border-b border-border bg-bg/60 flex items-start justify-between gap-4 flex-shrink-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {selected.source}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${pc.bg} ${pc.color} ${pc.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />{selected.priority} Priority
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{selected.status}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-text-primary leading-snug">
                      {selected.description || 'Improvement Item'}
                    </h2>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-6 py-4 space-y-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>

                  {/* Key fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <PanelField icon={User}     label="Owner"    value={selected.owner} />
                    <PanelField icon={Calendar} label="Due Date" value={fmt(selected.dueDate)} />
                    <PanelField icon={Tag}      label="Source"   value={selected.source} />
                    <PanelField icon={AlertTriangle} label="Priority" value={selected.priority} />
                  </div>

                  {/* Benefits */}
                  {selected.benefits && (
                    <div className="bg-success/5 rounded-xl border border-success/15 p-4">
                      <p className="text-[10px] font-semibold text-success uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" />Benefits Achieved
                      </p>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.benefits}</p>
                    </div>
                  )}

                  {/* Comments */}
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                    <CommentsPanel module="improvements" recordId={selected.id} apiGet={apiGet} apiPost={apiPost} apiDelete={apiDelete} user={user} />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-bg/60 flex gap-3 flex-shrink-0">
                  <button onClick={() => openEdit(selected)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all">
                    <Edit2 className="w-4 h-4" /> Edit Item
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
          title={editingId ? 'Edit Improvement' : 'Add Improvement'}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Select label="Source" value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>
              <option>Audit Finding</option><option>Incident</option><option>Management Review</option>
              <option>Suggestion</option><option>Gap Analysis</option><option>Vulnerability</option>
            </Select>
            <TextArea label="Description" rows={2} placeholder="Describe the improvement"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Owner" placeholder="Responsible person" value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} />
              <Select label="Priority" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                <option>Low</option><option>Medium</option><option>High</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option>Open</option><option>In Progress</option><option>Implemented</option><option>Closed</option>
              </Select>
              <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <TextArea label="Benefits Achieved" rows={2} placeholder="Quantifiable or qualitative benefits"
              value={form.benefits} onChange={e => setForm(p => ({ ...p, benefits: e.target.value }))} />
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
