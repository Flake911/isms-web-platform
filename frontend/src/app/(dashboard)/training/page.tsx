'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select,
  ConfirmDialog, Breadcrumbs, DueDateBadge, CommentsPanel, toast,
} from '@/components/ui';
import {
  GraduationCap, Plus, CheckCircle, Clock, Trash2, Edit2,
  Download, FileText, Search, X, User, Calendar, Star,
  BookOpen, Award,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { useAuth } from '@/context/AuthContext';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface Training {
  id: string; title: string; type: string; assignee?: string; status: string;
  dueDate?: string | null; completedAt?: string | null; score?: number | null;
  createdAt: string; updatedAt: string;
}

const EMPTY = {
  title: '', type: 'Internal', assignee: '', status: 'Planned',
  dueDate: '', completedAt: '', score: '',
};

function statusCfg(s: string) {
  if (s === 'Completed')  return { color: 'text-success',    bg: 'bg-success/10',    dot: 'bg-success' };
  if (s === 'In Progress') return { color: 'text-primary',   bg: 'bg-primary/10',    dot: 'bg-primary' };
  if (s === 'Cancelled')  return { color: 'text-danger',     bg: 'bg-danger/10',     dot: 'bg-danger' };
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

const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function TrainingPage() {
  const { user } = useAuth();
  const [items, setItems]           = useState<Training[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm]             = useState(EMPTY);
  const [selected, setSelected]     = useState<Training | null>(null);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType]     = useState('');

  const load = useCallback(async () => {
    try { setItems(await apiGet('/training')); } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => items.filter(t => {
    const q = search.toLowerCase();
    const matchQ = !q || t.title.toLowerCase().includes(q) || (t.assignee || '').toLowerCase().includes(q);
    const matchS = !filterStatus || t.status === filterStatus;
    const matchT = !filterType   || t.type === filterType;
    return matchQ && matchS && matchT;
  }), [items, search, filterStatus, filterType]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (t: Training) => {
    setEditingId(t.id);
    setForm({
      title: t.title, type: t.type || 'Internal', assignee: t.assignee || '',
      status: t.status || 'Planned',
      dueDate: t.dueDate ? t.dueDate.split('T')[0] : '',
      completedAt: t.completedAt ? t.completedAt.split('T')[0] : '',
      score: t.score != null ? String(t.score) : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const data: Record<string, unknown> = { ...form };
    if (form.dueDate) data.dueDate = new Date(form.dueDate).toISOString(); else data.dueDate = null;
    if (form.completedAt) data.completedAt = new Date(form.completedAt).toISOString(); else data.completedAt = null;
    data.score = form.score !== '' ? parseInt(form.score) : null;
    try {
      if (editingId) await apiPut(`/training/${editingId}`, data);
      else await apiPost('/training', data);
      setShowModal(false); load(); toast('Training record saved', 'success');
    } catch (err: any) { toast(err?.message || 'Failed to save', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/training/${id}`); load(); toast('Training record deleted', 'success'); if (selected?.id === id) setSelected(null); }
    catch (err: any) { toast(err?.message || 'Failed to delete', 'error'); }
  };

  const total = items.length;
  const completed = items.filter(t => t.status === 'Completed').length;
  const inProgress = items.filter(t => t.status === 'In Progress').length;
  const planned = items.filter(t => t.status === 'Planned').length;

  return (
    <AccessGuard page="training">
      <div className="animate-fade-in">
        <Breadcrumbs items={[{ label: 'Training Records' }]} />
        <PageHeader
          title="Training Records"
          subtitle="Clause A.6.3 — Security awareness, education & training"
          icon={<GraduationCap className="w-4 h-4" />}
          action={
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => exportToCSV(items, 'training', [
                { key: 'title', label: 'Title' }, { key: 'type', label: 'Type' },
                { key: 'assignee', label: 'Assignee' }, { key: 'status', label: 'Status' }, { key: 'dueDate', label: 'Due Date' },
              ])}><Download className="w-3.5 h-3.5" /> CSV</Button>
              <Button variant="ghost" onClick={() => exportToPDF('Training Records', 'Clause A.6.3', items, [
                { key: 'title', label: 'Title' }, { key: 'type', label: 'Type' },
                { key: 'assignee', label: 'Assignee' }, { key: 'status', label: 'Status' },
              ])}><FileText className="w-3.5 h-3.5" /> PDF</Button>
              <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Training</Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger">
          <StatsCard title="Total Records" value={total} icon={<GraduationCap className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
          <StatsCard title="Completed" value={completed} icon={<CheckCircle className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
          <StatsCard title="In Progress" value={inProgress} icon={<Clock className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
          <StatsCard title="Planned" value={planned} icon={<Clock className="w-4 h-4 text-text-muted" />} iconBg="bg-surface-light" />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input className="bg-transparent text-sm flex-1 outline-none text-text-primary placeholder:text-text-muted/50"
              placeholder="Search title, assignee…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')}><X className="w-3 h-3 text-text-muted hover:text-text-primary" /></button>}
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Types</option>
            <option>Internal</option><option>External</option><option>Online</option><option>Certification</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Statuses</option>
            <option>Planned</option><option>In Progress</option><option>Completed</option><option>Cancelled</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-text-muted text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Schedule training" description="Plan and track employee training for security awareness."
            icon={<GraduationCap className="w-7 h-7 text-primary/40" />}
            action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Training</Button>} />
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg/50">
                  {['Title', 'Type', 'Assignee', 'Score', 'Due Date', 'Status', ''].map(h =>
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const sc = statusCfg(t.status);
                  return (
                    <tr key={t.id}
                      onClick={() => setSelected(t)}
                      className="border-b border-border/40 last:border-0 cursor-pointer transition-colors group hover:bg-surface-light/50">
                      <td className="px-4 py-3 text-sm font-medium text-text-primary">{t.title}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">{t.type}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">{t.assignee || '—'}</td>
                      <td className="px-4 py-3">
                        {t.score != null ? (
                          <span className={`text-sm font-bold ${t.score >= 80 ? 'text-success' : t.score >= 60 ? 'text-warning' : 'text-danger'}`}>
                            {t.score}%
                          </span>
                        ) : <span className="text-sm text-text-muted/40">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {t.dueDate ? <DueDateBadge date={t.dueDate} /> : <span className="text-sm text-text-muted/40">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{t.status}
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
              <span className="text-[11px] text-text-muted">{filtered.length} of {total} record{total !== 1 ? 's' : ''} — click any row to view details</span>
            </div>
          </div>
        )}

        {/* Detail Side Panel */}
        {selected && (() => {
          const sc = statusCfg(selected.status);
          const scoreColor = selected.score != null
            ? selected.score >= 80 ? '#10b981' : selected.score >= 60 ? '#f59e0b' : '#ef4444'
            : '#6366f1';
          return (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
              <div className="fixed top-0 right-0 w-[560px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel overflow-hidden" style={{ maxHeight: '100vh' }}>

                {/* Status accent bar */}
                <div className={`h-1 w-full flex-shrink-0 ${sc.dot}`} />

                {/* Header */}
                <div className="px-6 py-5 border-b border-border bg-bg/60 flex items-start justify-between gap-4 flex-shrink-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {selected.type}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{selected.status}
                      </span>
                      {selected.score != null && (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                          style={{ background: `${scoreColor}12`, color: scoreColor, borderColor: `${scoreColor}30` }}>
                          <Star className="w-2.5 h-2.5 inline mr-1" />{selected.score}%
                        </span>
                      )}
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
                  {/* Fields grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <PanelField icon={User}     label="Assignee"       value={selected.assignee} />
                    <PanelField icon={BookOpen} label="Training Type"  value={selected.type} />
                    <PanelField icon={Calendar} label="Due Date"       value={fmt(selected.dueDate)} />
                    <PanelField icon={Award}    label="Completed Date" value={fmt(selected.completedAt)} />
                  </div>

                  {/* Score card */}
                  {selected.score != null && (
                    <div className="rounded-xl border p-4 flex items-center gap-4"
                      style={{ background: `${scoreColor}08`, borderColor: `${scoreColor}25` }}>
                      <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 font-black text-lg"
                        style={{ background: `${scoreColor}15`, color: scoreColor, border: `2px solid ${scoreColor}30` }}>
                        {selected.score}%
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted mb-0.5">Assessment Score</p>
                        <p className="text-sm font-semibold" style={{ color: scoreColor }}>
                          {selected.score >= 80 ? 'Excellent — passed' : selected.score >= 60 ? 'Satisfactory — passed' : 'Below threshold — needs retake'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                    <CommentsPanel module="training" recordId={selected.id} apiGet={apiGet} apiPost={apiPost} apiDelete={apiDelete} user={user} />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-bg/60 flex gap-3 flex-shrink-0">
                  <button onClick={() => openEdit(selected)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all">
                    <Edit2 className="w-4 h-4" /> Edit Training
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
          title={editingId ? 'Edit Training' : 'Add Training Record'} size="lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input label="Training Title *" placeholder="e.g. ISO 27001 Foundation"
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Type" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option>Internal</option><option>External</option><option>Online</option><option>Certification</option>
              </Select>
              <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option>Planned</option><option>In Progress</option><option>Completed</option><option>Cancelled</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Assignee" placeholder="Employee name" value={form.assignee} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))} />
              <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Completed Date" type="date" value={form.completedAt} onChange={e => setForm(p => ({ ...p, completedAt: e.target.value }))} />
              <Input label="Score (%)" type="number" placeholder="e.g. 85" value={form.score} onChange={e => setForm(p => ({ ...p, score: e.target.value }))} />
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
