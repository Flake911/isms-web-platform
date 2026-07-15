'use client';
import React from 'react';
import { PageHeader, StatsCard, Button } from '@/components/ui';
import { Lock, Tag, FileText, Info } from 'lucide-react';
import AccessGuard from '@/components/AccessGuard';
const levels = [
  { level:'Public', border:'border-l-success', icon:'text-success', bg:'bg-success-light', desc:'No restrictions. Free to share.', examples:'Marketing materials, press releases, public docs', handling:'No special handling' },
  { level:'Internal', border:'border-l-primary', icon:'text-primary', bg:'bg-info-light', desc:'For internal use only.', examples:'Internal memos, org charts, procedures', handling:'No external sharing without approval' },
  { level:'Confidential', border:'border-l-warning', icon:'text-warning', bg:'bg-warning-light', desc:'Sensitive. Unauthorized disclosure could cause damage.', examples:'Financial reports, contracts, employee records', handling:'Encrypted storage, need-to-know, NDA required' },
  { level:'Restricted', border:'border-l-danger', icon:'text-danger', bg:'bg-danger-light', desc:'Highest sensitivity. Severe damage if disclosed.', examples:'Encryption keys, passwords, security audit reports', handling:'Strong encryption, strict access control, audit logging' },
];
export default function ClassificationPage() {
  return (
    <AccessGuard page="classification">
    <div className="animate-fade-in">
      <PageHeader title="Information Classification" subtitle="A.5.12–A.5.13 — Classification & Labeling" icon={<Lock className="w-4 h-4" />} action={<Button variant="secondary"><FileText className="w-3.5 h-3.5" /> Export Scheme</Button>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger">
        <StatsCard title="Levels Defined" value={4} icon={<Lock className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
        <StatsCard title="Labeled Assets" value={0} icon={<Tag className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
        <StatsCard title="Pending" value={0} icon={<Info className="w-4 h-4 text-warning" />} iconBg="bg-warning-light" />
        <StatsCard title="Handling Rules" value={4} icon={<FileText className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
      </div>
      <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-3">Classification Scheme</p>
      <div className="space-y-3 stagger">
        {levels.map(l => (
          <div key={l.level} className={`card p-5 border-l-4 ${l.border}`}>
            <div className="flex items-start gap-4">
              <div className={`w-9 h-9 rounded-lg ${l.bg} flex items-center justify-center flex-shrink-0`}><Lock className={`w-4 h-4 ${l.icon}`} /></div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-text-primary mb-1">{l.level}</h3>
                <p className="text-sm text-text-secondary mb-3">{l.desc}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div><p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-1">Examples</p><p className="text-sm text-text-muted">{l.examples}</p></div>
                  <div><p className="text-[10px] text-text-muted font-medium uppercase tracking-wider mb-1">Handling Requirements</p><p className="text-sm text-text-muted">{l.handling}</p></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </AccessGuard>
  );
}
