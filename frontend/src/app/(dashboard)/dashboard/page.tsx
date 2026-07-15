'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader, StatsCard, Breadcrumbs } from '@/components/ui';
import {
  ShieldAlert, Shield, AlertCircle, ClipboardCheck, FileText, GraduationCap,
  Repeat, CheckSquare, ArrowRight, AlertTriangle, Bug, Truck, Target,
  Clock, Activity, Zap, TrendingUp, LayoutDashboard,
} from 'lucide-react';
import Link from 'next/link';
import { RiskTrendChart, ControlStatusChart, IncidentTrendChart, ComplianceGauge, RiskHeatmap } from '@/components/charts';
import { apiGet } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const MODULE_COLORS: Record<string, string> = {
  risks: 'bg-warning-light text-warning',
  controls: 'bg-info-light text-primary',
  incidents: 'bg-danger-light text-danger',
  policies: 'bg-info-light text-primary',
  assets: 'bg-caution-light text-caution',
  vulnerabilities: 'bg-danger-light text-danger',
  threats: 'bg-warning-light text-warning',
  audits: 'bg-info-light text-primary',
  capa: 'bg-danger-light text-danger',
  vendors: 'bg-success-light text-success',
  soa: 'bg-info-light text-primary',
  objectives: 'bg-success-light text-success',
};

interface ActivityItem {
  action: string;
  module: string;
  recordName: string | null;
  userEmail: string | null;
  createdAt: string;
}

interface DashboardStats {
  risks: { total: number; open: number };
  controls: { total: number; implemented: number; breakdown: Record<string, number> };
  incidents: { total: number; open: number };
  assets: number;
  policies: { total: number; active: number; overdue: number };
  training: { total: number; completed: number; rate: number };
  audits: number;
  vendors: number;
  compliance: { total: number; met: number; score: number };
  objectives: number;
  leadership: number;
  changes: number;
  capas: { total: number; open: number; overdue: number };
  heatmap: number[][];
  threats: { total: number; active: number };
  vulnerabilities: { total: number; open: number; overdue: number };
  soa: { total: number; applicable: number };
  scope: number;
  recentActivity: ActivityItem[];
}

const quickLinks = [
  { name: 'Register a Risk', path: '/risks', icon: ShieldAlert },
  { name: 'Add an Asset', path: '/assets', icon: Shield },
  { name: 'Create Policy', path: '/policies', icon: FileText },
  { name: 'Report Incident', path: '/incidents', icon: AlertCircle },
  { name: 'Schedule Audit', path: '/audits', icon: ClipboardCheck },
  { name: 'Manage Controls', path: '/controls', icon: Shield },
  { name: 'Log Vulnerability', path: '/vulnerabilities', icon: Bug },
  { name: 'View Threats', path: '/threats', icon: AlertTriangle },
  { name: 'Manage Vendors', path: '/vendors', icon: Truck },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiGet<DashboardStats>('/dashboard/stats');
      setStats(data);
    } catch (e) {
      console.error('Failed to fetch dashboard stats:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const totalOverdue = stats
    ? (stats.capas.overdue + stats.vulnerabilities.overdue + stats.policies.overdue + stats.vulnerabilities.open + stats.risks.open)
    : 0;

  return (
    <AccessGuard page="dashboard">
    <div className="animate-fade-in">
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />
      <PageHeader title="Dashboard" subtitle="ISO 27001:2022 — ISMS Overview" icon={<LayoutDashboard className="w-4 h-4" />} />

      {loading ? (
        <div className="text-center py-16 text-text-muted text-sm">Loading dashboard...</div>
      ) : (
        <>
          {/* ── Row 1: Core security metrics ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3 stagger">
            <StatsCard title="Open Risks" value={stats?.risks.open ?? 0} icon={<ShieldAlert className="w-4 h-4 text-warning" />} iconBg="bg-warning-light" />
            <StatsCard title="Controls" value={`${stats?.controls.implemented ?? 0} / ${stats?.controls.total ?? 0}`} icon={<Shield className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
            <StatsCard title="Open Incidents" value={stats?.incidents.open ?? 0} icon={<AlertCircle className="w-4 h-4 text-danger" />} iconBg="bg-danger-light" />
            <StatsCard title="Compliance Score" value={`${stats?.compliance.score ?? 0}%`} icon={<Activity className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
          </div>

          {/* ── Row 2: Operations ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3 stagger">
            <StatsCard title="Open CAPAs" value={stats?.capas.open ?? 0} icon={<Repeat className="w-4 h-4 text-danger" />} iconBg="bg-danger-light" />
            <StatsCard title="Training Rate" value={`${stats?.training.rate ?? 0}%`} icon={<GraduationCap className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
            <StatsCard title="Active Policies" value={stats?.policies.active ?? 0} icon={<FileText className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
            <StatsCard title="Total Assets" value={stats?.assets ?? 0} icon={<CheckSquare className="w-4 h-4 text-caution" />} iconBg="bg-caution-light" />
          </div>

          {/* ── Row 3: Threats, Vulns, Vendors, SoA ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger">
            <StatsCard title="Active Threats" value={stats?.threats.active ?? 0} icon={<Zap className="w-4 h-4 text-warning" />} iconBg="bg-warning-light" />
            <StatsCard title="Open Vulnerabilities" value={stats?.vulnerabilities.open ?? 0} icon={<Bug className="w-4 h-4 text-danger" />} iconBg="bg-danger-light" />
            <StatsCard title="Vendors" value={stats?.vendors ?? 0} icon={<Truck className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
            <StatsCard
              title="SoA Coverage"
              value={stats?.soa.total ? `${Math.round((stats.soa.applicable / stats.soa.total) * 100)}%` : '—'}
              icon={<Target className="w-4 h-4 text-success" />}
              iconBg="bg-success-light"
            />
          </div>

          {/* ── Charts ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
            <div className="lg:col-span-2 card p-5">
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Risk Trend</h3>
              <RiskTrendChart />
            </div>
            <div className="card p-5">
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Compliance</h3>
              <ComplianceGauge score={stats?.compliance.score ?? 0} />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-6">
            <div className="card p-5">
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Risk Heatmap</h3>
              <RiskHeatmap data={stats?.heatmap} />
            </div>
            <div className="card p-5">
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Control Status</h3>
              <ControlStatusChart breakdown={stats?.controls.breakdown} />
            </div>
            <div className="card p-5">
              <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Incidents</h3>
              <IncidentTrendChart />
            </div>
          </div>
        </>
      )}

      {/* ═══ OVERDUE ALERTS ═══ */}
      {stats && totalOverdue > 0 && (
        <div className="mb-6">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Overdue Alerts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stats.risks.open > 0 && (
              <Link href="/risks" className="group flex items-center gap-3 p-4 rounded-2xl border border-warning/30 bg-warning/5 hover:border-warning/50 hover:bg-warning/8 transition-all">
                <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-bold text-warning">{stats.risks.open} Open Risk{stats.risks.open > 1 ? 's' : ''}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">Unresolved risks require attention</p>
                </div>
              </Link>
            )}
            {stats.capas.overdue > 0 && (
              <Link href="/capa" className="group flex items-center gap-3 p-4 rounded-2xl border border-danger/30 bg-danger/5 hover:border-danger/50 hover:bg-danger/8 transition-all">
                <div className="w-10 h-10 rounded-xl bg-danger/15 flex items-center justify-center flex-shrink-0">
                  <Repeat className="w-4 h-4 text-danger" />
                </div>
                <div>
                  <p className="text-sm font-bold text-danger">{stats.capas.overdue} Overdue CAPA{stats.capas.overdue > 1 ? 's' : ''}</p>
                  <p className="text-[11px] text-text-muted mt-0.5">Past due date — action required</p>
                </div>
              </Link>
            )}
            {stats.vulnerabilities.open > 0 && (
              <Link href="/vulnerabilities" className="group flex items-center gap-3 p-4 rounded-2xl border border-danger/30 bg-danger/5 hover:border-danger/50 hover:bg-danger/8 transition-all">
                <div className="w-10 h-10 rounded-xl bg-danger/15 flex items-center justify-center flex-shrink-0">
                  <Bug className="w-4 h-4 text-danger" />
                </div>
                <div>
                  <p className="text-sm font-bold text-danger">
                    {stats.vulnerabilities.open} Open Vulnerabilit{stats.vulnerabilities.open > 1 ? 'ies' : 'y'}
                    {stats.vulnerabilities.overdue > 0 && ` · ${stats.vulnerabilities.overdue} Past Due`}
                  </p>
                  <p className="text-[11px] text-text-muted mt-0.5">Unresolved vulnerabilities require attention</p>
                </div>
              </Link>
            )}
            {stats.policies.overdue > 0 && (
              <Link href="/policies" className="group flex items-center gap-3 p-4 rounded-2xl border border-warning/30 bg-warning/5 hover:border-warning/50 hover:bg-warning/8 transition-all">
                <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-bold text-warning">{stats.policies.overdue} {stats.policies.overdue > 1 ? 'Policies' : 'Policy'} Need Review</p>
                  <p className="text-[11px] text-text-muted mt-0.5">Past scheduled review date</p>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ═══ RECENT ACTIVITY ═══ */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="card p-5 mb-6">
          <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-4">Recent Activity</h3>
          <div className="divide-y divide-border/30">
            {stats.recentActivity.map((item, i) => {
              const color = MODULE_COLORS[item.module] ?? 'bg-border/50 text-text-muted';
              return (
                <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[10px] font-bold uppercase ${color}`}>
                    {item.module.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-primary truncate">
                      <span className="font-semibold capitalize">{item.module}</span>
                      {' '}<span className="text-text-muted">{item.action.toLowerCase()}d</span>
                      {item.recordName && <span className="font-semibold"> — {item.recordName}</span>}
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {item.userEmail ?? 'System'} · {timeAgo(item.createdAt)}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border flex-shrink-0 ${
                    item.action === 'CREATE' ? 'border-success/30 text-success bg-success/8' :
                    item.action === 'DELETE' ? 'border-danger/30 text-danger bg-danger/8' :
                    'border-border text-text-muted bg-bg/50'
                  }`}>
                    {item.action}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ CERTIFICATION READINESS ═══ */}
      {stats && (() => {
        const certScore = Math.round(
          ((stats.controls.implemented / Math.max(stats.controls.total, 1)) * 30) +
          ((stats.compliance.score / 100) * 25) +
          ((stats.policies.active > 0 ? 1 : 0) * 15) +
          ((stats.training.rate / 100) * 15) +
          ((stats.audits > 0 ? 1 : 0) * 15)
        );
        return (
          <div className="card p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Certification Readiness</h3>
                <p className="text-[11px] text-text-muted mt-0.5">ISO 27001:2022 overall score</p>
              </div>
              <span className={`text-3xl font-bold ${certScore >= 80 ? 'text-success' : certScore >= 50 ? 'text-warning' : 'text-danger'}`}>
                {certScore}%
              </span>
            </div>
            <div className="w-full h-2 bg-bg rounded-full overflow-hidden mb-4">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-all duration-700" style={{ width: `${certScore}%` }} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { label: 'Controls', val: `${stats.controls.implemented}/${stats.controls.total}`, pct: Math.round((stats.controls.implemented / Math.max(stats.controls.total, 1)) * 100) },
                { label: 'Compliance', val: `${stats.compliance.score}%`, pct: stats.compliance.score },
                { label: 'Policies', val: `${stats.policies.active} active`, pct: stats.policies.active > 0 ? 100 : 0 },
                { label: 'Training', val: `${stats.training.rate}%`, pct: stats.training.rate },
                { label: 'Audits', val: `${stats.audits} done`, pct: stats.audits > 0 ? 100 : 0 },
              ].map(i => (
                <div key={i.label} className="text-center bg-bg/50 rounded-xl px-2 py-3">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">{i.label}</p>
                  <p className="text-sm font-bold text-text-primary">{i.val}</p>
                  <div className="w-full h-1 bg-border/40 rounded-full mt-2">
                    <div className={`h-full rounded-full transition-all duration-500 ${i.pct >= 80 ? 'bg-success' : i.pct >= 50 ? 'bg-warning' : 'bg-danger'}`} style={{ width: `${i.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* ═══ SETUP CHECKLIST ═══ */}
      {stats && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Setup Checklist</h3>
            <span className="text-[10px] font-semibold text-text-muted bg-surface-light px-2 py-1 rounded-lg">
              {[stats.scope > 0, stats.controls.total > 0, stats.risks.total > 0, stats.policies.total > 0, stats.assets > 0, stats.compliance.total > 0, stats.training.total > 0, stats.audits > 0, stats.soa.total > 0, stats.objectives > 0].filter(Boolean).length} / 10 complete
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: 'Define ISMS Scope', done: stats.scope > 0, link: '/scope' },
              { label: 'Import Annex A Controls', done: stats.controls.total > 0, link: '/controls' },
              { label: 'Register Risks', done: stats.risks.total > 0, link: '/risks' },
              { label: 'Create Policies', done: stats.policies.total > 0, link: '/policies' },
              { label: 'Add Assets', done: stats.assets > 0, link: '/assets' },
              { label: 'Assign Compliance Domains', done: stats.compliance.total > 0, link: '/compliance' },
              { label: 'Set Up Training', done: stats.training.total > 0, link: '/training' },
              { label: 'Schedule an Audit', done: stats.audits > 0, link: '/audits' },
              { label: 'Complete Statement of Applicability', done: stats.soa.total > 0, link: '/soa' },
              { label: 'Define Security Objectives', done: stats.objectives > 0, link: '/objectives' },
            ].map(item => (
              <Link key={item.label} href={item.link}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                  item.done ? 'border-success/20 bg-success/5' : 'border-border hover:border-primary/30 hover:bg-primary/5'
                }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-success text-white' : 'border-2 border-border'}`}>
                  {item.done && <TrendingUp className="w-3 h-3" />}
                </div>
                <span className={`text-xs font-medium ${item.done ? 'text-text-muted line-through' : 'text-text-secondary'}`}>
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══ QUICK ACTIONS ═══ */}
      <h3 className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-3">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
        {quickLinks.map(link => {
          const Icon = link.icon;
          return (
            <Link key={link.path} href={link.path} className="card card-interactive p-4 flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors flex-1">
                {link.name}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
    </AccessGuard>
  );
}
