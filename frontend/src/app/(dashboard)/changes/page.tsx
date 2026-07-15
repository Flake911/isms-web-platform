'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select,
  TextArea, ConfirmDialog, Breadcrumbs, CommentsPanel, toast,
} from '@/components/ui';
import {
  RefreshCw, Plus, CheckCircle, Clock, Trash2, Edit2,
  Download, FileText, Search, X, User, AlertTriangle,
  Shield, Calendar, Tag, Layers, XCircle, Repeat2,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { useAuth } from '@/context/AuthContext';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface Change {
  id: string; title: string; description?: string; type: string; status: string;
  requester?: string; impact?: string; approver?: string;
  approvedAt?: string | null; implementedAt?: string | null;
  createdAt: string; updatedAt: string;
}

const EMPTY = {
  title: '', description: '', type: 'Standard', status: 'Requested',
  requester: '', impact: '', approver: '', approvedAt: '', implementedAt: '',
};

function statusCfg(s: string) {
  if (s === 'Approved')     return { color: 'text-success',    bg: 'bg-success/10',    border: 'border-success/30',    dot: 'bg-success' };
  if (s === 'Implemented')  return { color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/30',    dot: 'bg-primary' };
  if (s === 'Requested')    return { color: 'text-warning',    bg: 'bg-warning/10',    border: 'border-warning/30',    dot: 'bg-warning' };
  if (s === 'Rejected')     return { color: 'text-danger',     bg: 'bg-danger/10',     border: 'border-danger/30',     dot: 'bg-danger' };
  return                           { color: 'text-text-muted', bg: 'bg-surface-light', border: 'border-border',        dot: 'bg-text-muted/30' };
}

function typeCfg(t: string) {
  if (t === 'Emergency') return { color: 'text-danger',  bg: 'bg-danger/10' };
  if (t === 'Normal')    return { color: 'text-warning', bg: 'bg-warning/10' };
  return                        { color: 'text-primary', bg: 'bg-primary/10' };
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

export default function ChangesPage() {
  const { user } = useAuth();
  const [items, setItems]           = useState<Change[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm]             = useState(EMPTY);
  const [selected, setSelected]     = useState<Change | null>(null);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');

  const load = useCallback(async () => {
    try { setItems(await apiGet('/changes')); } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => items.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.title.toLowerCase().includes(q) || (c.requester || '').toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q);
    const matchS = !filterStatus || c.status === filterStatus;
    const matchT = !filterType || c.type === filterType;
    return matchQ && matchS && matchT;
  }), [items, search, filterStatus, filterType]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (c: Change) => {
    setEditingId(c.id);
    setForm({
      title: c.title, description: c.description || '', type: c.type || 'Standard',
      status: c.status || 'Requested', requester: c.requester || '',
      impact: c.impact || '', approver: c.approver || '',
      approvedAt: c.approvedAt ? c.approvedAt.split('T')[0] : '',
      implementedAt: c.implementedAt ? c.implementedAt.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = {
      ...form,
      approvedAt: form.approvedAt ? new Date(form.approvedAt).toISOString() : null,
      implementedAt: form.implementedAt ? new Date(form.implementedAt).toISOString() : null,
    };
    try {
      if (editingId) await apiPut(`/changes/${editingId}`, payload);
      else await apiPost('/changes', payload);
      setShowModal(false); load(); toast('Change saved', 'success');
    } catch (err: any) { toast(err?.message || 'Failed to save', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/changes/${id}`); load(); toast('Change deleted', 'success'); if (selected?.id === id) setSelected(null); }
    catch (err: any) { toast(err?.message || 'Failed to delete', 'error'); }
  };

  const total = items.length;
  const approved = items.filter(c => c.status === 'Approved').length;
  const requested = items.filter(c => c.status === 'Requested').length;
  const implemented = items.filter(c => c.status === 'Implemented').length;
  const emergency = items.filter(c => c.type === 'Emergency').length;

  return (
    <AccessGuard page="changes">
      <div className="animate-fade-in">
        <Breadcrumbs items={[{ label: 'Change Management' }]} />
        <PageHeader
          title="Change Management"
          subtitle="Clause A.8.32 — Controlled change management lifecycle"
          icon={<Repeat2 className="w-4 h-4" />}
          action={
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => exportToCSV(items, 'changes', [
                { key: 'title', label: 'Title' }, { key: 'type', label: 'Type' },
                { key: 'requester', label: 'Requester' }, { key: 'impact', label: 'Impact' }, { key: 'status', label: 'Status' },
              ])}><Download className="w-3.5 h-3.5" /> CSV</Button>
              <Button variant="ghost" onClick={() => exportToPDF('Change Management', 'Clause A.8.32', items, [
                { key: 'title', label: 'Title' }, { key: 'type', label: 'Type' },
                { key: 'requester', label: 'Requester' }, { key: 'status', label: 'Status' },
              ])}><FileText className="w-3.5 h-3.5" /> PDF</Button>
              <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> New Change</Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6 stagger">
          <StatsCard title="Total Changes" value={total} icon={<RefreshCw className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
          <StatsCard title="Requested" value={requested} icon={<Clock className="w-4 h-4 text-warning" />} iconBg="bg-warning-light" />
          <StatsCard title="Approved" value={approved} icon={<CheckCircle className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
          <StatsCard title="Implemented" value={implemented} icon={<CheckCircle className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
          <StatsCard title="Emergency" value={emergency} icon={<AlertTriangle className="w-4 h-4 text-danger" />} iconBg="bg-danger-light" />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input className="bg-transparent text-sm flex-1 outline-none text-text-primary placeholder:text-text-muted/50"
              placeholder="Search title, requester…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')}><X className="w-3 h-3 text-text-muted hover:text-text-primary" /></button>}
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Statuses</option>
            <option>Requested</option><option>Approved</option>
            <option>Implemented</option><option>Rejected</option><option>Closed</option>
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Types</option>
            <option>Standard</option><option>Normal</option><option>Emergency</option>
          </select>
        </div>

        <div className="flex gap-4">
          {/* Table */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="text-center py-16 text-text-muted text-sm">Loading…</div>
            ) : filtered.length === 0 ? (
              <EmptyState title="No changes found" description="Track change requests, approvals, and implementations."
                icon={<RefreshCw className="w-7 h-7 text-primary/40" />}
                action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> New Change</Button>} />
            ) : (
              <div className="card overflow-hidden">
                <table className="w-full">
                  <thead><tr className="border-b border-border">
                    {['Title', 'Type', 'Requester', 'Approver', 'Status', ''].map(h =>
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wider bg-bg/50">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {filtered.map(c => {
                      const sc = statusCfg(c.status);
                      const tc = typeCfg(c.type);
                      const active = selected?.id === c.id;
                      return (
                        <tr key={c.id}
                          onClick={() => setSelected(active ? null : c)}
                          className={`border-b border-border/50 last:border-0 cursor-pointer transition-colors group ${active ? 'bg-primary/5' : 'hover:bg-surface-light/50'}`}>
                          <td className="px-4 py-3 text-sm font-medium text-text-primary max-w-xs">
                            <p className="truncate">{c.title}</p>
                            {c.description && <p className="text-xs text-text-muted truncate mt-0.5">{c.description}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${tc.bg} ${tc.color}`}>{c.type}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-text-muted">{c.requester || '—'}</td>
                          <td className="px-4 py-3 text-sm text-text-muted">{c.approver || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md font-medium ${sc.bg} ${sc.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{c.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
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
                  <span className="text-[11px] text-text-muted">{filtered.length} of {total} change{total !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="w-96 flex-shrink-0">
              <div className="card overflow-hidden sticky top-4 max-h-screen overflow-y-auto">
                <div className={`px-5 py-4 border-b border-border/50 ${statusCfg(selected.status).bg}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${typeCfg(selected.type).bg} ${typeCfg(selected.type).color}`}>{selected.type}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary leading-snug">{selected.title}</h3>
                    </div>
                    <button onClick={() => setSelected(null)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:bg-surface transition-all flex-shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md font-medium ${statusCfg(selected.status).bg} ${statusCfg(selected.status).color} border ${statusCfg(selected.status).border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg(selected.status).dot}`} />{selected.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  {selected.description && (
                    <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-3">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">Description</p>
                      <p className="text-sm text-text-primary leading-relaxed">{selected.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <PanelField icon={User} label="Requester" value={selected.requester} />
                    <PanelField icon={Shield} label="Approver" value={selected.approver} />
                  </div>
                  <PanelField icon={AlertTriangle} label="Impact" value={selected.impact} />
                  <div className="grid grid-cols-2 gap-2">
                    <PanelField icon={Calendar} label="Approved" value={fmt(selected.approvedAt)} />
                    <PanelField icon={Calendar} label="Implemented" value={fmt(selected.implementedAt)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <PanelField icon={Calendar} label="Created" value={fmt(selected.createdAt)} />
                    <PanelField icon={Calendar} label="Updated" value={fmt(selected.updatedAt)} />
                  </div>
                </div>

                <div className="px-4 pb-4 flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => openEdit(selected)}><Edit2 className="w-3 h-3" /> Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => setConfirmDelete(selected.id)}><Trash2 className="w-3 h-3" /></Button>
                </div>

                <div className="border-t border-border/50">
                  <CommentsPanel module="changes" recordId={selected.id} apiGet={apiGet} apiPost={apiPost} apiDelete={apiDelete} user={user} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        <Modal open={showModal} onClose={() => setShowModal(false)}
          title={editingId ? 'Edit Change' : 'New Change Request'} size="lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input label="Change Title *" placeholder="e.g. Server upgrade, Firewall rule change"
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <TextArea label="Description" rows={2} placeholder="Describe the change"
              value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Type" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option>Standard</option><option>Normal</option><option>Emergency</option>
              </Select>
              <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option>Requested</option><option>Approved</option>
                <option>Implemented</option><option>Rejected</option><option>Closed</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Requester" placeholder="Who requests this?" value={form.requester} onChange={e => setForm(p => ({ ...p, requester: e.target.value }))} />
              <Input label="Approver" placeholder="Who approves?" value={form.approver} onChange={e => setForm(p => ({ ...p, approver: e.target.value }))} />
            </div>
            <Input label="Impact" placeholder="Impact assessment" value={form.impact} onChange={e => setForm(p => ({ ...p, impact: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Approved Date" type="date" value={form.approvedAt} onChange={e => setForm(p => ({ ...p, approvedAt: e.target.value }))} />
              <Input label="Implemented Date" type="date" value={form.implementedAt} onChange={e => setForm(p => ({ ...p, implementedAt: e.target.value }))} />
            </div>
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
