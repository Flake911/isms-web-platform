'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select,
  TextArea, ConfirmDialog, Breadcrumbs, DueDateBadge, CommentsPanel, toast,
} from '@/components/ui';
import {
  AlertTriangle, Plus, Flame, CheckCircle, Clock, Trash2, Edit2,
  Download, FileText, Search, X, Shield, User, Users, Calendar,
  Activity, Server, Link2, Zap, AlertCircle, XCircle, Bug,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { useAuth } from '@/context/AuthContext';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface Incident {
  id: string; title: string; description?: string;
  severity: string; status: string; category?: string;
  reporter?: string; assignee?: string;
  impact?: string; affectedSystems?: string; containmentActions?: string;
  rootCause?: string; resolution?: string;
  linkedRisk?: string; linkedAsset?: string;
  dueDate?: string | null; reportedAt: string;
  resolvedAt?: string | null; closedAt?: string | null;
  createdAt: string; updatedAt: string;
}

const EMPTY = {
  title: '', description: '', severity: 'Medium', status: 'Open',
  category: 'Unauthorized Access', reporter: '', assignee: '',
  impact: '', affectedSystems: '', containmentActions: '',
  rootCause: '', resolution: '',
  linkedRisk: '', linkedAsset: '',
  dueDate: '', resolvedAt: '', closedAt: '',
};

const CATEGORIES = [
  'Unauthorized Access', 'Data Breach', 'Malware / Ransomware',
  'Phishing / Social Engineering', 'DDoS / Availability',
  'Insider Threat', 'Physical Security', 'System Misconfiguration',
  'Technical Failure', 'Human Error', 'Environmental', 'Other',
];

function sevConfig(s: string) {
  if (s === 'Critical') return { color: 'text-danger',   bg: 'bg-danger/10',   border: 'border-danger/30',   bar: 'bg-danger',   dot: 'bg-danger' };
  if (s === 'High')     return { color: 'text-warning',  bg: 'bg-warning/10',  border: 'border-warning/30',  bar: 'bg-warning',  dot: 'bg-warning' };
  if (s === 'Medium')   return { color: 'text-primary',  bg: 'bg-primary/10',  border: 'border-primary/30',  bar: 'bg-primary',  dot: 'bg-primary' };
  return                       { color: 'text-success',  bg: 'bg-success/10',  border: 'border-success/30',  bar: 'bg-success',  dot: 'bg-success' };
}

function statusConfig(s: string) {
  if (s === 'Open')        return { color: 'text-danger',  bg: 'bg-danger/10',  label: 'Open' };
  if (s === 'In Progress') return { color: 'text-warning', bg: 'bg-warning/10', label: 'In Progress' };
  if (s === 'Resolved')    return { color: 'text-success', bg: 'bg-success/10', label: 'Resolved' };
  return                          { color: 'text-text-muted', bg: 'bg-surface-light', label: s };
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

const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
const fmtDateTime = (d?: string | null) => d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const isOverdue = (d?: string | null, status?: string) => d && status !== 'Resolved' && status !== 'Closed' && new Date(d) < new Date();

export default function IncidentsPage() {
  const { user } = useAuth();
  const [items, setItems]               = useState<Incident[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selected, setSelected]         = useState<Incident | null>(null);
  const [form, setForm]                 = useState<typeof EMPTY>(EMPTY);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetch_ = useCallback(async () => {
    try { setItems(await apiGet('/incidents')); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch_(); }, [fetch_]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (i: Incident) => {
    setEditingId(i.id);
    setForm({
      title: i.title, description: i.description || '',
      severity: i.severity || 'Medium', status: i.status || 'Open',
      category: i.category || 'Unauthorized Access',
      reporter: i.reporter || '', assignee: i.assignee || '',
      impact: i.impact || '', affectedSystems: i.affectedSystems || '',
      containmentActions: i.containmentActions || '',
      rootCause: i.rootCause || '', resolution: i.resolution || '',
      linkedRisk: i.linkedRisk || '', linkedAsset: i.linkedAsset || '',
      dueDate: i.dueDate ? i.dueDate.split('T')[0] : '',
      resolvedAt: i.resolvedAt ? i.resolvedAt.split('T')[0] : '',
      closedAt: i.closedAt ? i.closedAt.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.title.trim()) return;
    const payload: any = {
      ...form,
      dueDate:    form.dueDate    ? new Date(form.dueDate).toISOString()    : null,
      resolvedAt: form.resolvedAt ? new Date(form.resolvedAt).toISOString() : null,
      closedAt:   form.closedAt   ? new Date(form.closedAt).toISOString()   : null,
    };
    try {
      if (editingId) await apiPut(`/incidents/${editingId}`, payload);
      else await apiPost('/incidents', payload);
      setShowModal(false); fetch_(); toast('Incident saved', 'success');
      if (selected?.id === editingId) setSelected(null);
    } catch (e: any) { toast(e?.message || 'Failed to save incident', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/incidents/${id}`); fetch_(); toast('Incident deleted', 'success');
      if (selected?.id === id) setSelected(null);
    } catch (e: any) { toast(e?.message || 'Failed to delete', 'error'); }
  };

  const f = (k: string) => (e: React.ChangeEvent<any>) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  const filtered = useMemo(() => items.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.title.toLowerCase().includes(q)
      || (i.reporter || '').toLowerCase().includes(q)
      || (i.assignee || '').toLowerCase().includes(q)
      || (i.category || '').toLowerCase().includes(q);
    const matchStatus   = !filterStatus   || i.status === filterStatus;
    const matchSeverity = !filterSeverity || i.severity === filterSeverity;
    const matchCategory = !filterCategory || i.category === filterCategory;
    return matchSearch && matchStatus && matchSeverity && matchCategory;
  }), [items, search, filterStatus, filterSeverity, filterCategory]);

  const overdueCount = items.filter(i => isOverdue(i.dueDate, i.status)).length;
  const csvCols = [
    { key: 'title', label: 'Title' }, { key: 'severity', label: 'Severity' },
    { key: 'status', label: 'Status' }, { key: 'category', label: 'Category' },
    { key: 'reporter', label: 'Reporter' }, { key: 'assignee', label: 'Assignee' },
    { key: 'reportedAt', label: 'Reported' }, { key: 'resolvedAt', label: 'Resolved' },
  ];

  return (
    <AccessGuard page="incidents">
    <div className="animate-fade-in">
      <Breadcrumbs items={[{ label: 'Incident Management' }]} />
      <PageHeader
        title="Incident Management"
        subtitle="Clause A.5.24–A.5.28 — Security Incident Response & Tracking"
        icon={<AlertCircle className="w-4 h-4" />}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => exportToCSV(items, 'incidents', csvCols)}>
              <Download className="w-3.5 h-3.5" /> CSV
            </Button>
            <Button variant="ghost" onClick={() => exportToPDF('Incident Management', 'Clause A.5.24–A.5.28', items, csvCols)}>
              <FileText className="w-3.5 h-3.5" /> PDF
            </Button>
            <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Report Incident</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 stagger">
        <StatsCard title="Total"       value={items.length}                                          icon={<AlertTriangle className="w-4 h-4 text-text-muted" />}  iconBg="bg-surface-light" />
        <StatsCard title="Critical"    value={items.filter(i => i.severity === 'Critical').length}   icon={<Flame className="w-4 h-4 text-danger" />}              iconBg="bg-danger/10" />
        <StatsCard title="Open"        value={items.filter(i => i.status === 'Open').length}         icon={<AlertCircle className="w-4 h-4 text-danger" />}        iconBg="bg-danger/10" />
        <StatsCard title="In Progress" value={items.filter(i => i.status === 'In Progress').length}  icon={<Clock className="w-4 h-4 text-warning" />}             iconBg="bg-warning/10" />
        <StatsCard title="Resolved"    value={items.filter(i => i.status === 'Resolved').length}     icon={<CheckCircle className="w-4 h-4 text-success" />}       iconBg="bg-success/10" />
        <StatsCard title="SLA Breach"  value={overdueCount}                                          icon={<XCircle className={`w-4 h-4 ${overdueCount > 0 ? 'text-danger' : 'text-text-muted'}`} />} iconBg={overdueCount > 0 ? 'bg-danger/10' : 'bg-surface-light'} />
      </div>

      {/* Search & Filters */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 flex-1 min-w-[200px] bg-bg border border-border rounded-lg hover:border-border-light focus-within:border-primary/50 transition-all">
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none border-none focus:ring-0 min-w-0"
              placeholder="Search incidents, reporters, assignees..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-text-muted hover:text-danger" /></button>}
          </div>
          <select className="px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary hover:border-border-light focus:outline-none focus:border-primary/50 transition-all"
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
          </select>
          <select className="px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary hover:border-border-light focus:outline-none focus:border-primary/50 transition-all"
            value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
            <option value="">All Severities</option>
            <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
          <select className="px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary hover:border-border-light focus:outline-none focus:border-primary/50 transition-all"
            value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-text-muted text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No incidents reported"
          description="Report and track security incidents, responses, root cause analysis, and resolution as required by ISO 27001:2022 Clause A.5.24–A.5.28."
          icon={<AlertTriangle className="w-7 h-7 text-warning/40" />}
          action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Report Incident</Button>}
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">No incidents match your filters.</div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-bg/50">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-3"></th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Incident</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-24">Severity</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-36">Category</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Assignee</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Reported</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Due / SLA</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(i => {
                const sev = sevConfig(i.severity);
                const sta = statusConfig(i.status);
                const overdue = isOverdue(i.dueDate, i.status);
                return (
                  <tr key={i.id} onClick={() => setSelected(i)}
                    className="border-b border-border/40 last:border-0 hover:bg-surface-light/50 transition-colors cursor-pointer group">
                    {/* Severity colour bar */}
                    <td className="px-0 py-0 w-1">
                      <div className={`w-1 h-full min-h-[52px] rounded-r-sm ${sev.bar}`} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text-primary leading-snug">{i.title}</p>
                      {i.description && <p className="text-[11px] text-text-muted mt-0.5 line-clamp-1">{i.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${sev.bg} ${sev.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sev.dot} flex-shrink-0`} />
                        <span className={`text-[11px] font-semibold ${sev.color}`}>{i.severity}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${sta.bg} ${sta.color}`}>{sta.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">{i.category || '—'}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{i.assignee || '—'}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{fmt(i.reportedAt) || '—'}</td>
                    <td className="px-4 py-3">
                      {i.dueDate
                        ? <DueDateBadge date={i.dueDate} />
                        : <span className="text-text-muted/30 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEdit(i)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setConfirmDelete(i.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-border/50 bg-bg/30">
            <span className="text-[11px] text-text-muted">{filtered.length} of {items.length} incident{items.length !== 1 ? 's' : ''} — click any row to view details</span>
          </div>
        </div>
      )}

      {/* ── Detail Side Panel ── */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
          <div className="fixed top-0 right-0 max-h-screen w-[700px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel">
            <div className={`h-1 w-full shrink-0 ${sevConfig(selected.severity).bar}`} />

            {/* Header */}
            <div className="px-7 py-5 border-b border-border bg-bg/60 flex items-start justify-between gap-4 shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {/* Severity badge */}
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${sevConfig(selected.severity).bg} ${sevConfig(selected.severity).border} ${sevConfig(selected.severity).color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sevConfig(selected.severity).dot}`} />
                    {selected.severity}
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusConfig(selected.status).bg} ${statusConfig(selected.status).color}`}>{selected.status}</span>
                  {selected.category && <span className="text-[10px] px-2 py-1 rounded-lg bg-surface-light border border-border/50 text-text-muted">{selected.category}</span>}
                  {isOverdue(selected.dueDate, selected.status) && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-danger/10 text-danger animate-pulse">SLA Breach</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-text-primary leading-snug">{selected.title}</h2>
                <p className="text-xs text-text-muted mt-1">Reported: {fmtDateTime(selected.reportedAt)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 min-h-0 overflow-y-auto px-7 pt-5 pb-2 space-y-5">

              {/* Key info grid */}
              <div className="grid grid-cols-2 gap-3">
                <PanelField icon={User}     label="Reporter"      value={selected.reporter} />
                <PanelField icon={Users}    label="Assignee"      value={selected.assignee} />
                <PanelField icon={Calendar} label="Due / SLA"     value={fmt(selected.dueDate)} accent={isOverdue(selected.dueDate, selected.status) ? 'text-danger font-semibold' : undefined} />
                <PanelField icon={CheckCircle} label="Resolved"   value={fmt(selected.resolvedAt)} />
              </div>

              {/* Description */}
              {selected.description && (
                <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileText className="w-3 h-3" />Description</p>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                </div>
              )}

              {/* Impact & Affected Systems */}
              <div className="grid grid-cols-1 gap-3">
                {selected.impact && (
                  <div className="bg-danger/5 rounded-xl border border-danger/20 p-4">
                    <p className="text-[10px] font-semibold text-danger uppercase tracking-wider mb-2 flex items-center gap-1.5"><Zap className="w-3 h-3" />Impact</p>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.impact}</p>
                  </div>
                )}
                {selected.affectedSystems && (
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><Server className="w-3 h-3" />Affected Systems</p>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.affectedSystems}</p>
                  </div>
                )}
              </div>

              {/* Response */}
              <div className="space-y-3">
                {selected.containmentActions && (
                  <div className="bg-warning/5 rounded-xl border border-warning/20 p-4">
                    <p className="text-[10px] font-semibold text-warning uppercase tracking-wider mb-2 flex items-center gap-1.5"><Shield className="w-3 h-3" />Containment Actions</p>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.containmentActions}</p>
                  </div>
                )}
                {selected.rootCause && (
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5"><Bug className="w-3 h-3" />Root Cause</p>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.rootCause}</p>
                  </div>
                )}
                {selected.resolution && (
                  <div className="bg-success/5 rounded-xl border border-success/20 p-4">
                    <p className="text-[10px] font-semibold text-success uppercase tracking-wider mb-2 flex items-center gap-1.5"><CheckCircle className="w-3 h-3" />Resolution</p>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.resolution}</p>
                  </div>
                )}
              </div>

              {/* Linked context */}
              {(selected.linkedRisk || selected.linkedAsset) && (
                <div className="grid grid-cols-2 gap-3">
                  {selected.linkedRisk  && <PanelField icon={Activity} label="Linked Risk"  value={selected.linkedRisk} accent="text-warning" />}
                  {selected.linkedAsset && <PanelField icon={Link2}    label="Linked Asset" value={selected.linkedAsset} accent="text-primary" />}
                </div>
              )}

              {/* Comments */}
              <CommentsPanel module="incidents" recordId={selected.id} apiGet={apiGet} apiPost={apiPost} apiDelete={apiDelete} user={user} />
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 px-6 py-4 border-t border-border flex-shrink-0">
              <Button onClick={() => openEdit(selected)} className="flex-1 justify-center"><Edit2 className="w-3.5 h-3.5" /> Edit Incident</Button>
              <button onClick={() => setConfirmDelete(selected.id)} className="px-4 py-2 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-all text-sm font-medium flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Incident' : 'Report Incident'} size="lg">
        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* Section: Basic Info */}
          <div className="flex items-center gap-2 pt-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Incident Details</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Input label="Incident Title *" placeholder="Brief description of the incident" value={form.title} onChange={f('title')} required />
          <TextArea label="Description" rows={2} placeholder="What happened? Provide a clear summary." value={form.description} onChange={f('description')} />

          <div className="grid grid-cols-3 gap-3">
            <Select label="Severity" value={form.severity} onChange={f('severity')}>
              <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
            </Select>
            <Select label="Status" value={form.status} onChange={f('status')}>
              <option>Open</option><option>In Progress</option><option>Resolved</option><option>Closed</option>
            </Select>
            <Select label="Category" value={form.category} onChange={f('category')}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Reporter" placeholder="Who reported it?" value={form.reporter} onChange={f('reporter')} />
            <Input label="Assignee" placeholder="Who is handling it?" value={form.assignee} onChange={f('assignee')} />
          </div>

          {/* Section: Impact */}
          <div className="flex items-center gap-2 pt-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Impact & Affected Systems</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <TextArea label="Impact" rows={2} placeholder="What was the business / security impact?" value={form.impact} onChange={f('impact')} />
          <TextArea label="Affected Systems" rows={2} placeholder="Which systems, services, or data were affected?" value={form.affectedSystems} onChange={f('affectedSystems')} />

          {/* Section: Response */}
          <div className="flex items-center gap-2 pt-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Response & Analysis</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <TextArea label="Containment Actions" rows={2} placeholder="What immediate steps were taken to contain the incident?" value={form.containmentActions} onChange={f('containmentActions')} />
          <TextArea label="Root Cause" rows={2} placeholder="What caused this incident?" value={form.rootCause} onChange={f('rootCause')} />
          <TextArea label="Resolution" rows={2} placeholder="How was it resolved? What was the final outcome?" value={form.resolution} onChange={f('resolution')} />

          {/* Section: Links & Dates */}
          <div className="flex items-center gap-2 pt-1">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-widest">Links & Dates</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Linked Risk" placeholder="Related risk title or ID" value={form.linkedRisk} onChange={f('linkedRisk')} />
            <Input label="Linked Asset" placeholder="Affected asset name" value={form.linkedAsset} onChange={f('linkedAsset')} />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Due Date / SLA Target" type="date" value={form.dueDate} onChange={f('dueDate')} />
            <Input label="Resolved Date" type="date" value={form.resolvedAt} onChange={f('resolvedAt')} />
            <Input label="Closed Date" type="date" value={form.closedAt} onChange={f('closedAt')} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">{editingId ? 'Save Changes' : 'Report Incident'}</Button>
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:bg-surface-light transition-all">Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Incident"
        message="Are you sure you want to delete this incident? This action cannot be undone."
        onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete); setConfirmDelete(null); }}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
    </AccessGuard>
  );
}
