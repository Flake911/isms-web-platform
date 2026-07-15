'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select, TextArea, ConfirmDialog, Breadcrumbs, toast } from '@/components/ui';
import { HardDrive, Plus, Server, Monitor, Shield, AlertTriangle, Clock, Trash2, Edit2, Download, FileText, Tag, X, MapPin, User, Users, Building2, Cpu, Hash, Globe, Calendar, CalendarCheck, CalendarX, Package, StickyNote, ChevronRight, Search } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { exportToCSV, exportToPDF } from '@/lib/export';
import CommentsSection from '@/components/Comments';

interface Asset {
  id: string; assetTag: string; name: string; description: string; type: string;
  classification: string; criticality: string; department: string; owner: string;
  custodian: string; vendor: string; serialNumber: string; ipAddress: string;
  version: string; location: string; status: string; purchaseDate: string | null;
  endOfLifeDate: string | null; lastReviewDate: string | null; disposalMethod: string; notes: string;
}

const empty = {
  assetTag: '', name: '', description: '', type: 'Hardware', classification: 'Internal',
  criticality: 'Medium', department: '', owner: '', custodian: '', vendor: '',
  serialNumber: '', ipAddress: '', version: '', location: '', status: 'Active',
  purchaseDate: '', endOfLifeDate: '', lastReviewDate: '', disposalMethod: '', notes: '',
};

const criticalityColor = (c: string) =>
  c === 'Critical' ? 'bg-danger-light text-danger' : c === 'High' ? 'bg-warning-light text-warning' :
  c === 'Medium' ? 'bg-info-light text-primary' : 'bg-surface-light text-text-muted';

const classColor = (c: string) =>
  c === 'Confidential' ? 'bg-danger-light text-danger' : c === 'Restricted' ? 'bg-warning-light text-warning' :
  c === 'Internal' ? 'bg-info-light text-primary' : 'bg-surface-light text-text-muted';

const statusColor = (s: string) =>
  s === 'Active' ? 'bg-success-light text-success' : s === 'Disposed' ? 'bg-danger-light text-danger' :
  s === 'Under Maintenance' ? 'bg-warning-light text-warning' : 'bg-surface-light text-text-muted';

const toDateInput = (d: string | null) => d ? d.split('T')[0] : '';
const toIso = (d: string) => d ? new Date(d).toISOString() : null;
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function GCell({ icon, label, value, accent, wide }: { icon: React.ReactNode; label: string; value?: string | null; accent?: string; wide?: boolean }) {
  return (
    <div className={`bg-bg/50 rounded-xl border border-border/40 px-4 py-3 ${wide ? 'col-span-2' : ''}`}>
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">{icon} {label}</p>
      <p className={`text-sm font-semibold leading-snug ${value ? (accent || 'text-text-primary') : 'text-text-muted/40'}`}>
        {value || '—'}
      </p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mt-5 mb-2">
      <div className="h-px flex-1 bg-border/50" />
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest px-2">{children}</span>
      <div className="h-px flex-1 bg-border/50" />
    </div>
  );
}

function DetailPanel({ asset, onClose, onEdit, onDelete }: { asset: Asset; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const eolDays = asset.endOfLifeDate ? (new Date(asset.endOfLifeDate).getTime() - Date.now()) / 86400000 : null;
  const reviewDays = asset.lastReviewDate ? (Date.now() - new Date(asset.lastReviewDate).getTime()) / 86400000 : null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 max-h-screen w-[680px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel">

        {/* Accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary shrink-0" />

        {/* Header */}
        <div className="px-7 py-5 border-b border-border bg-bg/60 flex items-start justify-between gap-4 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {asset.assetTag && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2.5 py-1 rounded-lg bg-surface-light border border-border/50 text-text-muted">
                  <Tag className="w-2.5 h-2.5" />{asset.assetTag}
                </span>
              )}
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor(asset.status)}`}>{asset.status}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${classColor(asset.classification)}`}>{asset.classification}</span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${criticalityColor(asset.criticality)}`}>{asset.criticality} Criticality</span>
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-surface-light border border-border/50 text-text-secondary">{asset.type}</span>
            </div>
            <h2 className="text-xl font-bold text-text-primary leading-tight">{asset.name}</h2>
            {asset.description && <p className="text-sm text-text-muted mt-1.5 leading-relaxed line-clamp-2">{asset.description}</p>}
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-7 pt-4 pb-2">

          <SectionLabel>Ownership</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <GCell icon={<User className="w-3 h-3" />} label="Asset Owner" value={asset.owner} />
            <GCell icon={<Users className="w-3 h-3" />} label="Custodian" value={asset.custodian} />
            <GCell icon={<Building2 className="w-3 h-3" />} label="Department" value={asset.department} wide />
          </div>

          <SectionLabel>Technical Details</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <GCell icon={<Package className="w-3 h-3" />} label="Vendor / Manufacturer" value={asset.vendor} />
            <GCell icon={<Hash className="w-3 h-3" />} label="Serial No. / License" value={asset.serialNumber} />
            <GCell icon={<Globe className="w-3 h-3" />} label="IP Address / Hostname" value={asset.ipAddress} />
            <GCell icon={<Cpu className="w-3 h-3" />} label="Version" value={asset.version} />
            <GCell icon={<MapPin className="w-3 h-3" />} label="Location" value={asset.location} wide />
          </div>

          <SectionLabel>Lifecycle</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            <GCell icon={<Calendar className="w-3 h-3" />} label="Purchase Date" value={fmtDate(asset.purchaseDate)} />
            <GCell
              icon={<CalendarX className="w-3 h-3" />} label="End of Life"
              value={asset.endOfLifeDate ? `${fmtDate(asset.endOfLifeDate)}${eolDays !== null && eolDays <= 90 ? ` · ${Math.ceil(eolDays)}d remaining` : ''}` : null}
              accent={eolDays !== null && eolDays <= 90 ? 'text-danger' : eolDays !== null && eolDays <= 180 ? 'text-warning' : undefined}
            />
            <GCell
              icon={<CalendarCheck className="w-3 h-3" />} label="Last Review"
              value={asset.lastReviewDate ? `${fmtDate(asset.lastReviewDate)}${reviewDays !== null && reviewDays > 365 ? ' · Overdue' : ''}` : 'Never reviewed'}
              accent={!asset.lastReviewDate || (reviewDays !== null && reviewDays > 365) ? 'text-warning' : undefined}
            />
            <GCell icon={<Trash2 className="w-3 h-3" />} label="Disposal Method" value={asset.disposalMethod} />
          </div>

          {asset.notes && (
            <>
              <SectionLabel>Notes</SectionLabel>
              <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-4">
                <p className="text-sm text-text-secondary leading-relaxed">{asset.notes}</p>
              </div>
            </>
          )}

          <SectionLabel>Comments</SectionLabel>
          <div className="bg-bg/50 rounded-xl border border-border/40 px-4 py-4">
            <CommentsSection module="assets" recordId={asset.id} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-border bg-bg/60 flex gap-3 shrink-0">
          <Button onClick={onEdit} className="flex-1 py-2.5 text-sm"><Edit2 className="w-4 h-4" /> Edit Asset</Button>
          <button onClick={onDelete} className="px-5 py-2.5 rounded-xl border border-danger/30 text-danger hover:bg-danger-light transition-all text-sm font-medium flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>
    </>
  );
}

export default function AssetsPage() {
  const [items, setItems] = useState<Asset[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState(empty);
  const f = (k: Partial<typeof empty>) => setForm(prev => ({ ...prev, ...k }));
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetch_ = useCallback(async () => {
    try { setItems(await apiGet('/assets')); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch_(); }, [fetch_]);

  const openCreate = () => { setEditingId(null); setForm(empty); setShowModal(true); };
  const openEdit = (a: Asset) => {
    setSelectedAsset(null);
    setEditingId(a.id);
    setForm({
      assetTag: a.assetTag || '', name: a.name, description: a.description || '',
      type: a.type || 'Hardware', classification: a.classification || 'Internal',
      criticality: a.criticality || 'Medium', department: a.department || '',
      owner: a.owner || '', custodian: a.custodian || '', vendor: a.vendor || '',
      serialNumber: a.serialNumber || '', ipAddress: a.ipAddress || '',
      version: a.version || '', location: a.location || '', status: a.status || 'Active',
      purchaseDate: toDateInput(a.purchaseDate), endOfLifeDate: toDateInput(a.endOfLifeDate),
      lastReviewDate: toDateInput(a.lastReviewDate), disposalMethod: a.disposalMethod || '', notes: a.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = { ...form, purchaseDate: toIso(form.purchaseDate), endOfLifeDate: toIso(form.endOfLifeDate), lastReviewDate: toIso(form.lastReviewDate) };
    try {
      if (editingId) await apiPut(`/assets/${editingId}`, payload);
      else await apiPost('/assets', payload);
      setShowModal(false); fetch_(); toast('Asset saved', 'success');
    } catch (e: any) { toast(e?.message || 'Failed to save asset'); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/assets/${id}`); setSelectedAsset(null); fetch_(); }
    catch (e: any) { toast(e?.message || 'Failed to delete asset'); }
  };

  const filtered = useMemo(() => items.filter(a => {
    const q = search.toLowerCase();
    const matchQ = !q || a.name.toLowerCase().includes(q) || (a.assetTag || '').toLowerCase().includes(q) || (a.owner || '').toLowerCase().includes(q) || (a.vendor || '').toLowerCase().includes(q);
    const matchT = !filterType   || a.type === filterType;
    const matchC = !filterClass  || a.classification === filterClass;
    const matchS = !filterStatus || a.status === filterStatus;
    return matchQ && matchT && matchC && matchS;
  }), [items, search, filterType, filterClass, filterStatus]);

  const eolSoon = items.filter(a => { if (!a.endOfLifeDate) return false; const d = (new Date(a.endOfLifeDate).getTime() - Date.now()) / 86400000; return d >= 0 && d <= 90; }).length;
  const overdueReview = items.filter(a => { if (!a.lastReviewDate) return true; return (Date.now() - new Date(a.lastReviewDate).getTime()) / 86400000 > 365; }).length;

  const csvCols = [
    { key: 'assetTag', label: 'Tag' }, { key: 'name', label: 'Name' }, { key: 'type', label: 'Type' },
    { key: 'classification', label: 'Classification' }, { key: 'criticality', label: 'Criticality' },
    { key: 'department', label: 'Department' }, { key: 'owner', label: 'Owner' }, { key: 'custodian', label: 'Custodian' },
    { key: 'vendor', label: 'Vendor' }, { key: 'location', label: 'Location' }, { key: 'status', label: 'Status' },
    { key: 'endOfLifeDate', label: 'End of Life' },
  ];

  return (
    <AccessGuard page="assets">
    <div className="animate-fade-in">
      <Breadcrumbs items={[{ label: 'Asset Inventory' }]} />
      <PageHeader
        title="Asset Inventory"
        subtitle="A.5.9 — Inventory of information and associated assets"
        icon={<HardDrive className="w-4 h-4" />}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => exportToCSV(items, 'assets', csvCols)}><Download className="w-3.5 h-3.5" /> CSV</Button>
            <Button variant="ghost" onClick={() => exportToPDF('Asset Inventory', 'A.5.9 — Inventory of information and associated assets', items, csvCols)}><FileText className="w-3.5 h-3.5" /> PDF</Button>
            <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Asset</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 stagger">
        <StatsCard title="Total Assets"   value={items.length} icon={<HardDrive className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
        <StatsCard title="Hardware"       value={items.filter(a => a.type === 'Hardware').length} icon={<Server className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
        <StatsCard title="Software"       value={items.filter(a => a.type === 'Software').length} icon={<Monitor className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
        <StatsCard title="Confidential"   value={items.filter(a => a.classification === 'Confidential').length} icon={<Shield className="w-4 h-4 text-danger" />} iconBg="bg-danger-light" />
        <StatsCard title="EoL in 90 days" value={eolSoon} icon={<Clock className="w-4 h-4 text-warning" />} iconBg="bg-warning-light" />
        <StatsCard title="Review Overdue" value={overdueReview} icon={<AlertTriangle className="w-4 h-4 text-danger" />} iconBg="bg-danger-light" />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          <input className="bg-transparent text-sm flex-1 outline-none text-text-primary placeholder:text-text-muted/50"
            placeholder="Search name, tag, owner, vendor…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')}><X className="w-3 h-3 text-text-muted hover:text-text-primary" /></button>}
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
          <option value="">All Types</option>
          <option>Hardware</option><option>Software</option><option>Data</option>
          <option>People</option><option>Service</option><option>Cloud</option>
        </select>
        <select value={filterClass} onChange={e => setFilterClass(e.target.value)}
          className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
          <option value="">All Classifications</option>
          <option>Public</option><option>Internal</option><option>Restricted</option><option>Confidential</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
          <option value="">All Statuses</option>
          <option>Active</option><option>Inactive</option><option>Under Maintenance</option><option>Disposed</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-16 text-text-muted text-sm">Loading...</div>
      ) : items.length === 0 ? (
        <EmptyState title="Register your assets" description="Document hardware, software, data, people, and service assets with full lifecycle tracking." icon={<HardDrive className="w-7 h-7 text-primary/40" />} action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Asset</Button>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border">
                  {['Tag', 'Name', 'Type', 'Classification', 'Criticality', 'Owner', 'Status', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-[10px] font-semibold text-text-muted uppercase tracking-widest bg-bg/60 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map(a => (
                  <tr
                    key={a.id}
                    onClick={() => setSelectedAsset(a)}
                    className="hover:bg-surface-light/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5">
                      {a.assetTag
                        ? <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded bg-surface-light border border-border/50 text-text-muted"><Tag className="w-2.5 h-2.5" />{a.assetTag}</span>
                        : <span className="text-text-muted/30 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-semibold text-text-primary">{a.name}</p>
                      {a.vendor && <p className="text-[10px] text-text-muted mt-0.5">{a.vendor}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-text-secondary whitespace-nowrap">{a.type}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${classColor(a.classification)}`}>{a.classification}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${criticalityColor(a.criticality)}`}>{a.criticality}</span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-text-muted">{a.owner || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${statusColor(a.status)}`}>{a.status}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <ChevronRight className="w-4 h-4 text-text-muted/30 group-hover:text-text-muted transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border/50 bg-bg/40 flex items-center justify-between">
            <span className="text-[11px] text-text-muted">{filtered.length} of {items.length} asset{items.length !== 1 ? 's' : ''} — click any row to view details</span>
            <div className="flex items-center gap-3 text-[10px] text-text-muted">
              {['Hardware','Software','Data','People','Service','Cloud'].map(t => {
                const n = items.filter(a => a.type === t).length;
                return n > 0 ? <span key={t}>{t}: <span className="font-semibold text-text-secondary">{n}</span></span> : null;
              })}
            </div>
          </div>
        </div>
      )}

      {/* Detail Panel */}
      {selectedAsset && (
        <DetailPanel
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onEdit={() => openEdit(selectedAsset)}
          onDelete={() => { setConfirmDelete(selectedAsset.id); setSelectedAsset(null); }}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Asset' : 'Add Asset'} size="lg">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="pb-1 border-b border-border/40">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-3">Identity</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Asset Tag" placeholder="e.g. AST-001" value={form.assetTag} onChange={e => f({ assetTag: e.target.value })} />
              <Input label="Asset Name *" placeholder="e.g. Production Web Server" value={form.name} onChange={e => f({ name: e.target.value })} />
            </div>
            <div className="mt-3"><TextArea label="Description" rows={2} placeholder="What is this asset? What does it do?" value={form.description} onChange={e => f({ description: e.target.value })} /></div>
          </div>
          <div className="pb-1 border-b border-border/40">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-3">Classification</p>
            <div className="grid grid-cols-3 gap-3">
              <Select label="Type" value={form.type} onChange={e => f({ type: e.target.value })}><option>Hardware</option><option>Software</option><option>Data</option><option>People</option><option>Service</option><option>Cloud</option></Select>
              <Select label="Classification" value={form.classification} onChange={e => f({ classification: e.target.value })}><option>Public</option><option>Internal</option><option>Restricted</option><option>Confidential</option></Select>
              <Select label="Criticality" value={form.criticality} onChange={e => f({ criticality: e.target.value })}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></Select>
            </div>
            <div className="mt-3"><Input label="Department / Business Unit" placeholder="e.g. IT, Finance, HR" value={form.department} onChange={e => f({ department: e.target.value })} /></div>
          </div>
          <div className="pb-1 border-b border-border/40">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-3">Ownership</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Asset Owner" placeholder="Accountable person/role" value={form.owner} onChange={e => f({ owner: e.target.value })} />
              <Input label="Custodian" placeholder="Day-to-day manager" value={form.custodian} onChange={e => f({ custodian: e.target.value })} />
            </div>
          </div>
          <div className="pb-1 border-b border-border/40">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-3">Technical Details</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Vendor / Manufacturer" placeholder="e.g. Dell, Microsoft, AWS" value={form.vendor} onChange={e => f({ vendor: e.target.value })} />
              <Input label="Serial No. / License Key" value={form.serialNumber} onChange={e => f({ serialNumber: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Input label="IP Address / Hostname" placeholder="e.g. 192.168.1.10" value={form.ipAddress} onChange={e => f({ ipAddress: e.target.value })} />
              <Input label="Version" placeholder="e.g. 2.4.1" value={form.version} onChange={e => f({ version: e.target.value })} />
            </div>
            <div className="mt-3"><Input label="Location" placeholder="Physical or logical location" value={form.location} onChange={e => f({ location: e.target.value })} /></div>
          </div>
          <div className="pb-1 border-b border-border/40">
            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-3">Lifecycle</p>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={e => f({ purchaseDate: e.target.value })} />
              <Input label="End of Life Date" type="date" value={form.endOfLifeDate} onChange={e => f({ endOfLifeDate: e.target.value })} />
              <Input label="Last Review Date" type="date" value={form.lastReviewDate} onChange={e => f({ lastReviewDate: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Select label="Status" value={form.status} onChange={e => f({ status: e.target.value })}><option>Active</option><option>Inactive</option><option>Under Maintenance</option><option>Disposed</option></Select>
              <Select label="Disposal Method" value={form.disposalMethod} onChange={e => f({ disposalMethod: e.target.value })}><option value="">— None —</option><option>Secure Wipe</option><option>Physical Destruction</option><option>Return to Vendor</option><option>Donation</option><option>Archive</option></Select>
            </div>
          </div>
          <TextArea label="Notes" rows={2} placeholder="Any additional notes" value={form.notes} onChange={e => f({ notes: e.target.value })} />
          <div className="flex gap-2 pt-2">
            <Button type="submit">{editingId ? 'Update Asset' : 'Save Asset'}</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) { handleDelete(confirmDelete); setConfirmDelete(null); } }}
      />
    </div>
    </AccessGuard>
  );
}
