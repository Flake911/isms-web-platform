'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';
import { canAccess } from '@/components/AccessGuard';
import {
  LayoutDashboard, ShieldAlert, FolderLock, Shield, FileCheck, Target,
  FileText, AlertCircle, ClipboardCheck, Repeat, Truck, GraduationCap,
  Zap, BookOpen, Globe, Scale, Repeat2, Activity, Building2, MessageSquare,
  TrendingUp, AlertTriangle, Lock, Users, BarChart3, Settings, FileArchive,
  ChevronLeft, ChevronRight, ShieldCheck, Bug, Gauge, CalendarDays
} from 'lucide-react';

const nav = [
  { section: 'Overview', items: [
    { name: 'Dashboard',     path: '/dashboard', slug: 'dashboard', icon: LayoutDashboard },
    { name: 'Metrics & KPIs', path: '/metrics',  slug: 'metrics',   icon: Gauge },
    { name: 'ISMS Calendar', path: '/calendar',  slug: 'calendar',  icon: CalendarDays },
  ]},
  { section: 'Core ISMS', items: [
    { name: 'Context & Scope', path: '/scope', slug: 'scope', icon: Globe },
    { name: 'Leadership', path: '/leadership', slug: 'leadership', icon: Building2 },
    { name: 'Risk Management', path: '/risks', slug: 'risks', icon: ShieldAlert },
    { name: 'Controls', path: '/controls', slug: 'controls', icon: Shield },
    { name: 'SoA', path: '/soa', slug: 'soa', icon: FileCheck },
    { name: 'Objectives', path: '/objectives', slug: 'objectives', icon: Target },
  ]},
  { section: 'Assets & Compliance', items: [
    { name: 'Assets', path: '/assets', slug: 'assets', icon: FolderLock },
    { name: 'Vulnerabilities', path: '/vulnerabilities', slug: 'vulnerabilities', icon: Bug },
    { name: 'Classification', path: '/classification', slug: 'classification', icon: Lock },
    { name: 'Compliance', path: '/compliance', slug: 'compliance', icon: Activity },
    { name: 'Legal Register', path: '/legal', slug: 'legal', icon: Scale },
  ]},
  { section: 'Operations', items: [
    { name: 'Policies', path: '/policies', slug: 'policies', icon: FileText },
    { name: 'Incidents', path: '/incidents', slug: 'incidents', icon: AlertCircle },
    { name: 'Audits', path: '/audits', slug: 'audits', icon: ClipboardCheck },
    { name: 'CAPA', path: '/capa', slug: 'capa', icon: Repeat },
    { name: 'Changes', path: '/changes', slug: 'changes', icon: Repeat2 },
    { name: 'Evidence', path: '/evidence', slug: 'evidence', icon: FileArchive },
  ]},
  { section: 'Management', items: [
    { name: 'Vendors', path: '/vendors', slug: 'vendors', icon: Truck },
    { name: 'Training', path: '/training', slug: 'training', icon: GraduationCap },
    { name: 'Security Awareness', path: '/security-awareness', slug: 'security-awareness', icon: ShieldCheck },
    { name: 'BCP & DR', path: '/bcp', slug: 'bcp', icon: Zap },
    { name: 'Mgmt Review', path: '/management-review', slug: 'management-review', icon: BookOpen },
    { name: 'Communication', path: '/communication', slug: 'communication', icon: MessageSquare },
    { name: 'Improvement', path: '/improvement', slug: 'improvement', icon: TrendingUp },
    { name: 'Threats', path: '/threats', slug: 'threats', icon: AlertTriangle },
  ]},
  { section: 'System', items: [
    { name: 'Reports', path: '/reports', slug: 'reports', icon: BarChart3 },
    { name: 'Audit Trail', path: '/audit-trail', slug: 'audit-trail', icon: FileArchive },
    { name: 'Users & Access', path: '/users', slug: 'users', icon: Users },
    { name: 'Settings', path: '/settings', slug: 'settings', icon: Settings },
  ]},
];

export default function Sidebar() {
  const { collapsed, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuth();
  const userRole = user?.role || 'Employee';

  return (
    <aside className={`fixed top-0 left-0 h-screen z-40 flex flex-col bg-surface border-r border-border transition-all duration-200 ${collapsed ? 'w-[60px]' : 'w-[240px]'}`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-16 flex-shrink-0 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-text-primary tracking-tight animate-fade-in">
            Sentra<span className="text-primary">ISMS</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {nav.map(group => (
          <div key={group.section}>
            {!collapsed && (
              <p className="text-[10px] font-medium uppercase tracking-widest text-text-muted px-2 mb-1">
                {group.section}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon;
                const active = pathname === item.path;
                const allowed = canAccess(userRole, item.slug);
                return (
                  <Link key={item.path} href={item.path}
                    className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-all ${
                      !allowed
                        ? 'text-text-muted/40 cursor-not-allowed'
                        : active
                          ? 'bg-primary/10 text-primary-light'
                          : 'text-text-muted hover:text-text-secondary hover:bg-surface-light/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-primary-light' : !allowed ? 'text-text-muted/30' : ''}`} />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                    {!collapsed && !allowed && (
                      <Lock className="w-3 h-3 text-text-muted/30 flex-shrink-0" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Toggle */}
      <div className="flex-shrink-0 px-2 py-2 border-t border-border">
        <button onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-light/50 transition-all text-xs"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}
