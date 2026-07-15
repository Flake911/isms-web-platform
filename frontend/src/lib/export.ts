/**
 * Export utilities for CSV download and PDF generation
 */

// ═══ CSV EXPORT ═══
export function exportToCSV(data: Record<string, any>[], filename: string, columns?: { key: string; label: string }[]) {
  if (data.length === 0) return;
  
  const keys = columns ? columns.map(c => c.key) : Object.keys(data[0]);
  const headers = columns ? columns.map(c => c.label) : keys;
  
  const csvRows = [
    headers.join(','),
    ...data.map(row => 
      keys.map(key => {
        const val = row[key];
        const str = val === null || val === undefined ? '' : String(val);
        // Escape commas and quotes
        return str.includes(',') || str.includes('"') || str.includes('\n') 
          ? `"${str.replace(/"/g, '""')}"` 
          : str;
      }).join(',')
    )
  ];
  
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ═══ PDF EXPORT (Print-based) ═══
export function exportToPDF(title: string, subtitle: string, data: Record<string, any>[], columns: { key: string; label: string }[]) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const rows = data.map(row => 
    `<tr>${columns.map(col => `<td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155">${row[col.key] ?? '—'}</td>`).join('')}</tr>`
  ).join('');
  
  const html = `<!DOCTYPE html>
<html><head><title>${title}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #0ea5e9; }
  .logo { font-size: 24px; font-weight: 700; color: #0ea5e9; }
  .logo span { color: #64748b; font-weight: 400; }
  .meta { text-align: right; font-size: 11px; color: #94a3b8; }
  h1 { font-size: 20px; margin-bottom: 4px; color: #0f172a; }
  .subtitle { font-size: 12px; color: #64748b; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; background: #f8fafc; border-bottom: 2px solid #e2e8f0; }
  tr:nth-child(even) { background: #f8fafc; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
  .stats { display: flex; gap: 24px; margin-bottom: 24px; }
  .stat { padding: 12px 20px; background: #f0f9ff; border-radius: 8px; border: 1px solid #bae6fd; }
  .stat-value { font-size: 24px; font-weight: 700; color: #0284c7; }
  .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  @media print { body { padding: 20px; } .no-print { display: none; } }
</style>
</head><body>
<div class="header">
  <div>
    <div class="logo">Sentra<span>ISMS</span></div>
    <div style="font-size:11px;color:#94a3b8;margin-top:2px">ISO 27001:2022 Compliance Platform</div>
  </div>
  <div class="meta">
    <div>Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    <div>${new Date().toLocaleTimeString()}</div>
  </div>
</div>
<h1>${title}</h1>
<div class="subtitle">${subtitle}</div>
<div class="stats">
  <div class="stat"><div class="stat-value">${data.length}</div><div class="stat-label">Total Records</div></div>
</div>
<table><thead><tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>
<div class="footer">
  <span>SentraISMS — Confidential</span>
  <span>Page 1 of 1 • ${data.length} records</span>
</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;
  
  printWindow.document.write(html);
  printWindow.document.close();
}
