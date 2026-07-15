'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select,
  ConfirmDialog, Breadcrumbs, CommentsPanel, DueDateBadge, toast,
} from '@/components/ui';
import {
  Scale, Plus, CheckCircle, AlertTriangle, FileText, Edit2, Trash2,
  Download, Search, X, User, Calendar, Globe, Tag, BookOpen,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { useAuth } from '@/context/AuthContext';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface LegalEntry {
  id: string; title: string; category: string; jurisdiction: string;
  applicability: string; owner?: string; status: string; evidence?: string;
  reviewDate?: string | null; createdAt: string; updatedAt: string;
}

const EMPTY = {
  title: '', category: 'Law', jurisdiction: 'EU',
  applicability: 'Fully Applicable', owner: '', status: 'Compliant',
  evidence: '', reviewDate: '',
};

function statusCfg(s: string) {
  if (s === 'Compliant')           return { color: 'text-success',    bg: 'bg-success/10',    border: 'border-success/30',    dot: 'bg-success' };
  if (s === 'Partially Compliant') return { color: 'text-warning',    bg: 'bg-warning/10',    border: 'border-warning/30',    dot: 'bg-warning' };
  if (s === 'Non-Compliant')       return { color: 'text-danger',     bg: 'bg-danger/10',     border: 'border-danger/30',     dot: 'bg-danger' };
  return                                  { color: 'text-text-muted', bg: 'bg-surface-light', border: 'border-border',        dot: 'bg-text-muted/30' };
}

function catColor(c: string) {
  if (c === 'Law')         return { color: 'text-danger',  bg: 'bg-danger/10' };
  if (c === 'Regulation')  return { color: 'text-warning', bg: 'bg-warning/10' };
  if (c === 'Standard')    return { color: 'text-primary', bg: 'bg-primary/10' };
  return                          { color: 'text-success', bg: 'bg-success/10' };
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

export default function LegalPage() {
  const { user } = useAuth();
  const [items, setItems]           = useState<LegalEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm]             = useState(EMPTY);
  const [selected, setSelected]     = useState<LegalEntry | null>(null);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus]   = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const load = useCallback(async () => {
    try { setItems(await apiGet('/legal')); } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => items.filter(l => {
    const q = search.toLowerCase();
    const matchQ = !q || l.title.toLowerCase().includes(q) || (l.owner || '').toLowerCase().includes(q) || l.jurisdiction.toLowerCase().includes(q);
    const matchS = !filterStatus   || l.status === filterStatus;
    const matchC = !filterCategory || l.category === filterCategory;
    return matchQ && matchS && matchC;
  }), [items, search, filterStatus, filterCategory]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (item: LegalEntry) => {
    setEditingId(item.id);
    setForm({ title: item.title, category: item.category, jurisdiction: item.jurisdiction, applicability: item.applicability, owner: item.owner || '', status: item.status, evidence: item.evidence || '', reviewDate: item.reviewDate ? item.reviewDate.split('T')[0] : '' });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = { ...form, reviewDate: form.reviewDate ? new Date(form.reviewDate).toISOString() : null };
    try {
      if (editingId) await apiPut(`/legal/${editingId}`, payload);
      else await apiPost('/legal', payload);
      setShowModal(false); load(); toast('Requirement saved', 'success');
    } catch (err: any) { toast(err?.message || 'Failed to save', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/legal/${id}`); load(); toast('Requirement deleted', 'success'); if (selected?.id === id) setSelected(null); }
    catch (err: any) { toast(err?.message || 'Failed to delete', 'error'); }
  };

  const total = items.length;
  const compliant = items.filter(i => i.status === 'Compliant').length;
  const nonCompliant = items.filter(i => i.status === 'Non-Compliant').length;
  const underReview = items.filter(i => i.status === 'Under Review').length;

  return (
    <AccessGuard page="legal">
      <div className="animate-fade-in">
        <Breadcrumbs items={[{ label: 'Legal & Regulatory Register' }]} />
        <PageHeader
          title="Legal & Regulatory Register"
          subtitle="A.5.31 — Legal, statutory, regulatory & contractual requirements"
          icon={<Scale className="w-4 h-4" />}
          action={
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => exportToCSV(items, 'legal_register', [
                { key: 'title', label: 'Requirement' }, { key: 'category', label: 'Category' },
                { key: 'jurisdiction', label: 'Jurisdiction' }, { key: 'status', label: 'Status' }, { key: 'owner', label: 'Owner' },
              ])}><Download className="w-3.5 h-3.5" /> CSV</Button>
              <Button variant="ghost" onClick={() => exportToPDF('Legal & Regulatory Register', 'A.5.31', items, [
                { key: 'title', label: 'Requirement' }, { key: 'category', label: 'Category' },
                { key: 'jurisdiction', label: 'Jurisdiction' }, { key: 'status', label: 'Status' },
              ])}><FileText className="w-3.5 h-3.5" /> PDF</Button>
              <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Requirement</Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger">
          <StatsCard title="Requirements" value={total} icon={<Scale className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
          <StatsCard title="Compliant" value={compliant} icon={<CheckCircle className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
          <StatsCard title="Non-Compliant" value={nonCompliant} icon={<AlertTriangle className="w-4 h-4 text-danger" />} iconBg="bg-danger-light" />
          <StatsCard title="Under Review" value={underReview} icon={<FileText className="w-4 h-4 text-warning" />} iconBg="bg-warning-light" />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input className="bg-transparent text-sm flex-1 outline-none text-text-primary placeholder:text-text-muted/50"
              placeholder="Search requirement, jurisdiction, owner…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')}><X className="w-3 h-3 text-text-muted hover:text-text-primary" /></button>}
          </div>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Categories</option>
            <option>Law</option><option>Regulation</option><option>Standard</option><option>Contractual</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Statuses</option>
            <option>Compliant</option><option>Partially Compliant</option>
            <option>Non-Compliant</option><option>Under Review</option>
          </select>
        </div>

        {/* Table — full width */}
        {loading ? (
          <div className="text-center py-16 text-text-muted text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No requirements registered" description="Track all applicable laws, regulations, standards, and contractual obligations."
            icon={<Scale className="w-7 h-7 text-primary/40" />}
            action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Requirement</Button>} />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Requirement', 'Category', 'Jurisdiction', 'Applicability', 'Owner', 'Status', 'Review Date', ''].map(h =>
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wider bg-bg/50">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => {
                  const sc = statusCfg(l.status);
                  const cc = catColor(l.category);
                  const isActive = selected?.id === l.id;
                  return (
                    <tr key={l.id}
                      onClick={() => setSelected(isActive ? null : l)}
                      className={`border-b border-border/50 last:border-0 cursor-pointer transition-colors group ${isActive ? 'bg-primary/5' : 'hover:bg-surface-light/50'}`}>
                      <td className="px-4 py-3 text-sm font-medium text-text-primary max-w-xs">
                        <p className="truncate">{l.title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cc.bg} ${cc.color}`}>{l.category}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">{l.jurisdiction}</td>
                      <td className="px-4 py-3 text-sm text-text-muted">{l.applicability}</td>
                      <td className="px-4 py-3 text-sm text-text-muted">{l.owner || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${sc.bg} ${sc.color} border ${sc.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{l.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {l.reviewDate ? <DueDateBadge date={l.reviewDate} /> : <span className="text-sm text-text-muted">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all justify-end">
                          <button onClick={e => { e.stopPropagation(); openEdit(l); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-info-light transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); setConfirmDelete(l.id); }}
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
          const cc = catColor(selected.category);
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
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${cc.bg} ${cc.color}`}>{selected.category}</span>
                        <span className="text-xs text-text-muted">{selected.jurisdiction}</span>
                      </div>
                      <h2 className="text-base font-bold text-text-primary leading-snug">{selected.title}</h2>
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
                    <PanelField icon={Globe}     label="Jurisdiction"  value={selected.jurisdiction} />
                    <PanelField icon={Tag}       label="Applicability" value={selected.applicability} />
                    <PanelField icon={User}      label="Owner"         value={selected.owner} />
                    <PanelField icon={Calendar}  label="Review Date"   value={fmt(selected.reviewDate)} />
                  </div>

                  {selected.evidence && (
                    <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-3">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" /> Evidence / Reference
                      </p>
                      <p className="text-sm text-text-primary leading-relaxed">{selected.evidence}</p>
                    </div>
                  )}

                  <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-3">
                    <CommentsPanel module="legal" recordId={selected.id} apiGet={apiGet} apiPost={apiPost} apiDelete={apiDelete} user={user} />
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
          title={editingId ? 'Edit Requirement' : 'Add Legal Requirement'} size="lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input label="Requirement Title *" placeholder="e.g. GDPR, NIS2, ISO 27001, PCI DSS"
              value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Category" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                <option>Law</option><option>Regulation</option><option>Standard</option><option>Contractual</option>
              </Select>
              <Select label="Jurisdiction" value={form.jurisdiction} onChange={e => setForm(p => ({ ...p, jurisdiction: e.target.value }))}>
                <option>EU</option><option>Germany</option><option>France</option><option>UK</option>
                <option>USA</option><option>Global</option>
              </Select>
            </div>
            <Select label="Applicability" value={form.applicability} onChange={e => setForm(p => ({ ...p, applicability: e.target.value }))}>
              <option>Fully Applicable</option><option>Partially Applicable</option><option>Not Applicable</option>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Owner" placeholder="Compliance owner" value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} />
              <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option>Compliant</option><option>Partially Compliant</option>
                <option>Non-Compliant</option><option>Under Review</option>
              </Select>
            </div>
            <Input label="Evidence" placeholder="Reference evidence files or links"
              value={form.evidence} onChange={e => setForm(p => ({ ...p, evidence: e.target.value }))} />
            <Input label="Review Date" type="date" value={form.reviewDate} onChange={e => setForm(p => ({ ...p, reviewDate: e.target.value }))} />
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
