'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { PageHeader, StatsCard, StatusBadge, ProgressBar, Button } from '@/components/ui';
import { courses } from '../courseData';
import { useEmployee } from '@/context/EmployeeContext';
import {
  ArrowLeft, Trophy, AlertTriangle, ShieldCheck,
  TrendingUp, Target, CheckCircle, Clock, XCircle, Users, UserPlus
} from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend
} from 'chart.js';
import AccessGuard from '@/components/AccessGuard';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function ProgressPage() {
  const { currentEmployee, allEmployees, isRegistered } = useEmployee();
  const [view, setView] = useState<'admin' | 'employee'>('admin');

  // Admin stats from real employees
  const totalEmployees = allEmployees.length;
  const empWithCourses = allEmployees.filter(e => e.coursesCompleted.length > 0);
  const overallCompletion = totalEmployees > 0
    ? Math.round(allEmployees.reduce((a, e) => a + (e.coursesCompleted.length / courses.length) * 100, 0) / totalEmployees)
    : 0;
  const allScores = allEmployees.flatMap(e => Object.values(e.scores));
  const avgOrgScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
  const atRiskCount = allEmployees.filter(e => {
    const scores = Object.values(e.scores);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return scores.length > 0 && avg < 60;
  }).length;

  // Employee stats
  const myCompleted = currentEmployee?.coursesCompleted.length || 0;
  const myScores = currentEmployee ? Object.values(currentEmployee.scores) : [];
  const myAvg = myScores.length > 0 ? Math.round(myScores.reduce((a, b) => a + b, 0) / myScores.length) : 0;

  // Charts
  const completedAll = allEmployees.reduce((a, e) => a + e.coursesCompleted.length, 0);
  const totalPossible = totalEmployees * courses.length;
  const notStartedCount = totalPossible - completedAll;

  const completionData = {
    labels: ['Completed', 'Not Completed'],
    datasets: [{
      data: [completedAll, Math.max(notStartedCount, 0)],
      backgroundColor: ['#22C55E', '#374151'],
      borderWidth: 0,
      cutout: '72%',
    }],
  };

  // Dept scores
  const deptMap: Record<string, number[]> = {};
  allEmployees.forEach(e => {
    if (!deptMap[e.department]) deptMap[e.department] = [];
    const scores = Object.values(e.scores);
    if (scores.length > 0) deptMap[e.department].push(scores.reduce((a, b) => a + b, 0) / scores.length);
  });
  const deptAvg = Object.entries(deptMap).filter(([, s]) => s.length > 0).map(([dept, scores]) => ({
    dept,
    avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
  }));

  const deptData = {
    labels: deptAvg.map(d => d.dept),
    datasets: [{
      data: deptAvg.map(d => d.avg),
      backgroundColor: deptAvg.map(d => d.avg >= 80 ? 'rgba(34,197,94,0.3)' : d.avg >= 60 ? 'rgba(249,115,22,0.3)' : 'rgba(239,68,68,0.3)'),
      borderColor: deptAvg.map(d => d.avg >= 80 ? '#22C55E' : d.avg >= 60 ? '#F97316' : '#EF4444'),
      borderWidth: 1.5,
      borderRadius: 6,
    }],
  };

  const getRisk = (emp: typeof allEmployees[0]) => {
    const scores = Object.values(emp.scores);
    if (scores.length === 0) return 'Unknown';
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return avg >= 80 ? 'Low' : avg >= 60 ? 'Medium' : 'High';
  };
  const riskVariant = (r: string) => r === 'Low' ? 'success' : r === 'Medium' ? 'warning' : r === 'High' ? 'danger' : 'default';

  return (
    <AccessGuard page="security-awareness">
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/security-awareness">
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div className="flex-1">
          <PageHeader title="Progress Dashboard" subtitle="Track training completion and employee security awareness levels" />
        </div>
      </div>

      {/* Toggle */}
      <div className="flex gap-1 p-1 bg-surface rounded-xl border border-border mb-6 max-w-xs">
        {(['admin', 'employee'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`flex-1 px-4 py-2 rounded-lg text-xs font-medium transition-all ${view === v ? 'bg-primary text-white' : 'text-text-muted hover:text-text-secondary'}`}>
            {v === 'admin' ? '👥 Admin View' : '👤 My Progress'}
          </button>
        ))}
      </div>

      {/* Admin View */}
      {view === 'admin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 stagger">
            <StatsCard title="Total Employees" value={totalEmployees} icon={<Users className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
            <StatsCard title="Avg Score" value={avgOrgScore > 0 ? `${avgOrgScore}%` : '—'} icon={<Trophy className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
            <StatsCard title="At-Risk Employees" value={atRiskCount} icon={<AlertTriangle className="w-4 h-4 text-danger" />} iconBg="bg-danger-light" />
            <StatsCard title="Overall Completion" value={totalEmployees > 0 ? `${overallCompletion}%` : '—'} icon={<TrendingUp className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
          </div>

          {totalEmployees === 0 ? (
            <div className="card p-12 text-center">
              <UserPlus className="w-10 h-10 text-primary/30 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-text-primary mb-1">No Employees Yet</h3>
              <p className="text-xs text-text-muted">Employees will appear here after they join the training program.</p>
            </div>
          ) : (
            <>
              {/* Charts */}
              {empWithCourses.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="card p-5">
                    <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Course Completion</h3>
                    <div className="h-48 relative flex items-center justify-center">
                      <Doughnut data={completionData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                      <div className="absolute text-center">
                        <p className="text-xl font-bold text-text-primary">{overallCompletion}%</p>
                        <p className="text-[11px] text-text-muted">Complete</p>
                      </div>
                    </div>
                  </div>
                  {deptAvg.length > 0 && (
                    <div className="lg:col-span-2 card p-5">
                      <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-4">Average Score by Department</h3>
                      <div className="h-48">
                        <Bar data={deptData} options={{
                          responsive: true, maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            x: { grid: { color: '#1F2937' }, ticks: { color: '#6B7280', font: { size: 11 } } },
                            y: { grid: { color: '#1F2937' }, ticks: { color: '#6B7280', font: { size: 11 } }, min: 0, max: 100 },
                          },
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Employee table */}
              <div className="card overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Employee Details</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {['Employee', 'Department', 'Joined', 'Courses Done', 'Avg Score', 'Risk Level', 'Last Active'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-text-muted uppercase tracking-wider bg-bg/50">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allEmployees.map(emp => {
                        const scores = Object.values(emp.scores);
                        const empAvg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                        const risk = getRisk(emp);
                        return (
                          <tr key={emp.id} className="border-b border-border/50 last:border-0 hover:bg-surface-light/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary">
                                  {emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </div>
                                <span className="text-sm text-text-primary font-medium">{emp.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-text-secondary">{emp.department}</td>
                            <td className="px-4 py-3 text-sm text-text-muted">{emp.joinedAt}</td>
                            <td className="px-4 py-3 text-sm text-text-secondary">{emp.coursesCompleted.length}/{courses.length}</td>
                            <td className="px-4 py-3">
                              <span className={`text-sm font-medium ${empAvg >= 80 ? 'text-success' : empAvg >= 60 ? 'text-warning' : scores.length > 0 ? 'text-danger' : 'text-text-muted'}`}>
                                {scores.length > 0 ? `${empAvg}%` : '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3"><StatusBadge status={risk} variant={riskVariant(risk) as 'success' | 'warning' | 'danger' | 'default'} /></td>
                            <td className="px-4 py-3 text-sm text-text-muted">{emp.lastActivity || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 py-2.5 border-t border-border/50 bg-bg/30">
                  <span className="text-[11px] text-text-muted">{totalEmployees} employee{totalEmployees !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Employee View */}
      {view === 'employee' && (
        <div className="space-y-6">
          {!isRegistered ? (
            <div className="card p-12 text-center">
              <UserPlus className="w-10 h-10 text-primary/30 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-text-primary mb-1">Not Registered</h3>
              <p className="text-xs text-text-muted mb-4">Join the training program from the library page to track your progress.</p>
              <Link href="/security-awareness"><Button>Go to Library</Button></Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 stagger">
                <StatsCard title="Courses Completed" value={`${myCompleted} / ${courses.length}`} icon={<ShieldCheck className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
                <StatsCard title="Overall Score" value={myAvg > 0 ? `${myAvg}%` : '—'} icon={<Trophy className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
                <StatsCard title="Last Activity" value={currentEmployee?.lastActivity || '—'} icon={<Clock className="w-4 h-4 text-text-muted" />} iconBg="bg-surface-light" />
                <StatsCard title="Risk Level" value={myCompleted === 0 ? 'Unknown' : myAvg >= 80 ? 'Low' : myAvg >= 60 ? 'Medium' : 'High'} icon={<Target className="w-4 h-4 text-warning" />} iconBg="bg-warning-light" />
              </div>

              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider">Course Progress</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 stagger">
                {courses.map(course => {
                  const done = currentEmployee!.coursesCompleted.includes(course.id);
                  const score = currentEmployee!.scores[course.id];
                  return (
                    <div key={course.id} className="card p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-base" style={{ background: `${course.color}18` }}>
                          {course.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-text-primary truncate">{course.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            {done ? (
                              <><CheckCircle className="w-3 h-3 text-success" /><span className="text-xs text-success font-medium">Completed — {score}%</span></>
                            ) : (
                              <span className="text-xs text-text-muted">Not Started</span>
                            )}
                          </div>
                          <div className="mt-2">
                            <ProgressBar value={done ? 100 : 0} color={done ? 'bg-success' : 'bg-primary'} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
    </AccessGuard>
  );
}
