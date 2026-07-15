'use client';
import React from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const darkOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: '#1F2937' }, ticks: { color: '#6B7280', font: { size: 11 } } },
    y: { grid: { color: '#1F2937' }, ticks: { color: '#6B7280', font: { size: 11 } } },
  },
};

export function RiskTrendChart() {
  const data = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [
      { label: 'High', data: [0,0,0,0,0,0,0,0,0,0,0,0], borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.05)', fill: true, tension: 0.4, borderWidth: 1.5, pointRadius: 2 },
      { label: 'Medium', data: [0,0,0,0,0,0,0,0,0,0,0,0], borderColor: '#F97316', backgroundColor: 'rgba(249,115,22,0.05)', fill: true, tension: 0.4, borderWidth: 1.5, pointRadius: 2 },
      { label: 'Low', data: [0,0,0,0,0,0,0,0,0,0,0,0], borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.05)', fill: true, tension: 0.4, borderWidth: 1.5, pointRadius: 2 },
    ],
  };
  return (
    <div className="h-64">
      <Line data={data} options={{ ...darkOptions, plugins: { legend: { display: true, position: 'top' as const, labels: { usePointStyle: true, padding: 16, color: '#9CA3AF', font: { size: 11 } } } } }} />
    </div>
  );
}

export function ControlStatusChart({ breakdown = {} }: { breakdown?: Record<string, number> }) {
  const implemented = breakdown['Implemented'] || 0;
  const planned = breakdown['Planned'] || 0;
  const notImpl = breakdown['Not Implemented'] || 0;
  const na = breakdown['N/A'] || 0;
  const total = implemented + planned + notImpl + na;
  const pct = total > 0 ? Math.round((implemented / total) * 100) : 0;
  const data = {
    labels: ['Implemented', 'Planned', 'Not Implemented', 'N/A'],
    datasets: [{ data: [implemented, planned, notImpl, na], backgroundColor: ['#22C55E', '#2563EB', '#374151', '#1F2937'], borderWidth: 0, cutout: '75%' }],
  };
  return (
    <div className="h-48 relative flex items-center justify-center">
      <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
      <div className="absolute text-center"><p className="text-xl font-bold text-text-primary">{pct}%</p><p className="text-[11px] text-text-muted">Implemented</p></div>
    </div>
  );
}

export function IncidentTrendChart() {
  const data = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun'],
    datasets: [{ data: [0,0,0,0,0,0], backgroundColor: 'rgba(37,99,235,0.2)', borderColor: '#2563EB', borderWidth: 1.5, borderRadius: 4 }],
  };
  return <div className="h-48"><Bar data={data} options={darkOptions} /></div>;
}

export function ComplianceGauge({ score = 0 }: { score?: number }) {
  const data = {
    datasets: [{ data: [score, 100 - score], backgroundColor: [score >= 75 ? '#22C55E' : score >= 50 ? '#F97316' : '#EF4444', '#1F2937'], borderWidth: 0, cutout: '80%', circumference: 270, rotation: 225 }],
  };
  return (
    <div className="h-44 relative flex items-center justify-center">
      <Doughnut data={data} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
      <div className="absolute text-center mt-4"><p className="text-2xl font-bold text-text-primary">{score}%</p><p className="text-[11px] text-text-muted">Compliance</p></div>
    </div>
  );
}

export function RiskHeatmap({ data: heatmapData }: { data?: number[][] }) {
  const cells = (heatmapData || [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]]).slice().reverse();
  const getColor = (v: number) => {
    if (v === 0) return 'bg-surface-light text-text-muted/30';
    if (v <= 2) return 'bg-success/20 text-success';
    if (v <= 4) return 'bg-warning/20 text-warning';
    return 'bg-danger/20 text-danger';
  };
  return (
    <div>
      <div className="flex gap-1 mb-1"><div className="w-10" />{['1','2','3','4','5'].map(i => <div key={i} className="flex-1 text-center text-[10px] text-text-muted">{i}</div>)}</div>
      {cells.map((row, ri) => (
        <div key={ri} className="flex gap-1 mb-1">
          <div className="w-10 flex items-center justify-end pr-2 text-[10px] text-text-muted">{5-ri}</div>
          {row.map((v, ci) => <div key={ci} className={`flex-1 aspect-square rounded-md flex items-center justify-center text-xs font-medium ${getColor(v)}`}>{v || '—'}</div>)}
        </div>
      ))}
    </div>
  );
}
