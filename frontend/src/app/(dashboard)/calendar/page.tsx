'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader, Breadcrumbs } from '@/components/ui';
import {
  ChevronLeft, ChevronRight, Calendar, Clock, FileText,
  GraduationCap, Zap, BookOpen, Scale, Repeat, Target, Truck, ClipboardCheck, CalendarDays,
} from 'lucide-react';
import { apiGet } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';

const MODULE_CFG: Record<string, {
  label: string; dot: string; bg: string; text: string;
  icon: React.ElementType; border: string;
}> = {
  audit:     { label: 'Audit',         dot: 'bg-primary',  bg: 'bg-primary/10',    text: 'text-primary',      icon: ClipboardCheck, border: 'border-primary/30' },
  training:  { label: 'Training Due',  dot: 'bg-success',  bg: 'bg-success-light', text: 'text-success',      icon: GraduationCap,  border: 'border-success/30' },
  bcp:       { label: 'BCP Test',      dot: 'bg-warning',  bg: 'bg-warning/10',    text: 'text-warning',      icon: Zap,            border: 'border-warning/30' },
  policy:    { label: 'Policy Review', dot: 'bg-warning',  bg: 'bg-surface-light', text: 'text-text-secondary', icon: FileText,     border: 'border-border' },
  vendor:    { label: 'Vendor Review', dot: 'bg-caution',  bg: 'bg-caution-light', text: 'text-caution',      icon: Truck,          border: 'border-border/50' },
  legal:     { label: 'Legal Review',  dot: 'bg-caution',  bg: 'bg-caution-light', text: 'text-caution',      icon: Scale,          border: 'border-border/50' },
  mgmt:      { label: 'Mgmt Review',   dot: 'bg-primary',  bg: 'bg-info-light',    text: 'text-primary',      icon: BookOpen,       border: 'border-primary/20' },
  capa:      { label: 'CAPA Due',      dot: 'bg-danger',   bg: 'bg-danger/10',     text: 'text-danger',       icon: Repeat,         border: 'border-danger/30' },
  objective: { label: 'Objective',     dot: 'bg-success',  bg: 'bg-success-light', text: 'text-success',      icon: Target,         border: 'border-success/30' },
};

interface CalEvent {
  id: string; date: Date; title: string;
  module: keyof typeof MODULE_CFG; status?: string;
}

function toDate(str?: string | null): Date | null {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

const DAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const fmtDate = (d: Date) => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

export default function CalendarPage() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents]   = useState<CalEvent[]>([]);
  const [current, setCurrent] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  useEffect(() => {
    const load = async () => {
      const results = await Promise.allSettled([
        apiGet<any[]>('/audits'),
        apiGet<any[]>('/training'),
        apiGet<any[]>('/bcp'),
        apiGet<any[]>('/policies'),
        apiGet<any[]>('/vendors'),
        apiGet<any[]>('/legal'),
        apiGet<any[]>('/mgmt-review'),
        apiGet<any[]>('/capa'),
        apiGet<any[]>('/objectives'),
      ]);

      const [audits, training, bcp, policies, vendors, legal, mgmt, capas, objectives] = results;
      const ev: CalEvent[] = [];

      if (audits.status === 'fulfilled') {
        for (const a of audits.value ?? []) {
          const d1 = toDate(a.startDate);
          const d2 = toDate(a.endDate);
          if (d1) ev.push({ id: `audit-s-${a.id}`, date: d1, title: `Audit Start: ${a.title}`, module: 'audit', status: a.status });
          if (d2 && (!d1 || !isSameDay(d2, d1))) ev.push({ id: `audit-e-${a.id}`, date: d2, title: `Audit End: ${a.title}`, module: 'audit', status: a.status });
        }
      }

      if (training.status === 'fulfilled') {
        for (const t of training.value ?? []) {
          if (t.status === 'Completed') continue;
          const d = toDate(t.dueDate);
          if (d) ev.push({ id: `training-${t.id}`, date: d, title: `Training: ${t.title}`, module: 'training', status: t.status });
        }
      }

      if (bcp.status === 'fulfilled') {
        for (const b of bcp.value ?? []) {
          const d = toDate(b.lastTestDate);
          if (d) ev.push({ id: `bcp-${b.id}`, date: d, title: `BCP Test: ${b.planName}`, module: 'bcp', status: b.testResult });
        }
      }

      if (policies.status === 'fulfilled') {
        for (const p of policies.value ?? []) {
          const d = toDate(p.reviewDate);
          if (d) ev.push({ id: `policy-${p.id}`, date: d, title: `Review: ${p.title}`, module: 'policy', status: p.status });
        }
      }

      if (vendors.status === 'fulfilled') {
        for (const v of vendors.value ?? []) {
          const d = toDate(v.reviewDate);
          if (d) ev.push({ id: `vendor-${v.id}`, date: d, title: `Vendor: ${v.name}`, module: 'vendor', status: v.status });
        }
      }

      if (legal.status === 'fulfilled') {
        for (const l of legal.value ?? []) {
          const d = toDate(l.reviewDate);
          if (d) ev.push({ id: `legal-${l.id}`, date: d, title: `Legal: ${l.title}`, module: 'legal', status: l.status });
        }
      }

      if (mgmt.status === 'fulfilled') {
        for (const m of mgmt.value ?? []) {
          const d = toDate(m.reviewDate);
          if (d) ev.push({ id: `mgmt-${m.id}`, date: d, title: 'Management Review', module: 'mgmt', status: m.status });
        }
      }

      if (capas.status === 'fulfilled') {
        for (const c of capas.value ?? []) {
          if (c.status === 'Closed') continue;
          const d = toDate(c.dueDate);
          if (d) ev.push({ id: `capa-${c.id}`, date: d, title: `CAPA: ${c.title}`, module: 'capa', status: c.status });
        }
      }

      if (objectives.status === 'fulfilled') {
        for (const o of objectives.value ?? []) {
          const d1 = toDate(o.reviewDate);
          const d2 = toDate(o.deadline);
          if (d1) ev.push({ id: `obj-r-${o.id}`, date: d1, title: `Review: ${o.title}`, module: 'objective', status: o.status });
          if (d2 && (!d1 || !isSameDay(d2, d1))) ev.push({ id: `obj-d-${o.id}`, date: d2, title: `Target: ${o.title}`, module: 'objective', status: o.status });
        }
      }

      setEvents(ev);
      setLoading(false);
    };
    load();
  }, []);

  const year  = current.getFullYear();
  const month = current.getMonth();

  const calDays = useMemo(() => {
    const first = new Date(year, month, 1);
    const last  = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [year, month]);

  const monthEvents = useMemo(
    () => events.filter(e => e.date.getFullYear() === year && e.date.getMonth() === month),
    [events, year, month]
  );

  const upcoming = useMemo(() => {
    const future = new Date(today);
    future.setDate(future.getDate() + 60);
    return events
      .filter(e => e.date >= today && e.date <= future)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, 25);
  }, [events, today]);

  const dayEvents = (day: Date) => monthEvents.filter(e => isSameDay(e.date, day));
  const selectedEvents = selectedDay ? dayEvents(selectedDay) : [];

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1));
  const goToday   = () => { setCurrent(new Date()); setSelectedDay(today); };

  return (
    <AccessGuard page="calendar">
    <div className="animate-fade-in">
      <Breadcrumbs items={[{ label: 'ISMS Calendar' }]} />
      <PageHeader
        title="ISMS Calendar"
        subtitle="ISO 27001 — Aggregated schedule of audits, reviews, training, due dates, and ISMS activities"
        icon={<CalendarDays className="w-4 h-4" />}
        action={
          <button onClick={goToday} className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all font-medium">
            Today
          </button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-4">
        {/* ── Calendar (left) ── */}
        <div className="flex-1 min-w-0 space-y-3">

          {/* Month view */}
          <div className="card p-4">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-surface-light transition-all text-text-muted hover:text-text-primary">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h3 className="text-sm font-semibold text-text-primary">{MONTHS[month]} {year}</h3>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-surface-light transition-all text-text-muted hover:text-text-primary">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[10px] font-medium text-text-muted uppercase tracking-wider py-1">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-0.5">
              {calDays.map((day, i) => {
                if (!day) return <div key={`e-${i}`} className="min-h-[58px]" />;
                const evs = dayEvents(day);
                const isActive  = selectedDay && isSameDay(day, selectedDay);
                const isTodayDay = isSameDay(day, today);
                const isPast     = day < today;
                return (
                  <button
                    key={day.getTime()}
                    onClick={() => setSelectedDay(isActive ? null : day)}
                    className={`relative rounded-xl p-1.5 min-h-[58px] text-left transition-all hover:bg-surface-light group ${
                      isActive ? 'ring-1 ring-primary bg-primary/5' : ''
                    }`}
                  >
                    <span className={`text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full mx-auto ${
                      isTodayDay
                        ? 'bg-primary text-white'
                        : isPast
                          ? 'text-text-muted/40'
                          : 'text-text-secondary group-hover:text-text-primary'
                    }`}>
                      {day.getDate()}
                    </span>
                    {evs.length > 0 && (
                      <div className="mt-1.5 space-y-0.5 px-0.5">
                        {evs.slice(0, 3).map(ev => {
                          const cfg = MODULE_CFG[ev.module];
                          return <div key={ev.id} className={`w-full h-1 rounded-full ${cfg.dot} opacity-80`} title={ev.title} />;
                        })}
                        {evs.length > 3 && (
                          <p className="text-[10px] text-text-muted text-center">+{evs.length - 3}</p>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected day detail */}
          {selectedDay && (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wider">
                  {fmtDate(selectedDay)}
                </p>
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                  {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
                </span>
              </div>
              {selectedEvents.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="w-6 h-6 text-text-muted/30 mx-auto mb-2" />
                  <p className="text-xs text-text-muted">No events scheduled for this day</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map(ev => {
                    const cfg = MODULE_CFG[ev.module];
                    const Icon = cfg.icon;
                    return (
                      <div key={ev.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                          <Icon className={`w-3.5 h-3.5 ${cfg.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium truncate ${cfg.text}`}>{ev.title}</p>
                          <p className="text-[10px] text-text-muted">{cfg.label}</p>
                        </div>
                        {ev.status && (
                          <span className={`text-[10px] font-medium px-2 py-1 rounded-full border flex-shrink-0 ${cfg.border} ${cfg.text}`}>
                            {ev.status}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar (right) ── */}
        <div className="lg:w-72 flex-shrink-0 space-y-3">

          {/* Upcoming events */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">Upcoming · 60 days</p>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">{upcoming.length}</span>
            </div>
            {loading ? (
              <div className="text-center py-10 text-text-muted text-xs">Loading events...</div>
            ) : upcoming.length === 0 ? (
              <div className="text-center py-10">
                <Calendar className="w-8 h-8 text-text-muted/20 mx-auto mb-2" />
                <p className="text-xs text-text-muted">No upcoming events in the next 60 days</p>
              </div>
            ) : (
              <div className="space-y-1">
                {upcoming.map(ev => {
                  const cfg = MODULE_CFG[ev.module];
                  const Icon = cfg.icon;
                  const daysAway = Math.ceil((ev.date.getTime() - today.getTime()) / 86400000);
                  const soon = daysAway <= 7;
                  return (
                    <button
                      key={ev.id}
                      onClick={() => { setCurrent(new Date(ev.date.getFullYear(), ev.date.getMonth(), 1)); setSelectedDay(ev.date); }}
                      className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg hover:bg-surface-light/60 transition-all text-left"
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                        <Icon className={`w-3 h-3 ${cfg.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-primary truncate leading-tight">{ev.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-2.5 h-2.5 text-text-muted" />
                          <span className={`text-[10px] ${soon ? 'text-warning font-medium' : 'text-text-muted'}`}>
                            {fmtDate(ev.date)} · {daysAway}d
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="card p-4">
            <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-3">Legend</p>
            <div className="space-y-2">
              {Object.entries(MODULE_CFG).map(([key, cfg]) => {
                const Icon = cfg.icon;
                return (
                  <div key={key} className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                    <Icon className={`w-3 h-3 flex-shrink-0 ${cfg.text}`} />
                    <span className="text-[10px] text-text-secondary">{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Month summary */}
          {!loading && monthEvents.length > 0 && (
            <div className="card p-4">
              <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-3">This Month</p>
              <p className="text-2xl font-bold text-text-primary mb-1">{monthEvents.length}</p>
              <p className="text-xs text-text-muted">events in {MONTHS[month]}</p>
              <div className="mt-3 space-y-1.5">
                {Object.entries(MODULE_CFG)
                  .map(([key, cfg]) => ({ key, cfg, count: monthEvents.filter(e => e.module === key).length }))
                  .filter(x => x.count > 0)
                  .map(({ key, cfg, count }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <span className="text-[10px] text-text-secondary">{cfg.label}</span>
                      </div>
                      <span className={`text-[10px] font-semibold ${cfg.text}`}>{count}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </AccessGuard>
  );
}
