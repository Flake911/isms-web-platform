'use client';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { PageHeader, StatsCard, Button, EmptyState, DataTable, Modal, Input, Select, TextArea, ConfirmDialog, Breadcrumbs, toast } from '@/components/ui';
import { FileArchive, Plus, Upload, Tag, Link2, Clock, Edit2, Trash2, Download, FileText, Paperclip, Search, X } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete, UPLOADS_BASE } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { exportToCSV, exportToPDF } from '@/lib/export';

interface EvidenceEntry { id: string; title: string; description: string; type: string; referenceType: string; referenceId: string; tags: string; fileName: string; filePath: string; fileSize: number; mimeType: string; createdAt: string; }
const empty = { title: '', type: 'Document', referenceType: 'Control', referenceId: '', tags: '', description: '' };

export default function EvidencePage() {
  const [items, setItems] = useState<EvidenceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string|null>(null);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetch_ = useCallback(async () => { try { setItems(await apiGet('/evidence')); } catch(e) { console.error(e); } finally { setLoading(false); } }, []);
  useEffect(() => { fetch_(); }, [fetch_]);

  const openCreate = () => { setEditingId(null); setForm(empty); setFile(null); setShowModal(true); };
  const openEdit = (item: EvidenceEntry) => { setEditingId(item.id); setForm({ title: item.title, type: item.type||'Document', referenceType: item.referenceType||'Control', referenceId: item.referenceId||'', tags: item.tags||'', description: item.description||'' }); setFile(null); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setUploading(true);
    try {
      if (file && !editingId) {
        // Upload with file
        const token = typeof window !== 'undefined' ? localStorage.getItem('isms_token') : '';
        const fd = new FormData();
        fd.append('file', file);
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3001/api';
        const res = await fetch(`${apiBase}/evidence/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd,
        });
        if (!res.ok) throw new Error('Upload failed');
      } else if (editingId) {
        await apiPut(`/evidence/${editingId}`, form);
      } else {
        await apiPost('/evidence', form);
      }
      setShowModal(false); fetch_(); toast('Evidence saved', 'success');
    } catch(e: any) { toast(e?.message || 'Failed to save evidence'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => { try { await apiDelete(`/evidence/${id}`); fetch_(); } catch(e: any) { toast(e?.message || 'Failed to delete evidence'); } };

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterRefType, setFilterRefType] = useState('');

  const filtered = useMemo(() => items.filter(i => {
    const q = search.toLowerCase();
    const matchQ = !q || i.title.toLowerCase().includes(q) || (i.tags || '').toLowerCase().includes(q) || (i.referenceId || '').toLowerCase().includes(q);
    const matchT = !filterType    || i.type === filterType;
    const matchR = !filterRefType || i.referenceType === filterRefType;
    return matchQ && matchT && matchR;
  }), [items, search, filterType, filterRefType]);

  const formatSize = (bytes: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
    return `${(bytes/1048576).toFixed(1)} MB`;
  };

  const columns = [
    { key: 'title', label: 'Title', render: (r: EvidenceEntry) => (
      <div>
        <span className="font-medium text-text-primary">{r.title}</span>
        {r.fileName && <div className="flex items-center gap-1 mt-0.5"><Paperclip className="w-3 h-3 text-primary/60" /><span className="text-[10px] text-text-muted">{r.fileName} ({formatSize(r.fileSize)})</span></div>}
      </div>
    )},
    { key: 'type', label: 'Type', render: (r: EvidenceEntry) => <span className="text-xs px-2 py-1 rounded-md font-medium bg-primary/10 text-primary">{r.type}</span> },
    { key: 'referenceType', label: 'Linked To', render: (r: EvidenceEntry) => <span className="text-xs">{r.referenceType ? `${r.referenceType}: ${r.referenceId||'—'}` : '—'}</span> },
    { key: 'tags', label: 'Tags', render: (r: EvidenceEntry) => r.tags ? <div className="flex flex-wrap gap-1">{r.tags.split(',').map((t,i) => <span key={i} className="text-[10px] px-1.5 py-1 rounded bg-surface-light text-text-muted">{t.trim()}</span>)}</div> : <span className="text-text-muted text-xs">—</span> },
    { key: 'createdAt', label: 'Uploaded', render: (r: EvidenceEntry) => <span className="text-text-muted text-xs">{new Date(r.createdAt).toLocaleDateString()}</span> },
    { key: 'actions', label: '', render: (r: EvidenceEntry) => <div className="flex gap-1">
      {r.filePath && <a href={`${UPLOADS_BASE}/uploads/evidence/${r.filePath}`} target="_blank" className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-success hover:bg-success-light transition-all"><Download className="w-3.5 h-3.5"/></a>}
      <button onClick={() => openEdit(r)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-info-light transition-all"><Edit2 className="w-3.5 h-3.5"/></button>
      <button onClick={() => setConfirmDelete(r.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger-light transition-all"><Trash2 className="w-3.5 h-3.5"/></button>
    </div> },
  ];

  return (
    <AccessGuard page="evidence">
    <div className="animate-fade-in">
      <Breadcrumbs items={[{ label: 'Evidence Management' }]} />
      <PageHeader title="Evidence Management" subtitle="A.5.33 — Documented proof for controls, audits, risks, and compliance" icon={<FileArchive className="w-4 h-4" />} action={<div className="flex gap-2">
        <Button variant="ghost" onClick={() => exportToCSV(items, 'evidence', [{key:'title',label:'Title'},{key:'type',label:'Type'},{key:'referenceType',label:'Linked To'},{key:'fileName',label:'File'},{key:'tags',label:'Tags'}])}><Download className="w-3.5 h-3.5" /> CSV</Button>
        <Button onClick={openCreate}><Upload className="w-3.5 h-3.5" /> Upload Evidence</Button>
      </div>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger">
        <StatsCard title="Total Evidence" value={items.length} icon={<FileArchive className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
        <StatsCard title="With Files" value={items.filter(i=>i.filePath).length} icon={<Paperclip className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
        <StatsCard title="Linked Items" value={items.filter(i=>i.referenceId).length} icon={<Link2 className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
        <StatsCard title="Tags Used" value={new Set(items.flatMap(i=>(i.tags||'').split(',').map(t=>t.trim())).filter(Boolean)).size} icon={<Tag className="w-4 h-4 text-warning" />} iconBg="bg-warning-light" />
      </div>
      {/* Search & Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          <input className="bg-transparent text-sm flex-1 outline-none text-text-primary placeholder:text-text-muted/50"
            placeholder="Search title, tags, reference…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')}><X className="w-3 h-3 text-text-muted hover:text-text-primary" /></button>}
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
          <option value="">All Types</option>
          <option>Document</option><option>Screenshot</option><option>Certificate</option>
          <option>Log</option><option>Configuration</option><option>Report</option>
        </select>
        <select value={filterRefType} onChange={e => setFilterRefType(e.target.value)}
          className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
          <option value="">All Links</option>
          <option>Control</option><option>Risk</option><option>Audit</option>
          <option>Incident</option><option>Policy</option><option>CAPA</option>
        </select>
      </div>
      {loading ? <div className="text-center py-16 text-text-muted text-sm">Loading...</div> :
        filtered.length === 0 ? <EmptyState title="No evidence found" description="Upload evidence files and link them to controls, risks, audits, and more." icon={<FileArchive className="w-7 h-7 text-primary/40" />} action={<Button onClick={openCreate}><Upload className="w-3.5 h-3.5" /> Upload Evidence</Button>} /> :
        <DataTable columns={columns} data={filtered} />
      }
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Evidence' : 'Upload Evidence'} size="lg">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input label="Evidence Title" placeholder="e.g. Firewall Config Screenshot Q1" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          {!editingId && (
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Attach File (max 10MB)</label>
              <div 
                onClick={() => fileRef.current?.click()}
                className="w-full px-4 py-6 border-2 border-dashed border-border rounded-lg text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <Upload className="w-5 h-5 text-text-muted mx-auto mb-2" />
                {file ? (
                  <div className="text-sm text-text-primary font-medium">{file.name} <span className="text-text-muted font-normal">({formatSize(file.size)})</span></div>
                ) : (
                  <div className="text-sm text-text-muted">Click to select a file or drag & drop</div>
                )}
              </div>
              <input ref={fileRef} type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" value={form.type} onChange={e => setForm({...form, type: e.target.value})}><option>Document</option><option>Screenshot</option><option>Certificate</option><option>Log</option><option>Configuration</option><option>Report</option><option>Other</option></Select>
            <Select label="Link To" value={form.referenceType} onChange={e => setForm({...form, referenceType: e.target.value})}><option>Control</option><option>Risk</option><option>Audit</option><option>Incident</option><option>Policy</option><option>CAPA</option><option>Vendor</option></Select>
          </div>
          <Input label="Reference ID" placeholder="e.g. A.8.7, RSK-003, AUD-001" value={form.referenceId} onChange={e => setForm({...form, referenceId: e.target.value})} />
          <Input label="Tags" placeholder="Comma separated: firewall, network, Q1-2026" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} />
          <TextArea label="Description" rows={2} placeholder="Brief description of this evidence" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : editingId ? 'Update' : 'Upload'}</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
      <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={() => { if (confirmDelete) { handleDelete(confirmDelete); setConfirmDelete(null); } }} />
    </div>
    </AccessGuard>
  );
}
