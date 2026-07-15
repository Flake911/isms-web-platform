'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, StatsCard, StatusBadge, Button, Modal, Input, Select, TextArea, ConfirmDialog, Breadcrumbs, toast } from '@/components/ui';
import { Shield, CheckCircle, Clock, XCircle, Search, Plus, Edit2, Trash2, Download, FileText, X, AlertTriangle, Link2, Calendar, CalendarCheck, StickyNote, Zap, ShieldCheck, Eye } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import CommentsSection from '@/components/Comments';
import { exportToCSV, exportToPDF } from '@/lib/export';

const annexASeed = [
  { code:'A.5.1',title:'Policies for information security',category:'Organizational',description:'Provide management direction and support for infosec.' },
  { code:'A.5.2',title:'Information security roles and responsibilities',category:'Organizational',description:'Ensure all infosec responsibilities are defined and allocated.' },
  { code:'A.5.3',title:'Segregation of duties',category:'Organizational',description:'Reduce opportunities for unauthorized modification.' },
  { code:'A.5.4',title:'Management responsibilities',category:'Organizational',description:'Management actively supports security.' },
  { code:'A.5.5',title:'Contact with authorities',category:'Organizational',description:'Maintain contact with relevant authorities.' },
  { code:'A.5.6',title:'Contact with special interest groups',category:'Organizational',description:'Maintain contact with security forums.' },
  { code:'A.5.7',title:'Threat intelligence',category:'Organizational',description:'Collect and analyze threat information.' },
  { code:'A.5.8',title:'Infosec in project management',category:'Organizational',description:'Integrate infosec into project management.' },
  { code:'A.5.9',title:'Inventory of information assets',category:'Organizational',description:'Identify and maintain inventory of assets.' },
  { code:'A.5.10',title:'Acceptable use of information',category:'Organizational',description:'Ensure proper use of information.' },
  { code:'A.5.11',title:'Return of assets',category:'Organizational',description:'Ensure return of assets upon termination.' },
  { code:'A.5.12',title:'Classification of information',category:'Organizational',description:'Ensure appropriate level of protection.' },
  { code:'A.5.13',title:'Labelling of information',category:'Organizational',description:'Facilitate communication of classification.' },
  { code:'A.5.14',title:'Information transfer',category:'Organizational',description:'Maintain security of transferred information.' },
  { code:'A.5.15',title:'Access control',category:'Organizational',description:'Limit access to information.' },
  { code:'A.5.16',title:'Identity management',category:'Organizational',description:'Enable unique identity recognition.' },
  { code:'A.5.17',title:'Authentication information',category:'Organizational',description:'Ensure proper authentication.' },
  { code:'A.5.18',title:'Access rights',category:'Organizational',description:'Ensure authorized access only.' },
  { code:'A.5.19',title:'Infosec in supplier relationships',category:'Organizational',description:'Maintain agreed level of security.' },
  { code:'A.5.20',title:'Addressing infosec within supplier agreements',category:'Organizational',description:'Establish requirements with suppliers.' },
  { code:'A.5.21',title:'Managing infosec in the ICT supply chain',category:'Organizational',description:'Maintain agreed security level in supply chain.' },
  { code:'A.5.22',title:'Monitoring and review of supplier services',category:'Organizational',description:'Monitor changes to supplier services.' },
  { code:'A.5.23',title:'Infosec for use of cloud services',category:'Organizational',description:'Manage cloud service risks.' },
  { code:'A.5.24',title:'Incident management planning',category:'Organizational',description:'Ensure quick effective response.' },
  { code:'A.5.25',title:'Assessment of infosec events',category:'Organizational',description:'Categorize security events.' },
  { code:'A.5.26',title:'Response to infosec incidents',category:'Organizational',description:'Respond in accordance with procedures.' },
  { code:'A.5.27',title:'Learning from infosec incidents',category:'Organizational',description:'Reduce future incidents.' },
  { code:'A.5.28',title:'Collection of evidence',category:'Organizational',description:'Ensure proper evidence handling.' },
  { code:'A.5.29',title:'Infosec during disruption',category:'Organizational',description:'Maintain infosec during disruption.' },
  { code:'A.5.30',title:'ICT readiness for business continuity',category:'Organizational',description:'Ensure ICT continuity.' },
  { code:'A.5.31',title:'Legal, statutory & regulatory requirements',category:'Organizational',description:'Avoid legal breaches.' },
  { code:'A.5.32',title:'Intellectual property rights',category:'Organizational',description:'Ensure compliance with IP.' },
  { code:'A.5.33',title:'Protection of records',category:'Organizational',description:'Protect records from loss.' },
  { code:'A.5.34',title:'Privacy and protection of PII',category:'Organizational',description:'Ensure privacy compliance.' },
  { code:'A.5.35',title:'Independent review of infosec',category:'Organizational',description:'Ensure continuing suitability.' },
  { code:'A.5.36',title:'Compliance with policies & standards',category:'Organizational',description:'Ensure compliance.' },
  { code:'A.5.37',title:'Documented operating procedures',category:'Organizational',description:'Ensure correct operations.' },
  { code:'A.6.1',title:'Screening',category:'People',description:'Ensure suitability of personnel.' },
  { code:'A.6.2',title:'Terms and conditions of employment',category:'People',description:'State infosec responsibilities.' },
  { code:'A.6.3',title:'Information security awareness & training',category:'People',description:'Ensure adequate awareness.' },
  { code:'A.6.4',title:'Disciplinary process',category:'People',description:'Ensure a formal process.' },
  { code:'A.6.5',title:'Responsibilities after termination',category:'People',description:'Protect organization interests.' },
  { code:'A.6.6',title:'Confidentiality or NDA',category:'People',description:'Maintain confidentiality.' },
  { code:'A.6.7',title:'Remote working',category:'People',description:'Protect remotely processed info.' },
  { code:'A.6.8',title:'Information security event reporting',category:'People',description:'Support timely reporting.' },
  { code:'A.7.1',title:'Physical security perimeters',category:'Physical',description:'Prevent unauthorized physical access.' },
  { code:'A.7.2',title:'Physical entry',category:'Physical',description:'Secure areas by entry controls.' },
  { code:'A.7.3',title:'Securing offices, rooms & facilities',category:'Physical',description:'Prevent unauthorized access.' },
  { code:'A.7.4',title:'Physical security monitoring',category:'Physical',description:'Detect unauthorized physical access.' },
  { code:'A.7.5',title:'Protecting against physical threats',category:'Physical',description:'Prevent environmental damage.' },
  { code:'A.7.6',title:'Working in secure areas',category:'Physical',description:'Protect info in secure areas.' },
  { code:'A.7.7',title:'Clear desk and clear screen',category:'Physical',description:'Reduce risk of unauthorized access.' },
  { code:'A.7.8',title:'Equipment siting and protection',category:'Physical',description:'Reduce environmental risks.' },
  { code:'A.7.9',title:'Security of assets off-premises',category:'Physical',description:'Protect off-site assets.' },
  { code:'A.7.10',title:'Storage media',category:'Physical',description:'Prevent unauthorized disclosure.' },
  { code:'A.7.11',title:'Supporting utilities',category:'Physical',description:'Prevent loss of power.' },
  { code:'A.7.12',title:'Cabling security',category:'Physical',description:'Prevent interception of cabling.' },
  { code:'A.7.13',title:'Equipment maintenance',category:'Physical',description:'Prevent loss from maintenance.' },
  { code:'A.7.14',title:'Secure disposal or re-use',category:'Physical',description:'Prevent data leakage on disposal.' },
  { code:'A.8.1',title:'User endpoint devices',category:'Technological',description:'Protect info on endpoints.' },
  { code:'A.8.2',title:'Privileged access rights',category:'Technological',description:'Restrict and manage privileged access.' },
  { code:'A.8.3',title:'Information access restriction',category:'Technological',description:'Ensure authorized access only.' },
  { code:'A.8.4',title:'Access to source code',category:'Technological',description:'Prevent unauthorized changes.' },
  { code:'A.8.5',title:'Secure authentication',category:'Technological',description:'Ensure secure logon procedures.' },
  { code:'A.8.6',title:'Capacity management',category:'Technological',description:'Ensure adequate capacity.' },
  { code:'A.8.7',title:'Protection against malware',category:'Technological',description:'Ensure malware protection.' },
  { code:'A.8.8',title:'Management of technical vulnerabilities',category:'Technological',description:'Prevent exploitation.' },
  { code:'A.8.9',title:'Configuration management',category:'Technological',description:'Ensure proper configuration.' },
  { code:'A.8.10',title:'Information deletion',category:'Technological',description:'Prevent unnecessary retention.' },
  { code:'A.8.11',title:'Data masking',category:'Technological',description:'Limit data exposure.' },
  { code:'A.8.12',title:'Data leakage prevention',category:'Technological',description:'Detect and prevent data leakage.' },
  { code:'A.8.13',title:'Information backup',category:'Technological',description:'Protect against data loss.' },
  { code:'A.8.14',title:'Redundancy of information processing',category:'Technological',description:'Ensure availability.' },
  { code:'A.8.15',title:'Logging',category:'Technological',description:'Record events for investigation.' },
  { code:'A.8.16',title:'Monitoring activities',category:'Technological',description:'Detect anomalous behavior.' },
  { code:'A.8.17',title:'Clock synchronization',category:'Technological',description:'Enable event correlation.' },
  { code:'A.8.18',title:'Use of privileged utility programs',category:'Technological',description:'Prevent misuse of utilities.' },
  { code:'A.8.19',title:'Installation of software',category:'Technological',description:'Prevent unauthorized software.' },
  { code:'A.8.20',title:'Networks security',category:'Technological',description:'Protect network information.' },
  { code:'A.8.21',title:'Security of network services',category:'Technological',description:'Ensure security of network services.' },
  { code:'A.8.22',title:'Segregation of networks',category:'Technological',description:'Segregate network groups.' },
  { code:'A.8.23',title:'Web filtering',category:'Technological',description:'Reduce malicious web exposure.' },
  { code:'A.8.24',title:'Use of cryptography',category:'Technological',description:'Ensure proper use of crypto.' },
  { code:'A.8.25',title:'Secure development life cycle',category:'Technological',description:'Ensure security in development.' },
  { code:'A.8.26',title:'Application security requirements',category:'Technological',description:'Identify and specify requirements.' },
  { code:'A.8.27',title:'Secure system architecture',category:'Technological',description:'Establish secure architecture.' },
  { code:'A.8.28',title:'Secure coding',category:'Technological',description:'Ensure secure coding practices.' },
  { code:'A.8.29',title:'Security testing in development',category:'Technological',description:'Validate security in dev/acceptance.' },
  { code:'A.8.30',title:'Outsourced development',category:'Technological',description:'Ensure security in outsourced dev.' },
  { code:'A.8.31',title:'Separation of environments',category:'Technological',description:'Reduce risks from dev environment.' },
  { code:'A.8.32',title:'Change management',category:'Technological',description:'Preserve security during changes.' },
  { code:'A.8.33',title:'Test information',category:'Technological',description:'Ensure appropriate test data.' },
  { code:'A.8.34',title:'Protection during audit testing',category:'Technological',description:'Minimize impact of audit tests.' },
];

interface ControlEntry {
  id: string; code: string; title: string; description: string; category: string;
  status: string; owner: string; evidence: string; implementationNotes: string;
  effectiveness: string; controlType: string; cybersecurityConcept: string;
  lastReviewDate: string | null; nextReviewDate: string | null;
  createdAt: string; updatedAt: string;
}
interface LinkedRisk { id: string; riskId: string; controlId: string; notes: string; }

const emptyForm = {
  code: '', title: '', description: '', category: 'Organizational',
  status: 'Not Implemented', owner: '', evidence: '',
  implementationNotes: '', effectiveness: 'Not Assessed',
  controlType: 'Preventive', cybersecurityConcept: '',
  lastReviewDate: '', nextReviewDate: '',
};

const themeColors: Record<string, string> = {
  Organizational: 'bg-primary/10 text-primary',
  People: 'bg-accent/10 text-accent',
  Physical: 'bg-warning-light text-warning',
  Technological: 'bg-success-light text-success',
};
const effectivenessColor = (e: string) =>
  e === 'Effective' ? 'bg-success-light text-success' :
  e === 'Partially Effective' ? 'bg-warning-light text-warning' :
  e === 'Not Effective' ? 'bg-danger-light text-danger' :
  'bg-surface-light text-text-muted';

const statusColor = (s: string) =>
  s === 'Implemented' ? 'bg-success-light text-success' :
  s === 'In Progress' ? 'bg-info-light text-primary' :
  s === 'Partially Implemented' ? 'bg-warning-light text-warning' :
  'bg-surface-light text-text-muted';

const toDateInput = (d: string | null) => d ? d.split('T')[0] : '';
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const CATEGORY_TOTALS: Record<string, number> = { Organizational: 37, People: 8, Physical: 14, Technological: 34 };

export default function ControlsPage() {
  const [controls, setControls] = useState<ControlEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTheme, setFilterTheme] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selected, setSelected] = useState<ControlEntry | null>(null);
  const [linkedRisks, setLinkedRisks] = useState<LinkedRisk[]>([]);
  const f = (k: Partial<typeof emptyForm>) => setForm(prev => ({ ...prev, ...k }));

  const fetchControls = useCallback(async () => {
    try {
      let data = await apiGet<ControlEntry[]>('/controls');
      if (data.length === 0) {
        for (const c of annexASeed) await apiPost('/controls', c);
        data = await apiGet<ControlEntry[]>('/controls');
      }
      setControls(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchControls(); }, [fetchControls]);

  const fetchLinkedRisks = useCallback(async (controlId: string) => {
    try { setLinkedRisks(await apiGet(`/risk-controls?controlId=${controlId}`)); }
    catch { setLinkedRisks([]); }
  }, []);

  const handleRowClick = (c: ControlEntry) => {
    setSelected(c);
    fetchLinkedRisks(c.id);
  };

  const filtered = controls.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = c.title.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || (c.owner || '').toLowerCase().includes(q);
    const matchTheme = filterTheme === 'All' || c.category === filterTheme;
    const matchStatus = filterStatus === 'All' || c.status === filterStatus;
    return matchSearch && matchTheme && matchStatus;
  });

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (c: ControlEntry) => {
    setSelected(null);
    setEditingId(c.id);
    setForm({
      code: c.code, title: c.title, description: c.description || '',
      category: c.category, status: c.status, owner: c.owner || '',
      evidence: c.evidence || '', implementationNotes: c.implementationNotes || '',
      effectiveness: c.effectiveness || 'Not Assessed',
      controlType: c.controlType || 'Preventive',
      cybersecurityConcept: c.cybersecurityConcept || '',
      lastReviewDate: toDateInput(c.lastReviewDate),
      nextReviewDate: toDateInput(c.nextReviewDate),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim() || !form.title.trim()) return;
    const payload = {
      ...form,
      lastReviewDate: form.lastReviewDate ? new Date(form.lastReviewDate).toISOString() : null,
      nextReviewDate: form.nextReviewDate ? new Date(form.nextReviewDate).toISOString() : null,
    };
    try {
      if (editingId) await apiPut(`/controls/${editingId}`, payload);
      else await apiPost('/controls', payload);
      setShowModal(false); fetchControls(); toast('Control saved', 'success');
    } catch (e: any) { toast(e?.message || 'Failed to save control'); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/controls/${id}`); setSelected(null); fetchControls(); toast('Control deleted', 'success'); }
    catch (e: any) { toast(e?.message || 'Failed to delete'); }
  };

  // Stats
  const implemented = controls.filter(c => c.status === 'Implemented').length;
  const inProgress = controls.filter(c => c.status === 'In Progress' || c.status === 'Partially Implemented').length;
  const notStarted = controls.filter(c => c.status === 'Not Implemented').length;
  const effective = controls.filter(c => c.effectiveness === 'Effective').length;

  // Category progress
  const categoryProgress = ['Organizational', 'People', 'Physical', 'Technological'].map(cat => {
    const total = CATEGORY_TOTALS[cat];
    const done = controls.filter(c => c.category === cat && c.status === 'Implemented').length;
    const inProg = controls.filter(c => c.category === cat && (c.status === 'In Progress' || c.status === 'Partially Implemented')).length;
    const pct = Math.round((done / total) * 100);
    return { cat, total, done, inProg, pct };
  });

  return (
    <AccessGuard page="controls">
      <div className="animate-fade-in">
        <Breadcrumbs items={[{ label: 'Controls Management' }]} />
        <PageHeader
          title="Controls Management"
          subtitle="Annex A — ISO 27001:2022 — All 93 Controls"
          icon={<Shield className="w-4 h-4" />}
          action={
            <div className="flex gap-2">
              <button onClick={() => exportToCSV(controls, 'controls', [{key:'code',label:'ID'},{key:'title',label:'Name'},{key:'category',label:'Theme'},{key:'status',label:'Status'},{key:'effectiveness',label:'Effectiveness'},{key:'owner',label:'Owner'}])}
                className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-text-muted hover:text-text-secondary hover:bg-surface-light transition-all flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button onClick={() => exportToPDF('Controls Management', 'Annex A — ISO 27001:2022', controls, [{key:'code',label:'ID'},{key:'title',label:'Name'},{key:'category',label:'Theme'},{key:'status',label:'Status'},{key:'owner',label:'Owner'}])}
                className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-text-muted hover:text-text-secondary hover:bg-surface-light transition-all flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
              <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Control</Button>
            </div>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatsCard title="Total Controls" value={controls.length} icon={<Shield className="w-5 h-5" />} />
          <StatsCard title="Implemented" value={implemented} icon={<CheckCircle className="w-5 h-5" />} color="success" />
          <StatsCard title="In Progress" value={inProgress} icon={<Clock className="w-5 h-5" />} color="info" />
          <StatsCard title="Effective" value={effective} icon={<ShieldCheck className="w-5 h-5" />} color="success" />
        </div>

        {/* Category Progress Bars */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {categoryProgress.map(({ cat, total, done, inProg, pct }) => (
            <div key={cat} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${themeColors[cat]}`}>{cat}</span>
                <span className="text-xs font-semibold text-text-primary">{pct}%</span>
              </div>
              <div className="w-full h-1.5 bg-surface-light rounded-full overflow-hidden mb-2">
                <div className="h-full bg-success rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[10px] text-text-muted">{done}/{total} implemented{inProg > 0 ? ` · ${inProg} in progress` : ''}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-bg border border-border rounded-lg flex-1 min-w-[200px] max-w-sm hover:border-border-light focus-within:border-primary/50 transition-all">
            <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search controls..."
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none border-none focus:ring-0 min-w-0" />
          </div>
          <select value={filterTheme} onChange={e => setFilterTheme(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary hover:border-border-light transition-all">
            <option value="All">All Themes</option>
            <option>Organizational</option><option>People</option><option>Physical</option><option>Technological</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary hover:border-border-light transition-all">
            <option value="All">All Statuses</option>
            <option>Implemented</option><option>In Progress</option>
            <option>Partially Implemented</option><option>Not Implemented</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : (
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-bg/50">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-20">ID</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Control Name</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-32">Theme</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-36">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-36">Effectiveness</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Owner</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Next Review</th>
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} onClick={() => handleRowClick(c)}
                    className="border-b border-border/40 last:border-0 hover:bg-surface-light/50 transition-colors cursor-pointer">
                    <td className="px-4 py-2.5 font-mono text-xs text-primary font-semibold">{c.code}</td>
                    <td className="px-4 py-2.5 text-sm text-text-primary max-w-[280px]">
                      <p className="truncate">{c.title}</p>
                      {c.implementationNotes && <p className="text-[10px] text-text-muted truncate mt-0.5">{c.implementationNotes}</p>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-2 py-1 rounded font-medium ${themeColors[c.category] || 'bg-surface-light text-text-muted'}`}>{c.category}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${statusColor(c.status)}`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${effectivenessColor(c.effectiveness)}`}>{c.effectiveness || 'Not Assessed'}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-text-muted">{c.owner || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-text-muted">{fmtDate(c.nextReviewDate)}</td>
                    <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-info-light transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setConfirmDelete(c.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger-light transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-2.5 border-t border-border/50 bg-bg/30">
              <span className="text-[11px] text-text-muted">{filtered.length} of {controls.length} controls</span>
            </div>
          </div>
        )}

        {/* Detail Side Panel */}
        {selected && (
          <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
            <div className="fixed top-0 right-0 max-h-screen w-[640px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel">
              {/* Accent bar */}
              <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-success shrink-0" />

              {/* Header */}
              <div className="px-7 py-6 border-b border-border bg-bg/60 flex items-start justify-between gap-4 shrink-0">
                <div className="min-w-0 flex-1">
                  <span className="inline-flex items-center font-mono text-xs px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 mb-2">{selected.code}</span>
                  <h2 className="text-xl font-bold text-text-primary leading-snug">{selected.title}</h2>
                  {selected.description && <p className="text-sm text-text-muted mt-1.5 leading-relaxed">{selected.description}</p>}
                </div>
                <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Badges */}
              <div className="px-7 py-3 border-b border-border/50 flex items-center gap-2 flex-wrap shrink-0 bg-bg/30">
                <span className={`text-xs px-2.5 py-1 rounded font-semibold ${themeColors[selected.category]}`}>{selected.category}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor(selected.status)}`}>{selected.status}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${effectivenessColor(selected.effectiveness)}`}>{selected.effectiveness || 'Not Assessed'}</span>
                {selected.controlType && <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-surface-light text-text-secondary border border-border/50">{selected.controlType}</span>}
                {selected.cybersecurityConcept && <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-accent/10 text-accent border border-accent/20">{selected.cybersecurityConcept}</span>}
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-7 pt-5 pb-2 space-y-4">

                {/* Implementation Notes */}
                {selected.implementationNotes && (
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5"><StickyNote className="w-3 h-3" /> Implementation Notes</p>
                    <p className="text-sm text-text-secondary leading-relaxed">{selected.implementationNotes}</p>
                  </div>
                )}

                {/* Owner & Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-3">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest mb-1">Owner</p>
                    <p className="text-sm text-text-primary font-medium">{selected.owner || '—'}</p>
                  </div>
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-3">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest mb-1">Control Type</p>
                    <p className="text-sm text-text-primary font-medium">{selected.controlType || '—'}</p>
                  </div>
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-3">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Last Review</p>
                    <p className="text-sm text-text-primary font-medium">{fmtDate(selected.lastReviewDate)}</p>
                  </div>
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-3">
                    <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest mb-1 flex items-center gap-1"><CalendarCheck className="w-3 h-3" /> Next Review</p>
                    <p className={`text-sm font-medium ${selected.nextReviewDate && new Date(selected.nextReviewDate) < new Date() ? 'text-danger' : 'text-text-primary'}`}>
                      {fmtDate(selected.nextReviewDate)}
                    </p>
                  </div>
                </div>

                {/* Evidence */}
                {selected.evidence && (
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5"><Eye className="w-3 h-3" /> Evidence References</p>
                    <p className="text-sm text-text-secondary">{selected.evidence}</p>
                  </div>
                )}

                {/* Linked Risks */}
                <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Linked Risks {linkedRisks.length > 0 && `(${linkedRisks.length})`}</p>
                  {linkedRisks.length === 0 ? (
                    <p className="text-xs text-text-muted/50">No risks linked to this control yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {linkedRisks.map(lr => (
                        <div key={lr.id} className="flex items-center gap-2 text-xs">
                          <Link2 className="w-3 h-3 text-text-muted flex-shrink-0" />
                          <span className="text-text-secondary font-mono">{lr.riskId}</span>
                          {lr.notes && <span className="text-text-muted">— {lr.notes}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comments */}
                <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                  <CommentsSection module="controls" recordId={selected.id} />
                </div>
              </div>

              {/* Footer */}
              <div className="px-7 py-5 border-t border-border bg-bg/60 flex gap-3 shrink-0">
                <Button onClick={() => openEdit(selected)} className="flex-1 py-2.5 text-sm"><Edit2 className="w-4 h-4" /> Edit Control</Button>
                <button onClick={() => setConfirmDelete(selected.id)} className="px-4 py-2.5 rounded-xl border border-danger/30 text-danger hover:bg-danger-light transition-all text-sm font-medium flex items-center gap-2">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          </>
        )}

        {/* Create / Edit Modal */}
        <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Control' : 'Add Control'} size="lg">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Control ID *" placeholder="e.g. A.5.1" value={form.code} onChange={e => f({ code: e.target.value })} required />
              <div className="col-span-2"><Input label="Control Name *" placeholder="e.g. Policies for information security" value={form.title} onChange={e => f({ title: e.target.value })} required /></div>
            </div>
            <TextArea label="Description / Objective" rows={2} placeholder="What this control aims to achieve..." value={form.description} onChange={e => f({ description: e.target.value })} />
            <TextArea label="Implementation Notes" rows={3} placeholder="How this control is implemented in your organization..." value={form.implementationNotes} onChange={e => f({ implementationNotes: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <Select label="Theme" value={form.category} onChange={e => f({ category: e.target.value })}>
                <option>Organizational</option><option>People</option><option>Physical</option><option>Technological</option>
              </Select>
              <Select label="Status" value={form.status} onChange={e => f({ status: e.target.value })}>
                <option>Not Implemented</option><option>In Progress</option>
                <option>Partially Implemented</option><option>Implemented</option>
              </Select>
              <Select label="Effectiveness" value={form.effectiveness} onChange={e => f({ effectiveness: e.target.value })}>
                <option>Not Assessed</option><option>Not Effective</option>
                <option>Partially Effective</option><option>Effective</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Control Type" value={form.controlType} onChange={e => f({ controlType: e.target.value })}>
                <option>Preventive</option><option>Detective</option><option>Corrective</option>
              </Select>
              <Select label="Cybersecurity Concept" value={form.cybersecurityConcept} onChange={e => f({ cybersecurityConcept: e.target.value })}>
                <option value="">— Select —</option>
                <option>Identify</option><option>Protect</option><option>Detect</option>
                <option>Respond</option><option>Recover</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Owner" placeholder="Responsible person" value={form.owner} onChange={e => f({ owner: e.target.value })} />
              <Input label="Evidence Reference" placeholder="e.g. DOC-001, Screenshot Q1" value={form.evidence} onChange={e => f({ evidence: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Last Review Date" type="date" value={form.lastReviewDate} onChange={e => f({ lastReviewDate: e.target.value })} />
              <Input label="Next Review Date" type="date" value={form.nextReviewDate} onChange={e => f({ nextReviewDate: e.target.value })} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">{editingId ? 'Save Changes' : 'Add Control'}</Button>
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:bg-surface-light transition-all">Cancel</button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          open={!!confirmDelete}
          title="Delete Control"
          message="Are you sure you want to delete this control? This action cannot be undone."
          onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete); setConfirmDelete(null); }}
          onClose={() => setConfirmDelete(null)}
        />
      </div>
    </AccessGuard>
  );
}
