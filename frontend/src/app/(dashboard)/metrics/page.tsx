'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader, Breadcrumbs } from '@/components/ui';
import {
  Shield, ShieldAlert, AlertCircle, GraduationCap, Repeat,
  FileCheck, Activity, Bug, FileText, AlertTriangle,
  BarChart3, Gauge,
} from 'lucide-react';
import { apiGet } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';

function pct(num: number, den: number) {
  return den === 0 ? 0 : Math.round((num / den) * 100);
}
function scoreColor(v: number) {
  return v >= 80 ? 'text-success' : v >= 60 ? 'text-warning' : 'text-danger';
}
function barColor(v: number) {
  return v >= 80 ? 'bg-success' : v >= 60 ? 'bg-warning' : 'bg-danger';
}
function iconBg(v: number) {
  return v >= 80 ? 'bg-success-light' : v >= 60 ? 'bg-warning-light' : 'bg-danger-light';
}
function iconText(v: number) {
  return v >= 80 ? 'text-success' : v >= 60 ? 'text-warning' : 'text-danger';
}

interface DashboardStats {
  risks: { total: number; open: number };
  controls: { total: number; implemented: number; breakdown: Record<string, number> };
  incidents: { total: number; open: number };
  policies: { total: number; active: number; overdue: number };
  training: { total: number; completed: number; rate: number };
  compliance: { total: number; met: number; score: number };
  capas: { total: number; open: number; overdue: number };
  threats: { total: number; active: number };
  vulnerabilities: { total: number; open: number; overdue: number };
  soa: { total: number; applicable: number };
  objectives: number;
  audits: number;
  vendors: number;
  assets: number;
}

function KpiCard({ title, clause, value, total, description, icon: Icon }: {
  title: string; clause: string; value: number; total: number;
  description: string; icon: React.ElementType;
}) {
  const v = total === 0 ? 0 : pct(value, total);
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider leading-tight">{title}</p>
          <p className="text-[10px] text-primary/60 mt-0.5 font-mono">{clause}</p>
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg(v)}`}>
          <Icon className={`w-4 h-4 ${iconText(v)}`} />
        </div>
      </div>
      <div className="flex items-end gap-2 mb-3">
        <span className={`text-3xl font-bold tracking-tight ${scoreColor(v)}`}>{v}%</span>
        {total > 0 && <span className="text-xs text-text-muted mb-1">{value} / {total}</span>}
      </div>
      <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor(v)}`}
          style={{ width: `${Math.min(v, 100)}%` }}
        />
      </div>
      <p className="text-[10px] text-text-muted leading-relaxed">{description}</p>
    </div>
  );
}

export default function MetricsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<DashboardStats>('/dashboard/stats')
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AccessGuard page="metrics">
    <div className="animate-fade-in">
      <Breadcrumbs items={[{ label: 'Metrics & KPIs' }]} />
      <PageHeader
        title="ISMS Metrics & KPIs"
        subtitle="Clause 9.1 — Monitoring, Measurement, Analysis and Evaluation"
        icon={<Gauge className="w-4 h-4" />}
        action={
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <BarChart3 className="w-3.5 h-3.5" />
            10 KPIs tracked
          </div>
        }
      />

      {loading && (
        <div className="text-center py-20 text-text-muted text-sm">Loading metrics...</div>
      )}

      {!loading && !stats && (
        <div className="text-center py-20 text-danger text-sm">Failed to load metrics data</div>
      )}

      {!loading && stats && (() => {
        const kpis = [
          {
            title: 'Control Implementation',
            clause: 'Clause 6.1 / Annex A',
            value: stats.controls.implemented,
            total: stats.controls.total,
            description: 'Annex A controls marked as Implemented vs. total applicable controls',
            icon: Shield,
          },
          {
            title: 'Risk Treatment Rate',
            clause: 'Clause 6.1.2',
            value: stats.risks.total - stats.risks.open,
            total: stats.risks.total,
            description: 'Risks with treated or accepted status vs. total registered risks',
            icon: ShieldAlert,
          },
          {
            title: 'Incident Resolution',
            clause: 'Clause 10.1',
            value: stats.incidents.total - stats.incidents.open,
            total: stats.incidents.total,
            description: 'Security incidents that have been resolved vs. total reported',
            icon: AlertCircle,
          },
          {
            title: 'Training Completion',
            clause: 'Clause 7.2',
            value: stats.training.completed,
            total: stats.training.total,
            description: 'Training sessions completed vs. total assigned to employees',
            icon: GraduationCap,
          },
          {
            title: 'SoA Coverage',
            clause: 'Clause 6.1.3',
            value: stats.soa.applicable,
            total: stats.soa.total,
            description: 'Controls declared applicable in the Statement of Applicability',
            icon: FileCheck,
          },
          {
            title: 'Compliance Score',
            clause: 'Clause 4.2',
            value: stats.compliance.met,
            total: stats.compliance.total,
            description: 'Compliance obligations fully met vs. total registered requirements',
            icon: Activity,
          },
          {
            title: 'CAPA Closure Rate',
            clause: 'Clause 10.1',
            value: stats.capas.total - stats.capas.open,
            total: stats.capas.total,
            description: 'Corrective and preventive actions closed vs. total raised',
            icon: Repeat,
          },
          {
            title: 'Policy Compliance',
            clause: 'Clause 5.2',
            value: stats.policies.active,
            total: stats.policies.total,
            description: 'Active (approved) policies vs. total in the policy register',
            icon: FileText,
          },
          {
            title: 'Vulnerability Remediation',
            clause: 'Annex A.8.8',
            value: stats.vulnerabilities.total - stats.vulnerabilities.open,
            total: stats.vulnerabilities.total,
            description: 'Vulnerabilities remediated or accepted vs. total identified',
            icon: Bug,
          },
          {
            title: 'Threat Mitigation',
            clause: 'Annex A.5.7',
            value: stats.threats.total - stats.threats.active,
            total: stats.threats.total,
            description: 'Threats mitigated or closed vs. total recorded threats',
            icon: AlertTriangle,
          },
        ];

        // Weighted ISMS health score
        const weights: [number, number][] = [
          [pct(stats.controls.implemented, stats.controls.total), 25],
          [stats.compliance.score, 20],
          [stats.risks.total ? pct(stats.risks.total - stats.risks.open, stats.risks.total) : 0, 20],
          [stats.training.rate, 15],
          [stats.capas.total ? pct(stats.capas.total - stats.capas.open, stats.capas.total) : 100, 10],
          [stats.incidents.total ? pct(stats.incidents.total - stats.incidents.open, stats.incidents.total) : 100, 10],
        ];
        const totalWeight = weights.reduce((s, [, w]) => s + w, 0);
        const healthScore = Math.round(weights.reduce((s, [v, w]) => s + v * w, 0) / totalWeight);

        return (
          <>
            {/* ── ISMS Health Score ── */}
            <div className="card p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex-1">
                  <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-0.5">ISMS Health Score</p>
                  <p className="text-[10px] text-text-muted mb-4">Weighted composite of Clause 9.1 KPIs</p>
                  <div className="flex items-end gap-3 mb-4">
                    <span className={`text-5xl font-bold tracking-tight ${scoreColor(healthScore)}`}>{healthScore}%</span>
                    <div className="mb-1">
                      <p className={`text-sm font-semibold ${scoreColor(healthScore)}`}>
                        {healthScore >= 80 ? 'Good Standing' : healthScore >= 60 ? 'Needs Attention' : 'Critical — Action Required'}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {healthScore >= 80 ? 'ISMS is operating effectively' : healthScore >= 60 ? 'Some areas require improvement' : 'Immediate remediation needed'}
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${barColor(healthScore)}`}
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-[10px] text-text-muted">
                    <span>Controls 25%</span>
                    <span>Compliance 20%</span>
                    <span>Risks 20%</span>
                    <span>Training 15%</span>
                    <span>CAPA 10%</span>
                    <span>Incidents 10%</span>
                  </div>
                </div>

                {/* Overdue alerts panel */}
                <div className="sm:w-60 space-y-2">
                  <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">Overdue Items</p>
                  {[
                    { label: 'CAPA Overdue', count: stats.capas.overdue },
                    { label: 'Vulns Past Due', count: stats.vulnerabilities.overdue },
                    { label: 'Policy Reviews Due', count: stats.policies.overdue },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between px-3 py-2 rounded-lg bg-bg/50 border border-border/40">
                      <span className="text-xs text-text-secondary">{item.label}</span>
                      <span className={`text-sm font-bold ${item.count > 0 ? 'text-danger' : 'text-text-muted'}`}>{item.count}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-bg/50 border border-border/40">
                    <span className="text-xs text-text-secondary">Total Assets</span>
                    <span className="text-sm font-bold text-text-primary">{stats.assets}</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-bg/50 border border-border/40">
                    <span className="text-xs text-text-secondary">Active Vendors</span>
                    <span className="text-sm font-bold text-text-primary">{stats.vendors}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── KPI Grid ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mb-6 stagger">
              {kpis.map(kpi => (
                <KpiCard key={kpi.title} {...kpi} />
              ))}
            </div>

            {/* ── Controls Breakdown ── */}
            {stats.controls.breakdown && Object.keys(stats.controls.breakdown).length > 0 && (
              <div className="card p-5 mb-6">
                <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-4">Annex A Controls by Status</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(stats.controls.breakdown).map(([status, count]) => {
                    const v = pct(count, stats.controls.total);
                    return (
                      <div key={status} className="text-center bg-bg/50 rounded-xl border border-border/40 px-3 py-4">
                        <p className="text-2xl font-bold text-text-primary mb-1">{count}</p>
                        <p className="text-[10px] text-text-muted mb-2">{status}</p>
                        <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barColor(v)}`} style={{ width: `${v}%` }} />
                        </div>
                        <p className="text-[10px] text-text-muted mt-1">{v}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Measurement methodology note ── */}
            <div className="card p-4 border-border/50 bg-bg/30">
              <div className="flex items-start gap-3">
                <Gauge className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-text-secondary mb-1">ISO 27001:2022 Clause 9.1 — Measurement Basis</p>
                  <p className="text-[10px] text-text-muted leading-relaxed">
                    All KPIs are calculated in real-time from live ISMS data. The ISMS Health Score is a weighted composite:
                    Controls (25%) · Compliance (20%) · Risk Treatment (20%) · Training (15%) · CAPA Closure (10%) · Incident Resolution (10%).
                    Review these metrics at defined intervals per your measurement plan and document results as inputs to management review (Clause 9.3).
                  </p>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
    </AccessGuard>
  );
}
