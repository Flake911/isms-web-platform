'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select,
  TextArea, ConfirmDialog, Breadcrumbs, CommentsPanel, toast,
} from '@/components/ui';
import {
  BookOpen, Plus, Calendar, CheckCircle, FileText, Edit2, Trash2,
  Download, Search, X, Users, Clock, ClipboardList, Layers,
  AlertCircle, User,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { useAuth } from '@/context/AuthContext';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface ReviewEntry {
  id: string; reviewDate?: string | null; attendees?: string; agenda?: string;
  reviewInputs?: string; reviewOutputs?: string; decisions?: string;
  actionItems?: string; status: string;
  createdAt: string; updatedAt: string;
}

const EMPTY = {
  reviewDate: '', attendees: '', agenda: '', reviewInputs: '',
  reviewOutputs: '', decisions: '', actionItems: '', status: 'Scheduled',
};

function statusCfg(s: string) {
  if (s === 'Completed')   return { color: 'text-success',    bg: 'bg-success/10',    border: 'border-success/30',    dot: 'bg-success' };
  if (s === 'In Progress') return { color: 'text-primary',    bg: 'bg-primary/10',    border: 'border-primary/30',    dot: 'bg-primary' };
  if (s === 'Scheduled')   return { color: 'text-warning',    bg: 'bg-warning/10',    border: 'border-warning/30',    dot: 'bg-warning' };
  return                          { color: 'text-text-muted', bg: 'bg-surface-light', border: 'border-border',        dot: 'bg-text-muted/30' };
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

export default function ManagementReviewPage() {
  const { user } = useAuth();
  const [items, setItems]           = useState<ReviewEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm]             = useState(EMPTY);
  const [selected, setSelected]     = useState<ReviewEntry | null>(null);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const load = useCallback(async () => {
    try { setItems(await apiGet('/management-reviews')); } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => items.filter(r => {
    const q = search.toLowerCase();
    const matchQ = !q || (r.attendees || '').toLowerCase().includes(q) || (r.agenda || '').toLowerCase().includes(q) || (r.decisions || '').toLowerCase().includes(q);
    const matchS = !filterStatus || r.status === filterStatus;
    return matchQ && matchS;
  }), [items, search, filterStatus]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (item: ReviewEntry) => {
    setEditingId(item.id);
    setForm({
      reviewDate: item.reviewDate ? item.reviewDate.split('T')[0] : '',
      attendees: item.attendees || '', agenda: item.agenda || '',
      reviewInputs: item.reviewInputs || '', reviewOutputs: item.reviewOutputs || '',
      decisions: item.decisions || '', actionItems: item.actionItems || '', status: item.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, reviewDate: form.reviewDate ? new Date(form.reviewDate).toISOString() : null };
    try {
      if (editingId) await apiPut(`/management-reviews/${editingId}`, payload);
      else await apiPost('/management-reviews', payload);
      setShowModal(false); load(); toast('Review saved', 'success');
    } catch (err: any) { toast(err?.message || 'Failed to save', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/management-reviews/${id}`); load(); toast('Review deleted', 'success'); if (selected?.id === id) setSelected(null); }
    catch (err: any) { toast(err?.message || 'Failed to delete', 'error'); }
  };

  const total = items.length;
  const completed = items.filter(i => i.status === 'Completed').length;
  const scheduled = items.filter(i => i.status === 'Scheduled').length;
  const nextReview = items.find(i => i.status === 'Scheduled');

  return (
    <AccessGuard page="management-review">
      <div className="animate-fade-in">
        <Breadcrumbs items={[{ label: 'Management Review' }]} />
        <PageHeader
          title="Management Review"
          subtitle="Clause 9.3 — Top management review of the ISMS"
          icon={<BookOpen className="w-4 h-4" />}
          action={
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => exportToCSV(items, 'management_reviews', [
                { key: 'reviewDate', label: 'Date' }, { key: 'attendees', label: 'Attendees' },
                { key: 'status', label: 'Status' }, { key: 'decisions', label: 'Decisions' }, { key: 'actionItems', label: 'Actions' },
              ])}><Download className="w-3.5 h-3.5" /> CSV</Button>
              <Button variant="ghost" onClick={() => exportToPDF('Management Review', 'Clause 9.3', items, [
                { key: 'reviewDate', label: 'Date' }, { key: 'attendees', label: 'Attendees' },
                { key: 'status', label: 'Status' }, { key: 'decisions', label: 'Decisions' },
              ])}><FileText className="w-3.5 h-3.5" /> PDF</Button>
              <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Schedule Review</Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger">
          <StatsCard title="Total Reviews" value={total} icon={<BookOpen className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
          <StatsCard title="Scheduled" value={scheduled} icon={<Calendar className="w-4 h-4 text-warning" />} iconBg="bg-warning-light" />
          <StatsCard title="Completed" value={completed} icon={<CheckCircle className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
          <StatsCard title="Next Review" value={nextReview?.reviewDate ? fmt(nextReview.reviewDate) : '—'} icon={<Clock className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input className="bg-transparent text-sm flex-1 outline-none text-text-primary placeholder:text-text-muted/50"
              placeholder="Search attendees, agenda, decisions…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')}><X className="w-3 h-3 text-text-muted hover:text-text-primary" /></button>}
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Statuses</option>
            <option>Scheduled</option><option>In Progress</option><option>Completed</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-text-muted text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No reviews scheduled" description="Schedule management reviews per ISO 27001 Clause 9.3."
            icon={<BookOpen className="w-7 h-7 text-primary/40" />}
            action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Schedule Review</Button>} />
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg/50">
                  {['Date', 'Attendees', 'Agenda', 'Status', 'Action Items', ''].map(h =>
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const sc = statusCfg(r.status);
                  return (
                    <tr key={r.id}
                      onClick={() => setSelected(r)}
                      className="border-b border-border/40 last:border-0 cursor-pointer transition-colors group hover:bg-surface-light/50">
                      <td className="px-4 py-3 text-sm font-medium text-text-primary whitespace-nowrap">{fmt(r.reviewDate)}</td>
                      <td className="px-4 py-3 text-sm text-text-muted max-w-[140px] truncate">{r.attendees || '—'}</td>
                      <td className="px-4 py-3 text-sm text-text-muted max-w-[160px] truncate">{r.agenda || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted max-w-[160px] truncate">{r.actionItems || '—'}</td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => openEdit(r)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setConfirmDelete(r.id)}
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
              <span className="text-[11px] text-text-muted">{filtered.length} of {total} review{total !== 1 ? 's' : ''} — click any row to view details</span>
            </div>
          </div>
        )}

        {/* Detail Side Panel */}
        {selected && (() => {
          const sc = statusCfg(selected.status);
          const statusHex = selected.status === 'Completed' ? '#10b981'
            : selected.status === 'In Progress' ? '#6366f1'
            : selected.status === 'Scheduled' ? '#f59e0b'
            : '#6b7280';
          return (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
              <div className="fixed top-0 right-0 w-[600px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel overflow-hidden" style={{ maxHeight: '100vh' }}>

                {/* Status accent bar */}
                <div className="h-1 w-full flex-shrink-0" style={{ background: statusHex }} />

                {/* Header */}
                <div className="px-6 py-5 border-b border-border bg-bg/60 flex items-start justify-between gap-4 flex-shrink-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.color} ${sc.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{selected.status}
                      </span>
                      <span className="text-[10px] text-text-muted px-2.5 py-1 rounded-full bg-surface-light border border-border">
                        ISO 27001 · Clause 9.3
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-text-primary leading-snug">Management Review</h2>
                    <p className="text-sm text-text-muted mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />{fmt(selected.reviewDate)}
                    </p>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-6 py-4 space-y-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>

                  {/* Attendees */}
                  {selected.attendees && (
                    <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Users className="w-3 h-3" />Attendees
                      </p>
                      <p className="text-sm text-text-primary leading-relaxed">{selected.attendees}</p>
                    </div>
                  )}

                  {/* Agenda */}
                  {selected.agenda && (
                    <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <ClipboardList className="w-3 h-3" />Agenda
                      </p>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.agenda}</p>
                    </div>
                  )}

                  {/* Inputs / Outputs side by side if both exist, otherwise full width */}
                  {(selected.reviewInputs || selected.reviewOutputs) && (
                    <div className={`grid gap-3 ${selected.reviewInputs && selected.reviewOutputs ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {selected.reviewInputs && (
                        <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Layers className="w-3 h-3" />Review Inputs
                          </p>
                          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.reviewInputs}</p>
                        </div>
                      )}
                      {selected.reviewOutputs && (
                        <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <CheckCircle className="w-3 h-3" />Review Outputs
                          </p>
                          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.reviewOutputs}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Decisions — highlighted */}
                  {selected.decisions && (
                    <div className="bg-primary/5 rounded-xl border border-primary/15 p-4">
                      <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-3 h-3" />Decisions
                      </p>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.decisions}</p>
                    </div>
                  )}

                  {/* Action Items — highlighted */}
                  {selected.actionItems && (
                    <div className="bg-warning/5 rounded-xl border border-warning/20 p-4">
                      <p className="text-[10px] font-semibold text-warning uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" />Action Items
                      </p>
                      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.actionItems}</p>
                    </div>
                  )}

                  {/* Comments */}
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                    <CommentsPanel module="management-review" recordId={selected.id} apiGet={apiGet} apiPost={apiPost} apiDelete={apiDelete} user={user} />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-bg/60 flex gap-3 flex-shrink-0">
                  <button onClick={() => openEdit(selected)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all">
                    <Edit2 className="w-4 h-4" /> Edit Review
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
          title={editingId ? 'Edit Review' : 'Schedule Management Review'} size="lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Review Date" type="date" value={form.reviewDate} onChange={e => setForm(p => ({ ...p, reviewDate: e.target.value }))} />
              <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option>Scheduled</option><option>In Progress</option><option>Completed</option>
              </Select>
            </div>
            <Input label="Attendees" placeholder="CEO, CISO, IT Director, DPO…"
              value={form.attendees} onChange={e => setForm(p => ({ ...p, attendees: e.target.value }))} />
            <TextArea label="Agenda" rows={2} placeholder="Topics to discuss"
              value={form.agenda} onChange={e => setForm(p => ({ ...p, agenda: e.target.value }))} />
            <TextArea label="Review Inputs" rows={2} placeholder="Risk register, audit results, incidents, performance metrics"
              value={form.reviewInputs} onChange={e => setForm(p => ({ ...p, reviewInputs: e.target.value }))} />
            <TextArea label="Review Outputs" rows={2} placeholder="Improvement opportunities, resource needs, policy updates"
              value={form.reviewOutputs} onChange={e => setForm(p => ({ ...p, reviewOutputs: e.target.value }))} />
            <TextArea label="Decisions" rows={2} placeholder="Key decisions made during the review"
              value={form.decisions} onChange={e => setForm(p => ({ ...p, decisions: e.target.value }))} />
            <TextArea label="Action Items" rows={2} placeholder="Follow-up actions with owners and due dates"
              value={form.actionItems} onChange={e => setForm(p => ({ ...p, actionItems: e.target.value }))} />
            <div className="flex gap-2 pt-2">
              <Button type="submit">{editingId ? 'Update' : 'Schedule'}</Button>
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
