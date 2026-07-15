'use client';
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, ShieldOff, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Permissions map: role → set of allowed page slugs
// A role can access a page if it appears in its set
const PERMISSIONS: Record<string, Set<string>> = {
  'Employee': new Set([
    'dashboard', 'security-awareness', 'training', 'policies', 'incidents',
    'calendar',
  ]),
  'Security Officer': new Set([
    'dashboard', 'security-awareness', 'training', 'policies', 'incidents',
    'risks', 'controls', 'assets', 'classification', 'threats', 'vulnerabilities',
    'calendar',
  ]),
  'Auditor': new Set([
    'dashboard', 'security-awareness', 'training', 'policies', 'incidents',
    'risks', 'controls', 'assets', 'classification', 'threats', 'vulnerabilities',
    'audits', 'evidence', 'soa', 'scope', 'leadership', 'objectives',
    'compliance', 'legal',
    'calendar', 'metrics',
  ]),
  'ISMS Manager': new Set([
    'dashboard', 'security-awareness', 'training', 'policies', 'incidents',
    'risks', 'controls', 'assets', 'classification', 'threats', 'vulnerabilities',
    'audits', 'evidence', 'soa', 'scope', 'leadership', 'objectives',
    'compliance', 'legal',
    'capa', 'changes', 'vendors', 'bcp', 'management-review',
    'communication', 'improvement', 'reports',
    'calendar', 'metrics',
  ]),
  'Organization Admin': new Set([
    'dashboard', 'security-awareness', 'training', 'policies', 'incidents',
    'risks', 'controls', 'assets', 'classification', 'threats', 'vulnerabilities',
    'audits', 'evidence', 'soa', 'scope', 'leadership', 'objectives',
    'compliance', 'legal',
    'capa', 'changes', 'vendors', 'bcp', 'management-review',
    'communication', 'improvement', 'reports',
    'users', 'settings', 'audit-trail',
    'calendar', 'metrics',
  ]),
  'Super Admin': new Set([
    'dashboard', 'security-awareness', 'training', 'policies', 'incidents',
    'risks', 'controls', 'assets', 'classification', 'threats', 'vulnerabilities',
    'audits', 'evidence', 'soa', 'scope', 'leadership', 'objectives',
    'compliance', 'legal',
    'capa', 'changes', 'vendors', 'bcp', 'management-review',
    'communication', 'improvement', 'reports',
    'users', 'settings', 'audit-trail',
    'calendar', 'metrics',
  ]),
};

export function canAccess(role: string, page: string): boolean {
  const allowed = PERMISSIONS[role];
  if (!allowed) return false;
  return allowed.has(page);
}

export function getAllowedPages(role: string): Set<string> {
  return PERMISSIONS[role] || new Set();
}

interface AccessGuardProps {
  page: string;
  children: React.ReactNode;
}

export default function AccessGuard({ page, children }: AccessGuardProps) {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const hasAccess = canAccess(user.role, page);

  if (!hasAccess) {
    return (
      <div className="animate-fade-in flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-danger/10 flex items-center justify-center mb-6 relative">
            <ShieldOff className="w-9 h-9 text-danger" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-surface border-2 border-border flex items-center justify-center">
              <Lock className="w-4 h-4 text-text-muted" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">
            Access Restricted
          </h1>

          {/* Description */}
          <p className="text-sm text-text-muted mb-6 leading-relaxed max-w-sm mx-auto">
            Your role <span className="font-semibold text-text-secondary">{user.role}</span> does
            not have permission to access this module. Contact your administrator to request access.
          </p>

          {/* Current role badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-border mb-6">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            </div>
            <div className="text-left">
              <p className="text-xs font-medium text-text-primary">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-text-muted">{user.role}</p>
            </div>
          </div>

          {/* Action */}
          <div>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light active:bg-primary-dark transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
