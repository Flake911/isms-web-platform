'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader, StatsCard, Button, EmptyState, DataTable, Modal, Input, Select, TextArea, ConfirmDialog, Breadcrumbs, toast } from '@/components/ui';
import { Bug, Plus, AlertTriangle, ShieldCheck, XCircle, Edit2, Trash2, Download, FileText, X, Search } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import CommentsSection from '@/components/Comments';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface Vulnerability {
  id: string; cveId: string; title: string; description: string; severity: string;
  cvssScore: number | null; source: string; status: string; affectedSystem: string;
  affectedAsset: string; owner: string; discoveryDate: string | null; dueDate: string | null;
  remediation: string; linkedControl: string; notes: string;
}

const empty = {
  cveId: '', title: '', description: '', severity: 'Medium', cvssScore: '',
  source: 'Vulnerability Scanner', status: 'Open', affectedSystem: '', affectedAsset: '',
  owner: '', discoveryDate: '', dueDate: '', remediation: '', linkedControl: '', notes: '',
};

const severityColor = (s: string) =>
  s === 'Critical' ? 'bg-danger-light text-danger' :
  s === 'High' ? 'bg-warning-light text-warning' :
  s === 'Medium' ? 'bg-info-light text-primary' :
  'bg-surface-light text-text-muted';

const statusColor = (s: string) =>
  s === 'Open' ? 'bg-danger-light text-danger' :
  s === 'In Progress' ? 'bg-warning-light text-warning' :
  s === 'Resolved' ? 'bg-success-light text-success' :
  'bg-surface-light text-text-muted';

const toDateInput = (d: string | null) => d ? d.split('T')[0] : '';
const toIso = (d: string) => d ? new Date(d).toISOString() : null;
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function VulnerabilitiesPage() {
  const [items, setItems] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selected, setSelected] = useState<Vulnerability | null>(null);
  const [form, setForm] = useState(empty);
  const f = (k: Partial<typeof empty>) => setForm(prev => ({ ...prev, ...k }));
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetch_ = useCallback(async () => {
    try { setItems(await apiGet('/vulnerabilities')); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch_(); }, [fetch_]);

  const openCreate = () => { setEditingId(null); setForm(empty); setShowModal(true); };
  const openEdit = (v: Vulnerability) => {
    setSelected(null);
    setEditingId(v.id);
    setForm({
      cveId: v.cveId || '', title: v.title, description: v.description || '',
      severity: v.severity, cvssScore: v.cvssScore != null ? String(v.cvssScore) : '',
      source: v.source, status: v.status, affectedSystem: v.affectedSystem || '',
      affectedAsset: v.affectedAsset || '', owner: v.owner || '',
      discoveryDate: toDateInput(v.discoveryDate), dueDate: toDateInput(v.dueDate),
      remediation: v.remediation || '', linkedControl: v.linkedControl || '', notes: v.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = {
      ...form,
      cvssScore: form.cvssScore !== '' ? parseFloat(form.cvssScore as string) : null,
      discoveryDate: toIso(form.discoveryDate as string),
      dueDate: toIso(form.dueDate as string),
    };
    try {
      if (editingId) await apiPut(`/vulnerabilities/${editingId}`, payload);
      else await apiPost('/vulnerabilities', payload);
      setShowModal(false); fetch_(); toast('Vulnerability saved', 'success');
    } catch (e: any) { toast(e?.message || 'Failed to save'); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/vulnerabilities/${id}`); setSelected(null); fetch_(); toast('Vulnerability deleted', 'success'); }
    catch (e: any) { toast(e?.message || 'Failed to delete'); }
  };

  const filtered = useMemo(() => items.filter(v => {
    const q = search.toLowerCase();
    const matchQ = !q || v.title.toLowerCase().includes(q) || (v.cveId || '').toLowerCase().includes(q) || (v.affectedSystem || '').toLowerCase().includes(q) || (v.owner || '').toLowerCase().includes(q);
    const matchSev = !filterSeverity || v.severity === filterSeverity;
    const matchSt  = !filterStatus  || v.status === filterStatus;
    return matchQ && matchSev && matchSt;
  }), [items, search, filterSeverity, filterStatus]);

  const stats = {
    total: items.length,
    critical: items.filter(v => v.severity === 'Critical' || v.severity === 'High').length,
    open: items.filter(v => v.status === 'Open').length,
    resolved: items.filter(v => v.status === 'Resolved').length,
  };

  const columns = [
    { key: 'title', label: 'Vulnerability', render: (v: Vulnerability) => (
      <div>
        {v.cveId && <span className="text-[10px] font-mono text-text-muted mr-2">{v.cveId}</span>}
        <span className="text-sm font-medium text-text-primary">{v.title}</span>
        {v.affectedSystem && <p className="text-xs text-text-muted mt-0.5">{v.affectedSystem}</p>}
      </div>
    )},
    { key: 'severity', label: 'Severity', render: (v: Vulnerability) => (
      <div className="flex flex-col gap-1">
        <span className={`inline-flex text-[11px] px-2.5 py-1 rounded-full font-semibold ${severityColor(v.severity)}`}>{v.severity}</span>
        {v.cvssScore != null && <span className="text-[10px] text-text-muted">CVSS {v.cvssScore.toFixed(1)}</span>}
      </div>
    )},
    { key: 'status', label: 'Status', render: (v: Vulnerability) => (
      <span className={`inline-flex text-[11px] px-2.5 py-1 rounded-full font-semibold ${statusColor(v.status)}`}>{v.status}</span>
    )},
    { key: 'owner', label: 'Owner', render: (v: Vulnerability) => (
      <span className="text-sm text-text-secondary">{v.owner || '—'}</span>
    )},
    { key: 'dueDate', label: 'Due', render: (v: Vulnerability) => (
      <span className="text-xs text-text-muted">{fmtDate(v.dueDate)}</span>
    )},
    { key: 'actions', label: '', render: (v: Vulnerability) => (
      <div className="flex gap-1.5 justify-end">
        <button onClick={e => { e.stopPropagation(); openEdit(v); }} className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
        <button onClick={e => { e.stopPropagation(); setConfirmDelete(v.id); }} className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger-light transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    )},
  ];

  return (
    <AccessGuard page="vulnerabilities">
      <div className="animate-fade-in">
        <Breadcrumbs items={[{ label: 'Assets & Compliance' }, { label: 'Vulnerabilities' }]} />
        <PageHeader
          title="Vulnerability Register"
          subtitle="A.8.8 — Track and remediate security vulnerabilities across your systems and assets"
          icon={<Bug className="w-4 h-4" />}
          action={
            <div className="flex gap-2">
              <button onClick={() => exportToCSV(items, 'vulnerabilities')} className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-text-muted hover:text-text-secondary hover:bg-surface-light transition-all flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button onClick={() => exportToPDF(items, 'vulnerabilities', 'Vulnerability Register')} className="px-3 py-2 rounded-lg border border-border text-xs font-medium text-text-muted hover:text-text-secondary hover:bg-surface-light transition-all flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> PDF
              </button>
              <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Vulnerability</Button>
            </div>
          }
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatsCard title="Total" value={stats.total} icon={<Bug className="w-5 h-5" />} />
          <StatsCard title="Critical / High" value={stats.critical} icon={<AlertTriangle className="w-5 h-5" />} color="danger" />
          <StatsCard title="Open" value={stats.open} icon={<XCircle className="w-5 h-5" />} color="warning" />
          <StatsCard title="Resolved" value={stats.resolved} icon={<ShieldCheck className="w-5 h-5" />} color="success" />
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input className="bg-transparent text-sm flex-1 outline-none text-text-primary placeholder:text-text-muted/50"
              placeholder="Search CVE, title, system, owner…" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')}><X className="w-3 h-3 text-text-muted hover:text-text-primary" /></button>}
          </div>
          <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Severities</option>
            <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
            <option value="">All Statuses</option>
            <option>Open</option><option>In Progress</option><option>Resolved</option><option>Accepted</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={<Bug className="w-8 h-8" />} title="No vulnerabilities found" description="Add vulnerability findings from scanners, pentests, or manual review." action={<Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Vulnerability</Button>} />
        ) : (
          <DataTable columns={columns} data={filtered} onRowClick={v => setSelected(v)} />
        )}

        {/* Detail side panel */}
        {selected && (
          <>
            <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
            <div className="fixed top-0 right-0 w-[620px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel overflow-hidden" style={{ maxHeight: '100vh' }}>
              <div className="h-1 w-full bg-gradient-to-r from-danger to-warning shrink-0" />

              {/* Header */}
              <div className="px-6 pt-5 pb-4 border-b border-border bg-bg/60 flex items-start justify-between gap-4 shrink-0">
                <div className="min-w-0 flex-1">
                  {selected.cveId && (
                    <span className="inline-flex text-[10px] font-mono px-2.5 py-1 rounded-lg bg-surface-light border border-border/50 text-text-muted mb-2 block w-fit">{selected.cveId}</span>
                  )}
                  <h2 className="text-lg font-bold text-text-primary leading-snug">{selected.title}</h2>
                  {selected.description && <p className="text-sm text-text-muted mt-1.5 leading-relaxed">{selected.description}</p>}
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Badges */}
              <div className="px-6 py-2.5 border-b border-border/50 flex items-center gap-2 flex-wrap shrink-0 bg-bg/30">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${severityColor(selected.severity)}`}>{selected.severity}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor(selected.status)}`}>{selected.status}</span>
                {selected.cvssScore != null && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-surface-light text-text-secondary border border-border/50">CVSS {selected.cvssScore.toFixed(1)}</span>
                )}
                {selected.source && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-surface-light text-text-muted border border-border/50">{selected.source}</span>
                )}
              </div>

              {/* Body — fits content, scrolls when tall */}
              <div className="overflow-y-auto px-6 py-4 space-y-3" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { label: 'Owner',           value: selected.owner },
                    { label: 'Affected System', value: selected.affectedSystem },
                    { label: 'Affected Asset',  value: selected.affectedAsset },
                    { label: 'Linked Control',  value: selected.linkedControl },
                    { label: 'Discovered',      value: fmtDate(selected.discoveryDate) },
                    { label: 'Due Date',        value: fmtDate(selected.dueDate) },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-bg/50 rounded-xl border border-border/40 px-3 py-2.5">
                      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1">{label}</p>
                      <p className="text-sm text-text-primary font-medium">{value || '—'}</p>
                    </div>
                  ))}
                </div>

                {selected.remediation && (
                  <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-3">
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Remediation Plan</p>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.remediation}</p>
                  </div>
                )}

                {selected.notes && (
                  <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-3">
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Notes</p>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.notes}</p>
                  </div>
                )}

                <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-3">
                  <CommentsSection module="vulnerabilities" recordId={selected.id} />
                </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 px-6 py-3 border-t border-border bg-bg/60 flex gap-2">
                <Button onClick={() => openEdit(selected)} className="flex-1 justify-center"><Edit2 className="w-3.5 h-3.5" /> Edit</Button>
                <button onClick={() => setConfirmDelete(selected.id)} className="px-4 py-2 rounded-xl border border-danger/30 text-danger hover:bg-danger-light transition-all text-sm font-medium flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          </>
        )}

        {/* Create / Edit Modal */}
        <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Vulnerability' : 'Add Vulnerability'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="CVE ID" placeholder="CVE-2024-XXXXX" value={form.cveId} onChange={e => f({ cveId: e.target.value })} />
              <Input label="CVSS Score" type="number" min={0} max={10} step={0.1} placeholder="e.g. 9.8" value={form.cvssScore as string} onChange={e => f({ cvssScore: e.target.value })} />
            </div>
            <Input label="Title *" placeholder="Short descriptive name" value={form.title} onChange={e => f({ title: e.target.value })} required />
            <TextArea label="Description" placeholder="Describe the vulnerability..." value={form.description} onChange={e => f({ description: e.target.value })} rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Severity" value={form.severity} onChange={e => f({ severity: e.target.value })}>
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
                <option>Informational</option>
              </Select>
              <Select label="Status" value={form.status} onChange={e => f({ status: e.target.value })}>
                <option>Open</option>
                <option value="In Progress">In Progress</option>
                <option>Resolved</option>
                <option>Accepted</option>
                <option value="False Positive">False Positive</option>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Source" value={form.source} onChange={e => f({ source: e.target.value })}>
                <option value="Vulnerability Scanner">Vulnerability Scanner</option>
                <option value="Penetration Test">Penetration Test</option>
                <option>Audit</option>
                <option value="Manual Review">Manual Review</option>
                <option value="Bug Bounty">Bug Bounty</option>
                <option value="Threat Intelligence">Threat Intelligence</option>
              </Select>
              <Input label="Owner" placeholder="Responsible person" value={form.owner} onChange={e => f({ owner: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Affected System" placeholder="e.g. Web Server, VPN" value={form.affectedSystem} onChange={e => f({ affectedSystem: e.target.value })} />
              <Input label="Affected Asset" placeholder="Asset name or ID" value={form.affectedAsset} onChange={e => f({ affectedAsset: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Discovery Date" type="date" value={form.discoveryDate as string} onChange={e => f({ discoveryDate: e.target.value })} />
              <Input label="Due Date" type="date" value={form.dueDate as string} onChange={e => f({ dueDate: e.target.value })} />
            </div>
            <TextArea label="Remediation Plan" placeholder="Steps to fix or mitigate..." value={form.remediation} onChange={e => f({ remediation: e.target.value })} rows={3} />
            <Input label="Linked Control" placeholder="e.g. A.8.8 - Management of technical vulnerabilities" value={form.linkedControl} onChange={e => f({ linkedControl: e.target.value })} />
            <TextArea label="Notes" placeholder="Additional context..." value={form.notes} onChange={e => f({ notes: e.target.value })} rows={2} />
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1">{editingId ? 'Save Changes' : 'Add Vulnerability'}</Button>
              <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:bg-surface-light transition-all">Cancel</button>
            </div>
          </form>
        </Modal>

        <ConfirmDialog
          open={!!confirmDelete}
          title="Delete Vulnerability"
          message="Are you sure you want to delete this vulnerability? This action cannot be undone."
          onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete); setConfirmDelete(null); }}
          onClose={() => setConfirmDelete(null)}
        />
      </div>
    </AccessGuard>
  );
}
