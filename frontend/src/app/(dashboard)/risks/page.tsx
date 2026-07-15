'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader, StatsCard, Button, Modal, Input, Select, TextArea, ConfirmDialog, Breadcrumbs, DueDateBadge, CommentsPanel, toast, EmptyState } from '@/components/ui';
import { ShieldAlert, Plus, TrendingDown, Shield, Trash2, Edit2, Download, FileText, Link2, X, Search, AlertTriangle, CheckCircle, Clock, Target, Bug, Zap } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { useAuth } from '@/context/AuthContext';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface Risk {
  id: string; title: string; description?: string; category: string;
  likelihood: number; impact: number; riskScore: number;
  residualLikelihood?: number; residualImpact?: number; residualScore?: number;
  status: string; owner?: string; treatment?: string; mitigations?: string;
  riskAppetite?: string; linkedAsset?: string; linkedThreat?: string; linkedVulnerability?: string;
  identifiedAt?: string; dueDate?: string | null; reviewDate?: string;
  createdAt: string; updatedAt: string;
}
interface RiskControlLink { id: string; riskId: string; controlId: string; notes: string; }

const EMPTY = {
  title: '', description: '', category: 'Technical',
  likelihood: 3, impact: 3, residualLikelihood: 0, residualImpact: 0,
  treatment: 'Mitigate', status: 'Open', owner: '', mitigations: '',
  riskAppetite: 'Above Appetite', linkedAsset: '', linkedThreat: '', linkedVulnerability: '',
  identifiedAt: '', dueDate: '', reviewDate: '',
};

const CATEGORIES = ['Technical', 'Operational', 'Human', 'Physical', 'Vendor / Supply Chain', 'Legal & Compliance', 'Environmental', 'Financial', 'Reputational'];

function riskLevel(score: number) {
  if (score >= 15) return { label: 'Critical', color: 'text-danger',  bg: 'bg-danger/10',  border: 'border-danger/30',  dot: 'bg-danger' };
  if (score >= 9)  return { label: 'High',     color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30', dot: 'bg-warning' };
  if (score >= 4)  return { label: 'Medium',   color: 'text-caution', bg: 'bg-caution/10', border: 'border-caution/30', dot: 'bg-caution' };
  return               { label: 'Low',      color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', dot: 'bg-success' };
}

function ScoreBadge({ score }: { score: number }) {
  const lvl = riskLevel(score);
  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${lvl.bg} ${lvl.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${lvl.dot} flex-shrink-0`} />
      <span className={`text-xs font-bold ${lvl.color}`}>{score}</span>
      <span className={`text-[10px] font-medium ${lvl.color} opacity-80`}>{lvl.label}</span>
    </div>
  );
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

function LiveScore({ l, i, label }: { l: number; i: number; label: string }) {
  const score = l * i;
  const lvl = riskLevel(score > 0 ? score : 0);
  return (
    <div>
      <label className="block text-xs font-medium text-text-secondary mb-1.5">{label}</label>
      <div className={`px-3 py-2 rounded-lg border ${score > 0 ? `${lvl.bg} ${lvl.border}` : 'bg-bg border-border'} text-center`}>
        <p className={`text-xl font-bold ${score > 0 ? lvl.color : 'text-text-muted'}`}>{score > 0 ? score : '—'}</p>
        {score > 0 && <p className={`text-[10px] font-semibold ${lvl.color}`}>{lvl.label}</p>}
      </div>
    </div>
  );
}

export default function RisksPage() {
  const { user } = useAuth();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selected, setSelected] = useState<Risk | null>(null);
  const [linkedControls, setLinkedControls] = useState<RiskControlLink[]>([]);
  const [allControls, setAllControls] = useState<{ id: string; code: string; title: string }[]>([]);
  const [linkControlId, setLinkControlId] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);

  const fetch_ = useCallback(async () => {
    try { setRisks(await apiGet('/risks')); } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch_(); }, [fetch_]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (r: Risk) => {
    setEditingId(r.id);
    setForm({
      title: r.title, description: r.description || '', category: r.category || 'Technical',
      likelihood: r.likelihood || 3, impact: r.impact || 3,
      residualLikelihood: r.residualLikelihood || 0, residualImpact: r.residualImpact || 0,
      treatment: r.treatment || 'Mitigate', status: r.status || 'Open',
      owner: r.owner || '', mitigations: r.mitigations || '',
      riskAppetite: r.riskAppetite || 'Above Appetite',
      linkedAsset: r.linkedAsset || '', linkedThreat: r.linkedThreat || '',
      linkedVulnerability: r.linkedVulnerability || '',
      identifiedAt: r.identifiedAt ? r.identifiedAt.split('T')[0] : '',
      dueDate: r.dueDate ? r.dueDate.split('T')[0] : '',
      reviewDate: r.reviewDate ? r.reviewDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const openDetail = async (r: Risk) => {
    setSelected(r);
    try {
      const [links, ctrls] = await Promise.all([apiGet(`/risk-controls?riskId=${r.id}`), apiGet('/controls')]);
      setLinkedControls(links); setAllControls(ctrls);
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.title.trim()) return;
    const payload: any = {
      ...form,
      riskScore: form.likelihood * form.impact,
      residualScore: form.residualLikelihood && form.residualImpact ? form.residualLikelihood * form.residualImpact : null,
      residualLikelihood: form.residualLikelihood || null,
      residualImpact: form.residualImpact || null,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      reviewDate: form.reviewDate ? new Date(form.reviewDate).toISOString() : null,
      identifiedAt: form.identifiedAt ? new Date(form.identifiedAt).toISOString() : null,
    };
    try {
      if (editingId) await apiPut(`/risks/${editingId}`, payload);
      else await apiPost('/risks', payload);
      setShowModal(false); fetch_(); toast('Risk saved', 'success');
      if (selected?.id === editingId) setSelected(null);
    } catch (e: any) { toast(e?.message || 'Failed to save risk', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/risks/${id}`); fetch_(); toast('Risk deleted', 'success');
      if (selected?.id === id) setSelected(null);
    } catch (e: any) { toast(e?.message || 'Failed to delete risk', 'error'); }
  };

  const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

  const filtered = useMemo(() => risks.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || (r.owner || '').toLowerCase().includes(q) || (r.category || '').toLowerCase().includes(q);
    const matchStatus = !filterStatus || r.status === filterStatus;
    const matchCat = !filterCategory || r.category === filterCategory;
    const matchLevel = !filterLevel || riskLevel(r.riskScore).label === filterLevel;
    return matchSearch && matchStatus && matchCat && matchLevel;
  }), [risks, search, filterStatus, filterCategory, filterLevel]);

  const overdueCount = risks.filter(r => r.dueDate && new Date(r.dueDate) < new Date() && r.status !== 'Closed').length;
  const f = (k: string) => (e: React.ChangeEvent<any>) => setForm(prev => ({ ...prev, [k]: e.target.value }));
  const fNum = (k: string) => (e: React.ChangeEvent<any>) => setForm(prev => ({ ...prev, [k]: parseInt(e.target.value) }));

  return (
    <AccessGuard page="risks">
    <div className="animate-fade-in">
      <Breadcrumbs items={[{ label: 'Risk Management' }]} />
      <PageHeader
        title="Risk Management"
        subtitle="Clause 6.1 — Risk Assessment & Treatment"
        icon={<ShieldAlert className="w-4 h-4" />}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => exportToCSV(risks, 'risk_register', [
              { key: 'title', label: 'Title' }, { key: 'category', label: 'Category' },
              { key: 'riskScore', label: 'Score' }, { key: 'treatment', label: 'Treatment' },
              { key: 'status', label: 'Status' }, { key: 'owner', label: 'Owner' }, { key: 'dueDate', label: 'Due Date' },
            ])}><Download className="w-3.5 h-3.5" /> CSV</Button>
            <Button variant="ghost" onClick={() => exportToPDF('Risk Register', 'Clause 6.1', risks, [
              { key: 'title', label: 'Title' }, { key: 'category', label: 'Category' },
              { key: 'riskScore', label: 'Score' }, { key: 'treatment', label: 'Treatment' },
              { key: 'status', label: 'Status' }, { key: 'owner', label: 'Owner' },
            ])}><FileText className="w-3.5 h-3.5" /> PDF</Button>
            <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Register Risk</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 stagger">
        <StatsCard title="Open"          value={risks.filter(r => r.status === 'Open').length}            icon={<ShieldAlert className="w-4 h-4 text-warning" />}  iconBg="bg-warning-light" />
        <StatsCard title="Critical ≥ 15" value={risks.filter(r => r.riskScore >= 15).length}              icon={<AlertTriangle className="w-4 h-4 text-danger" />}  iconBg="bg-danger-light" />
        <StatsCard title="High 9–14"     value={risks.filter(r => r.riskScore >= 9 && r.riskScore < 15).length} icon={<ShieldAlert className="w-4 h-4 text-warning" />} iconBg="bg-warning-light" />
        <StatsCard title="Accepted"      value={risks.filter(r => r.status === 'Accepted').length}        icon={<CheckCircle className="w-4 h-4 text-primary" />}   iconBg="bg-info-light" />
        <StatsCard title="Overdue"       value={overdueCount}                                             icon={<Clock className={`w-4 h-4 ${overdueCount > 0 ? 'text-danger' : 'text-text-muted'}`} />} iconBg={overdueCount > 0 ? 'bg-danger-light' : 'bg-bg'} />
        <StatsCard title="Closed"        value={risks.filter(r => r.status === 'Closed').length}          icon={<TrendingDown className="w-4 h-4 text-success" />}  iconBg="bg-success-light" />
      </div>

      {/* Search & Filters */}
      {risks.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 flex-1 min-w-[200px] bg-bg border border-border rounded-lg hover:border-border-light focus-within:border-primary/50 transition-all">
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none border-none focus:ring-0 min-w-0" placeholder="Search risks, owners, categories..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary hover:border-border-light focus:outline-none focus:border-primary/50 transition-all" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option>Open</option><option>Under Treatment</option><option>Accepted</option><option>Closed</option>
          </select>
          <select className="px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary hover:border-border-light focus:outline-none focus:border-primary/50 transition-all" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select className="px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary hover:border-border-light focus:outline-none focus:border-primary/50 transition-all" value={filterLevel} onChange={e => setFilterLevel(e.target.value)}>
            <option value="">All Levels</option>
            <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-text-muted text-sm">Loading...</div>
      ) : risks.length === 0 ? (
        <EmptyState title="No risks registered" description="Start building your risk register by documenting identified threats, assessing likelihood and impact, and defining treatment plans as required by ISO 27001:2022 Clause 6.1." icon={<ShieldAlert className="w-7 h-7 text-warning/40" />} action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Register Risk</Button>} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">No risks match your filters.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Risk', 'Category', 'Inherent Score', 'Residual Score', 'Treatment', 'Owner', 'Status', 'Due Date', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wider bg-bg/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-border/50 last:border-0 hover:bg-surface-light/30 transition-colors group">
                    <td className="px-4 py-3 max-w-[220px]">
                      <button onClick={() => openDetail(r)} className="text-sm font-medium text-text-primary hover:text-primary transition-colors text-left">
                        {r.title}
                      </button>
                      {r.description && <p className="text-[11px] text-text-muted truncate mt-0.5 max-w-[200px]">{r.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">{r.category}</td>
                    <td className="px-4 py-3"><ScoreBadge score={r.riskScore} /></td>
                    <td className="px-4 py-3">
                      {r.residualScore ? <ScoreBadge score={r.residualScore} /> : <span className="text-xs text-text-muted/40">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{r.treatment || '—'}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{r.owner || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                        r.status === 'Open'             ? 'bg-danger-light text-danger' :
                        r.status === 'Closed'           ? 'bg-success-light text-success' :
                        r.status === 'Accepted'         ? 'bg-info-light text-primary' :
                        'bg-warning-light text-warning'
                      }`}>{r.status}</span>
                    </td>
                    <td className="px-4 py-3"><DueDateBadge date={r.dueDate} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openDetail(r)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-info-light transition-all"><Target className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openEdit(r)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-info-light transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setConfirmDelete(r.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger-light transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2.5 border-t border-border/50 bg-bg/30">
            <span className="text-[11px] text-text-muted">{filtered.length} of {risks.length} risk{risks.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* ── Detail Side Panel ── */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
          <div className="fixed top-0 right-0 max-h-screen w-[680px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel">
            <div className={`h-1 w-full flex-shrink-0 ${riskLevel(selected.riskScore).label === 'Critical' ? 'bg-gradient-to-r from-danger to-warning' : riskLevel(selected.riskScore).label === 'High' ? 'bg-gradient-to-r from-warning to-caution' : 'bg-gradient-to-r from-primary to-success'}`} />

            {/* Header */}
            <div className="flex items-start gap-4 px-6 py-5 border-b border-border flex-shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <ScoreBadge score={selected.riskScore} />
                  {selected.residualScore != null && (
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-text-muted">→ Residual:</span>
                      <ScoreBadge score={selected.residualScore} />
                    </div>
                  )}
                  <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                    selected.status === 'Open' ? 'bg-danger/10 text-danger border border-danger/20' :
                    selected.status === 'Closed' ? 'bg-success/10 text-success border border-success/20' :
                    selected.status === 'Accepted' ? 'bg-info-light text-primary border border-primary/20' :
                    'bg-warning/10 text-warning border border-warning/20'
                  }`}>{selected.status}</span>
                </div>
                <h2 className="text-base font-semibold text-text-primary leading-snug">{selected.title}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-5 pb-2">

              {/* Score grid */}
              <div className="grid grid-cols-3 gap-3 mb-3">
                <PanelField icon={AlertTriangle} label="Likelihood" value={`${selected.likelihood} / 5`} />
                <PanelField icon={AlertTriangle} label="Impact" value={`${selected.impact} / 5`} />
                <PanelField icon={ShieldAlert}   label="Inherent Score" value={`${selected.riskScore} — ${riskLevel(selected.riskScore).label}`} accent={riskLevel(selected.riskScore).color} />
              </div>
              {selected.residualScore != null && (
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <PanelField icon={TrendingDown} label="Residual Likelihood" value={selected.residualLikelihood ? `${selected.residualLikelihood} / 5` : null} />
                  <PanelField icon={TrendingDown} label="Residual Impact"     value={selected.residualImpact     ? `${selected.residualImpact} / 5`     : null} />
                  <PanelField icon={TrendingDown} label="Residual Score"      value={`${selected.residualScore} — ${riskLevel(selected.residualScore).label}`} accent={riskLevel(selected.residualScore).color} />
                </div>
              )}

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <PanelField icon={Shield}    label="Category"         value={selected.category} />
                <PanelField icon={Shield}    label="Treatment"        value={selected.treatment} />
                <PanelField icon={Target}    label="Risk Owner"       value={selected.owner} />
                <PanelField icon={AlertTriangle} label="Risk Appetite" value={selected.riskAppetite} />
                <PanelField icon={Clock}     label="Identified"       value={fmt(selected.identifiedAt)} />
                <PanelField icon={Clock}     label="Due Date"         value={fmt(selected.dueDate)} />
                <PanelField icon={Clock}     label="Review Date"      value={fmt(selected.reviewDate)} />
              </div>

              {/* Linked context */}
              {(selected.linkedAsset || selected.linkedThreat || selected.linkedVulnerability) && (
                <div className="grid grid-cols-1 gap-3 mb-3">
                  {selected.linkedAsset         && <PanelField icon={FileText} label="Linked Asset"         value={selected.linkedAsset} />}
                  {selected.linkedThreat        && <PanelField icon={Zap}      label="Linked Threat"        value={selected.linkedThreat} />}
                  {selected.linkedVulnerability && <PanelField icon={Bug}      label="Linked Vulnerability" value={selected.linkedVulnerability} />}
                </div>
              )}

              {/* Description */}
              {selected.description && (
                <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-3 mb-3">
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Description</p>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                </div>
              )}

              {/* Mitigations */}
              {selected.mitigations && (
                <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-3 mb-3">
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Mitigations & Treatment Actions</p>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.mitigations}</p>
                </div>
              )}

              {/* Linked Controls */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Linked Controls</span>
                </div>
                {linkedControls.length > 0 ? (
                  <div className="space-y-1.5 mb-2">
                    {linkedControls.map(lc => {
                      const ctrl = allControls.find(c => c.id === lc.controlId);
                      return (
                        <div key={lc.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-bg/50 border border-border/40">
                          <div className="flex items-center gap-2">
                            <Shield className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span className="text-sm text-text-primary">{ctrl ? `${ctrl.code} — ${ctrl.title}` : lc.controlId}</span>
                          </div>
                          <button onClick={async () => { await apiDelete(`/risk-controls/${lc.id}`); const updated = await apiGet(`/risk-controls?riskId=${selected.id}`); setLinkedControls(updated); }} className="w-5 h-5 rounded flex items-center justify-center text-text-muted hover:text-danger transition-all">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-xs text-text-muted mb-2">No controls linked yet.</p>}
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-bg border border-border rounded-lg focus-within:border-primary/50 transition-all">
                    <select value={linkControlId} onChange={e => setLinkControlId(e.target.value)} className="flex-1 bg-transparent text-xs text-text-primary outline-none border-none focus:ring-0">
                      <option value="">Select a control to link...</option>
                      {allControls.filter(c => !linkedControls.some(lc => lc.controlId === c.id)).map(c => (
                        <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                      ))}
                    </select>
                  </div>
                  <button disabled={!linkControlId} onClick={async () => { if (!linkControlId) return; await apiPost('/risk-controls', { riskId: selected.id, controlId: linkControlId }); const updated = await apiGet(`/risk-controls?riskId=${selected.id}`); setLinkedControls(updated); setLinkControlId(''); }} className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium disabled:opacity-40 hover:bg-primary/90 transition-all flex items-center gap-1">
                    <Link2 className="w-3 h-3" /> Link
                  </button>
                </div>
              </div>

              <CommentsPanel module="risks" recordId={selected.id} apiGet={apiGet} apiPost={apiPost} apiDelete={apiDelete} user={user} />
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 px-6 py-4 border-t border-border flex-shrink-0">
              <Button onClick={() => openEdit(selected)} className="flex-1 justify-center">
                <Edit2 className="w-3.5 h-3.5" /> Edit Risk
              </Button>
              <Button variant="secondary" onClick={() => setConfirmDelete(selected.id)} className="text-danger hover:text-danger hover:bg-danger/10 hover:border-danger/30">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Risk' : 'Register New Risk'} size="lg">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Risk Title *" placeholder="Brief risk description" value={form.title} onChange={f('title')} />
          <TextArea label="Description" rows={2} placeholder="Detailed risk description and context" value={form.description} onChange={f('description')} />

          <div className="grid grid-cols-2 gap-3">
            <Select label="Category" value={form.category} onChange={f('category')}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </Select>
            <Select label="Risk Appetite" value={form.riskAppetite} onChange={f('riskAppetite')}>
              <option>Within Appetite</option>
              <option>Above Appetite</option>
              <option>Critical — Immediate Action</option>
            </Select>
          </div>

          {/* Inherent risk scoring */}
          <div className="flex items-center gap-3 pt-1">
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-2">Inherent Risk</span>
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select label="Likelihood (1–5)" value={String(form.likelihood)} onChange={fNum('likelihood')}>
              <option value="1">1 — Rare</option><option value="2">2 — Unlikely</option>
              <option value="3">3 — Possible</option><option value="4">4 — Likely</option><option value="5">5 — Almost Certain</option>
            </Select>
            <Select label="Impact (1–5)" value={String(form.impact)} onChange={fNum('impact')}>
              <option value="1">1 — Negligible</option><option value="2">2 — Minor</option>
              <option value="3">3 — Moderate</option><option value="4">4 — Major</option><option value="5">5 — Catastrophic</option>
            </Select>
            <LiveScore l={form.likelihood} i={form.impact} label="Inherent Score" />
          </div>

          {/* Residual risk scoring */}
          <div className="flex items-center gap-3 pt-1">
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-[10px] font-bold text-success uppercase tracking-widest px-2">Residual Risk (after treatment)</span>
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select label="Residual Likelihood" value={String(form.residualLikelihood)} onChange={fNum('residualLikelihood')}>
              <option value="0">— Not set</option>
              <option value="1">1 — Rare</option><option value="2">2 — Unlikely</option>
              <option value="3">3 — Possible</option><option value="4">4 — Likely</option><option value="5">5 — Almost Certain</option>
            </Select>
            <Select label="Residual Impact" value={String(form.residualImpact)} onChange={fNum('residualImpact')}>
              <option value="0">— Not set</option>
              <option value="1">1 — Negligible</option><option value="2">2 — Minor</option>
              <option value="3">3 — Moderate</option><option value="4">4 — Major</option><option value="5">5 — Catastrophic</option>
            </Select>
            <LiveScore l={form.residualLikelihood} i={form.residualImpact} label="Residual Score" />
          </div>

          {/* Treatment */}
          <div className="flex items-center gap-3 pt-1">
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2">Treatment</span>
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select label="Treatment" value={form.treatment} onChange={f('treatment')}>
              <option>Mitigate</option><option>Accept</option><option>Transfer</option><option>Avoid</option>
            </Select>
            <Select label="Status" value={form.status} onChange={f('status')}>
              <option>Open</option><option>Under Treatment</option><option>Accepted</option><option>Closed</option>
            </Select>
            <Input label="Risk Owner" placeholder="Responsible person" value={form.owner} onChange={f('owner')} />
          </div>
          <TextArea label="Mitigations & Treatment Actions" rows={2} placeholder="Describe mitigation measures and treatment actions" value={form.mitigations} onChange={f('mitigations')} />

          {/* Links & Dates */}
          <div className="flex items-center gap-3 pt-1">
            <div className="h-px flex-1 bg-border/40" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2">Links & Dates</span>
            <div className="h-px flex-1 bg-border/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Linked Asset" placeholder="e.g. SAP ERP, Customer Portal" value={form.linkedAsset} onChange={f('linkedAsset')} />
            <Input label="Linked Threat" placeholder="e.g. Ransomware, Phishing" value={form.linkedThreat} onChange={f('linkedThreat')} />
            <Input label="Linked Vulnerability" placeholder="e.g. CVE-2024-xxxx, Unpatched OS" value={form.linkedVulnerability} onChange={f('linkedVulnerability')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Date Identified" type="date" value={form.identifiedAt} onChange={f('identifiedAt')} />
            <Input label="Due Date" type="date" value={form.dueDate} onChange={f('dueDate')} />
            <Input label="Review Date" type="date" value={form.reviewDate} onChange={f('reviewDate')} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit">{editingId ? 'Update Risk' : 'Save Risk'}</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={() => { if (confirmDelete) { handleDelete(confirmDelete); setConfirmDelete(null); } }} />
    </div>
    </AccessGuard>
  );
}
