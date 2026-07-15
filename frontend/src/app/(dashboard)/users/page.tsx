'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader, StatsCard, DataTable, Button, EmptyState, Modal, Input, Select, ConfirmDialog, Breadcrumbs, toast } from '@/components/ui';
import { Users, Plus, Shield, Eye, Trash2, Edit2, UserCheck, AlertCircle, Download, Search, X } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import AccessGuard from '@/components/AccessGuard';
import { exportToCSV } from '@/lib/export';

interface User { id: string; firstName: string; lastName: string; email: string; role: string; organization: string; status: string; mfaEnabled: boolean; lastLogin: string | null; createdAt: string; }
const empty = { firstName: '', lastName: '', email: '', password: '', role: 'Employee', organization: 'Default Organization', status: 'Active', mfaEnabled: false };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string|null>(null);
  const [form, setForm] = useState(empty);
  const [formError, setFormError] = useState('');

  const fetch_ = useCallback(async () => { try { setUsers(await apiGet('/users')); } catch (e) { console.error(e); } finally { setLoading(false); } }, []);
  useEffect(() => { fetch_(); }, [fetch_]);

  const openCreate = () => { setEditingId(null); setForm(empty); setFormError(''); setShowModal(true); };
  const openEdit = (u: User) => { setEditingId(u.id); setForm({ firstName: u.firstName, lastName: u.lastName, email: u.email, password: '', role: u.role, organization: u.organization, status: u.status, mfaEnabled: u.mfaEnabled }); setFormError(''); setShowModal(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validation with visible feedback
    if (!form.firstName.trim()) { setFormError('First name is required.'); return; }
    if (!form.email.trim()) { setFormError('Email is required.'); return; }
    if (!editingId && !form.password.trim()) { setFormError('Password is required for new accounts.'); return; }

    const payload: any = { ...form };
    if (editingId && !payload.password) delete payload.password;

    setSubmitting(true);
    try {
      if (editingId) {
        await apiPut(`/users/${editingId}`, payload);
      } else {
        await apiPost('/users', payload);
      }
      setShowModal(false);
      fetch_();
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong';
      if (msg.includes('Unique constraint') || msg.includes('unique') || msg.includes('already exists')) {
        setFormError('A user with this email already exists.');
      } else {
        setFormError(msg.length > 200 ? 'Failed to save user. Please try again.' : msg);
      }
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (id: string) => { try { await apiDelete(`/users/${id}`); fetch_(); toast('User deleted', 'success'); } catch (e: any) { toast(e?.message || 'Failed to delete user'); } };

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const filteredUsers = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = !q || `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.organization || '').toLowerCase().includes(q);
    const matchR = !filterRole   || u.role === filterRole;
    const matchS = !filterStatus || u.status === filterStatus;
    return matchQ && matchR && matchS;
  }), [users, search, filterRole, filterStatus]);

  const columns = [
    { key: 'name', label: 'Name', render: (u: User) => <span className="font-medium text-text-primary">{u.firstName} {u.lastName}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (u: User) => <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === 'Super Admin' || u.role === 'Organization Admin' ? 'bg-primary/10 text-primary' : u.role === 'Security Officer' ? 'bg-warning/10 text-warning' : u.role === 'Auditor' ? 'bg-danger/10 text-danger' : 'bg-surface-light text-text-secondary'}`}>{u.role}</span> },
    { key: 'organization', label: 'Organization' },
    { key: 'status', label: 'Status', render: (u: User) => <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.status === 'Active' ? 'bg-success/10 text-success' : u.status === 'Pending Invitation' ? 'bg-warning/10 text-warning' : 'bg-surface-light text-text-muted'}`}>{u.status}</span> },
    { key: 'mfa', label: 'MFA', render: (u: User) => <span className={`text-xs ${u.mfaEnabled ? 'text-success' : 'text-text-muted'}`}>{u.mfaEnabled ? 'Enabled' : 'Disabled'}</span> },
    { key: 'actions', label: '', render: (u: User) => <div className="flex items-center gap-1">
      <button onClick={() => openEdit(u)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-primary hover:bg-info-light transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
      <button onClick={() => setConfirmDelete(u.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger-light transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
    </div> },
  ];

  const activeCount = users.filter(u => u.status === 'Active').length;
  const mfaRate = users.length > 0 ? Math.round((users.filter(u => u.mfaEnabled).length / users.length) * 100) : 0;

  return (
    <AccessGuard page="users">
    <div className="animate-fade-in">
      <Breadcrumbs items={[{ label: 'Users & Access Management' }]} />
      <PageHeader title="Users & Access Management" subtitle="A.5.15–A.5.18 — Access Control & Identity Management" icon={<Users className="w-4 h-4" />} action={<div className="flex gap-2"><Button variant="ghost" onClick={() => exportToCSV(users, 'users', [{key:'firstName',label:'First Name'},{key:'lastName',label:'Last Name'},{key:'email',label:'Email'},{key:'role',label:'Role'},{key:'organization',label:'Organization'},{key:'status',label:'Status'}])}><Download className="w-3.5 h-3.5" /> CSV</Button><Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Create User</Button></div>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 stagger">
        <StatsCard title="Users" value={users.length} icon={<Users className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
        <StatsCard title="Active" value={activeCount} icon={<UserCheck className="w-4 h-4 text-success" />} iconBg="bg-success-light" />
        <StatsCard title="MFA Enabled" value={`${mfaRate}%`} icon={<Shield className="w-4 h-4 text-primary" />} iconBg="bg-info-light" />
        <StatsCard title="Pending" value={users.filter(u => u.status === 'Pending Invitation').length} icon={<Eye className="w-4 h-4 text-warning" />} iconBg="bg-warning-light" />
      </div>
      {/* Search & Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="flex items-center gap-2 bg-bg border border-border rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-text-muted flex-shrink-0" />
          <input className="bg-transparent text-sm flex-1 outline-none text-text-primary placeholder:text-text-muted/50"
            placeholder="Search name, email, organization…" value={search} onChange={e => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch('')}><X className="w-3 h-3 text-text-muted hover:text-text-primary" /></button>}
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
          <option value="">All Roles</option>
          <option>Employee</option><option>ISMS Manager</option><option>Security Officer</option>
          <option>Auditor</option><option>Organization Admin</option><option>Super Admin</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none">
          <option value="">All Statuses</option>
          <option>Active</option><option>Inactive</option><option>Pending Invitation</option>
        </select>
      </div>
      {loading ? <div className="text-center py-16 text-text-muted text-sm">Loading...</div> :
        users.length === 0 ? <EmptyState title="No users added" description="Create user accounts, assign roles, manage MFA, and conduct periodic access reviews." icon={<Users className="w-7 h-7 text-primary/40" />} action={<Button onClick={openCreate}><Plus className="w-3.5 h-3.5" /> Create User</Button>} /> :
        <DataTable columns={columns} data={filteredUsers} />
      }
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit User' : 'Create User'} size="lg">
        <form className="space-y-4" onSubmit={handleSubmit} autoComplete="off">
          {formError && (
            <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 rounded-lg animate-fade-in">
              <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
              <p className="text-sm text-danger">{formError}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" placeholder="First name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} autoComplete="off" />
            <Input label="Last Name" placeholder="Last name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} autoComplete="off" />
          </div>
          <Input label="Email" type="email" placeholder="name@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} autoComplete="off" />
          <Input label={editingId ? "Password (leave blank to keep current)" : "Password"} type="password" placeholder={editingId ? "Leave blank to keep current password" : "Enter a strong password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Role" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option>Employee</option><option>ISMS Manager</option><option>Security Officer</option><option>Auditor</option><option>Organization Admin</option><option>Super Admin</option>
            </Select>
            <Select label="Organization" value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })}>
              <option>Default Organization</option>
            </Select>
          </div>
          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option>Active</option><option>Inactive</option><option>Pending Invitation</option>
          </Select>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (editingId ? 'Update User' : 'Create Account')}
            </Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
            <ConfirmDialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} onConfirm={() => { if (confirmDelete) { handleDelete(confirmDelete); setConfirmDelete(null); } }} />
    </div>
    </AccessGuard>
  );
}
