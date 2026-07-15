'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select,
  ConfirmDialog, Breadcrumbs, CommentsPanel, toast,
} from '@/components/ui';
import {
  MessageSquare, Plus, Mail, Users, CheckCircle, Edit2, Trash2,
  Download, FileText, Search, X, User, Clock, Radio, Link2,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { useAuth } from '@/context/AuthContext';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface CommEntry {
  id: string; topic: string; audience?: string; method: string;
  frequency: string; owner?: string; record?: string; status: string;
  createdAt: string; updatedAt: string;
}

const EMPTY = {
  topic: '', audience: '', method: 'Email', frequency: 'Ad-hoc',
  owner: '', record: '', status: 'Ongoing',
};

function methodCfg(m: string) {
  if (m === 'Meeting')    return { color: 'text-primary',  bg: 'bg-primary/10' };
  if (m === 'Email')      return { color: 'text-success',  bg: 'bg-success/10' };
  if (m === 'Report')     return { color: 'text-warning',  bg: 'bg-warning/10' };
  if (m === 'Newsletter') return { color: 'text-danger',   bg: 'bg-danger/10' };
  return                         { color: 'text-primary',  bg: 'bg-primary/10' };
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

export default function CommunicationPage() {
  const { user } = useAuth();
  const [items, setItems]           = useState<CommEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm]             = useState(EMPTY);
  const [selected, setSelected]     = useState<CommEntry | null>(null);
  const [search, setSearch]         = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = useCallback(async () => {
    try { setItems(await apiGet('/communications')); } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => items.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.topic.toLowerCase().includes(q) || (c.audience || '').toLowerCase().includes(q) || (c.owner || '').toLowerCase().includes(q);
    const matchM = !filterMethod || c.method === filterMethod;
    const matchS = !filterStatus || c.status === filterStatus;
    return matchQ && matchM && matchS;
  }), [items, search, filterMethod, filterStatus]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (item: CommEntry) => {
    setEditingId(item.id);
    setForm({ topic: item.topic, audience: item.audience || '', method: item.method, frequency: item.frequency, owner: item.owner || '', record: item.record || '', status: item.status });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.topic.trim()) return;
    try {
      if (editingId) await apiPut(`/communications/${editingId}`, form);
      else await apiPost('/communications', form);
      setShowModal(false); load(); toast('Entry saved', 'success');
    } catch (err: any) { toast(err?.message || 'Failed to save', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/communications/${id}`); load(); toast('Entry deleted', 'success'); if (selected?.id === id) setSelected(null); }
    catch (err: any) { toast(err?.message || 'Failed to delete', 'error'); }
  };

  const total = items.length;
  const ongoing = items.filter(i => i.status === 'Ongoing').length;
  const completed = items.filter(i => i.status === 'Completed').length;
  const audiences = new Set(items.map(i => i.audience).filter(Boolean)).size;

  return (
    <AccessGuard page="communication">
      <div className="animate-fade-in">
        <Breadcrumbs items={[{ label: 'Communication Plan' }]} />
        <PageHeader
          title="Communication Plan"
          subtitle="Clause 7.4 — What, when, with whom, and how to communicate"
          icon={<MessageSquare className="w-4 h-4" />}
          action={
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => exportToCSV(items, 'communications', [
                { key: 'topic', label: 'Topic' }, { key: 'audience', label: 'Audience' },
                { key: 'method', label: 'Method' }, { key: 'frequency', label: 'Frequency' }, { key: 'owner', label: 'Owner' },
              ])}><Download className="w-3.5 h-3.5" /> CSV</Button>
              <Button variant="ghost" onClick={() => exportToPDF('Communication Plan', 'Clause 7.4', items, [
                { key: 'topic', label: 'Topic' }, { key: 'audience', label: 'Audience' },
                { key: 'method', label: 'Method' }, { key: 'frequency', label: 'Frequency' },
              ])}><FileText className="w-3.5 h-3.5" /> PDF</Button>
              <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Entry</Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger">
          <StatsCard title="Total Items" value={total} icon={<MessageSquare className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
          <StatsCard title="Ongoing" value={ongoing} icon={<Radio className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
          <StatsCard title="Completed" value={completed} icon={<CheckCircle className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
          <StatsCard title="Audiences" value={audiences} icon={<Users className="w-4 h-4 text-warning" />} iconBg="bg-warning-light" />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input className="bg-transparent text-sm flex-1 outline-none text-text-primary placeholder:text-text-muted/50"
              placeholder="Search topic, audience, owner…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')}><X className="w-3 h-3 text-text-muted hover:text-text-primary" /></button>}
          </div>
          <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Methods</option>
            <option>Email</option><option>Meeting</option><option>Intranet</option>
            <option>Report</option><option>Newsletter</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Statuses</option>
            <option>Ongoing</option><option>Completed</option><option>Planned</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-text-muted text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No communication items" description="Define ISMS communication items — what, when, to whom, and how."
            icon={<MessageSquare className="w-7 h-7 text-primary/40" />}
            action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Item</Button>} />
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg/50">
                  {['Topic', 'Audience', 'Method', 'Frequency', 'Owner', 'Status', ''].map(h =>
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const mc = methodCfg(c.method);
                  return (
                    <tr key={c.id}
                      onClick={() => setSelected(c)}
                      className="border-b border-border/40 last:border-0 cursor-pointer transition-colors group hover:bg-surface-light/50">
                      <td className="px-4 py-3 text-sm font-medium text-text-primary max-w-[180px] truncate">{c.topic}</td>
                      <td className="px-4 py-3 text-sm text-text-muted">{c.audience || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${mc.bg} ${mc.color}`}>{c.method}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">{c.frequency}</td>
                      <td className="px-4 py-3 text-sm text-text-muted">{c.owner || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${c.status === 'Completed' ? 'bg-success/10 text-success' : c.status === 'Planned' ? 'bg-warning/10 text-warning' : 'bg-primary/10 text-primary'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => openEdit(c)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setConfirmDelete(c.id)}
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
          const mc = methodCfg(selected.method);
          const methodHex = selected.method === 'Meeting' ? '#6366f1'
            : selected.method === 'Email' ? '#10b981'
            : selected.method === 'Report' ? '#f59e0b'
            : selected.method === 'Newsletter' ? '#ef4444'
            : '#6366f1';
          const statusColor = selected.status === 'Completed' ? 'bg-success/10 text-success border-success/20'
            : selected.status === 'Planned' ? 'bg-warning/10 text-warning border-warning/20'
            : 'bg-primary/10 text-primary border-primary/20';
          return (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
              <div className="fixed top-0 right-0 w-[540px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel overflow-hidden" style={{ maxHeight: '100vh' }}>

                {/* Method colour accent bar */}
                <div className="h-1 w-full flex-shrink-0" style={{ background: methodHex }} />

                {/* Header */}
                <div className="px-6 py-5 border-b border-border bg-bg/60 flex items-start justify-between gap-4 flex-shrink-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${mc.bg} ${mc.color}`}
                        style={{ borderColor: `${methodHex}30` }}>
                        {selected.method}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColor}`}>
                        {selected.status}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-text-primary leading-snug">{selected.topic}</h2>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-6 py-4 space-y-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>

                  {/* Key fields grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <PanelField icon={Users} label="Audience"  value={selected.audience} />
                    <PanelField icon={User}  label="Owner"     value={selected.owner} />
                    <PanelField icon={Radio} label="Method"    value={selected.method} />
                    <PanelField icon={Clock} label="Frequency" value={selected.frequency} />
                  </div>

                  {/* Record / evidence link */}
                  {selected.record && (
                    <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Link2 className="w-3 h-3" />Communication Record
                      </p>
                      <p className="text-sm text-text-secondary leading-relaxed break-all">{selected.record}</p>
                    </div>
                  )}

                  {/* Comments */}
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                    <CommentsPanel module="communications" recordId={selected.id} apiGet={apiGet} apiPost={apiPost} apiDelete={apiDelete} user={user} />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-bg/60 flex gap-3 flex-shrink-0">
                  <button onClick={() => openEdit(selected)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all">
                    <Edit2 className="w-4 h-4" /> Edit Entry
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
          title={editingId ? 'Edit Entry' : 'Add Communication Entry'}>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input label="Topic *" placeholder="e.g. Security Policy Update"
              value={form.topic} onChange={e => setForm(p => ({ ...p, topic: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Audience" placeholder="e.g. All employees" value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))} />
              <Select label="Method" value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value }))}>
                <option>Email</option><option>Meeting</option><option>Intranet</option>
                <option>Report</option><option>Newsletter</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Frequency" value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}>
                <option>Ad-hoc</option><option>Weekly</option><option>Monthly</option>
                <option>Quarterly</option><option>Annually</option>
              </Select>
              <Input label="Owner" placeholder="Responsible person" value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} />
            </div>
            <Input label="Record" placeholder="Link to communication record" value={form.record} onChange={e => setForm(p => ({ ...p, record: e.target.value }))} />
            <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              <option>Ongoing</option><option>Planned</option><option>Completed</option>
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
