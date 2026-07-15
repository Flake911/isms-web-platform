'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select,
  TextArea, ConfirmDialog, Breadcrumbs, CommentsPanel, toast,
} from '@/components/ui';
import {
  Zap, Plus, CheckCircle, AlertTriangle, Clock, Trash2, Edit2,
  Download, FileText, Search, X, User, Calendar, Server,
  Activity, Shield, Layers,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { useAuth } from '@/context/AuthContext';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface BCPEntry {
  id: string; planName: string; type: string; owner?: string;
  criticalServices?: string; rto?: string; rpo?: string;
  dependencies?: string; lastTestDate?: string | null; testResult?: string;
  improvements?: string; status: string;
  createdAt: string; updatedAt: string;
}

const EMPTY = {
  planName: '', type: 'DR Plan', owner: '', criticalServices: '',
  rto: '', rpo: '', dependencies: '', lastTestDate: '',
  testResult: 'Not Tested', improvements: '', status: 'Active',
};

function testCfg(t: string) {
  if (t === 'Passed')  return { color: 'text-success',    bg: 'bg-success/10',    dot: 'bg-success' };
  if (t === 'Failed')  return { color: 'text-danger',     bg: 'bg-danger/10',     dot: 'bg-danger' };
  if (t === 'Partial') return { color: 'text-warning',    bg: 'bg-warning/10',    dot: 'bg-warning' };
  return                      { color: 'text-text-muted', bg: 'bg-surface-light', dot: 'bg-text-muted/30' };
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

export default function BCPPage() {
  const { user } = useAuth();
  const [items, setItems]           = useState<BCPEntry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm]             = useState(EMPTY);
  const [selected, setSelected]     = useState<BCPEntry | null>(null);
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterTest, setFilterTest] = useState('');

  const load = useCallback(async () => {
    try { setItems(await apiGet('/bcp')); } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => items.filter(b => {
    const q = search.toLowerCase();
    const matchQ = !q || b.planName.toLowerCase().includes(q) || (b.owner || '').toLowerCase().includes(q) || (b.criticalServices || '').toLowerCase().includes(q);
    const matchT = !filterType || b.type === filterType;
    const matchR = !filterTest || b.testResult === filterTest;
    return matchQ && matchT && matchR;
  }), [items, search, filterType, filterTest]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (item: BCPEntry) => {
    setEditingId(item.id);
    setForm({
      planName: item.planName, type: item.type, owner: item.owner || '',
      criticalServices: item.criticalServices || '', rto: item.rto || '', rpo: item.rpo || '',
      dependencies: item.dependencies || '',
      lastTestDate: item.lastTestDate ? item.lastTestDate.split('T')[0] : '',
      testResult: item.testResult || 'Not Tested', improvements: item.improvements || '', status: item.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.planName.trim()) return;
    const payload = { ...form, lastTestDate: form.lastTestDate ? new Date(form.lastTestDate).toISOString() : null };
    try {
      if (editingId) await apiPut(`/bcp/${editingId}`, payload);
      else await apiPost('/bcp', payload);
      setShowModal(false); load(); toast('Plan saved', 'success');
    } catch (err: any) { toast(err?.message || 'Failed to save', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/bcp/${id}`); load(); toast('Plan deleted', 'success'); if (selected?.id === id) setSelected(null); }
    catch (err: any) { toast(err?.message || 'Failed to delete', 'error'); }
  };

  const total = items.length;
  const active = items.filter(i => i.status === 'Active').length;
  const notTested = items.filter(i => i.testResult === 'Not Tested').length;
  const passed = items.filter(i => i.testResult === 'Passed').length;
  const failed = items.filter(i => i.testResult === 'Failed').length;

  return (
    <AccessGuard page="bcp">
      <div className="animate-fade-in">
        <Breadcrumbs items={[{ label: 'Business Continuity & DR' }]} />
        <PageHeader
          title="Business Continuity & DR"
          subtitle="A.5.29–A.5.30 — ICT readiness, RTO/RPO targets and test exercises"
          icon={<Zap className="w-4 h-4" />}
          action={
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => exportToCSV(items, 'bcp', [
                { key: 'planName', label: 'Plan' }, { key: 'type', label: 'Type' },
                { key: 'owner', label: 'Owner' }, { key: 'rto', label: 'RTO' },
                { key: 'rpo', label: 'RPO' }, { key: 'testResult', label: 'Test Result' },
              ])}><Download className="w-3.5 h-3.5" /> CSV</Button>
              <Button variant="ghost" onClick={() => exportToPDF('BCP / DR Plans', 'A.5.29–A.5.30', items, [
                { key: 'planName', label: 'Plan' }, { key: 'type', label: 'Type' },
                { key: 'owner', label: 'Owner' }, { key: 'rto', label: 'RTO' }, { key: 'testResult', label: 'Result' },
              ])}><FileText className="w-3.5 h-3.5" /> PDF</Button>
              <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> New Plan</Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6 stagger">
          <StatsCard title="Total Plans" value={total} icon={<Zap className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
          <StatsCard title="Active" value={active} icon={<CheckCircle className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
          <StatsCard title="Passed Tests" value={passed} icon={<Shield className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
          <StatsCard title="Failed Tests" value={failed} icon={<AlertTriangle className="w-4 h-4 text-danger" />} iconBg="bg-danger-light" />
          <StatsCard title="Not Tested" value={notTested} icon={<Clock className="w-4 h-4 text-warning" />} iconBg="bg-warning-light" />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input className="bg-transparent text-sm flex-1 outline-none text-text-primary placeholder:text-text-muted/50"
              placeholder="Search plan name, owner, services…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')}><X className="w-3 h-3 text-text-muted hover:text-text-primary" /></button>}
          </div>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Types</option>
            <option>DR Plan</option><option>BCP</option><option>Crisis Plan</option>
          </select>
          <select value={filterTest} onChange={e => setFilterTest(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Test Results</option>
            <option>Passed</option><option>Failed</option><option>Partial</option><option>Not Tested</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-16 text-text-muted text-sm">Loading…</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No continuity plans" description="Create disaster recovery and BCP plans with RTO/RPO targets."
            icon={<Zap className="w-7 h-7 text-primary/40" />}
            action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Create Plan</Button>} />
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg/50">
                  {['Plan Name', 'Type', 'Owner', 'RTO', 'RPO', 'Test Result', ''].map(h =>
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const tc = testCfg(b.testResult || 'Not Tested');
                  return (
                    <tr key={b.id}
                      onClick={() => setSelected(b)}
                      className="border-b border-border/40 last:border-0 cursor-pointer transition-colors group hover:bg-surface-light/50">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-text-primary">{b.planName}</p>
                        {b.criticalServices && <p className="text-xs text-text-muted truncate mt-0.5 max-w-xs">{b.criticalServices}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">{b.type}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">{b.owner || '—'}</td>
                      <td className="px-4 py-3 text-sm font-mono font-semibold text-text-secondary">{b.rto || '—'}</td>
                      <td className="px-4 py-3 text-sm font-mono font-semibold text-text-secondary">{b.rpo || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${tc.bg} ${tc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />{b.testResult || 'Not Tested'}
                        </span>
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => openEdit(b)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setConfirmDelete(b.id)}
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
              <span className="text-[11px] text-text-muted">{filtered.length} of {total} plan{total !== 1 ? 's' : ''} — click any row to view details</span>
            </div>
          </div>
        )}

        {/* Detail Side Panel */}
        {selected && (() => {
          const tc = testCfg(selected.testResult || 'Not Tested');
          const testHex = selected.testResult === 'Passed' ? '#10b981'
            : selected.testResult === 'Failed' ? '#ef4444'
            : selected.testResult === 'Partial' ? '#f59e0b'
            : '#6b7280';
          return (
            <>
              <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
              <div className="fixed top-0 right-0 w-[580px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel overflow-hidden" style={{ maxHeight: '100vh' }}>

                {/* Test-result accent bar */}
                <div className="h-1 w-full flex-shrink-0" style={{ background: testHex }} />

                {/* Header */}
                <div className="px-6 py-5 border-b border-border bg-bg/60 flex items-start justify-between gap-4 flex-shrink-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {selected.type}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${tc.bg} ${tc.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />{selected.testResult || 'Not Tested'}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${selected.status === 'Active' ? 'bg-success/10 text-success border border-success/20' : 'bg-surface-light text-text-muted border border-border'}`}>
                        {selected.status}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-text-primary leading-snug">{selected.planName}</h2>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto px-6 py-4 space-y-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>

                  {/* RTO / RPO highlight */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary/5 rounded-xl border border-primary/15 p-4 text-center">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Clock className="w-3 h-3" />RTO</p>
                      <p className="text-xl font-black text-primary">{selected.rto || '—'}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">Recovery Time Objective</p>
                    </div>
                    <div className="bg-primary/5 rounded-xl border border-primary/15 p-4 text-center">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1 flex items-center justify-center gap-1"><Activity className="w-3 h-3" />RPO</p>
                      <p className="text-xl font-black text-primary">{selected.rpo || '—'}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">Recovery Point Objective</p>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <PanelField icon={User}     label="Owner"          value={selected.owner} />
                    <PanelField icon={Calendar} label="Last Test Date" value={fmt(selected.lastTestDate)} />
                  </div>

                  {selected.criticalServices && (
                    <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5"><Server className="w-3 h-3" />Critical Services</p>
                      <p className="text-sm text-text-secondary leading-relaxed">{selected.criticalServices}</p>
                    </div>
                  )}

                  {selected.dependencies && (
                    <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5"><Layers className="w-3 h-3" />Dependencies</p>
                      <p className="text-sm text-text-secondary leading-relaxed">{selected.dependencies}</p>
                    </div>
                  )}

                  {selected.improvements && (
                    <div className="bg-success/5 rounded-xl border border-success/15 p-4">
                      <p className="text-[10px] font-semibold text-success uppercase tracking-widest mb-2 flex items-center gap-1.5"><Shield className="w-3 h-3" />Improvements / Lessons Learned</p>
                      <p className="text-sm text-text-secondary leading-relaxed">{selected.improvements}</p>
                    </div>
                  )}

                  {/* Comments */}
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                    <CommentsPanel module="bcp" recordId={selected.id} apiGet={apiGet} apiPost={apiPost} apiDelete={apiDelete} user={user} />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-bg/60 flex gap-3 flex-shrink-0">
                  <button onClick={() => openEdit(selected)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all">
                    <Edit2 className="w-4 h-4" /> Edit Plan
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
          title={editingId ? 'Edit Plan' : 'Create Continuity Plan'} size="lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input label="Plan Name *" placeholder="e.g. IT Disaster Recovery Plan"
              value={form.planName} onChange={e => setForm(p => ({ ...p, planName: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Type" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option>DR Plan</option><option>BCP</option><option>Crisis Plan</option>
              </Select>
              <Select label="Status" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option>Active</option><option>Under Review</option><option>Archived</option>
              </Select>
            </div>
            <Input label="Owner" placeholder="Responsible person"
              value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} />
            <Input label="Critical Services" placeholder="Services covered by this plan"
              value={form.criticalServices} onChange={e => setForm(p => ({ ...p, criticalServices: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="RTO" placeholder="e.g. 4 hours" value={form.rto} onChange={e => setForm(p => ({ ...p, rto: e.target.value }))} />
              <Input label="RPO" placeholder="e.g. 1 hour" value={form.rpo} onChange={e => setForm(p => ({ ...p, rpo: e.target.value }))} />
            </div>
            <Input label="Dependencies" placeholder="Key dependencies"
              value={form.dependencies} onChange={e => setForm(p => ({ ...p, dependencies: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Last Test Date" type="date" value={form.lastTestDate} onChange={e => setForm(p => ({ ...p, lastTestDate: e.target.value }))} />
              <Select label="Test Result" value={form.testResult} onChange={e => setForm(p => ({ ...p, testResult: e.target.value }))}>
                <option>Passed</option><option>Failed</option><option>Partial</option><option>Not Tested</option>
              </Select>
            </div>
            <TextArea label="Improvements" rows={2} placeholder="Lessons learned / improvements"
              value={form.improvements} onChange={e => setForm(p => ({ ...p, improvements: e.target.value }))} />
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
