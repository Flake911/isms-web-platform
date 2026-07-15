'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select, TextArea, ConfirmDialog, Breadcrumbs, toast } from '@/components/ui';
import { Target, Plus, CheckCircle, Clock, Trash2, Edit2, Download, FileText, Search, X, AlertTriangle, TrendingUp, User, Calendar, Link2, Gauge, BarChart3, StickyNote } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import CommentsSection from '@/components/Comments';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface Objective {
  id: string; title: string; description: string; target: string;
  progress: number; owner: string; status: string; priority: string;
  measurementMethod: string; measurementFrequency: string;
  linkedClause: string; linkedRisks: string; linkedControls: string;
  reviewDate: string | null; deadline: string | null;
  createdAt: string; updatedAt: string;
}

const empty = {
  title: '', description: '', target: '', progress: 0,
  owner: '', status: 'Active', priority: 'Medium',
  measurementMethod: '', measurementFrequency: 'Quarterly',
  linkedClause: '', linkedRisks: '', linkedControls: '',
  reviewDate: '', deadline: '',
};

const priorityColor = (p: string) =>
  p === 'High' ? 'bg-danger-light text-danger' :
  p === 'Medium' ? 'bg-warning-light text-warning' :
  'bg-surface-light text-text-muted';

const statusColor = (s: string) =>
  s === 'Completed' ? 'bg-success-light text-success' :
  s === 'Active' ? 'bg-info-light text-primary' :
  s === 'On Hold' ? 'bg-warning-light text-warning' :
  'bg-surface-light text-text-muted';

const progressColor = (p: number) =>
  p >= 100 ? 'bg-success' : p >= 60 ? 'bg-primary' : p >= 30 ? 'bg-warning' : 'bg-danger';

const toDateInput = (d: string | null) => d ? d.split('T')[0] : '';
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function isOverdue(deadline: string | null, progress: number) {
  return deadline && progress < 100 && new Date(deadline) < new Date();
}

export default function ObjectivesPage() {
  const [items, setItems] = useState<Objective[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selected, setSelected] = useState<Objective | null>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const f = (k: Partial<typeof empty>) => setForm(prev => ({ ...prev, ...k }));

  const fetch_ = useCallback(async () => {
    try { setItems(await apiGet('/objectives')); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch_(); }, [fetch_]);

  const openCreate = () => { setEditingId(null); setForm(empty); setShowModal(true); };
  const openEdit = (o: Objective) => {
    setSelected(null);
    setEditingId(o.id);
    setForm({
      title: o.title, description: o.description || '', target: o.target || '',
      progress: o.progress || 0, owner: o.owner || '',
      status: o.status || 'Active', priority: o.priority || 'Medium',
      measurementMethod: o.measurementMethod || '',
      measurementFrequency: o.measurementFrequency || 'Quarterly',
      linkedClause: o.linkedClause || '', linkedRisks: o.linkedRisks || '',
      linkedControls: o.linkedControls || '',
      reviewDate: toDateInput(o.reviewDate), deadline: toDateInput(o.deadline),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = {
      ...form,
      progress: Number(form.progress),
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      reviewDate: form.reviewDate ? new Date(form.reviewDate).toISOString() : null,
    };
    try {
      if (editingId) await apiPut(`/objectives/${editingId}`, payload);
      else await apiPost('/objectives', payload);
      setShowModal(false); fetch_(); toast('Objective saved', 'success');
    } catch (e: any) { toast(e?.message || 'Failed to save objective'); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/objectives/${id}`); setSelected(null); fetch_(); toast('Objective deleted', 'success'); }
    catch (e: any) { toast(e?.message || 'Failed to delete'); }
  };

  const filtered = items.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = o.title.toLowerCase().includes(q) || (o.owner || '').toLowerCase().includes(q) || (o.linkedClause || '').toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    const matchPriority = filterPriority === 'All' || o.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const achieved = items.filter(o => o.progress >= 100).length;
  const inProgress = items.filter(o => o.progress > 0 && o.progress < 100).length;
  const overdue = items.filter(o => isOverdue(o.deadline, o.progress)).length;
  const avgProgress = items.length ? Math.round(items.reduce((s, o) => s + o.progress, 0) / items.length) : 0;

  return (
    <AccessGuard page="objectives">
      <div className="animate-fade-in">
        <Breadcrumbs items={[{ label: 'ISMS Objectives' }]} />
        <PageHeader
          title="ISMS Objectives"
          subtitle="Clause 6.2 — Information Security Objectives & Planning"
          icon={<Target className="w-4 h-4" />}
          action={
            <div className="flex gap-2">
              <button onClick={() => exportToCSV(items, 'objectives', [
                {key:'title',label:'Title'},{key:'priority',label:'Priority'},
                {key:'target',label:'Target/KPI'},{key:'progress',label:'Progress %'},
                {key:'status',label:'Status'},{key:'owner',label:'Owner'},
                {key:'measurementFrequency',label:'Frequency'},
              ])} className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-text-muted hover:text-text-secondary hover:bg-surface-light transition-all flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button onClick={() => exportToPDF('ISMS Objectives', 'Clause 6.2 — Information Security Objectives', items, [
                {key:'title',label:'Title'},{key:'priority',label:'Priority'},
                {key:'progress',label:'Progress %'},{key:'status',label:'Status'},{key:'owner',label:'Owner'},
              ])} className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-text-muted hover:text-text-secondary hover:bg-surface-light transition-all flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
              <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Objective</Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatsCard title="Total" value={items.length} icon={<Target className="w-5 h-5" />} />
          <StatsCard title="Achieved" value={achieved} icon={<CheckCircle className="w-5 h-5" />} color="success" />
          <StatsCard title="In Progress" value={inProgress} icon={<Clock className="w-5 h-5" />} color="info" />
          <StatsCard title="Overdue" value={overdue} icon={<AlertTriangle className="w-5 h-5" />} color="danger" />
        </div>

        {/* Overall progress bar */}
        {items.length > 0 && (
          <div className="bg-surface border border-border rounded-xl p-4 mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5"><Gauge className="w-3.5 h-3.5 text-primary" /> Overall Objectives Progress</span>
              <span className="text-xs font-bold text-primary">{avgProgress}% average</span>
            </div>
            <div className="w-full h-2.5 bg-surface-light rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${progressColor(avgProgress)}`} style={{ width: `${avgProgress}%` }} />
            </div>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-text-muted">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success inline-block" /> Achieved: {achieved}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary inline-block" /> In Progress: {inProgress}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger inline-block" /> Overdue: {overdue}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-bg border border-border rounded-lg flex-1 min-w-[200px] max-w-sm hover:border-border-light focus-within:border-primary/50 transition-all">
            <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search objectives..."
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none border-none focus:ring-0 min-w-0" />
            {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-text-muted hover:text-text-primary" /></button>}
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary hover:border-border-light transition-all">
            <option value="All">All Statuses</option>
            <option>Active</option><option>Completed</option><option>On Hold</option><option>Cancelled</option>
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary hover:border-border-light transition-all">
            <option value="All">All Priorities</option>
            <option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : items.length === 0 ? (
          <EmptyState title="Define ISMS objectives" description="Set measurable security objectives aligned with your ISMS policy and Clause 6.2." icon={<Target className="w-8 h-8" />} action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Objective</Button>} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-text-muted text-sm">No objectives match your filters.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(o => {
              const overdueBool = isOverdue(o.deadline, o.progress);
              return (
                <div key={o.id} onClick={() => setSelected(o)}
                  className="bg-surface border border-border rounded-xl p-4 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group">

                  {/* Card header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${priorityColor(o.priority || 'Medium')}`}>{o.priority || 'Medium'}</span>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${statusColor(o.status)}`}>{o.status}</span>
                        {overdueBool && <span className="text-[10px] px-2 py-1 rounded-full font-semibold bg-danger-light text-danger animate-pulse">Overdue</span>}
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2">{o.title}</h3>
                    </div>
                    <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(o)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-info-light transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setConfirmDelete(o.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger-light transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  {/* Target/KPI */}
                  {o.target && <p className="text-[11px] text-text-muted mb-3 line-clamp-1">🎯 {o.target}</p>}

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-text-muted">Progress</span>
                      <span className="text-xs font-bold text-text-primary">{o.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-light rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${progressColor(o.progress)}`} style={{ width: `${Math.min(o.progress, 100)}%` }} />
                    </div>
                  </div>

                  {/* Footer meta */}
                  <div className="flex items-center gap-3 text-[10px] text-text-muted flex-wrap">
                    {o.owner && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {o.owner}</span>}
                    {o.deadline && (
                      <span className={`flex items-center gap-1 ${overdueBool ? 'text-danger font-semibold' : ''}`}>
                        <Calendar className="w-3 h-3" /> {fmtDate(o.deadline)}
                      </span>
                    )}
                    {o.measurementFrequency && <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" /> {o.measurementFrequency}</span>}
                    {o.linkedClause && <span className="flex items-center gap-1"><Link2 className="w-3 h-3" /> {o.linkedClause}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail Side Panel */}
        {selected && (
          <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
            <div className="fixed top-0 right-0 max-h-screen w-[640px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel">
              {/* Accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-warning to-primary shrink-0" />

              {/* Header */}
              <div className="px-7 py-6 border-b border-border bg-bg/60 flex items-start justify-between gap-4 shrink-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${priorityColor(selected.priority || 'Medium')}`}>{selected.priority || 'Medium'} Priority</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor(selected.status)}`}>{selected.status}</span>
                    {isOverdue(selected.deadline, selected.progress) && <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-danger-light text-danger animate-pulse">Overdue</span>}
                  </div>
                  <h2 className="text-xl font-bold text-text-primary leading-snug">{selected.title}</h2>
                  {selected.description && <p className="text-sm text-text-muted mt-1.5 leading-relaxed">{selected.description}</p>}
                </div>
                <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress */}
              <div className="px-7 py-4 border-b border-border/50 shrink-0 bg-bg/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-text-muted font-medium">Progress</span>
                  <span className="text-sm font-bold text-text-primary">{selected.progress}%</span>
                </div>
                <div className="w-full h-3 bg-surface-light rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${progressColor(selected.progress)}`} style={{ width: `${Math.min(selected.progress, 100)}%` }} />
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-7 pt-5 pb-2 space-y-4">

                {/* Target/KPI */}
                {selected.target && (
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5"><Target className="w-3 h-3" /> Target / KPI</p>
                    <p className="text-sm text-text-secondary leading-relaxed">{selected.target}</p>
                  </div>
                )}

                {/* Measurement */}
                {selected.measurementMethod && (
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5"><Gauge className="w-3 h-3" /> How It Will Be Evaluated</p>
                    <p className="text-sm text-text-secondary leading-relaxed">{selected.measurementMethod}</p>
                  </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-3">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Owner</p>
                    <p className="text-sm text-text-primary font-medium">{selected.owner || '—'}</p>
                  </div>
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-3">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Measured</p>
                    <p className="text-sm text-text-primary font-medium">{selected.measurementFrequency || '—'}</p>
                  </div>
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-3">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Deadline</p>
                    <p className={`text-sm font-medium ${isOverdue(selected.deadline, selected.progress) ? 'text-danger' : 'text-text-primary'}`}>{fmtDate(selected.deadline)}</p>
                  </div>
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-3">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Review Date</p>
                    <p className="text-sm text-text-primary font-medium">{fmtDate(selected.reviewDate)}</p>
                  </div>
                </div>

                {/* Links */}
                {(selected.linkedClause || selected.linkedRisks || selected.linkedControls) && (
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-4 space-y-2">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-1.5"><Link2 className="w-3 h-3" /> Linked Items</p>
                    {selected.linkedClause && <div className="flex items-center gap-2 text-xs"><span className="text-text-muted w-20">ISO Clause:</span><span className="text-text-primary font-medium">{selected.linkedClause}</span></div>}
                    {selected.linkedRisks && <div className="flex items-center gap-2 text-xs"><span className="text-text-muted w-20">Risks:</span><span className="text-text-primary">{selected.linkedRisks}</span></div>}
                    {selected.linkedControls && <div className="flex items-center gap-2 text-xs"><span className="text-text-muted w-20">Controls:</span><span className="text-text-primary">{selected.linkedControls}</span></div>}
                  </div>
                )}

                {/* Comments */}
                <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                  <CommentsSection module="objectives" recordId={selected.id} />
                </div>
              </div>

              {/* Footer */}
              <div className="px-7 py-5 border-t border-border bg-bg/60 flex gap-3 shrink-0">
                <Button onClick={() => openEdit(selected)} className="flex-1 py-2.5 text-sm"><Edit2 className="w-4 h-4" /> Edit Objective</Button>
                <button onClick={() => setConfirmDelete(selected.id)} className="px-4 py-2.5 rounded-xl border border-danger/30 text-danger hover:bg-danger-light transition-all text-sm font-medium flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </>
        )}

        {/* Create / Edit Modal */}
        <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Objective' : 'Add Objective'} size="lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input label="Objective Title *" placeholder="e.g. Achieve 95% patch compliance by Q4" value={form.title} onChange={e => f({ title: e.target.value })} required />
            <TextArea label="Description" rows={2} placeholder="Background and context for this objective..." value={form.description} onChange={e => f({ description: e.target.value })} />
            <Input label="Target / KPI" placeholder="e.g. 95% of systems patched within 30 days" value={form.target} onChange={e => f({ target: e.target.value })} />
            <TextArea label="Measurement Method (How it will be evaluated)" rows={2} placeholder="e.g. Monthly vulnerability scan reports reviewed by CISO..." value={form.measurementMethod} onChange={e => f({ measurementMethod: e.target.value })} />

            <div className="grid grid-cols-3 gap-3">
              <Select label="Priority" value={form.priority} onChange={e => f({ priority: e.target.value })}>
                <option>High</option><option>Medium</option><option>Low</option>
              </Select>
              <Select label="Status" value={form.status} onChange={e => f({ status: e.target.value })}>
                <option>Active</option><option>Completed</option><option>On Hold</option><option>Cancelled</option>
              </Select>
              <Select label="Measurement Frequency" value={form.measurementFrequency} onChange={e => f({ measurementFrequency: e.target.value })}>
                <option>Monthly</option><option>Quarterly</option><option>Bi-Annually</option><option>Annually</option>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Progress (%)" type="number" min={0} max={100} value={String(form.progress)} onChange={e => f({ progress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })} />
              <Input label="Owner" placeholder="Responsible person" value={form.owner} onChange={e => f({ owner: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Deadline" type="date" value={form.deadline} onChange={e => f({ deadline: e.target.value })} />
              <Input label="Review Date" type="date" value={form.reviewDate} onChange={e => f({ reviewDate: e.target.value })} />
            </div>

            <Input label="Linked ISO Clause" placeholder="e.g. Clause 6.2, A.8.8" value={form.linkedClause} onChange={e => f({ linkedClause: e.target.value })} />

            <div className="grid grid-cols-2 gap-3">
              <Input label="Linked Risks" placeholder="e.g. RSK-001, RSK-003" value={form.linkedRisks} onChange={e => f({ linkedRisks: e.target.value })} />
              <Input label="Linked Controls" placeholder="e.g. A.8.7, A.5.15" value={form.linkedControls} onChange={e => f({ linkedControls: e.target.value })} />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">{editingId ? 'Save Changes' : 'Add Objective'}</Button>
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:bg-surface-light transition-all">Cancel</button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          open={!!confirmDelete}
          title="Delete Objective"
          message="Are you sure you want to delete this objective? This action cannot be undone."
          onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete); setConfirmDelete(null); }}
          onClose={() => setConfirmDelete(null)}
        />
      </div>
    </AccessGuard>
  );
}
