'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select, TextArea, ConfirmDialog, Breadcrumbs, CommentsPanel, toast } from '@/components/ui';
import { Building2, Plus, CheckCircle, AlertTriangle, Trash2, Edit2, Download, FileText, Search, X, Mail, User, Calendar, Link2, ShieldAlert, Clock, Truck } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { useAuth } from '@/context/AuthContext';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface Vendor {
  id: string; name: string; service?: string; riskLevel: string;
  status: string; contact?: string; email?: string;
  contract?: string; reviewDate?: string | null;
  createdAt: string; updatedAt: string;
}

const EMPTY = {
  name: '', service: '', riskLevel: 'Low', status: 'Active',
  contact: '', email: '', contract: '', reviewDate: '',
};

const riskCfg = (r: string) => {
  if (r === 'Critical') return { color: 'text-danger',   bg: 'bg-danger/10',   border: 'border-danger/30',   dot: 'bg-danger' };
  if (r === 'High')     return { color: 'text-warning',  bg: 'bg-warning/10',  border: 'border-warning/30',  dot: 'bg-warning' };
  if (r === 'Medium')   return { color: 'text-primary',  bg: 'bg-primary/10',  border: 'border-primary/30',  dot: 'bg-primary' };
  return                       { color: 'text-success',  bg: 'bg-success/10',  border: 'border-success/30',  dot: 'bg-success' };
};

const statusCfg = (s: string) => {
  if (s === 'Active')        return { color: 'text-success',    bg: 'bg-success/10' };
  if (s === 'Under Review')  return { color: 'text-warning',    bg: 'bg-warning/10' };
  if (s === 'Terminated')    return { color: 'text-danger',     bg: 'bg-danger/10' };
  return                            { color: 'text-text-muted', bg: 'bg-surface-light' };
};

function PanelField({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value?: string | null; accent?: string }) {
  return (
    <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-3">
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
        <Icon className="w-3 h-3" />{label}
      </p>
      <p className={`text-sm font-medium leading-snug ${value ? (accent || 'text-text-primary') : 'text-text-muted/40'}`}>{value || '—'}</p>
    </div>
  );
}

const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
const isOverdue = (d?: string | null, status?: string) => d && status !== 'Terminated' && status !== 'Inactive' && new Date(d) < new Date();

export default function VendorsPage() {
  const { user } = useAuth();
  const [items, setItems]               = useState<Vendor[]>([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selected, setSelected]         = useState<Vendor | null>(null);
  const [form, setForm]                 = useState<typeof EMPTY>(EMPTY);
  const [search, setSearch]             = useState('');
  const [filterRisk, setFilterRisk]     = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetch_ = useCallback(async () => {
    try { setItems(await apiGet('/vendors')); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch_(); }, [fetch_]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY); setShowModal(true); };
  const openEdit = (v: Vendor) => {
    setEditingId(v.id);
    setForm({
      name: v.name, service: v.service || '', riskLevel: v.riskLevel || 'Low',
      status: v.status || 'Active', contact: v.contact || '', email: v.email || '',
      contract: v.contract || '', reviewDate: v.reviewDate ? v.reviewDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!form.name.trim()) return;
    const payload: any = { ...form, reviewDate: form.reviewDate ? new Date(form.reviewDate).toISOString() : null };
    try {
      if (editingId) await apiPut(`/vendors/${editingId}`, payload);
      else await apiPost('/vendors', payload);
      setShowModal(false); fetch_(); toast('Vendor saved', 'success');
      if (selected?.id === editingId) setSelected(null);
    } catch (e: any) { toast(e?.message || 'Failed to save vendor', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/vendors/${id}`); fetch_(); toast('Vendor deleted', 'success');
      if (selected?.id === id) setSelected(null);
    } catch (e: any) { toast(e?.message || 'Failed to delete', 'error'); }
  };

  const f = (k: string) => (e: React.ChangeEvent<any>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const filtered = useMemo(() => items.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.name.toLowerCase().includes(q) || (v.service || '').toLowerCase().includes(q) || (v.contact || '').toLowerCase().includes(q);
    const matchRisk   = !filterRisk   || v.riskLevel === filterRisk;
    const matchStatus = !filterStatus || v.status === filterStatus;
    return matchSearch && matchRisk && matchStatus;
  }), [items, search, filterRisk, filterStatus]);

  const overdueReview = items.filter(v => isOverdue(v.reviewDate, v.status)).length;
  const csvCols = [
    { key: 'name', label: 'Vendor' }, { key: 'service', label: 'Service' },
    { key: 'riskLevel', label: 'Risk Level' }, { key: 'status', label: 'Status' },
    { key: 'contact', label: 'Contact' }, { key: 'email', label: 'Email' },
    { key: 'reviewDate', label: 'Review Date' },
  ];

  return (
    <AccessGuard page="vendors">
    <div className="animate-fade-in">
      <Breadcrumbs items={[{ label: 'Vendor Management' }]} />
      <PageHeader
        title="Vendor Management"
        subtitle="Clause A.5.19–A.5.23 — Supplier Relationships & Third-Party Risk"
        icon={<Truck className="w-4 h-4" />}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => exportToCSV(items, 'vendors', csvCols)}><Download className="w-3.5 h-3.5" /> CSV</Button>
            <Button variant="ghost" onClick={() => exportToPDF('Vendor Management', 'Clause A.5.19–A.5.23', items, csvCols)}><FileText className="w-3.5 h-3.5" /> PDF</Button>
            <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Vendor</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6 stagger">
        <StatsCard title="Total"          value={items.length}                                              icon={<Building2 className="w-4 h-4 text-text-muted" />}      iconBg="bg-surface-light" />
        <StatsCard title="Active"         value={items.filter(v => v.status === 'Active').length}           icon={<CheckCircle className="w-4 h-4 text-success" />}       iconBg="bg-success/10" />
        <StatsCard title="High Risk"      value={items.filter(v => v.riskLevel === 'High').length}          icon={<AlertTriangle className="w-4 h-4 text-warning" />}     iconBg="bg-warning/10" />
        <StatsCard title="Critical Risk"  value={items.filter(v => v.riskLevel === 'Critical').length}      icon={<ShieldAlert className="w-4 h-4 text-danger" />}        iconBg="bg-danger/10" />
        <StatsCard title="Review Overdue" value={overdueReview}                                             icon={<Clock className={`w-4 h-4 ${overdueReview > 0 ? 'text-danger' : 'text-text-muted'}`} />} iconBg={overdueReview > 0 ? 'bg-danger/10' : 'bg-surface-light'} />
      </div>

      {/* Search & Filters */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 flex-1 min-w-[200px] bg-bg border border-border rounded-lg hover:border-border-light focus-within:border-primary/50 transition-all">
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none border-none focus:ring-0 min-w-0"
              placeholder="Search vendors, services, contacts..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-text-muted hover:text-danger" /></button>}
          </div>
          <select className="px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary hover:border-border-light focus:outline-none focus:border-primary/50 transition-all"
            value={filterRisk} onChange={e => setFilterRisk(e.target.value)}>
            <option value="">All Risk Levels</option>
            <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
          <select className="px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary hover:border-border-light focus:outline-none focus:border-primary/50 transition-all"
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option>Active</option><option>Under Review</option><option>Inactive</option><option>Terminated</option>
          </select>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-text-muted text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState title="No vendors registered" description="Track third-party vendors, their risk levels, contracts, and review schedules as required by ISO 27001 Clause A.5.19–A.5.23." icon={<Building2 className="w-7 h-7 text-primary/30" />} action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Vendor</Button>} />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">No vendors match your filters.</div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-bg/50">
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider">Vendor</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-24">Risk Level</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-28">Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-32">Contact</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-32">Contract</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-text-muted uppercase tracking-wider w-32">Review Date</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const rc = riskCfg(v.riskLevel);
                const sc = statusCfg(v.status);
                const overdue = isOverdue(v.reviewDate, v.status);
                return (
                  <tr key={v.id} onClick={() => setSelected(v)}
                    className="border-b border-border/40 last:border-0 hover:bg-surface-light/50 transition-colors cursor-pointer group">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text-primary">{v.name}</p>
                      {v.service && <p className="text-[11px] text-text-muted mt-0.5">{v.service}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${rc.bg} ${rc.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
                        <span className={`text-[11px] font-semibold ${rc.color}`}>{v.riskLevel}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${sc.bg} ${sc.color}`}>{v.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">{v.contact || '—'}</td>
                    <td className="px-4 py-3 text-xs text-text-muted">{v.contract || '—'}</td>
                    <td className="px-4 py-3">
                      {v.reviewDate
                        ? <span className={`text-xs font-medium ${overdue ? 'text-danger' : 'text-text-muted'}`}>
                            {overdue && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                            {fmt(v.reviewDate)}
                          </span>
                        : <span className="text-text-muted/30 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEdit(v)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setConfirmDelete(v.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="px-4 py-2.5 border-t border-border/50 bg-bg/30">
            <span className="text-[11px] text-text-muted">{filtered.length} of {items.length} vendor{items.length !== 1 ? 's' : ''} — click any row to view details</span>
          </div>
        </div>
      )}

      {/* Detail Side Panel */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
          <div className="fixed top-0 right-0 max-h-screen w-[620px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel">
            <div className={`h-1 w-full shrink-0 ${riskCfg(selected.riskLevel).dot}`} />
            <div className="px-7 py-5 border-b border-border bg-bg/60 flex items-start justify-between gap-4 shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${riskCfg(selected.riskLevel).bg} ${riskCfg(selected.riskLevel).border} ${riskCfg(selected.riskLevel).color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${riskCfg(selected.riskLevel).dot}`} />{selected.riskLevel} Risk
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCfg(selected.status).bg} ${statusCfg(selected.status).color}`}>{selected.status}</span>
                  {isOverdue(selected.reviewDate, selected.status) && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-danger/10 text-danger animate-pulse">Review Overdue</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-text-primary">{selected.name}</h2>
                {selected.service && <p className="text-sm text-text-muted mt-0.5">{selected.service}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-7 pt-5 pb-2 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <PanelField icon={User}     label="Contact Person" value={selected.contact} />
                <PanelField icon={Mail}     label="Email"          value={selected.email} />
                <PanelField icon={Link2}    label="Contract Ref"   value={selected.contract} />
                <PanelField icon={Calendar} label="Review Date"    value={fmt(selected.reviewDate)} accent={isOverdue(selected.reviewDate, selected.status) ? 'text-danger font-semibold' : undefined} />
              </div>
              <CommentsPanel module="vendors" recordId={selected.id} apiGet={apiGet} apiPost={apiPost} apiDelete={apiDelete} user={user} />
            </div>
            <div className="flex items-center gap-2 px-6 py-4 border-t border-border flex-shrink-0">
              <Button onClick={() => openEdit(selected)} className="flex-1 justify-center"><Edit2 className="w-3.5 h-3.5" /> Edit Vendor</Button>
              <button onClick={() => setConfirmDelete(selected.id)} className="px-4 py-2 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-all text-sm font-medium flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Vendor' : 'Add Vendor'} size="lg">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Vendor Name *" placeholder="e.g. AWS, Microsoft, Accenture" value={form.name} onChange={f('name')} required />
          <Input label="Service Provided" placeholder="e.g. Cloud infrastructure, Software development" value={form.service} onChange={f('service')} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Risk Level" value={form.riskLevel} onChange={f('riskLevel')}>
              <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
            </Select>
            <Select label="Status" value={form.status} onChange={f('status')}>
              <option>Active</option><option>Under Review</option><option>Inactive</option><option>Terminated</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Contact Person" placeholder="Primary contact name" value={form.contact} onChange={f('contact')} />
            <Input label="Email" type="email" placeholder="vendor@company.com" value={form.email} onChange={f('email')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Contract Reference" placeholder="e.g. CONTRACT-2024-001" value={form.contract} onChange={f('contract')} />
            <Input label="Next Review Date" type="date" value={form.reviewDate} onChange={f('reviewDate')} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">{editingId ? 'Save Changes' : 'Add Vendor'}</Button>
            <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg border border-border text-sm text-text-muted hover:bg-surface-light transition-all">Cancel</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!confirmDelete} title="Delete Vendor" message="Are you sure you want to delete this vendor?"
        onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete); setConfirmDelete(null); }}
        onClose={() => setConfirmDelete(null)} />
    </div>
    </AccessGuard>
  );
}
