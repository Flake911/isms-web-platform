'use client';
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button, Modal, Input, Select } from '@/components/ui';
import {
  ShieldCheck, BookOpen, Clock, ChevronRight, Flame,
  Star, UserPlus, LogOut, BarChart3, Zap, X, Search,
} from 'lucide-react';
import { courses, categories } from './courseData';
import { useEmployee } from '@/context/EmployeeContext';
import AccessGuard from '@/components/AccessGuard';

const departments = ['Engineering', 'Marketing', 'HR', 'Finance', 'Sales', 'Legal', 'IT', 'Operations', 'Management', 'Support'];

const DIFF_CFG = {
  Beginner:     { label: 'Easy',   color: 'text-success', bg: 'bg-success/15', dot: 'bg-success',  stars: 1 },
  Intermediate: { label: 'Medium', color: 'text-warning', bg: 'bg-warning/15', dot: 'bg-warning',  stars: 2 },
  Advanced:     { label: 'Hard',   color: 'text-danger',  bg: 'bg-danger/15',  dot: 'bg-danger',   stars: 3 },
} as const;

function DiffBadge({ diff }: { diff: string }) {
  const cfg = DIFF_CFG[diff as keyof typeof DIFF_CFG] ?? DIFF_CFG.Beginner;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function DiffStars({ diff }: { diff: string }) {
  const cfg = DIFF_CFG[diff as keyof typeof DIFF_CFG] ?? DIFF_CFG.Beginner;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(i => (
        <Star key={i} className={`w-2.5 h-2.5 ${i <= cfg.stars ? cfg.color + ' fill-current' : 'text-border/60'}`} />
      ))}
    </div>
  );
}

export default function SecurityAwarenessPage() {
  const { currentEmployee, isRegistered, registerEmployee, logout } = useEmployee();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showJoin, setShowJoin] = useState(false);
  const [joinName, setJoinName] = useState('');
  const [joinDept, setJoinDept] = useState(departments[0]);

  const filtered = useMemo(() => courses.filter(c => {
    const matchCat = activeCategory === 'All' || c.category === activeCategory;
    const matchSearch = !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  }), [activeCategory, searchQuery]);

  const completedCount = currentEmployee?.coursesCompleted.length ?? 0;
  const scores = currentEmployee ? Object.values(currentEmployee.scores) : [];
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const xpEarned = completedCount * 100 + (avgScore > 0 ? Math.round(avgScore * 0.5) : 0);
  const completionPct = Math.round((completedCount / courses.length) * 100);

  const riskLevel = completedCount === 0 ? 'Unknown' : avgScore >= 80 ? 'Low' : avgScore >= 60 ? 'Medium' : 'High';
  const riskColor = riskLevel === 'Low' ? 'text-success' : riskLevel === 'Medium' ? 'text-warning' : riskLevel === 'High' ? 'text-danger' : 'text-text-muted';

  const getProgress = (id: string) => {
    if (!currentEmployee) return { completed: false, score: null as number | null };
    return {
      completed: currentEmployee.coursesCompleted.includes(id),
      score: currentEmployee.scores[id] ?? null,
    };
  };

  const handleJoin = () => {
    if (!joinName.trim()) return;
    registerEmployee(joinName.trim(), joinDept);
    setShowJoin(false);
    setJoinName('');
  };

  return (
    <AccessGuard page="security-awareness">
    <div className="animate-fade-in">

      {/* ══════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════ */}
      <div className="relative rounded-2xl overflow-hidden border border-primary/20 mb-6">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '28px 28px' }}
        />
        {/* Accent blob */}
        <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-primary/8 blur-3xl" />

        <div className="relative px-6 py-7">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">ISO 27001 · A.6.3 · A.7.2–7.3</span>
              </div>
              <h1 className="text-xl font-bold text-text-primary tracking-tight mb-1">Security Awareness Training</h1>
              <p className="text-sm text-text-muted">
                {courses.length} interactive modules · Attack simulations · Adaptive quizzes
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isRegistered && (
                <Link href="/security-awareness/progress">
                  <button className="flex items-center gap-1.5 text-xs font-medium text-text-secondary bg-surface hover:bg-surface-light border border-border hover:border-primary/30 px-3 py-1.5 rounded-lg transition-all">
                    <BarChart3 className="w-3.5 h-3.5" /> My Progress
                  </button>
                </Link>
              )}
              {isRegistered ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border">
                    <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                      {currentEmployee!.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text-primary leading-snug">{currentEmployee!.name}</p>
                      <p className="text-[10px] text-text-muted">{currentEmployee!.department}</p>
                    </div>
                  </div>
                  <button
                    onClick={logout}
                    title="Switch User"
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 border border-border transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Button onClick={() => setShowJoin(true)}>
                  <UserPlus className="w-3.5 h-3.5" /> Join Training
                </Button>
              )}
            </div>
          </div>

          {/* Stats row — registered */}
          {isRegistered && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-border/60">
              {/* Progress */}
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">Progress</p>
                <p className="text-2xl font-bold text-text-primary">
                  {completedCount}<span className="text-sm font-normal text-text-muted">/{courses.length}</span>
                </p>
                <div className="w-full h-1.5 bg-surface rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${completionPct}%` }} />
                </div>
              </div>
              {/* Avg score */}
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">Avg Score</p>
                <p className={`text-2xl font-bold ${avgScore >= 80 ? 'text-success' : avgScore >= 60 ? 'text-warning' : avgScore > 0 ? 'text-danger' : 'text-text-muted'}`}>
                  {avgScore > 0 ? `${avgScore}%` : '—'}
                </p>
              </div>
              {/* XP */}
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">XP Earned</p>
                <p className="text-2xl font-bold text-warning">
                  {xpEarned}<span className="text-sm font-normal text-text-muted"> XP</span>
                </p>
              </div>
              {/* Risk level */}
              <div>
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">Security Level</p>
                <p className={`text-2xl font-bold ${riskColor}`}>{riskLevel}</p>
              </div>
            </div>
          )}

          {/* CTA row — not registered */}
          {!isRegistered && (
            <div className="flex items-center gap-4 pt-4 border-t border-border/60">
              <div className="flex -space-x-2">
                {['MK','SJ','EA','RG'].map((l, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-primary/20 border-2 border-surface flex items-center justify-center text-[10px] font-bold text-primary">{l}</div>
                ))}
              </div>
              <p className="text-sm text-text-muted">
                Join <span className="text-text-primary font-semibold">1,200+ employees</span> building security awareness
              </p>
              <button
                onClick={() => setShowJoin(true)}
                className="ml-auto text-xs font-semibold text-primary hover:text-primary-light transition-colors flex-shrink-0"
              >
                Get started →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Join Modal */}
      <Modal open={showJoin} onClose={() => setShowJoin(false)} title="Join Security Awareness Training" size="sm">
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleJoin(); }}>
          <Input label="Your Full Name" placeholder="e.g. Majid Hassan" value={joinName} onChange={e => setJoinName(e.target.value)} />
          <Select label="Department" value={joinDept} onChange={e => setJoinDept(e.target.value)}>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleJoin}>Join</Button>
            <Button variant="secondary" onClick={() => setShowJoin(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* ══════════════════════════════════════════
          SEARCH + CATEGORY FILTERS
      ══════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5 items-start sm:items-center">
        {/* Search */}
        <div className="flex items-center gap-2 w-full sm:w-64 flex-shrink-0 bg-surface border border-border rounded-lg px-3 py-2 focus-within:border-primary/50 transition-all">
          <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          <input
            placeholder="Search modules..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 min-w-0 bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-text-muted hover:text-text-primary transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category pills — scrollable on mobile */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 flex-1 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface text-text-muted border border-border hover:border-primary/40 hover:text-text-secondary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Count */}
        <span className="hidden sm:block text-[11px] text-text-muted flex-shrink-0">
          {filtered.length} module{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ══════════════════════════════════════════
          COURSE GRID
      ══════════════════════════════════════════ */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-14 h-14 rounded-2xl bg-surface-light flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-text-muted/40" />
          </div>
          <p className="text-sm font-medium text-text-secondary mb-1">No modules found</p>
          <p className="text-xs text-text-muted">Try a different search term or category</p>
          <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="mt-3 text-xs text-primary hover:text-primary-light transition-colors">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
          {filtered.map(course => {
            const prog = getProgress(course.id);
            const xp = 100 + course.quiz.length * 25;

            return (
              <Link key={course.id} href={`/security-awareness/${course.id}`} className="group block">
                <div className={`card overflow-hidden h-full flex flex-col transition-all duration-200 ${
                  prog.completed
                    ? 'ring-1 ring-success/30 hover:ring-success/50'
                    : 'hover:ring-1 hover:ring-primary/40 hover:-translate-y-0.5 hover:shadow-lg'
                }`}>

                  {/* ── Banner ── */}
                  <div
                    className="relative h-[96px] flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${course.color}18 0%, ${course.color}08 50%, transparent 100%)`,
                      borderBottom: `1px solid ${course.color}22`,
                    }}
                  >
                    {/* Subtle grid */}
                    <div
                      className="absolute inset-0 opacity-[0.04]"
                      style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }}
                    />

                    {/* Category tag */}
                    <span
                      className="absolute top-2.5 left-3 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                      style={{ background: `${course.color}22`, color: course.color }}
                    >
                      {course.category}
                    </span>

                    {/* XP badge */}
                    <span className="absolute top-2.5 right-3 flex items-center gap-0.5 text-[10px] font-bold text-warning/80">
                      <Zap className="w-2.5 h-2.5" />{xp} XP
                    </span>

                    {/* Icon */}
                    <span className="text-[42px] select-none group-hover:scale-110 transition-transform duration-300 leading-none filter drop-shadow-sm">
                      {course.icon}
                    </span>

                    {/* Completed badge */}
                    {prog.completed && (
                      <div className="absolute bottom-2.5 right-3 w-5 h-5 rounded-full bg-success flex items-center justify-center shadow-sm">
                        <ShieldCheck className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  {/* ── Body ── */}
                  <div className="p-4 flex flex-col flex-1">
                    {/* Title row */}
                    <div className="flex items-start gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-text-primary leading-snug group-hover:text-primary transition-colors flex-1 line-clamp-2">
                        {course.title}
                      </h3>
                      <DiffBadge diff={course.difficulty} />
                    </div>

                    {/* Description */}
                    <p className="text-[11px] text-text-muted leading-relaxed mb-3 line-clamp-2">
                      {course.description}
                    </p>

                    {/* Meta row */}
                    <div className="flex items-center justify-between mb-3 text-[10px] text-text-muted">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3" />{course.quiz.length} Q
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />{course.attackFlow.length} tasks
                        </span>
                      </div>
                      <DiffStars diff={course.difficulty} />
                    </div>

                    {/* Progress — registered */}
                    {isRegistered && (
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-text-muted">
                            {prog.completed ? 'Completed' : 'Not started'}
                          </span>
                          {prog.score !== null && (
                            <span
                              className="text-[10px] font-bold tabular-nums"
                              style={{ color: prog.score >= 80 ? '#22C55E' : prog.score >= 60 ? '#F59E0B' : '#EF4444' }}
                            >
                              {prog.score}%
                            </span>
                          )}
                        </div>
                        <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${prog.completed ? 'bg-success' : 'bg-border/30'}`}
                            style={{ width: prog.completed ? '100%' : '0%' }}
                          />
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    <div className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-semibold transition-all border ${
                      prog.completed
                        ? 'bg-success/10 text-success border-success/20'
                        : 'bg-surface-light border-border text-text-secondary group-hover:bg-primary group-hover:border-primary group-hover:text-white'
                    }`}>
                      {prog.completed
                        ? <><ShieldCheck className="w-3.5 h-3.5" /> Completed · Review</>
                        : <><ChevronRight className="w-3.5 h-3.5" /> Start Learning</>
                      }
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
    </AccessGuard>
  );
}
