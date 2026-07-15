'use client';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Inbox, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';

/* ═══ TOAST ═══ */
let _setToast: ((t: { message: string; type: 'success' | 'error' } | null) => void) | null = null;

export function toast(message: string, type: 'success' | 'error' = 'error') {
  _setToast?.({ message, type });
  setTimeout(() => _setToast?.(null), 4000);
}

export function ToastProvider() {
  const [t, setT] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  useEffect(() => { _setToast = setT; return () => { _setToast = null; }; }, []);
  if (!t) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium animate-fade-in border ${
      t.type === 'error'
        ? 'bg-danger text-white border-danger/50'
        : 'bg-success text-white border-success/50'
    }`}>
      {t.type === 'error'
        ? <AlertCircle className="w-4 h-4 shrink-0" />
        : <CheckCircle className="w-4 h-4 shrink-0" />}
      {t.message}
      <button onClick={() => setT(null)} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ═══ PAGE HEADER ═══ */
export function PageHeader({ title, subtitle, action, icon }: {
  title: string; subtitle?: string; action?: React.ReactNode; icon?: React.ReactNode;
}) {
  // Split "Clause X.X — description text" into tag + desc
  let clauseTag: string | null = null;
  let descText: string | undefined = subtitle;
  if (subtitle) {
    const dashIdx = subtitle.indexOf(' — ');
    if (dashIdx !== -1) {
      const before = subtitle.slice(0, dashIdx);
      if (/clause|iso|a\.\d|annex/i.test(before)) {
        clauseTag = before;
        descText = subtitle.slice(dashIdx + 3);
      }
    }
  }

  return (
    <div
      className="relative rounded-2xl border border-indigo-900/40 mb-6"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #131229 40%, #0f172a 100%)' }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 rounded-2xl opacity-[0.04]"
        style={{ backgroundImage: 'radial-gradient(circle, #818cf8 1px, transparent 1px)', backgroundSize: '22px 22px' }}
      />
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px rounded-b-2xl bg-gradient-to-r from-indigo-500/40 via-violet-500/60 to-transparent" />

      <div className="relative px-6 pt-5 pb-5">
        {/* Top row: icon + clause tag | action */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 text-white">
                {icon}
              </div>
            )}
            {clauseTag && (
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{clauseTag}</span>
            )}
            {!icon && !clauseTag && <span />}
          </div>
          {action && (
            <div className="flex-shrink-0 flex items-center gap-2">
              {action}
            </div>
          )}
        </div>
        {/* Title + description */}
        <h1 className="text-2xl font-bold text-white tracking-tight leading-tight">{title}</h1>
        {descText && (
          <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">{descText}</p>
        )}
      </div>
    </div>
  );
}

/* ═══ STATS CARD ═══ */
const COLOR_TO_BG: Record<string, string> = {
  success: 'bg-success/10',
  danger:  'bg-danger/10',
  warning: 'bg-warning/10',
  info:    'bg-primary/10',
  primary: 'bg-primary/10',
  accent:  'bg-accent/10',
};

export function StatsCard({ title, value, change, changeType, icon, iconBg, color }: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon?: React.ReactNode;
  iconBg?: string;
  color?: string;
}) {
  const bg = iconBg || (color ? COLOR_TO_BG[color] : 'bg-primary/10');
  return (
    <div className="relative bg-surface border border-border rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 animate-fade-in">
      {/* Subtle top shimmer */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-text-muted uppercase tracking-widest mb-2">{title}</p>
          <p className="text-[28px] font-bold text-text-primary tracking-tight leading-tight">{value}</p>
          {change && (
            <p className={`text-[11px] font-medium mt-2 ${
              changeType === 'positive' ? 'text-success' :
              changeType === 'negative' ? 'text-danger' : 'text-text-muted'
            }`}>{change}</p>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${bg}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══ STATUS BADGE ═══ */
export function StatusBadge({ status, variant = 'default' }: {
  status: string; variant?: 'success' | 'danger' | 'warning' | 'info' | 'caution' | 'default';
}) {
  const styles: Record<string, string> = {
    success: 'bg-success/10 text-success border-success/20',
    danger:  'bg-danger/10 text-danger border-danger/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    caution: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    info:    'bg-primary/10 text-primary border-primary/20',
    default: 'bg-surface-light text-text-muted border-border',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${styles[variant]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
}

/* ═══ DATA TABLE ═══ */
export function DataTable<T extends Record<string, any>>({ columns, data, onRowClick }: {
  columns: { key: string; label: string; render?: (item: T) => React.ReactNode }[];
  data: T[];
  onRowClick?: (item: T) => void;
}) {
  if (data.length === 0) return <EmptyState />;
  return (
    <div className="rounded-2xl border border-border overflow-hidden bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-bg/60">
              {columns.map(col => (
                <th key={col.key} className="text-left px-4 py-3 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-border/50 last:border-0 hover:bg-surface-light/40 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3 text-sm text-text-secondary">
                    {col.render ? col.render(row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2.5 border-t border-border/50 bg-bg/30">
        <span className="text-[11px] text-text-muted">{data.length} record{data.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}

/* ═══ MODAL (Portal-based) ═══ */
export function Modal({ open, onClose, title, children, size = 'md' }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode; size?: 'sm' | 'md' | 'lg';
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  if (!open || !mounted) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative bg-surface rounded-2xl border border-border shadow-2xl w-full ${widths[size]} max-h-[88vh] flex flex-col animate-modal-content`}
        onClick={e => e.stopPropagation()}
      >
        {/* Gradient top stripe */}
        <div className="h-0.5 w-full bg-gradient-to-r from-primary via-accent to-primary/40 rounded-t-2xl shrink-0" />
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <h3 className="text-sm font-bold text-text-primary">{title}</h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 pt-4 pb-3 overflow-y-auto">{children}</div>
      </div>
    </div>,
    document.body
  );
}

/* ═══ BUTTON ═══ */
export function Button({ children, variant = 'primary', onClick, type, className = '', disabled, size = 'md' }: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  onClick?: () => void;
  type?: 'button' | 'submit';
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const styles: Record<string, string> = {
    primary:   'bg-primary text-white hover:bg-primary/90 active:bg-primary/80 shadow-sm',
    secondary: 'bg-surface-light text-text-secondary border border-border hover:border-border-light hover:text-text-primary hover:bg-surface',
    danger:    'bg-danger text-white hover:bg-danger/90 shadow-sm',
    ghost:     'text-text-muted hover:text-text-primary hover:bg-surface-light border border-transparent hover:border-border',
  };
  const sizes: Record<string, string> = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2',
  };
  return (
    <button
      onClick={onClick}
      type={type || 'button'}
      disabled={disabled}
      className={`inline-flex items-center rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

/* ═══ PROGRESS BAR ═══ */
export function ProgressBar({ value, max = 100, color = 'bg-primary' }: {
  value: number; max?: number; color?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full h-1.5 bg-surface-light rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ease-out ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ═══ EMPTY STATE ═══ */
export function EmptyState({ title = 'No data yet', description = 'Get started by adding your first record.', icon, action }: {
  title?: string; description?: string; icon?: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-surface-light border border-border flex items-center justify-center mb-5">
        {icon || <Inbox className="w-7 h-7 text-text-muted/40" />}
      </div>
      <h3 className="text-sm font-bold text-text-primary mb-1.5">{title}</h3>
      <p className="text-sm text-text-muted max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ═══ FORM: INPUT ═══ */
export function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-semibold text-text-secondary mb-1.5">{label}</label>
      <input
        {...props}
        className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 hover:border-border-light focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
      />
    </div>
  );
}

/* ═══ FORM: SELECT ═══ */
export function Select({ label, children, ...props }: {
  label: string; children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="block text-xs font-semibold text-text-secondary mb-1.5">{label}</label>
      <select
        {...props}
        className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm text-text-primary hover:border-border-light focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
      >
        {children}
      </select>
    </div>
  );
}

/* ═══ FORM: TEXTAREA ═══ */
export function TextArea({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label className="block text-xs font-semibold text-text-secondary mb-1.5">{label}</label>
      <textarea
        {...props}
        className="w-full px-3 py-2 bg-bg border border-border rounded-xl text-sm text-text-primary placeholder:text-text-muted/50 hover:border-border-light focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
      />
    </div>
  );
}

/* ═══ CONFIRM DIALOG ═══ */
export function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirm Delete', message = 'Are you sure? This action cannot be undone.' }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title?: string; message?: string;
}) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 animate-fade-in-up overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-0.5 w-full bg-gradient-to-r from-danger/60 via-danger to-danger/60" />
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-text-primary mb-1.5">{title}</h3>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">{message}</p>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-surface-light hover:bg-surface border border-border text-text-secondary text-sm font-medium rounded-xl transition-all">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-danger hover:bg-danger/90 text-white text-sm font-semibold rounded-xl shadow-sm transition-all">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ═══ BREADCRUMBS ═══ */
export function Breadcrumbs({ items }: {
  items: { label: string; href?: string; onClick?: () => void }[];
}) {
  return (
    <nav className="flex items-center gap-1.5 text-[11px] text-text-muted mb-4">
      <a href="/dashboard" className="hover:text-text-primary transition-colors">Dashboard</a>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <ChevronRight className="w-3 h-3 text-text-muted/40" />
          {item.href ? (
            <a href={item.href} className="hover:text-text-primary transition-colors">{item.label}</a>
          ) : item.onClick ? (
            <button onClick={item.onClick} className="hover:text-text-primary transition-colors">{item.label}</button>
          ) : (
            <span className="text-text-secondary font-semibold">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/* ═══ DUE DATE BADGE ═══ */
export function DueDateBadge({ date, label }: { date: string | null | undefined; label?: string }) {
  if (!date) return <span className="text-text-muted text-xs">—</span>;
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = diffDays < 0;
  const isDueSoon = diffDays >= 0 && diffDays <= 7;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
      isOverdue
        ? 'bg-danger/10 text-danger border-danger/20 animate-pulse'
        : isDueSoon
          ? 'bg-warning/10 text-warning border-warning/20'
          : 'text-text-muted border-transparent'
    }`}>
      {(isOverdue || isDueSoon) && <span className={`w-1.5 h-1.5 rounded-full ${isOverdue ? 'bg-danger' : 'bg-warning'}`} />}
      {label || d.toLocaleDateString()}
      {isOverdue && <span className="text-[10px]">({Math.abs(diffDays)}d overdue)</span>}
      {isDueSoon && !isOverdue && <span className="text-[10px]">({diffDays}d left)</span>}
    </span>
  );
}

/* ═══ LAST UPDATED ═══ */
export function LastUpdated({ date }: { date: string | null | undefined }) {
  if (!date) return null;
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  let text = '';
  if (diffMin < 1) text = 'Just now';
  else if (diffMin < 60) text = `${diffMin}m ago`;
  else if (diffHrs < 24) text = `${diffHrs}h ago`;
  else if (diffDays < 7) text = `${diffDays}d ago`;
  else text = d.toLocaleDateString();
  return <span className="text-[10px] text-text-muted/60">{text}</span>;
}

/* ═══ COMMENTS PANEL ═══ */
export function CommentsPanel({ module, recordId, apiGet: fetchFn, apiPost: postFn, apiDelete: delFn, user }: {
  module: string; recordId: string;
  apiGet: (url: string) => Promise<any>;
  apiPost: (url: string, data: any) => Promise<any>;
  apiDelete: (url: string) => Promise<any>;
  user?: { email?: string; firstName?: string; lastName?: string } | null;
}) {
  const [comments, setComments] = React.useState<any[]>([]);
  const [text, setText] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try { const c = await fetchFn(`/comments?module=${module}&recordId=${recordId}`); setComments(c); } catch {}
    finally { setLoading(false); }
  }, [module, recordId, fetchFn]);

  React.useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!text.trim()) return;
    try {
      await postFn('/comments', { module, recordId, content: text, userEmail: user?.email, userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown' });
      setText(''); load();
    } catch {}
  };

  const remove = async (id: string) => { try { await delFn(`/comments/${id}`); load(); } catch {} };

  return (
    <div className="mt-4 border-t border-border pt-4">
      <h4 className="text-xs font-bold text-text-primary mb-3 uppercase tracking-widest">Comments & Notes</h4>
      {loading ? <p className="text-xs text-text-muted">Loading...</p> : (
        <div className="space-y-2.5 max-h-48 overflow-y-auto mb-3">
          {comments.length === 0 && <p className="text-xs text-text-muted py-2">No comments yet.</p>}
          {comments.map((c: any) => (
            <div key={c.id} className="flex gap-2.5 group">
              <div className="w-7 h-7 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0 mt-0.5">
                {(c.userName || c.userEmail || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-semibold text-text-primary">{c.userName || c.userEmail || 'Unknown'}</span>
                  <span className="text-[10px] text-text-muted/60">{new Date(c.createdAt).toLocaleString()}</span>
                  <button onClick={() => remove(c.id)} className="text-[10px] text-danger opacity-0 group-hover:opacity-100 transition-opacity ml-auto">×</button>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Add a comment…"
          className="flex-1 px-3 py-2 bg-bg border border-border rounded-xl text-xs text-text-primary placeholder:text-text-muted/50 hover:border-border-light focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
        />
        <button onClick={submit}
          className="px-3 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm">
          Post
        </button>
      </div>
    </div>
  );
}
