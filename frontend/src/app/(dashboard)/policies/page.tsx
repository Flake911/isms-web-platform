'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, EmptyState, Modal, Input, Select, TextArea, ConfirmDialog, toast } from '@/components/ui';
import {
  FileText, Plus, CheckCircle, Clock, XCircle, Trash2, Edit2, Download,
  Search, X, AlertTriangle, User, Users, Calendar, CalendarCheck, Link2,
  BookOpen, Tag, Eye, ChevronRight, ArrowLeft, Shield, Globe, Lock,
  Server, Database, Cpu, UserCheck, Building2, RefreshCw, Scale, Layers,
  Package, Wifi, LayoutGrid,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import CommentsSection from '@/components/Comments';
import { exportToCSV } from '@/lib/export';

interface Policy {
  id: string; docId: string; title: string; version: string; status: string;
  category: string; owner: string; approver: string; linkedClause: string;
  scope: string; audience: string; content: string;
  approvedAt: string | null; reviewDate: string | null;
  createdAt: string; updatedAt: string;
}

const empty = {
  docId: '', title: '', version: '1.0', status: 'Draft',
  category: 'Governance', owner: '', approver: '',
  linkedClause: '', scope: '', audience: '', content: '',
  approvedAt: '', reviewDate: '',
};

const CAT_META: Record<string, { icon: React.ElementType; hex: string; desc: string }> = {
  'Governance':           { icon: Shield,        hex: '#6366f1', desc: 'ISMS policy framework, management direction & oversight' },
  'Access Control':       { icon: Lock,          hex: '#f59e0b', desc: 'Identity, authentication, and access management policies' },
  'Network Security':     { icon: Wifi,          hex: '#06b6d4', desc: 'Network access, perimeter, and remote working policies' },
  'Application Security': { icon: Cpu,           hex: '#10b981', desc: 'Secure development, testing, and software lifecycle policies' },
  'Data Protection':      { icon: Database,      hex: '#ef4444', desc: 'Data classification, privacy, GDPR and retention policies' },
  'Incident Management':  { icon: AlertTriangle, hex: '#f97316', desc: 'Incident response, reporting and escalation policies' },
  'Business Continuity':  { icon: RefreshCw,     hex: '#14b8a6', desc: 'BCP, DR and resilience management policies' },
  'Human Resources':      { icon: UserCheck,     hex: '#ec4899', desc: 'Hiring, onboarding, training, and offboarding policies' },
  'Physical Security':    { icon: Building2,     hex: '#78716c', desc: 'Physical access, facilities, and clean desk policies' },
  'Asset Management':     { icon: Package,       hex: '#8b5cf6', desc: 'Hardware, software, and information asset policies' },
  'Supplier Management':  { icon: Globe,         hex: '#0ea5e9', desc: 'Third-party, vendor, and supply chain security policies' },
  'Cryptography':         { icon: Server,        hex: '#a855f7', desc: 'Encryption, key management, and certificate policies' },
  'Change Management':    { icon: Layers,        hex: '#f59e0b', desc: 'Change control, release, and configuration policies' },
  'Compliance':           { icon: Scale,         hex: '#84cc16', desc: 'Legal, regulatory, and audit compliance policies' },
  'Operations':           { icon: LayoutGrid,    hex: '#38bdf8', desc: 'IT operations, monitoring, and logging policies' },
};

const CATEGORIES = Object.keys(CAT_META);

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  'Approved':  { label: 'Approved',  bg: 'bg-success/10',  text: 'text-success',  dot: '#10b981' },
  'In Review': { label: 'In Review', bg: 'bg-primary/10',  text: 'text-primary',  dot: '#6366f1' },
  'Draft':     { label: 'Draft',     bg: 'bg-warning/10',  text: 'text-warning',  dot: '#f59e0b' },
  'Retired':   { label: 'Retired',   bg: 'bg-surface-light', text: 'text-text-muted', dot: '#6b7280' },
};

const statusCfg = (s: string) => STATUS_CFG[s] ?? STATUS_CFG['Draft'];

const toDateInput = (d: string | null) => d ? d.split('T')[0] : '';
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const isOverdue = (reviewDate: string | null) => reviewDate && new Date(reviewDate) < new Date();

// ─── Category Card ────────────────────────────────────────────────────────────
function CategoryCard({ name, policies, onClick }: { name: string; policies: Policy[]; onClick: () => void }) {
  const meta = CAT_META[name] ?? { icon: FileText, hex: '#6b7280', desc: '' };
  const Icon = meta.icon;
  const approved = policies.filter(p => p.status === 'Approved').length;
  const draft    = policies.filter(p => p.status === 'Draft').length;
  const inReview = policies.filter(p => p.status === 'In Review').length;
  const overdue  = policies.filter(p => isOverdue(p.reviewDate) && p.status !== 'Retired').length;
  const total    = policies.length;
  const pct      = total > 0 ? Math.round((approved / total) * 100) : 0;

  return (
    <button onClick={onClick}
      className="group text-left w-full bg-surface border border-border/50 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 10px 32px ${meta.hex}22, 0 0 0 1.5px ${meta.hex}40`; e.currentTarget.style.borderColor = 'transparent'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = ''; }}>

      <div className="p-5">
        {/* Icon + overdue badge + arrow */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${meta.hex}14`, border: `1.5px solid ${meta.hex}28` }}>
            <Icon className="w-5 h-5" style={{ color: meta.hex }} />
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            {overdue > 0 && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20">
                {overdue} overdue
              </span>
            )}
            <div className="w-6 h-6 rounded-lg border border-border/60 flex items-center justify-center">
              <ChevronRight className="w-3.5 h-3.5 text-text-muted group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Name + description */}
        <h3 className="text-[13px] font-bold text-text-primary leading-snug mb-1">{name}</h3>
        <p className="text-[11px] text-text-muted leading-snug line-clamp-2 mb-4">{meta.desc}</p>

        {/* Stats */}
        {total === 0 ? (
          <p className="text-[11px] text-text-muted/35 italic">No policies yet · click to add</p>
        ) : (
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-text-primary">{total} {total === 1 ? 'policy' : 'policies'}</span>
              {approved > 0 && <><span className="text-text-muted/25 text-xs select-none">·</span><span className="text-[10px] font-semibold text-success">{approved} approved</span></>}
              {inReview > 0 && <><span className="text-text-muted/25 text-xs select-none">·</span><span className="text-[10px] font-semibold text-primary">{inReview} review</span></>}
              {draft > 0 && <><span className="text-text-muted/25 text-xs select-none">·</span><span className="text-[10px] font-semibold text-warning">{draft} draft</span></>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-text-muted">Approval rate</span>
                <span className="text-[10px] font-bold" style={{ color: meta.hex }}>{pct}%</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: `${meta.hex}14` }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: meta.hex }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom gradient accent strip */}
      <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${meta.hex} 0%, ${meta.hex}35 100%)` }} />
    </button>
  );
}

// ─── Policy Row Card ──────────────────────────────────────────────────────────
function PolicyCard({ p, onView, onEdit, onDelete }: { p: Policy; onView: () => void; onEdit: () => void; onDelete: () => void }) {
  const overduePol = isOverdue(p.reviewDate) && p.status !== 'Retired';
  const sc   = statusCfg(p.status);
  const meta = CAT_META[p.category];

  return (
    <div onClick={onView}
      className="group relative bg-surface border border-border/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md flex items-stretch"
      style={{ borderLeft: `4px solid ${meta?.hex ?? '#6b7280'}` }}>

      {/* Main content */}
      <div className="px-4 py-3.5 flex-1 min-w-0">
        {/* Top: doc id + version + overdue + status */}
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-1.5">
            {p.docId && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg border border-border/50 text-text-muted">{p.docId}</span>
            )}
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg border border-border/50 text-text-muted">v{p.version}</span>
            {overduePol && (
              <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-danger/10 text-danger border border-danger/20">Overdue</span>
            )}
          </div>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${sc.bg} ${sc.text}`}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sc.dot }} />
            {p.status}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-text-primary leading-snug mb-2.5 group-hover:text-primary transition-colors line-clamp-1">
          {p.title}
        </h3>

        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap text-[11px] text-text-muted">
          {p.linkedClause && (
            <span className="flex items-center gap-1 font-semibold" style={{ color: meta?.hex ?? '#6b7280' }}>
              <Link2 className="w-2.5 h-2.5" />{p.linkedClause}
            </span>
          )}
          {p.owner && (
            <span className="flex items-center gap-1">
              <User className="w-2.5 h-2.5" />{p.owner}
            </span>
          )}
          {p.reviewDate && (
            <span className={`flex items-center gap-1 ml-auto ${overduePol ? 'text-danger font-semibold' : ''}`}>
              <Calendar className="w-2.5 h-2.5" />{fmtDate(p.reviewDate)}
            </span>
          )}
        </div>
      </div>

      {/* Right: action strip (shown on hover) */}
      <div className="flex flex-col gap-1 justify-center px-2.5 border-l border-border/40 opacity-0 group-hover:opacity-100 transition-opacity w-12 flex-shrink-0" onClick={e => e.stopPropagation()}>
        <button onClick={onEdit}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-primary/10 transition-all">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-all">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PoliciesPage() {
  const [items, setItems]           = useState<Policy[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [selected, setSelected]     = useState<Policy | null>(null);
  const [form, setForm]             = useState(empty);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const f = (k: Partial<typeof empty>) => setForm(prev => ({ ...prev, ...k }));

  const fetch_ = useCallback(async () => {
    try { setItems(await apiGet('/policies')); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { fetch_(); }, [fetch_]);

  const openCreate = (cat?: string) => {
    setEditingId(null);
    setForm({ ...empty, category: cat ?? (activeCategory || 'Governance') });
    setShowModal(true);
  };
  const openEdit = (p: Policy) => {
    setSelected(null);
    setEditingId(p.id);
    setForm({
      docId: p.docId || '', title: p.title, version: p.version || '1.0',
      status: p.status || 'Draft', category: p.category || 'Governance',
      owner: p.owner || '', approver: p.approver || '',
      linkedClause: p.linkedClause || '', scope: p.scope || '',
      audience: p.audience || '', content: p.content || '',
      approvedAt: toDateInput(p.approvedAt), reviewDate: toDateInput(p.reviewDate),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = {
      ...form,
      approvedAt: form.approvedAt ? new Date(form.approvedAt).toISOString() : null,
      reviewDate: form.reviewDate ? new Date(form.reviewDate).toISOString() : null,
    };
    try {
      if (editingId) await apiPut(`/policies/${editingId}`, payload);
      else await apiPost('/policies', payload);
      setShowModal(false); fetch_(); toast('Policy saved', 'success');
    } catch (e: any) { toast(e?.message || 'Failed to save policy', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try { await apiDelete(`/policies/${id}`); setSelected(null); fetch_(); toast('Policy deleted', 'success'); }
    catch (e: any) { toast(e?.message || 'Failed to delete', 'error'); }
  };

  const byCategory = useMemo(() => {
    const map: Record<string, Policy[]> = {};
    CATEGORIES.forEach(c => { map[c] = []; });
    items.forEach(p => {
      const cat = CATEGORIES.includes(p.category) ? p.category : 'Governance';
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return map;
  }, [items]);

  const drillPolicies = useMemo(() => {
    if (!activeCategory) return [];
    return (byCategory[activeCategory] ?? []).filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.docId || '').toLowerCase().includes(q) || (p.owner || '').toLowerCase().includes(q);
      const matchStatus = !filterStatus || p.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [activeCategory, byCategory, search, filterStatus]);

  const totalApproved = items.filter(p => p.status === 'Approved').length;
  const totalInReview = items.filter(p => p.status === 'In Review').length;
  const totalDraft    = items.filter(p => p.status === 'Draft').length;
  const totalOverdue  = items.filter(p => isOverdue(p.reviewDate) && p.status !== 'Retired').length;

  const catMeta = activeCategory ? (CAT_META[activeCategory] ?? { icon: FileText, hex: '#6b7280', desc: '' }) : null;
  const CatIcon = catMeta?.icon ?? FileText;

  const csvCols = [
    { key: 'docId', label: 'Doc ID' }, { key: 'title', label: 'Title' },
    { key: 'version', label: 'Version' }, { key: 'status', label: 'Status' },
    { key: 'category', label: 'Category' }, { key: 'owner', label: 'Owner' },
    { key: 'approver', label: 'Approver' }, { key: 'linkedClause', label: 'ISO Clause' },
    { key: 'reviewDate', label: 'Review Date' },
  ];

  return (
    <AccessGuard page="policies">
    <div className="animate-fade-in">

      {/* ── Hero Banner ── */}
      <div className="relative rounded-2xl overflow-hidden mb-6 border border-border"
        style={{ background: 'linear-gradient(135deg, #6366f118 0%, #8b5cf608 50%, transparent 100%)' }}>
        {/* Dot grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative px-6 py-6">
          {activeCategory ? (
            <div className="flex items-center gap-4">
              <button onClick={() => { setActiveCategory(null); setSearch(''); setFilterStatus(''); }}
                className="w-9 h-9 rounded-xl bg-surface/70 border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface transition-all">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow"
                style={{ background: `${catMeta?.hex}22`, border: `1px solid ${catMeta?.hex}30` }}>
                <CatIcon className="w-5 h-5" style={{ color: catMeta?.hex }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] text-text-muted uppercase tracking-widest font-medium">Policy Management</span>
                  <span className="text-text-muted/30">/</span>
                  <span className="text-[10px] font-semibold" style={{ color: catMeta?.hex }}>{activeCategory}</span>
                </div>
                <h1 className="text-xl font-bold text-text-primary">{activeCategory}</h1>
                <p className="text-xs text-text-muted mt-0.5">{catMeta?.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => exportToCSV(drillPolicies, 'policies', csvCols)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface/70 border border-border text-xs text-text-muted hover:text-text-primary hover:bg-surface transition-all">
                  <Download className="w-3.5 h-3.5" /> CSV
                </button>
                <button onClick={() => openCreate(activeCategory)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm">
                  <Plus className="w-3.5 h-3.5" /> Add Policy
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-widest font-medium mb-0.5">ISO 27001 — Clause 5.2</p>
                  <h1 className="text-xl font-bold text-text-primary">Policy Management</h1>
                  <p className="text-xs text-text-muted mt-0.5">Policy library organized by category · {items.length} total policies</p>
                </div>
              </div>

              {/* Quick stats row */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="px-4 py-2.5 rounded-xl bg-surface/70 border border-border text-center min-w-[72px]">
                  <p className="text-[18px] font-bold text-success leading-tight">{totalApproved}</p>
                  <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wide">Approved</p>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-surface/70 border border-border text-center min-w-[72px]">
                  <p className="text-[18px] font-bold text-primary leading-tight">{totalInReview}</p>
                  <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wide">In Review</p>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-surface/70 border border-border text-center min-w-[72px]">
                  <p className="text-[18px] font-bold text-warning leading-tight">{totalDraft}</p>
                  <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wide">Draft</p>
                </div>
                {totalOverdue > 0 && (
                  <div className="px-4 py-2.5 rounded-xl bg-danger/10 border border-danger/20 text-center min-w-[72px]">
                    <p className="text-[18px] font-bold text-danger leading-tight">{totalOverdue}</p>
                    <p className="text-[10px] text-danger/70 mt-0.5 uppercase tracking-wide">Overdue</p>
                  </div>
                )}
                <div className="flex items-center gap-2 ml-2">
                  <button onClick={() => exportToCSV(items, 'policies', csvCols)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface/70 border border-border text-xs text-text-muted hover:text-text-primary hover:bg-surface transition-all">
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                  <button onClick={() => openCreate()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm">
                    <Plus className="w-3.5 h-3.5" /> New Policy
                  </button>
                </div>
              </div>
              {/* Mobile CTA */}
              <button onClick={() => openCreate()}
                className="sm:hidden flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm">
                <Plus className="w-3.5 h-3.5" /> New Policy
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : !activeCategory ? (
        /* ══ CATEGORY GRID ══ */
        items.length === 0 ? (
          <EmptyState
            title="No policies yet"
            description="Start building your ISO 27001 policy library. Policies are organized by category like the SANS Institute template."
            icon={<FileText className="w-7 h-7 text-text-muted/40" />}
            action={
              <button onClick={() => openCreate()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">
                <Plus className="w-3.5 h-3.5" /> New Policy
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map(cat => (
              <CategoryCard
                key={cat}
                name={cat}
                policies={byCategory[cat] ?? []}
                onClick={() => { setActiveCategory(cat); setSearch(''); setFilterStatus(''); }}
              />
            ))}
          </div>
        )
      ) : (
        /* ══ DRILL-DOWN LIST ══ */
        <div>
          {/* Search + filter bar */}
          <div className="flex flex-wrap gap-2 mb-5">
            <div className="flex items-center gap-2 px-3 py-2 flex-1 min-w-[200px] bg-surface border border-border rounded-lg hover:border-border-light focus-within:border-primary/50 transition-all">
              <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
              <input className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none border-none focus:ring-0 min-w-0"
                placeholder="Search policies by name, ID or owner…" value={search} onChange={e => setSearch(e.target.value)} />
              {search && (
                <button onClick={() => setSearch('')} className="text-text-muted hover:text-danger transition-colors flex-shrink-0">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <select className="px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary hover:border-border-light focus:outline-none focus:border-primary/50 transition-all"
              value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option>Draft</option><option>In Review</option><option>Approved</option><option>Retired</option>
            </select>
            {(search || filterStatus) && (
              <button onClick={() => { setSearch(''); setFilterStatus(''); }}
                className="px-3 py-2 text-sm text-text-muted hover:text-danger border border-border rounded-lg hover:border-danger/30 transition-all flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          {drillPolicies.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-border bg-surface/50">
              <div className="w-14 h-14 rounded-2xl bg-surface-light mx-auto flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-text-muted/30" />
              </div>
              <p className="text-sm font-medium text-text-muted mb-1">
                {(byCategory[activeCategory]?.length ?? 0) === 0 ? `No policies in ${activeCategory} yet` : 'No policies match your filters'}
              </p>
              <p className="text-xs text-text-muted/60 mb-4">
                {(byCategory[activeCategory]?.length ?? 0) === 0 ? 'Create your first policy for this category.' : 'Try adjusting your search or filters.'}
              </p>
              {(byCategory[activeCategory]?.length ?? 0) === 0 && (
                <button onClick={() => openCreate(activeCategory)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Add First Policy
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Stats bar */}
              <div className="flex items-center gap-3 flex-wrap mb-4 pb-3.5 border-b border-border/40">
                <p className="text-xs text-text-muted flex-1 min-w-[100px]">
                  <span className="font-semibold text-text-primary">{drillPolicies.length}</span> of <span className="font-semibold text-text-primary">{byCategory[activeCategory]?.length ?? 0}</span> policies
                </p>
                {(() => {
                  const cp = byCategory[activeCategory] ?? [];
                  const ca = cp.filter(p => p.status === 'Approved').length;
                  const cr = cp.filter(p => p.status === 'In Review').length;
                  const cd = cp.filter(p => p.status === 'Draft').length;
                  const co = cp.filter(p => isOverdue(p.reviewDate) && p.status !== 'Retired').length;
                  return (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {ca > 0 && <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/15"><span className="w-1.5 h-1.5 rounded-full bg-success" />{ca} approved</span>}
                      {cr > 0 && <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/15"><span className="w-1.5 h-1.5 rounded-full bg-primary" />{cr} in review</span>}
                      {cd > 0 && <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/15"><span className="w-1.5 h-1.5 rounded-full bg-warning" />{cd} draft</span>}
                      {co > 0 && <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-danger/10 text-danger border border-danger/20"><span className="w-1.5 h-1.5 rounded-full bg-danger" />{co} overdue</span>}
                    </div>
                  );
                })()}
              </div>
              <div className="space-y-2">
                {drillPolicies.map(p => (
                  <PolicyCard
                    key={p.id}
                    p={p}
                    onView={() => setSelected(p)}
                    onEdit={() => openEdit(p)}
                    onDelete={() => setConfirmDelete(p.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Detail Side Panel ── */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40" onClick={() => setSelected(null)} />
          <div className="fixed top-0 right-0 w-[640px] max-w-[96vw] bg-surface shadow-2xl z-50 flex flex-col animate-slide-panel overflow-hidden" style={{ maxHeight: '100vh' }}>
            {/* Colored top stripe */}
            <div className="h-1 w-full shrink-0"
              style={{ background: `linear-gradient(90deg, ${CAT_META[selected.category]?.hex ?? '#6366f1'}, #6366f1aa)` }} />

            {/* Panel header */}
            <div className="px-6 py-5 border-b border-border bg-bg/60 flex items-start justify-between gap-4 shrink-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  {selected.docId && (
                    <span className="text-[10px] font-mono px-2 py-1 rounded-md bg-surface-light border border-border/50 text-text-muted flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />{selected.docId}
                    </span>
                  )}
                  <span className="text-[10px] font-mono px-2 py-1 rounded-md bg-surface-light border border-border/50 text-text-muted">v{selected.version}</span>
                  {(() => {
                    const sc = statusCfg(selected.status);
                    return (
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${sc.bg} ${sc.text}`}>
                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: sc.dot }} />
                        {selected.status}
                      </span>
                    );
                  })()}
                  {isOverdue(selected.reviewDate) && selected.status !== 'Retired' && (
                    <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-danger/10 text-danger border border-danger/20 animate-pulse">
                      Review Overdue
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-text-primary leading-snug">{selected.title}</h2>
                {selected.category && (() => {
                  const m = CAT_META[selected.category];
                  const Icon = m?.icon ?? FileText;
                  return (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Icon className="w-3 h-3" style={{ color: m?.hex ?? '#6b7280' }} />
                      <p className="text-xs text-text-muted">{selected.category}</p>
                    </div>
                  );
                })()}
              </div>
              <button onClick={() => setSelected(null)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel body */}
            <div className="overflow-y-auto px-6 pt-5 pb-2 space-y-4" style={{ maxHeight: 'calc(100vh - 220px)' }}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: User, label: 'Policy Owner', value: selected.owner || '—' },
                  { icon: CheckCircle, label: 'Approver', value: selected.approver || '—' },
                  { icon: Calendar, label: 'Approved Date', value: fmtDate(selected.approvedAt) },
                  { icon: CalendarCheck, label: 'Next Review', value: fmtDate(selected.reviewDate), danger: !!(isOverdue(selected.reviewDate) && selected.status !== 'Retired') },
                ].map(({ icon: Icon, label, value, danger }) => (
                  <div key={label} className="bg-bg/50 rounded-xl border border-border/40 p-3.5">
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Icon className="w-3 h-3" /> {label}
                    </p>
                    <p className={`text-sm font-semibold ${danger ? 'text-danger' : 'text-text-primary'}`}>{value}</p>
                  </div>
                ))}
                {selected.linkedClause && (
                  <div className="bg-primary/5 rounded-xl border border-primary/15 p-3.5">
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Link2 className="w-3 h-3" /> ISO Clause
                    </p>
                    <p className="text-sm font-bold text-primary">{selected.linkedClause}</p>
                  </div>
                )}
                {selected.audience && (
                  <div className="bg-bg/50 rounded-xl border border-border/40 p-3.5">
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Audience
                    </p>
                    <p className="text-sm font-semibold text-text-primary">{selected.audience}</p>
                  </div>
                )}
              </div>

              {selected.scope && (
                <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Eye className="w-3 h-3" /> Scope
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed">{selected.scope}</p>
                </div>
              )}

              {selected.content && (
                <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" /> Policy Content / Purpose
                  </p>
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{selected.content}</p>
                </div>
              )}

              <div className="bg-bg/50 rounded-xl border border-border/40 p-4">
                <CommentsSection module="policies" recordId={selected.id} />
              </div>
            </div>

            {/* Panel footer */}
            <div className="px-6 py-4 border-t border-border bg-bg/60 flex gap-3 shrink-0">
              <button onClick={() => openEdit(selected)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all">
                <Edit2 className="w-4 h-4" /> Edit Policy
              </button>
              <button onClick={() => setConfirmDelete(selected.id)}
                className="px-5 py-2.5 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-all text-sm font-medium flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Create / Edit Modal ── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Policy' : 'New Policy'} size="lg">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Document ID" placeholder="e.g. POL-001" value={form.docId} onChange={e => f({ docId: e.target.value })} />
            <div className="col-span-2">
              <Input label="Policy Title *" placeholder="e.g. Information Security Policy" value={form.title} onChange={e => f({ title: e.target.value })} required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Version" placeholder="1.0" value={form.version} onChange={e => f({ version: e.target.value })} />
            <Select label="Status" value={form.status} onChange={e => f({ status: e.target.value })}>
              <option>Draft</option><option>In Review</option><option>Approved</option><option>Retired</option>
            </Select>
            <Select label="Category" value={form.category} onChange={e => f({ category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Policy Owner / Author" placeholder="Who maintains this policy?" value={form.owner} onChange={e => f({ owner: e.target.value })} />
            <Input label="Approver" placeholder="Who approves this policy?" value={form.approver} onChange={e => f({ approver: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Linked ISO Clause" placeholder="e.g. Clause 5.2, A.5.1" value={form.linkedClause} onChange={e => f({ linkedClause: e.target.value })} />
            <Input label="Distribution / Audience" placeholder="e.g. All Staff, IT Dept" value={form.audience} onChange={e => f({ audience: e.target.value })} />
          </div>
          <TextArea label="Scope" rows={2} placeholder="What systems, people, or processes does this policy apply to?" value={form.scope} onChange={e => f({ scope: e.target.value })} />
          <TextArea label="Policy Content / Purpose" rows={4} placeholder="Describe the purpose, objectives, and key requirements..." value={form.content} onChange={e => f({ content: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Approval Date" type="date" value={form.approvedAt} onChange={e => f({ approvedAt: e.target.value })} />
            <Input label="Next Review Date" type="date" value={form.reviewDate} onChange={e => f({ reviewDate: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all">
              {editingId ? 'Save Changes' : 'Save Policy'}
            </button>
            <button type="button" onClick={() => setShowModal(false)}
              className="px-4 py-2.5 rounded-xl border border-border text-sm text-text-muted hover:bg-surface-light transition-all">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Policy"
        message="Are you sure you want to delete this policy? This action cannot be undone."
        onConfirm={() => { if (confirmDelete) handleDelete(confirmDelete); setConfirmDelete(null); }}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
    </AccessGuard>
  );
}
