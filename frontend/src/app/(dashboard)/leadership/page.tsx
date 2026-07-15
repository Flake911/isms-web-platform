'use client';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PageHeader, StatsCard, Button, EmptyState, Modal, Input, Select, TextArea, ConfirmDialog, Breadcrumbs, toast } from '@/components/ui';
import {
  Building2, Plus, Users, CheckCircle, FileText, Trash2, Edit2, Download, X,
  Mail, Shield, AlertTriangle, Search, Clock, User, ArrowUp, BookOpen, Camera, Upload,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface Role {
  id: string;
  role: string;
  assignee: string;
  email?: string;
  department?: string;
  reportingTo?: string;
  deputy?: string;
  clauseRef?: string;
  responsibilities?: string;
  commitment?: string;
  authority: string;
  policyRef?: string;
  assignedAt?: string;
  reviewDate?: string;
}

const EMPTY: Omit<Role, 'id'> = {
  role: '', assignee: '', email: '', department: '', reportingTo: '',
  deputy: '', clauseRef: '', responsibilities: '', commitment: '',
  authority: 'Operational', policyRef: '', assignedAt: '', reviewDate: '',
};

const AUTHORITY_BADGE: Record<string, string> = {
  'Decision Maker': 'bg-primary/10 text-primary border-primary/20',
  'Advisory':       'bg-warning/10 text-warning border-warning/20',
  'Operational':    'bg-success/10 text-success border-success/20',
};
const AUTHORITY_BAR: Record<string, string> = {
  'Decision Maker': 'bg-primary',
  'Advisory':       'bg-warning',
  'Operational':    'bg-success',
};
const AUTHORITY_RING: Record<string, string> = {
  'Decision Maker': 'ring-primary/30',
  'Advisory':       'ring-warning/30',
  'Operational':    'ring-success/30',
};

/* ── Avatar store (localStorage) ── */
const AVATAR_KEY = (id: string) => `leadership_avatar_${id}`;
function loadAvatar(id: string): string | null {
  try { return localStorage.getItem(AVATAR_KEY(id)); } catch { return null; }
}
function saveAvatar(id: string, base64: string) {
  try { localStorage.setItem(AVATAR_KEY(id), base64); } catch {}
}
function deleteAvatar(id: string) {
  try { localStorage.removeItem(AVATAR_KEY(id)); } catch {}
}

/* ── Deterministic real portrait from randomuser.me ── */
function nameHash(name: string) {
  let h = 5381;
  for (let i = 0; i < name.length; i++) { h = ((h << 5) + h) + name.charCodeAt(i); h = h & h; }
  return Math.abs(h);
}
function prAvatarUrl(name: string) {
  const h = nameHash(name);
  const gender = h % 2 === 0 ? 'men' : 'women';
  const num    = h % 70;
  return `https://randomuser.me/api/portraits/${gender}/${num}.jpg`;
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}
function fmt(d?: string | null) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
}

/* ── Avatar component ── */
function Avatar({
  name, roleId, customBase64, size = 'md', authority,
}: {
  name: string; roleId?: string; customBase64?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl'; authority?: string;
}) {
  const [imgErr, setImgErr] = useState(false);
  const ring  = authority ? (AUTHORITY_RING[authority] ?? 'ring-border') : 'ring-border/40';
  const dims  = { sm: 'w-9 h-9 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-16 h-16 text-base', xl: 'w-24 h-24 text-xl' }[size];

  const stored = roleId ? loadAvatar(roleId) : null;
  const src    = customBase64 || stored || (!imgErr ? prAvatarUrl(name) : null);

  return (
    <div className={`${dims} rounded-2xl overflow-hidden flex-shrink-0 ring-2 ${ring} bg-primary/10 flex items-center justify-center`}>
      {src && !imgErr ? (
        <img src={src} alt={name} className="w-full h-full object-cover" onError={() => setImgErr(true)} />
      ) : (
        <span className="font-bold text-primary">{initials(name)}</span>
      )}
    </div>
  );
}

/* ── Avatar Upload picker (inside modal) ── */
function AvatarPicker({
  name, preview, onPick,
}: { name: string; preview: string | null; onPick: (base64: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (ev.target?.result) onPick(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 ring-2 ring-border/40 bg-primary/10 flex items-center justify-center relative group cursor-pointer"
        onClick={() => ref.current?.click()}>
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : name ? (
          <img src={prAvatarUrl(name)} alt={name} className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <Camera className="w-6 h-6 text-primary/40" />
        )}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Upload className="w-5 h-5 text-white" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-text-primary">Profile Photo</p>
        <p className="text-xs text-text-muted mt-0.5">Upload from your PC</p>
        <button type="button" onClick={() => ref.current?.click()}
          className="mt-1.5 text-xs text-primary hover:underline font-medium">
          Choose image…
        </button>
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function PanelField({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="bg-bg/60 rounded-xl border border-border/40 px-4 py-3">
      <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
        <Icon className="w-3 h-3" /> {label}
      </p>
      <p className={`text-sm font-medium leading-snug ${value ? 'text-text-primary' : 'text-text-muted/40'}`}>
        {value || '—'}
      </p>
    </div>
  );
}

export default function LeadershipPage() {
  const [showModal, setShowModal]         = useState(false);
  const [roles, setRoles]                 = useState<Role[]>([]);
  const [loading, setLoading]             = useState(true);
  const [editingId, setEditingId]         = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selected, setSelected]           = useState<Role | null>(null);
  const [search, setSearch]               = useState('');
  const [filterAuth, setFilterAuth]       = useState('');
  const [filterDept, setFilterDept]       = useState('');
  const [form, setForm]                   = useState<Omit<Role, 'id'>>(EMPTY);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [pendingAvatarId, setPendingAvatarId] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    try { setRoles(await apiGet('/leadership')); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchRoles(); }, [fetchRoles]);

  const openCreate = () => {
    setEditingId(null); setPendingAvatarId(null); setAvatarPreview(null);
    setForm(EMPTY); setShowModal(true);
  };
  const openEdit = (r: Role) => {
    setEditingId(r.id); setPendingAvatarId(r.id);
    setAvatarPreview(loadAvatar(r.id));
    setForm({
      role: r.role, assignee: r.assignee, email: r.email || '', department: r.department || '',
      reportingTo: r.reportingTo || '', deputy: r.deputy || '', clauseRef: r.clauseRef || '',
      responsibilities: r.responsibilities || '', commitment: r.commitment || '',
      authority: r.authority || 'Operational', policyRef: r.policyRef || '',
      assignedAt: r.assignedAt ? r.assignedAt.split('T')[0] : '',
      reviewDate: r.reviewDate ? r.reviewDate.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role.trim() || !form.assignee.trim()) return;
    const payload: any = { ...form };
    payload.assignedAt = form.assignedAt ? new Date(form.assignedAt).toISOString() : null;
    payload.reviewDate = form.reviewDate ? new Date(form.reviewDate).toISOString() : null;
    try {
      let savedId: string;
      if (editingId) {
        await apiPut(`/leadership/${editingId}`, payload);
        savedId = editingId;
      } else {
        const created: Role = await apiPost('/leadership', payload);
        savedId = created.id;
      }
      // Save avatar to localStorage
      if (avatarPreview) saveAvatar(savedId, avatarPreview);
      setShowModal(false); fetchRoles(); toast('Role saved', 'success');
      if (selected?.id === editingId) setSelected(null);
    } catch (e: any) { toast(e?.message || 'Failed to save', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/leadership/${id}`);
      deleteAvatar(id);
      fetchRoles(); toast('Role deleted', 'success');
      if (selected?.id === id) setSelected(null);
    } catch (e: any) { toast(e?.message || 'Failed to delete', 'error'); }
  };

  const departments = useMemo(() => [...new Set(roles.map(r => r.department).filter(Boolean))], [roles]);
  const filtered    = useMemo(() => roles.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.role.toLowerCase().includes(q) || r.assignee.toLowerCase().includes(q) || (r.department || '').toLowerCase().includes(q);
    return matchSearch && (!filterAuth || r.authority === filterAuth) && (!filterDept || r.department === filterDept);
  }), [roles, search, filterAuth, filterDept]);

  const overdueCount   = roles.filter(r => r.reviewDate && new Date(r.reviewDate) < new Date()).length;
  const decisionMakers = roles.filter(r => r.authority === 'Decision Maker').length;

  const f = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <AccessGuard page="leadership">
    <div className="animate-fade-in">
      <Breadcrumbs items={[{ label: 'Leadership & Governance' }]} />
      <PageHeader
        title="Leadership & Governance"
        subtitle="Clause 5.1, 5.3 — Leadership Commitment & Roles"
        icon={<Building2 className="w-4 h-4" />}
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => exportToCSV(roles, 'leadership', [
              { key: 'role', label: 'Role' }, { key: 'assignee', label: 'Assigned To' },
              { key: 'email', label: 'Email' }, { key: 'department', label: 'Department' },
              { key: 'authority', label: 'Authority' },
            ])}><Download className="w-3.5 h-3.5" /> CSV</Button>
            <Button variant="ghost" onClick={() => exportToPDF('Leadership & Governance', 'Clause 5.1, 5.3', roles, [
              { key: 'role', label: 'Role' }, { key: 'assignee', label: 'Assigned To' },
              { key: 'department', label: 'Department' }, { key: 'authority', label: 'Authority' },
            ])}><FileText className="w-3.5 h-3.5" /> PDF</Button>
            <Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Role</Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger">
        <StatsCard title="Total Roles"     value={roles.length}       icon={<Users className="w-4 h-4 text-primary" />}    iconBg="bg-info-light" />
        <StatsCard title="Decision Makers" value={decisionMakers}     icon={<Building2 className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
        <StatsCard title="Departments"     value={departments.length} icon={<Shield className="w-4 h-4 text-success" />}   iconBg="bg-success-light" />
        <StatsCard title="Review Overdue"  value={overdueCount}
          icon={<AlertTriangle className={`w-4 h-4 ${overdueCount > 0 ? 'text-danger' : 'text-text-muted'}`} />}
          iconBg={overdueCount > 0 ? 'bg-danger-light' : 'bg-bg'} />
      </div>

      {/* Search & Filter */}
      {roles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <div className="flex items-center gap-2 px-3 py-2 flex-1 min-w-[200px] bg-bg border border-border rounded-lg hover:border-border-light focus-within:border-primary/50 transition-all">
            <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
            <input className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none border-none focus:ring-0 min-w-0"
              placeholder="Search roles or people…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary hover:border-border-light focus:outline-none focus:border-primary/50 transition-all"
            value={filterAuth} onChange={e => setFilterAuth(e.target.value)}>
            <option value="">All Authority Levels</option>
            <option>Decision Maker</option><option>Advisory</option><option>Operational</option>
          </select>
          {departments.length > 0 && (
            <select className="px-3 py-2 text-sm bg-bg border border-border rounded-lg text-text-primary hover:border-border-light focus:outline-none focus:border-primary/50 transition-all"
              value={filterDept} onChange={e => setFilterDept(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d}>{d}</option>)}
            </select>
          )}
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-text-muted text-sm">Loading…</div>
      ) : roles.length === 0 ? (
        <EmptyState
          title="Define your leadership structure"
          description="Document management commitment, ISMS role assignments, security responsibilities and reporting lines as required by ISO 27001:2022 Clause 5."
          icon={<Building2 className="w-7 h-7 text-primary/40" />}
          action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Add Role</Button>}
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-text-muted text-sm">No roles match your search.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {filtered.map(r => {
            const isOverdue = r.reviewDate && new Date(r.reviewDate) < new Date();
            return (
              <div key={r.id} onClick={() => setSelected(r)}
                className="card card-interactive cursor-pointer group relative overflow-hidden flex flex-col">
                <div className={`h-1 w-full ${AUTHORITY_BAR[r.authority] ?? 'bg-border'} flex-shrink-0`} />
                <div className="p-5 flex flex-col flex-1">
                  {/* Profile header */}
                  <div className="flex items-start gap-3 mb-4">
                    <Avatar name={r.assignee} roleId={r.id} size="md" authority={r.authority} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-text-primary leading-tight truncate">{r.assignee}</p>
                      <p className="text-xs text-text-muted truncate mt-0.5">{r.role}</p>
                      {r.department && <p className="text-[11px] text-text-muted/50 truncate mt-0.5">{r.department}</p>}
                    </div>
                  </div>
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${AUTHORITY_BADGE[r.authority] ?? 'bg-border/30 text-text-muted border-border'}`}>
                      {r.authority}
                    </span>
                    {r.clauseRef && (
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-info-light text-primary border border-primary/10 font-medium">
                        {r.clauseRef}
                      </span>
                    )}
                    {isOverdue && (
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-danger/10 text-danger border border-danger/20 flex items-center gap-1 font-medium">
                        <Clock className="w-2.5 h-2.5" /> Review Due
                      </span>
                    )}
                  </div>
                  {/* Info rows */}
                  <div className="space-y-2 text-[12px] text-text-muted border-t border-border/30 pt-3 mt-auto">
                    {r.email && (
                      <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 flex-shrink-0 text-text-muted/50" /><span className="truncate">{r.email}</span></div>
                    )}
                    {r.reportingTo && (
                      <div className="flex items-center gap-2"><ArrowUp className="w-3.5 h-3.5 flex-shrink-0 text-text-muted/50" /><span className="truncate">Reports to <span className="text-text-secondary font-medium">{r.reportingTo}</span></span></div>
                    )}
                    {r.deputy && (
                      <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 flex-shrink-0 text-text-muted/50" /><span className="truncate">Deputy: <span className="text-text-secondary font-medium">{r.deputy}</span></span></div>
                    )}
                  </div>
                  {r.responsibilities && (
                    <p className="text-[11px] text-text-muted mt-3 line-clamp-2 leading-relaxed">{r.responsibilities}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Detail Side Panel ── */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
          {/* Panel — width fixed, height fits content up to full screen */}
          <div className="fixed top-0 right-0 w-[560px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel overflow-hidden" style={{ maxHeight: '100vh' }}>
            <div className={`h-1 flex-shrink-0 ${AUTHORITY_BAR[selected.authority] ?? 'bg-primary'}`} />

            {/* Header */}
            <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar name={selected.assignee} roleId={selected.id} size="lg" authority={selected.authority} />
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-text-primary leading-tight">{selected.assignee}</h2>
                    <p className="text-sm text-text-muted mt-0.5">{selected.role}</p>
                    {selected.department && <p className="text-xs text-text-muted/60 mt-0.5">{selected.department}</p>}
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${AUTHORITY_BADGE[selected.authority] ?? 'bg-border/30 text-text-muted border-border'}`}>
                  {selected.authority}
                </span>
                {selected.clauseRef && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-info-light text-primary border border-primary/10 font-medium">{selected.clauseRef}</span>
                )}
                {selected.reviewDate && new Date(selected.reviewDate) < new Date() && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-danger/10 text-danger border border-danger/20 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3 h-3" /> Review Overdue
                  </span>
                )}
              </div>
            </div>

            {/* Body — scrolls only when content is taller than available space */}
            <div className="overflow-y-auto px-6 py-4 space-y-3" style={{ maxHeight: 'calc(100vh - 230px)' }}>
              <div className="grid grid-cols-2 gap-2.5">
                <PanelField icon={Mail}        label="Email"           value={selected.email} />
                <PanelField icon={Building2}   label="Department"      value={selected.department} />
                <PanelField icon={ArrowUp}     label="Reports To"      value={selected.reportingTo} />
                <PanelField icon={User}        label="Deputy / Backup" value={selected.deputy} />
                <PanelField icon={CheckCircle} label="Date Assigned"   value={fmt(selected.assignedAt)} />
                <PanelField icon={Clock}       label="Review Date"     value={fmt(selected.reviewDate)} />
              </div>
              {selected.policyRef && <PanelField icon={FileText} label="Policy Approval Reference" value={selected.policyRef} />}
              {selected.responsibilities && (
                <div className="bg-bg/60 rounded-xl border border-border/40 px-4 py-3">
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Shield className="w-3 h-3" /> Responsibilities
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.responsibilities}</p>
                </div>
              )}
              {selected.commitment && (
                <div className="bg-bg/60 rounded-xl border border-border/40 px-4 py-3">
                  <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" /> Management Commitment
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.commitment}</p>
                </div>
              )}
            </div>

            {/* Footer — always right below content */}
            <div className="flex-shrink-0 flex items-center gap-2 px-6 py-3 border-t border-border">
              <Button onClick={() => openEdit(selected)} className="flex-1 justify-center">
                <Edit2 className="w-3.5 h-3.5" /> Edit Role
              </Button>
              <Button variant="secondary" onClick={() => setConfirmDelete(selected.id)} className="text-danger hover:text-danger hover:bg-danger/10 hover:border-danger/30">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            </div>
          </div>
        </>
      )}

      {/* ── Add / Edit Modal ── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit ISMS Role' : 'Add ISMS Role'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-2.5">

          {/* Row 1: avatar + top 4 fields side by side */}
          <div className="flex gap-3">
            <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <AvatarPicker name={form.assignee} preview={avatarPreview} onPick={setAvatarPreview} />
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2.5">
              <Input label="Role Title *"  placeholder="e.g. CISO, DPO"     value={form.role}       onChange={f('role')} />
              <Input label="Assigned To *" placeholder="Full name"           value={form.assignee}   onChange={f('assignee')} />
              <Input label="Email" type="email" placeholder="person@co.com"  value={form.email}      onChange={f('email')} />
              <Input label="Department"    placeholder="e.g. IT, Legal"      value={form.department} onChange={f('department')} />
            </div>
          </div>

          {/* Row 2: org chart */}
          <div className="grid grid-cols-3 gap-2.5">
            <Input label="Reports To"      placeholder="e.g. CEO"        value={form.reportingTo} onChange={f('reportingTo')} />
            <Input label="Deputy / Backup" placeholder="Backup person"   value={form.deputy}      onChange={f('deputy')} />
            <Input label="Policy Ref"      placeholder="e.g. POL-001"    value={form.policyRef}   onChange={f('policyRef')} />
          </div>

          {/* Row 3: authority + clause + dates */}
          <div className="grid grid-cols-4 gap-2.5">
            <Select label="Authority" value={form.authority} onChange={f('authority')}>
              <option>Decision Maker</option><option>Advisory</option><option>Operational</option>
            </Select>
            <Input label="ISO Clause" placeholder="e.g. 5.3"  value={form.clauseRef}  onChange={f('clauseRef')} />
            <Input label="Assigned"   type="date"              value={form.assignedAt} onChange={f('assignedAt')} />
            <Input label="Review Due" type="date"              value={form.reviewDate} onChange={f('reviewDate')} />
          </div>

          {/* Row 4: text areas */}
          <TextArea label="Responsibilities" rows={2}
            placeholder="Key responsibilities and accountabilities for information security"
            value={form.responsibilities} onChange={f('responsibilities')} />
          <TextArea label="Management Commitment" rows={2}
            placeholder="Top management commitment statement or reference"
            value={form.commitment} onChange={f('commitment')} />

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button type="submit">{editingId ? 'Update Role' : 'Save Role'}</Button>
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
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
