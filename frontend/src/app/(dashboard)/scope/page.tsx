'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, Button, EmptyState, Modal, Input, TextArea, Breadcrumbs } from '@/components/ui';
import {
  Globe, Plus, Users, FileText, Building2, Edit2, Calendar, Clock,
  Shield, CheckCircle, AlertCircle, Layers, MapPin, Cpu, Scale,
} from 'lucide-react';
import { apiGet, apiPost, apiPut } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { exportToPDF } from '@/lib/export';

interface ScopeDoc {
  id: string;
  version?: string;
  companyDescription?: string;
  internalIssues?: string;
  externalIssues?: string;
  interestedParty?: string;
  requirements?: string;
  scopeStatement?: string;
  locations?: string;
  processes?: string;
  systems?: string;
  regulations?: string;
  exclusions?: string;
  approvedBy?: string;
  approvedAt?: string;
  reviewDate?: string;
  updatedAt?: string;
}

const EMPTY: Record<string, string> = {
  version: '1.0', companyDescription: '', internalIssues: '', externalIssues: '',
  interestedParty: '', requirements: '', scopeStatement: '', locations: '',
  processes: '', systems: '', regulations: '', exclusions: '',
  approvedBy: '', approvedAt: '', reviewDate: '',
};

type TabId = '4.1' | '4.2' | '4.3';

const TABS: { id: TabId; label: string; icon: React.ElementType; desc: string }[] = [
  { id: '4.1', label: '4.1 — Organization Context', icon: Building2, desc: 'Internal & external issues' },
  { id: '4.2', label: '4.2 — Interested Parties',   icon: Users,     desc: 'Parties & their requirements' },
  { id: '4.3', label: '4.3 — Scope Definition',     icon: Globe,     desc: 'Boundaries & inclusions' },
];

type Accent = 'blue' | 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose';

const ACCENT_MAP: Record<Accent, { bar: string; icon: string; labelBg: string; dot: string }> = {
  blue:    { bar: 'bg-blue-500',    icon: 'text-blue-400',    labelBg: 'bg-blue-500/8',    dot: 'bg-blue-500' },
  indigo:  { bar: 'bg-indigo-500',  icon: 'text-indigo-400',  labelBg: 'bg-indigo-500/8',  dot: 'bg-indigo-500' },
  violet:  { bar: 'bg-violet-500',  icon: 'text-violet-400',  labelBg: 'bg-violet-500/8',  dot: 'bg-violet-500' },
  emerald: { bar: 'bg-emerald-500', icon: 'text-emerald-400', labelBg: 'bg-emerald-500/8', dot: 'bg-emerald-500' },
  amber:   { bar: 'bg-amber-500',   icon: 'text-amber-400',   labelBg: 'bg-amber-500/8',   dot: 'bg-amber-500' },
  rose:    { bar: 'bg-rose-500',    icon: 'text-rose-400',    labelBg: 'bg-rose-500/8',    dot: 'bg-rose-500' },
};

function DocField({
  icon: Icon, label, value, accent = 'blue',
}: {
  icon: React.ElementType; label: string; value?: string | null; accent?: Accent;
}) {
  const c = ACCENT_MAP[accent];
  const lines = value ? value.split('\n').map(l => l.trim()).filter(Boolean) : [];
  const isList = lines.length > 2;

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden bg-surface/40">
      {/* Field header */}
      <div className={`flex items-center gap-3 px-4 py-3 border-b border-border/40 ${c.labelBg}`}>
        <span className={`w-1 h-5 rounded-full ${c.bar} flex-shrink-0`} />
        <Icon className={`w-4 h-4 ${c.icon} flex-shrink-0`} />
        <span className="text-xs font-semibold text-text-secondary tracking-wide">{label}</span>
      </div>
      {/* Field value */}
      <div className="px-4 py-4">
        {lines.length > 0 ? (
          isList ? (
            <ul className="space-y-2">
              {lines.map((line, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-text-primary leading-relaxed">
                  <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-[7px] flex-shrink-0 opacity-70`} />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{value}</p>
          )
        ) : (
          <p className="text-sm text-text-muted/50 italic">Not yet defined</p>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon: Icon, clause, title, description }: {
  icon: React.ElementType; clause: string; title: string; description: string;
}) {
  return (
    <div className="flex items-center gap-3 pb-1 mb-1">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{clause}</span>
        </div>
        <h3 className="text-sm font-bold text-text-primary leading-tight">{title}</h3>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function ModalSection({ clause, title }: { clause: string; title: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <div className="h-px flex-1 bg-border/40" />
      <span className="text-[10px] font-bold text-primary uppercase tracking-widest px-2.5 py-1 bg-primary/5 rounded-md border border-primary/20">
        {clause} — {title}
      </span>
      <div className="h-px flex-1 bg-border/40" />
    </div>
  );
}

function MetaItem({ icon: Icon, label, value, danger }: { icon: React.ElementType; label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${danger ? 'bg-danger/10' : 'bg-surface'}`}>
        <Icon className={`w-3.5 h-3.5 ${danger ? 'text-danger' : 'text-text-muted'}`} />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">{label}</p>
        <p className={`text-xs font-semibold mt-0.5 ${danger ? 'text-danger' : 'text-text-primary'}`}>{value}</p>
      </div>
    </div>
  );
}

export default function ScopePage() {
  const [scope, setScope] = useState<ScopeDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('4.1');
  const [form, setForm] = useState<Record<string, string>>(EMPTY);

  const load = useCallback(async () => {
    try {
      const items = await apiGet<ScopeDoc[]>('/scope');
      setScope(items[0] ?? null);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = () => {
    setForm({
      version:            scope?.version            ?? '1.0',
      companyDescription: scope?.companyDescription ?? '',
      internalIssues:     scope?.internalIssues     ?? '',
      externalIssues:     scope?.externalIssues     ?? '',
      interestedParty:    scope?.interestedParty    ?? '',
      requirements:       scope?.requirements       ?? '',
      scopeStatement:     scope?.scopeStatement     ?? '',
      locations:          scope?.locations          ?? '',
      processes:          scope?.processes          ?? '',
      systems:            scope?.systems            ?? '',
      regulations:        scope?.regulations        ?? '',
      exclusions:         scope?.exclusions         ?? '',
      approvedBy:         scope?.approvedBy         ?? '',
      approvedAt:         scope?.approvedAt  ? scope.approvedAt.split('T')[0]  : '',
      reviewDate:         scope?.reviewDate  ? scope.reviewDate.split('T')[0]  : '',
    });
    setShowModal(true);
  };

  const openCreate = () => { setForm(EMPTY); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = { ...form };
    payload.approvedAt  = form.approvedAt  ? new Date(form.approvedAt).toISOString()  : null;
    payload.reviewDate  = form.reviewDate  ? new Date(form.reviewDate).toISOString()  : null;
    try {
      if (scope) await apiPut(`/scope/${scope.id}`, payload);
      else        await apiPost('/scope', payload);
      setShowModal(false);
      load();
    } catch (e) { console.error(e); }
  };

  const handleExport = () => {
    if (!scope) return;
    exportToPDF('ISMS Scope Document', `Version ${scope.version ?? '1.0'} — ISO 27001:2022`, [scope], [
      { key: 'companyDescription', label: 'Company Description' },
      { key: 'internalIssues',     label: 'Internal Issues (4.1)' },
      { key: 'externalIssues',     label: 'External Issues (4.1)' },
      { key: 'interestedParty',    label: 'Interested Parties (4.2)' },
      { key: 'requirements',       label: 'Their Requirements (4.2)' },
      { key: 'scopeStatement',     label: 'Scope Statement (4.3)' },
      { key: 'locations',          label: 'Locations in Scope' },
      { key: 'processes',          label: 'Processes in Scope' },
      { key: 'systems',            label: 'Systems in Scope' },
      { key: 'regulations',        label: 'Applicable Regulations' },
      { key: 'exclusions',         label: 'Exclusions' },
      { key: 'approvedBy',         label: 'Approved By' },
    ]);
  };

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const fmt = (d?: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

  const isOverdue = scope?.reviewDate && new Date(scope.reviewDate) < new Date();

  return (
    <AccessGuard page="scope">
    <div className="animate-fade-in">
      <Breadcrumbs items={[{ label: 'Context & ISMS Scope' }]} />
      <PageHeader
        title="Context & ISMS Scope"
        subtitle="ISO 27001:2022 Clause 4.1–4.3 — Organization Context, Interested Parties & Scope"
        icon={<Globe className="w-4 h-4" />}
        action={
          scope ? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleExport}>
                <FileText className="w-3.5 h-3.5" /> Export PDF
              </Button>
              <Button onClick={openEdit}>
                <Edit2 className="w-3.5 h-3.5" /> Edit Document
              </Button>
            </div>
          ) : (
            <Button onClick={openCreate}>
              <Plus className="w-3.5 h-3.5" /> Define Scope
            </Button>
          )
        }
      />

      {loading ? (
        <div className="text-center py-16 text-text-muted text-sm">Loading...</div>
      ) : !scope ? (
        <EmptyState
          title="ISMS Scope not yet defined"
          description="Document your organization's context, interested parties, scope boundaries, systems/processes included, and exclusions — as required by ISO 27001:2022 Clauses 4.1 to 4.3."
          icon={<Globe className="w-7 h-7 text-primary/40" />}
          action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Define Scope</Button>}
        />
      ) : (
        <>
          {/* ── Document header card ── */}
          <div className="card mb-5 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-primary via-accent to-success w-full" />
            <div className="p-5">
              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/8 px-2.5 py-1 rounded-full border border-primary/20">
                  ISO 27001:2022
                </span>
                <span className="text-xs bg-bg border border-border text-text-muted px-2.5 py-1 rounded-full font-medium">
                  v{scope.version ?? '1.0'}
                </span>
                {scope.approvedBy ? (
                  <span className="text-xs text-success bg-success/10 px-2.5 py-1 rounded-full border border-success/20 flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" /> Approved
                  </span>
                ) : (
                  <span className="text-xs text-warning bg-warning/10 px-2.5 py-1 rounded-full border border-warning/20 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> Draft
                  </span>
                )}
                {isOverdue && (
                  <span className="text-xs text-danger bg-danger/10 px-2.5 py-1 rounded-full border border-danger/20 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5" /> Review Overdue
                  </span>
                )}
              </div>

              <h2 className="text-base font-bold text-text-primary">ISMS Scope Document</h2>
              <p className="text-xs text-text-muted mt-1">
                Organization context, interested parties, and scope of the Information Security Management System
              </p>

              {(scope.approvedBy || scope.approvedAt || scope.reviewDate || scope.updatedAt) && (
                <div className="flex flex-wrap gap-5 mt-4 pt-4 border-t border-border/40">
                  {scope.approvedBy  && <MetaItem icon={Users}    label="Approved By"   value={scope.approvedBy} />}
                  {scope.approvedAt  && <MetaItem icon={Calendar} label="Approved Date" value={fmt(scope.approvedAt)!} />}
                  {scope.reviewDate  && <MetaItem icon={Clock}    label="Review Due"    value={fmt(scope.reviewDate)!} danger={!!isOverdue} />}
                  {scope.updatedAt   && <MetaItem icon={Shield}   label="Last Updated"  value={fmt(scope.updatedAt)!} />}
                </div>
              )}
            </div>
          </div>

          {/* ── Tab navigation ── */}
          <div className="flex gap-1 bg-surface border border-border/60 rounded-xl p-1 mb-5">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-text-muted hover:text-text-secondary hover:bg-bg'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.id}</span>
                </button>
              );
            })}
          </div>

          {/* ── Tab content ── */}
          <div className="card p-6">

            {/* 4.1 Organization Context */}
            {activeTab === '4.1' && (
              <div className="space-y-5">
                <SectionHeader
                  icon={Building2}
                  clause="Clause 4.1"
                  title="Understanding the Organization and Its Context"
                  description="Identify internal and external issues relevant to the ISMS purpose and direction"
                />
                <div className="h-px bg-border/30" />
                <DocField icon={FileText} label="Company / Organization Description" value={scope.companyDescription} accent="blue" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <DocField icon={Building2} label="Internal Issues" value={scope.internalIssues} accent="indigo" />
                  <DocField icon={Globe}     label="External Issues" value={scope.externalIssues} accent="violet" />
                </div>
              </div>
            )}

            {/* 4.2 Interested Parties */}
            {activeTab === '4.2' && (
              <div className="space-y-5">
                <SectionHeader
                  icon={Users}
                  clause="Clause 4.2"
                  title="Needs and Expectations of Interested Parties"
                  description="Determine relevant parties and their requirements that affect the ISMS"
                />
                <div className="h-px bg-border/30" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <DocField icon={Users}    label="Interested Parties" value={scope.interestedParty} accent="blue" />
                  <DocField icon={FileText} label="Their Needs & Requirements" value={scope.requirements} accent="emerald" />
                </div>
              </div>
            )}

            {/* 4.3 Scope */}
            {activeTab === '4.3' && (
              <div className="space-y-5">
                <SectionHeader
                  icon={Globe}
                  clause="Clause 4.3"
                  title="Determining the Scope of the ISMS"
                  description="Define the boundaries and applicability of the information security management system"
                />
                <div className="h-px bg-border/30" />

                {/* Scope statement — full width, prominent */}
                <DocField icon={Shield} label="Scope Statement" value={scope.scopeStatement} accent="blue" />

                {/* 2x2 grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <DocField icon={MapPin} label="Locations / Sites in Scope"        value={scope.locations}   accent="indigo" />
                  <DocField icon={Layers} label="Business Processes in Scope"        value={scope.processes}   accent="violet" />
                  <DocField icon={Cpu}    label="IT Systems & Services in Scope"     value={scope.systems}     accent="blue" />
                  <DocField icon={Scale}  label="Applicable Regulations & Standards" value={scope.regulations} accent="emerald" />
                </div>

                {/* Exclusions — warning-tinted */}
                <DocField icon={AlertCircle} label="Exclusions & Justification" value={scope.exclusions} accent="amber" />
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Edit / Create Modal ── */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={scope ? 'Edit ISMS Scope Document' : 'Define ISMS Scope'} size="lg">
        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* Document metadata */}
          <div className="grid grid-cols-3 gap-3">
            <Input label="Version"       placeholder="1.0"             value={form.version}    onChange={f('version')} />
            <Input label="Approved By"   placeholder="e.g. CISO, CEO"  value={form.approvedBy} onChange={f('approvedBy')} />
            <Input label="Approval Date" type="date"                    value={form.approvedAt} onChange={f('approvedAt')} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Next Review Date" type="date" value={form.reviewDate} onChange={f('reviewDate')} />
          </div>

          {/* Clause 4.1 */}
          <ModalSection clause="Clause 4.1" title="Organization Context" />
          <TextArea label="Company Description" rows={2}
            placeholder="Overview of the organization — industry, size, structure, services provided"
            value={form.companyDescription} onChange={f('companyDescription')} />
          <div className="grid grid-cols-2 gap-3">
            <TextArea label="Internal Issues" rows={3}
              placeholder="Organizational culture, governance, resources, IT infrastructure, existing contracts"
              value={form.internalIssues} onChange={f('internalIssues')} />
            <TextArea label="External Issues" rows={3}
              placeholder="Legal, regulatory, political, economic, social, environmental, competitive factors"
              value={form.externalIssues} onChange={f('externalIssues')} />
          </div>

          {/* Clause 4.2 */}
          <ModalSection clause="Clause 4.2" title="Interested Parties" />
          <div className="grid grid-cols-2 gap-3">
            <TextArea label="Interested Parties" rows={3}
              placeholder="One per line:&#10;Customers&#10;Regulators&#10;Employees&#10;Shareholders&#10;Suppliers"
              value={form.interestedParty} onChange={f('interestedParty')} />
            <TextArea label="Their Needs & Requirements" rows={3}
              placeholder="Corresponding requirements per party:&#10;Data privacy, GDPR compliance&#10;Audit access, reporting&#10;Access controls, training"
              value={form.requirements} onChange={f('requirements')} />
          </div>

          {/* Clause 4.3 */}
          <ModalSection clause="Clause 4.3" title="Scope Definition" />
          <TextArea label="Scope Statement" rows={3}
            placeholder="The ISMS applies to all information assets, processes, and systems used in the delivery of..."
            value={form.scopeStatement} onChange={f('scopeStatement')} />
          <div className="grid grid-cols-2 gap-3">
            <TextArea label="Locations / Sites in Scope" rows={2}
              placeholder="HQ – Frankfurt&#10;Data Centre – AWS eu-central-1&#10;Remote offices"
              value={form.locations} onChange={f('locations')} />
            <TextArea label="Business Processes in Scope" rows={2}
              placeholder="Software development&#10;IT operations&#10;HR onboarding&#10;Customer support"
              value={form.processes} onChange={f('processes')} />
            <TextArea label="IT Systems & Services in Scope" rows={2}
              placeholder="SAP ERP&#10;Microsoft 365&#10;AWS infrastructure&#10;Customer Portal"
              value={form.systems} onChange={f('systems')} />
            <TextArea label="Applicable Regulations & Standards" rows={2}
              placeholder="ISO 27001:2022&#10;GDPR (EU 2016/679)&#10;NIS2 Directive&#10;BSI IT-Grundschutz"
              value={form.regulations} onChange={f('regulations')} />
          </div>
          <TextArea label="Exclusions & Justification" rows={2}
            placeholder="Any systems or locations excluded and the reason — e.g. Subsidiary X not included due to separate ISMS certification"
            value={form.exclusions} onChange={f('exclusions')} />

          <div className="flex gap-2 pt-2">
            <Button type="submit">{scope ? 'Update Document' : 'Save Scope'}</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
    </AccessGuard>
  );
}
