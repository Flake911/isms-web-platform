'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select, TextArea, ConfirmDialog, Breadcrumbs, toast } from '@/components/ui';
import { FileCheck, Download, Plus, CheckCircle, MinusCircle, Clock, Edit2, Trash2, FileText, Search, X, User, Calendar, Link2, Eye, AlertTriangle, StickyNote } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { exportToCSV, exportToPDF } from '@/lib/export';

// All 93 Annex A controls
const ALL_CONTROLS = [
  { code:'A.5.1', name:'Policies for information security', category:'Organizational' },
  { code:'A.5.2', name:'Information security roles and responsibilities', category:'Organizational' },
  { code:'A.5.3', name:'Segregation of duties', category:'Organizational' },
  { code:'A.5.4', name:'Management responsibilities', category:'Organizational' },
  { code:'A.5.5', name:'Contact with authorities', category:'Organizational' },
  { code:'A.5.6', name:'Contact with special interest groups', category:'Organizational' },
  { code:'A.5.7', name:'Threat intelligence', category:'Organizational' },
  { code:'A.5.8', name:'Infosec in project management', category:'Organizational' },
  { code:'A.5.9', name:'Inventory of information assets', category:'Organizational' },
  { code:'A.5.10', name:'Acceptable use of information', category:'Organizational' },
  { code:'A.5.11', name:'Return of assets', category:'Organizational' },
  { code:'A.5.12', name:'Classification of information', category:'Organizational' },
  { code:'A.5.13', name:'Labelling of information', category:'Organizational' },
  { code:'A.5.14', name:'Information transfer', category:'Organizational' },
  { code:'A.5.15', name:'Access control', category:'Organizational' },
  { code:'A.5.16', name:'Identity management', category:'Organizational' },
  { code:'A.5.17', name:'Authentication information', category:'Organizational' },
  { code:'A.5.18', name:'Access rights', category:'Organizational' },
  { code:'A.5.19', name:'Infosec in supplier relationships', category:'Organizational' },
  { code:'A.5.20', name:'Addressing infosec within supplier agreements', category:'Organizational' },
  { code:'A.5.21', name:'Managing infosec in the ICT supply chain', category:'Organizational' },
  { code:'A.5.22', name:'Monitoring and review of supplier services', category:'Organizational' },
  { code:'A.5.23', name:'Infosec for use of cloud services', category:'Organizational' },
  { code:'A.5.24', name:'Incident management planning', category:'Organizational' },
  { code:'A.5.25', name:'Assessment of infosec events', category:'Organizational' },
  { code:'A.5.26', name:'Response to infosec incidents', category:'Organizational' },
  { code:'A.5.27', name:'Learning from infosec incidents', category:'Organizational' },
  { code:'A.5.28', name:'Collection of evidence', category:'Organizational' },
  { code:'A.5.29', name:'Infosec during disruption', category:'Organizational' },
  { code:'A.5.30', name:'ICT readiness for business continuity', category:'Organizational' },
  { code:'A.5.31', name:'Legal, statutory & regulatory requirements', category:'Organizational' },
  { code:'A.5.32', name:'Intellectual property rights', category:'Organizational' },
  { code:'A.5.33', name:'Protection of records', category:'Organizational' },
  { code:'A.5.34', name:'Privacy and protection of PII', category:'Organizational' },
  { code:'A.5.35', name:'Independent review of infosec', category:'Organizational' },
  { code:'A.5.36', name:'Compliance with policies & standards', category:'Organizational' },
  { code:'A.5.37', name:'Documented operating procedures', category:'Organizational' },
  { code:'A.6.1', name:'Screening', category:'People' },
  { code:'A.6.2', name:'Terms and conditions of employment', category:'People' },
  { code:'A.6.3', name:'Information security awareness & training', category:'People' },
  { code:'A.6.4', name:'Disciplinary process', category:'People' },
  { code:'A.6.5', name:'Responsibilities after termination', category:'People' },
  { code:'A.6.6', name:'Confidentiality or NDA', category:'People' },
  { code:'A.6.7', name:'Remote working', category:'People' },
  { code:'A.6.8', name:'Information security event reporting', category:'People' },
  { code:'A.7.1', name:'Physical security perimeters', category:'Physical' },
  { code:'A.7.2', name:'Physical entry', category:'Physical' },
  { code:'A.7.3', name:'Securing offices, rooms & facilities', category:'Physical' },
  { code:'A.7.4', name:'Physical security monitoring', category:'Physical' },
  { code:'A.7.5', name:'Protecting against physical threats', category:'Physical' },
  { code:'A.7.6', name:'Working in secure areas', category:'Physical' },
  { code:'A.7.7', name:'Clear desk and clear screen', category:'Physical' },
  { code:'A.7.8', name:'Equipment siting and protection', category:'Physical' },
  { code:'A.7.9', name:'Security of assets off-premises', category:'Physical' },
  { code:'A.7.10', name:'Storage media', category:'Physical' },
  { code:'A.7.11', name:'Supporting utilities', category:'Physical' },
  { code:'A.7.12', name:'Cabling security', category:'Physical' },
  { code:'A.7.13', name:'Equipment maintenance', category:'Physical' },
  { code:'A.7.14', name:'Secure disposal or re-use', category:'Physical' },
  { code:'A.8.1', name:'User endpoint devices', category:'Technological' },
  { code:'A.8.2', name:'Privileged access rights', category:'Technological' },
  { code:'A.8.3', name:'Information access restriction', category:'Technological' },
  { code:'A.8.4', name:'Access to source code', category:'Technological' },
  { code:'A.8.5', name:'Secure authentication', category:'Technological' },
  { code:'A.8.6', name:'Capacity management', category:'Technological' },
  { code:'A.8.7', name:'Protection against malware', category:'Technological' },
  { code:'A.8.8', name:'Management of technical vulnerabilities', category:'Technological' },
  { code:'A.8.9', name:'Configuration management', category:'Technological' },
  { code:'A.8.10', name:'Information deletion', category:'Technological' },
  { code:'A.8.11', name:'Data masking', category:'Technological' },
  { code:'A.8.12', name:'Data leakage prevention', category:'Technological' },
  { code:'A.8.13', name:'Information backup', category:'Technological' },
  { code:'A.8.14', name:'Redundancy of information processing', category:'Technological' },
  { code:'A.8.15', name:'Logging', category:'Technological' },
  { code:'A.8.16', name:'Monitoring activities', category:'Technological' },
  { code:'A.8.17', name:'Clock synchronization', category:'Technological' },
  { code:'A.8.18', name:'Use of privileged utility programs', category:'Technological' },
  { code:'A.8.19', name:'Installation of software', category:'Technological' },
  { code:'A.8.20', name:'Networks security', category:'Technological' },
  { code:'A.8.21', name:'Security of network services', category:'Technological' },
  { code:'A.8.22', name:'Segregation of networks', category:'Technological' },
  { code:'A.8.23', name:'Web filtering', category:'Technological' },
  { code:'A.8.24', name:'Use of cryptography', category:'Technological' },
  { code:'A.8.25', name:'Secure development life cycle', category:'Technological' },
  { code:'A.8.26', name:'Application security requirements', category:'Technological' },
  { code:'A.8.27', name:'Secure system architecture', category:'Technological' },
  { code:'A.8.28', name:'Secure coding', category:'Technological' },
  { code:'A.8.29', name:'Security testing in development', category:'Technological' },
  { code:'A.8.30', name:'Outsourced development', category:'Technological' },
  { code:'A.8.31', name:'Separation of environments', category:'Technological' },
  { code:'A.8.32', name:'Change management', category:'Technological' },
  { code:'A.8.33', name:'Test information', category:'Technological' },
  { code:'A.8.34', name:'Protection during audit testing', category:'Technological' },
];

interface SoAEntry {
  id: string; controlId: string; controlName: string; category: string;
  applicable: string; justification: string; exclusionReason: string;
  status: string; owner: string; linkedRisks: string; evidence: string;
  implementationDate: string | null; reviewDate: string | null;
}

const empty = {
  controlId: 'A.5.1', controlName: 'Policies for information security', category: 'Organizational',
  applicable: 'Yes', justification: '', exclusionReason: '',
  status: 'Not Started', owner: '', linkedRisks: '', evidence: '',
  implementationDate: '', reviewDate: '',
};

const applicableColor = (a: string) =>
  a === 'Yes' ? 'bg-success-light text-success' :
  a === 'Partial' ? 'bg-warning-light text-warning' :
  'bg-surface-light text-text-muted';

const statusColor = (s: string) =>
  s === 'Implemented' ? 'bg-success-light text-success' :
  s === 'In Progress' ? 'bg-info-light text-primary' :
  s === 'Planned' ? 'bg-warning-light text-warning' :
  'bg-surface-light text-text-muted';

const categoryColor: Record<string, string> = {
  Organizational: 'bg-primary/10 text-primary',
  People: 'bg-accent/10 text-accent',
  Physical: 'bg-warning-light text-warning',
  Technological: 'bg-success-light text-success',
};

const toDateInput = (d: string | null) => d ? d.split('T')[0] : '';
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function SoAPage() {
  const [items, setItems] = useState<SoAEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selected, setSelected] = useState<SoAEntry | null>(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');
  const [filterApplicable, setFilterApplicable] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const f = (k: Partial<typeof empty>) => setForm(prev => ({ ...prev, ...k }));

  const fetch_ = useCallback(async () => {
    try { setItems(await apiGet('/soa')); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch_(); }, [fetch_]);

  const handleControlSelect = (value: string) => {
    const ctrl = ALL_CONTROLS.find(c => c.code === value);
    if (ctrl) f({ controlId: ctrl.code, controlName: ctrl.name, category: ctrl.category });
  };

  const openCreate = () => { setEditingId(null); setForm(empty); setShowModal(true); };
  const openEdit = (item: SoAEntry) => {
    setSelected(null);
    setEditingId(item.id);
    setForm({
      controlId: item.controlId, controlName: item.controlName || '',
      category: item.category || '',
      applicable: item.applicable, justification: item.justification || '',
      exclusionReason: item.exclusionReason || '',
      status: item.status, owner: item.owner || '',
      linkedRisks: item.linkedRisks || '', evidence: item.evidence || '',
      implementationDate: toDateInput(item.implementationDate),
      reviewDate: toDateInput(item.reviewDate),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      implementationDate: form.implementationDate ? new Date(form.implementationDate).toISOString() : null,
      reviewDate: form.reviewDate ? new Date(form.reviewDate).toISOString() : null,
    };
    try {
      if (editingId) await apiPut(`/soa/${editingId}`, payload);
      else await apiPost('/soa', payload);
      setShowModal(false); fetch_(); toast('SoA entry saved', 'success');
    } catch (e: any) { toast(e?.message || 'Failed to save'); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/soa/${id}`); setSelected(null); fetch_(); toast('Entry deleted', 'success'); }
    catch (e: any) { toast(e?.message || 'Failed to delete'); }
  };

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = i.controlId.toLowerCase().includes(q) || (i.controlName || '').toLowerCase().includes(q) || (i.owner || '').toLowerCase().includes(q);
    const matchApplicable = filterApplicable === 'All' || i.applicable === filterApplicable;
    const matchStatus = filterStatus === 'All' || i.status === filterStatus;
    return matchSearch && matchApplicable && matchStatus;
  });

  const applicable = items.filter(i => i.applicable === 'Yes' || i.applicable === 'Partial').length;
  const notApplicable = items.filter(i => i.applicable === 'No').length;
  const implemented = items.filter(i => i.status === 'Implemented').length;
  const coverage = Math.round((items.length / 93) * 100);

  return (
    <AccessGuard page="soa">
      <div className="animate-fade-in">
        <Breadcrumbs items={[{ label: 'Statement of Applicability' }]} />
        <PageHeader
          title="Statement of Applicability"
          subtitle="Clause 6.1.3 — ISO 27001:2022 Annex A — All 93 Controls"
          icon={<FileCheck className="w-4 h-4" />}
          action={
            <div className="flex gap-2">
              <button onClick={() => exportToCSV(items, 'soa', [
                {key:'controlId',label:'Control ID'},{key:'controlName',label:'Control Name'},
                {key:'category',label:'Category'},{key:'applicable',label:'Applicable'},
                {key:'justification',label:'Justification'},{key:'exclusionReason',label:'Exclusion Reason'},
                {key:'status',label:'Status'},{key:'owner',label:'Owner'},
              ])} className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-text-muted hover:text-text-secondary hover:bg-surface-light transition-all flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button onClick={() => exportToPDF('Statement of Applicability', 'Clause 6.1.3 — ISO 27001:2022', items, [
                {key:'controlId',label:'ID'},{key:'controlName',label:'Control'},
                {key:'applicable',label:'Applicable'},{key:'status',label:'Status'},{key:'owner',label:'Owner'},
              ])} className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-text-muted hover:text-text-secondary hover:bg-surface-light transition-all flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
              <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Entry</Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatsCard title="SoA Coverage" value={`${items.length}/93`} icon={<FileCheck className="w-5 h-5" />} />
          <StatsCard title="Applicable" value={applicable} icon={<CheckCircle className="w-5 h-5" />} color="success" />
          <StatsCard title="Not Applicable" value={notApplicable} icon={<MinusCircle className="w-5 h-5" />} />
          <StatsCard title="Implemented" value={implemented} icon={<Clock className="w-5 h-5" />} color="info" />
        </div>

        {/* Coverage progress bar */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-text-secondary">SoA Completion</span>
            <span className="text-xs font-bold text-primary">{coverage}% — {items.length} of 93 controls documented</span>
          </div>
          <div className="w-full h-2 bg-surface-light rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${coverage}%` }} />
          </div>
          <div className="flex items-center gap-4 mt-2">
            {['Organizational','People','Physical','Technological'].map(cat => {
              const total = { Organizational:37, People:8, Physical:14, Technological:34 }[cat]!;
              const done = items.filter(i => i.category === cat).length;
              return (
                <span key={cat} className={`text-[10px] px-2 py-1 rounded font-medium ${categoryColor[cat]}`}>
                  {cat}: {done}/{total}
                </span>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-bg border border-border rounded-lg flex-1 min-w-[200px] max-w-sm hover:border-border-light focus-within:border-primary/50 transition-all">
            <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search controls..."
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none border-none focus:ring-0 min-w-0" />
            {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-text-muted hover:text-text-primary" /></button>}
          </div>
          <select value={filterApplicable} onChange={e => setFilterApplicable(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary hover:border-border-light transition-all">
            <option value="All">All Applicability</option>
            <option>Yes</option><option>Partial</option><option>No</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary hover:border-border-light transition-all">
            <option value="All">All Statuses</option>
            <option>Not Started</option><option>Planned</option>
            <option>In Progress</option><option>Implemented</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : items.length === 0 ? (
          <EmptyState title="Statement of Applicability is empty" description="Define which Annex A controls apply to your organization with justifications." icon={<FileCheck className="w-8 h-8" />} action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Start SoA</Button>} />
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg/50">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-20">ID</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Control Name</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Category</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Applicable</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-32">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-32">Owner</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Review Date</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} onClick={() => setSelected(item)}
                    className="border-b border-border/40 last:border-0 hover:bg-surface-light/50 transition-colors cursor-pointer">
                    <td className="px-4 py-2.5 font-mono text-xs text-primary font-semibold">{item.controlId}</td>
                    <td className="px-4 py-2.5 text-sm text-text-primary max-w-[240px]">
                      <p className="truncate">{item.controlName}</p>
                      {item.justification && <p className="text-[10px] text-text-muted truncate mt-0.5">{item.justification}</p>}
                    </td>
                    <td className="px-4 py-2.5">
                      {item.category && <span className={`text-[10px] px-2 py-1 rounded font-medium ${categoryColor[item.category] || 'bg-surface-light text-text-muted'}`}>{item.category}</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${applicableColor(item.applicable)}`}>{item.applicable}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${statusColor(item.status)}`}>{item.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-text-muted">{item.owner || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-text-muted">{fmtDate(item.reviewDate)}</td>
                    <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(item)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-info-light transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setConfirmDelete(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger-light transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2.5 border-t border-border/50 bg-bg/30">
              <span className="text-[11px] text-text-muted">{filtered.length} of {items.length} entries</span>
            </div>
          </div>
        )}

        {/* Detail Side Panel */}
        {selected && (
          <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
            <div className="fixed top-0 right-0 max-h-screen w-[640px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel">
              {/* Accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-primary to-success shrink-0" />

              {/* Header */}
              <div className="px-7 py-6 border-b border-border bg-bg/60 flex items-start justify-between gap-4 shrink-0">
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center font-mono text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 mb-2">{selected.controlId}</span>
                  <h2 className="text-xl font-bold text-text-primary leading-snug">{selected.controlName}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Badges */}
              <div className="px-7 py-3 border-b border-border/50 flex items-center gap-2 flex-wrap shrink-0 bg-bg/30">
                {selected.category && <span className={`text-xs px-2.5 py-1 rounded font-semibold ${categoryColor[selected.category] || 'bg-surface-light text-text-muted'}`}>{selected.category}</span>}
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${applicableColor(selected.applicable)}`}>
                  {selected.applicable === 'Yes' ? 'Applicable' : selected.applicable === 'Partial' ? 'Partially Applicable' : 'Not Applicable'}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor(selected.status)}`}>{selected.status}</span>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-7 pt-5 pb-2 space-y-4">

                {/* Justification */}
                {selected.justification && (
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5"><StickyNote className="w-3 h-3" /> Justification</p>
                    <p className="text-sm text-text-secondary leading-relaxed">{selected.justification}</p>
                  </div>
                )}

                {/* Exclusion Reason */}
                {selected.exclusionReason && (
                  <div className="bg-danger/5 rounded-xl border border-danger/20 p-4">
                    <p className="text-[10px] font-bold text-danger/70 uppercase tracking-widest mb-2 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Exclusion Reason</p>
                    <p className="text-sm text-text-secondary leading-relaxed">{selected.exclusionReason}</p>
                  </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-3">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1"><User className="w-3 h-3" /> Owner</p>
                    <p className="text-sm text-text-primary font-medium">{selected.owner || '—'}</p>
                  </div>
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-3">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Implementation Date</p>
                    <p className="text-sm text-text-primary font-medium">{fmtDate(selected.implementationDate)}</p>
                  </div>
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-3">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Review Date</p>
                    <p className={`text-sm font-medium ${selected.reviewDate && new Date(selected.reviewDate) < new Date() ? 'text-danger' : 'text-text-primary'}`}>
                      {fmtDate(selected.reviewDate)}
                    </p>
                  </div>
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-3">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1"><Link2 className="w-3 h-3" /> Linked Risks</p>
                    <p className="text-sm text-text-primary font-medium">{selected.linkedRisks || '—'}</p>
                  </div>
                </div>

                {/* Evidence */}
                {selected.evidence && (
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5"><Eye className="w-3 h-3" /> Evidence</p>
                    <p className="text-sm text-text-secondary">{selected.evidence}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-7 py-5 border-t border-border bg-bg/60 flex gap-3 shrink-0">
                <Button onClick={() => openEdit(selected)} className="flex-1 py-2.5 text-sm"><Edit2 className="w-4 h-4" /> Edit Entry</Button>
                <button onClick={() => setConfirmDelete(selected.id)} className="px-4 py-2.5 rounded-xl border border-danger/30 text-danger hover:bg-danger-light transition-all text-sm font-medium flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </>
        )}

        {/* Create / Edit Modal */}
        <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit SoA Entry' : 'Add SoA Entry'} size="lg">
          <form className="space-y-4" onSubmit={handleSubmit}>

            {/* Control selector */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Annex A Control *</label>
              <select value={form.controlId} onChange={e => handleControlSelect(e.target.value)}
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary hover:border-border-light transition-all">
                {ALL_CONTROLS.map(c => (
                  <option key={c.code} value={c.code}>{c.code} — {c.name}</option>
                ))}
              </select>
              {form.category && (
                <span className={`inline-flex mt-1.5 text-[10px] px-2 py-1 rounded font-medium ${categoryColor[form.category]}`}>{form.category}</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select label="Applicable" value={form.applicable} onChange={e => f({ applicable: e.target.value })}>
                <option>Yes</option>
                <option>Partial</option>
                <option>No</option>
              </Select>
              <Select label="Implementation Status" value={form.status} onChange={e => f({ status: e.target.value })}>
                <option>Not Started</option>
                <option>Planned</option>
                <option>In Progress</option>
                <option>Implemented</option>
              </Select>
            </div>

            <TextArea label="Justification" rows={2} placeholder="Why is this control applicable to your organization?" value={form.justification} onChange={e => f({ justification: e.target.value })} />

            {(form.applicable === 'No' || form.applicable === 'Partial') && (
              <TextArea label="Exclusion / Limitation Reason" rows={2} placeholder="Why is this control excluded or only partially applicable?" value={form.exclusionReason} onChange={e => f({ exclusionReason: e.target.value })} />
            )}

            <div className="grid grid-cols-2 gap-3">
              <Input label="Owner" placeholder="Responsible person" value={form.owner} onChange={e => f({ owner: e.target.value })} />
              <Input label="Linked Risks" placeholder="e.g. RSK-001, RSK-003" value={form.linkedRisks} onChange={e => f({ linkedRisks: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Implementation Date" type="date" value={form.implementationDate} onChange={e => f({ implementationDate: e.target.value })} />
              <Input label="Review Date" type="date" value={form.reviewDate} onChange={e => f({ reviewDate: e.target.value })} />
            </div>

            <Input label="Evidence Reference" placeholder="e.g. DOC-001, Audit report Q1" value={form.evidence} onChange={e => f({ evidence: e.target.value })} />

            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">{editingId ? 'Save Changes' : 'Add Entry'}</Button>
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:bg-surface-light transition-all">Cancel</button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          open={!!confirmDelete}
          title="Delete SoA Entry"
          message="Are you sure you want to delete this entry? This action cannot be undone."
          onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete); setConfirmDelete(null); }}
          onClose={() => setConfirmDelete(null)}
        />
      </div>
    </AccessGuard>
  );
}
