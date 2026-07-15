'use client';
import React, { useState } from 'react';
import { PageHeader, Button, Breadcrumbs } from '@/components/ui';
import { BarChart3, Download, FileText, AlertTriangle, Shield, ClipboardCheck, Activity, Truck, GraduationCap, Repeat, CheckCircle, Loader2, Target, TrendingUp, Map, MessageSquare, Users, BookOpen, RefreshCw, ScrollText } from 'lucide-react';
import { apiGet } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { exportToPDF } from '@/lib/export';

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function toCSV(data: any[]): string {
  if (!data.length) return '';
  const keys = Object.keys(data[0]).filter(k => k !== 'updatedAt');
  const header = keys.join(',');
  const rows = data.map(row => keys.map(k => {
    const val = String(row[k] ?? '').replace(/"/g, '""');
    return `"${val}"`;
  }).join(',')).join('\n');
  return `${header}\n${rows}`;
}

const reports = [
  // Risk & Security
  { name:'Risk Register', desc:'All risks with scores, treatment plans, and owners', icon:AlertTriangle, endpoint:'/risks', formats:['CSV','PDF','JSON'] },
  { name:'Risk-Control Mapping', desc:'Risk-to-control associations and coverage gaps', icon:Shield, endpoint:'/risk-controls', formats:['CSV','PDF','JSON'] },
  { name:'Threat Intelligence', desc:'Active threats with severity, relevance, and linked controls', icon:AlertTriangle, endpoint:'/threats', formats:['CSV','PDF','JSON'] },
  { name:'Vulnerability Report', desc:'Identified vulnerabilities with severity, status, and remediation', icon:AlertTriangle, endpoint:'/vulnerabilities', formats:['CSV','PDF','JSON'] },
  { name:'Incident Report', desc:'Security incidents with severity and resolution status', icon:AlertTriangle, endpoint:'/incidents', formats:['CSV','PDF','JSON'] },
  // Controls & Compliance
  { name:'Controls (Annex A)', desc:'All 93 Annex A controls with implementation status', icon:Shield, endpoint:'/controls', formats:['CSV','PDF','JSON'] },
  { name:'Statement of Applicability', desc:'SoA entries with applicability decisions and justifications', icon:Shield, endpoint:'/soa', formats:['CSV','PDF','JSON'] },
  { name:'Compliance Status', desc:'Compliance domains with scores and gap analysis', icon:Activity, endpoint:'/compliance', formats:['CSV','PDF','JSON'] },
  { name:'Legal Register', desc:'Legal, regulatory, and contractual requirements', icon:ScrollText, endpoint:'/legal', formats:['CSV','PDF','JSON'] },
  // Audits & Reviews
  { name:'Audit Report', desc:'Audit findings, nonconformities, and corrective actions', icon:ClipboardCheck, endpoint:'/audits', formats:['CSV','PDF','JSON'] },
  { name:'System Audit Log', desc:'Full activity trace — who did what and when across the platform', icon:Activity, endpoint:'/audit-logs', formats:['CSV','PDF','JSON'] },
  { name:'Management Review', desc:'Management review records, decisions, and action items', icon:ClipboardCheck, endpoint:'/mgmt-review', formats:['CSV','PDF','JSON'] },
  { name:'CAPA Status', desc:'Corrective and preventive action tracking', icon:Repeat, endpoint:'/capa', formats:['CSV','PDF','JSON'] },
  { name:'Improvement Tracker', desc:'Continual improvement initiatives and their progress', icon:TrendingUp, endpoint:'/improvement', formats:['CSV','PDF','JSON'] },
  // Policies & Governance
  { name:'Policy Register', desc:'All security policies with version, status, owner, and review dates', icon:FileText, endpoint:'/policies', formats:['CSV','PDF','JSON'] },
  { name:'Security Objectives', desc:'ISMS objectives with KPIs, progress, and linked controls', icon:Target, endpoint:'/objectives', formats:['CSV','PDF','JSON'] },
  { name:'ISMS Scope', desc:'Defined scope boundaries, exclusions, and justifications', icon:Map, endpoint:'/scope', formats:['CSV','PDF','JSON'] },
  { name:'Leadership & Responsibilities', desc:'Leadership roles, responsibilities, and accountability assignments', icon:Users, endpoint:'/leadership', formats:['CSV','PDF','JSON'] },
  { name:'Communication Log', desc:'Internal and external communications register', icon:MessageSquare, endpoint:'/communication', formats:['CSV','PDF','JSON'] },
  // Assets & Operations
  { name:'Asset Inventory', desc:'Asset register with classification and CIA ratings', icon:FileText, endpoint:'/assets', formats:['CSV','PDF','JSON'] },
  { name:'Change Management', desc:'Change requests, impact assessments, approvals, and rollbacks', icon:RefreshCw, endpoint:'/changes', formats:['CSV','PDF','JSON'] },
  { name:'Evidence Register', desc:'Evidence records linked to controls and audits', icon:BookOpen, endpoint:'/evidence', formats:['CSV','PDF','JSON'] },
  { name:'BCP & DR Plans', desc:'Business continuity and disaster recovery plans', icon:Activity, endpoint:'/bcp', formats:['CSV','PDF','JSON'] },
  // People & Awareness
  { name:'Training Report', desc:'Employee training sessions, status, and completion', icon:GraduationCap, endpoint:'/training', formats:['CSV','PDF','JSON'] },
  { name:'Security Awareness', desc:'Awareness campaign records, topics covered, and participation', icon:GraduationCap, endpoint:'/awareness', formats:['CSV','PDF','JSON'] },
  // Vendors
  { name:'Vendor Risk Report', desc:'Third-party vendor assessments, risk levels, and contract status', icon:Truck, endpoint:'/vendors', formats:['CSV','PDF','JSON'] },
];

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<Set<string>>(new Set());

  const autoColumns = (data: any[]) => {
    if (!data.length) return [];
    const skip = new Set(['id', 'createdAt', 'updatedAt']);
    return Object.keys(data[0])
      .filter(k => !skip.has(k))
      .map(k => ({
        key: k,
        label: k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
      }));
  };

  const handleDownload = async (endpoint: string, name: string, format: string, desc: string) => {
    const key = `${name}-${format}`;
    setDownloading(key);
    try {
      const data = await apiGet(endpoint);
      const arr = Array.isArray(data) ? data : [data];
      if (arr.length === 0) {
        alert(`No data available for ${name}. Add records first.`);
        return;
      }
      const safeName = name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      const date = new Date().toISOString().split('T')[0];
      if (format === 'CSV') {
        downloadFile(toCSV(arr), `${safeName}_${date}.csv`, 'text/csv');
      } else if (format === 'PDF') {
        exportToPDF(name, desc, arr, autoColumns(arr));
      } else {
        downloadFile(JSON.stringify(arr, null, 2), `${safeName}_${date}.json`, 'application/json');
      }
      setDownloaded(prev => new Set(prev).add(key));
      setTimeout(() => setDownloaded(prev => { const next = new Set(prev); next.delete(key); return next; }), 3000);
    } catch (e) {
      console.error(e);
      alert(`Failed to download ${name}: ${e}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <AccessGuard page="reports">
    <div className="animate-fade-in">
      <Breadcrumbs items={[{ label: 'Reports & Exports' }]} />
      <PageHeader title="Reports & Exports" subtitle="ISO 27001 — Compliance reports for audits, reviews, and stakeholders" icon={<BarChart3 className="w-4 h-4" />} action={<div className="flex items-center gap-2 text-xs text-text-muted"><BarChart3 className="w-3.5 h-3.5" /> {reports.length} reports available</div>} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
        {reports.map(r => {
          const Icon = r.icon;
          return (
            <div key={r.name} className="card card-interactive p-4 group">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-info-light flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-all"><Icon className="w-4 h-4 text-primary" /></div>
                <div className="flex-1 min-w-0"><h3 className="text-sm font-medium text-text-primary group-hover:text-primary-light transition-colors">{r.name}</h3><p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{r.desc}</p></div>
              </div>
              <div className="flex items-center gap-2">
                {r.formats.map(f => {
                  const key = `${r.name}-${f}`;
                  const isDownloading = downloading === key;
                  const isDone = downloaded.has(key);
                  return (
                    <Button key={f} variant="secondary" className="text-[11px] px-2.5 py-1" onClick={() => handleDownload(r.endpoint, r.name, f, r.desc)} disabled={isDownloading}>
                      {isDownloading ? <Loader2 className="w-3 h-3 animate-spin" /> : isDone ? <CheckCircle className="w-3 h-3 text-success" /> : <Download className="w-3 h-3" />}
                      {' '}{f}
                    </Button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
    </AccessGuard>
  );
}
