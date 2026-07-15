'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Breadcrumbs } from '@/components/ui';
import {
  Building2, Shield, Bell, Lock, Check, Loader2, Settings,
  User, KeyRound, ChevronRight, Save,
} from 'lucide-react';
import { apiGet, apiPut } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import AccessGuard from '@/components/AccessGuard';

const toKey = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, '_');

const configSections = [
  { id: 'organization', title: 'Organization', icon: Building2, settings: [
    { label: 'Organization Name', placeholder: 'Enter org name', type: 'text' },
    { label: 'Industry', placeholder: 'e.g. Automotive, Finance', type: 'text' },
    { label: 'Contact Email', placeholder: 'admin@company.com', type: 'email' },
    { label: 'Timezone', type: 'select', options: ['Europe/Berlin (CET)', 'UTC', 'US/Eastern', 'US/Pacific', 'Asia/Tokyo'] },
  ]},
  { id: 'isms', title: 'ISMS Configuration', icon: Shield, settings: [
    { label: 'Risk Method', type: 'select', options: ['Qualitative (5×5 Matrix)', 'Quantitative', 'Semi-Quantitative'] },
    { label: 'Risk Acceptance', type: 'select', options: ['≤ 4 (Low)', '≤ 8 (Medium)', '≤ 12 (High)'] },
    { label: 'Review Cycle', type: 'select', options: ['Monthly', 'Quarterly', 'Semi-Annually', 'Annually'] },
    { label: 'Standard', type: 'select', options: ['ISO 27001:2022', 'ISO 27001:2013'] },
  ]},
  { id: 'security', title: 'Security', icon: Lock, settings: [
    { label: 'Session Timeout', type: 'select', options: ['15 min', '30 min', '1 hour', '4 hours'] },
    { label: 'MFA Enforcement', type: 'select', options: ['Required for all', 'Required for admins', 'Optional'] },
    { label: 'Max Login Attempts', placeholder: 'Number', type: 'number' },
    { label: 'Retention Period', type: 'select', options: ['1 year', '3 years', '5 years', '7 years'] },
  ]},
  { id: 'notifications', title: 'Notifications', icon: Bell, settings: [
    { label: 'Email Notifications', type: 'select', options: ['Enabled', 'Disabled'] },
    { label: 'Risk Reminders', type: 'select', options: ['Daily', 'Weekly', 'Monthly'] },
    { label: 'Audit Deadline Alerts', type: 'select', options: ['3 days', '7 days', '14 days'] },
    { label: 'Incident Escalation', type: 'select', options: ['Immediate', '1 hour', '4 hours'] },
  ]},
];

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'organization', label: 'Organization', icon: Building2 },
  { id: 'isms', label: 'ISMS Configuration', icon: Shield },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Platform settings state
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile state
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '' });
  const [passwords, setPasswords] = useState({ current: '', newPwd: '', confirm: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState('');

  useEffect(() => {
    if (user) setProfile({ firstName: user.firstName, lastName: user.lastName, email: user.email });
  }, [user]);

  const loadSettings = useCallback(async () => {
    try { const data = await apiGet<Record<string, string>>('/settings'); setValues(data); }
    catch { /* backend may not have values yet */ }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleChange = (key: string, value: string) => { setValues(prev => ({ ...prev, [key]: value })); setSaved(false); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = await apiPut<Record<string, string>>('/settings', values);
      setValues(data); setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  const handleProfileSave = async () => {
    setProfileSaving(true); setProfileError(''); setProfileSaved(false);
    try {
      const updated = await apiPut<any>('/auth/me', { firstName: profile.firstName, lastName: profile.lastName, email: profile.email });
      updateUser({ firstName: updated.firstName, lastName: updated.lastName, email: updated.email });
      setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000);
    } catch (e: any) { setProfileError(e.message || 'Failed to save profile'); }
    finally { setProfileSaving(false); }
  };

  const handlePasswordSave = async () => {
    setPwdError(''); setPwdSaved(false);
    if (!passwords.current || !passwords.newPwd || !passwords.confirm) { setPwdError('All fields are required'); return; }
    if (passwords.newPwd !== passwords.confirm) { setPwdError('New passwords do not match'); return; }
    if (passwords.newPwd.length < 8) { setPwdError('Password must be at least 8 characters'); return; }
    setPwdSaving(true);
    try {
      await apiPut('/auth/me', { currentPassword: passwords.current, newPassword: passwords.newPwd });
      setPasswords({ current: '', newPwd: '', confirm: '' }); setPwdSaved(true); setTimeout(() => setPwdSaved(false), 3000);
    } catch (e: any) { setPwdError(e.message || 'Failed to update password'); }
    finally { setPwdSaving(false); }
  };

  const activeConfig = configSections.find(s => s.id === activeTab);

  return (
    <AccessGuard page="settings">
      <div className="animate-fade-in">
        <Breadcrumbs items={[{ label: 'Settings' }]} />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-info-light flex items-center justify-center">
            <Settings className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary tracking-tight">Settings</h1>
            <p className="text-xs text-text-muted">ISO 27001 — Platform & ISMS Configuration</p>
          </div>
        </div>

        <div className="flex gap-5">
          {/* Sidebar */}
          <div className="w-52 shrink-0">
            <div className="card overflow-hidden">
              {/* User card */}
              {user && (
                <div className="px-4 py-4 border-b border-border bg-bg/40">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center ring-2 ring-primary/20">
                      <span className="text-sm font-bold text-primary">{user.firstName[0]}{user.lastName[0]}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-text-primary leading-tight">{user.firstName} {user.lastName}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{user.role}</p>
                    </div>
                  </div>
                </div>
              )}
              {/* Tab list */}
              <nav className="p-1.5 space-y-0.5">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                        active
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-text-secondary hover:bg-bg hover:text-text-primary'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="flex-1 truncate">{tab.label}</span>
                      {active && <ChevronRight className="w-3 h-3 shrink-0" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* ── Profile Tab ── */}
            {activeTab === 'profile' && (
              <>
                {/* Personal info */}
                <div className="card overflow-hidden">
                  <div className="px-5 py-3 border-b border-border flex items-center gap-2.5 bg-bg/40">
                    <div className="w-7 h-7 rounded-lg bg-info-light flex items-center justify-center"><User className="w-3.5 h-3.5 text-primary" /></div>
                    <h3 className="text-sm font-semibold text-text-primary">Personal Information</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    {/* Avatar row */}
                    <div className="flex items-center gap-4 pb-4 border-b border-border">
                      <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center ring-2 ring-primary/20 shrink-0">
                        <span className="text-xl font-bold text-primary">
                          {profile.firstName?.[0] || ''}{profile.lastName?.[0] || ''}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{profile.firstName} {profile.lastName}</p>
                        <p className="text-xs text-text-muted">{user?.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{user?.role}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-text-muted mb-1.5 block">First Name</label>
                        <input
                          type="text"
                          value={profile.firstName}
                          onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))}
                          className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary hover:border-border-light transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-muted mb-1.5 block">Last Name</label>
                        <input
                          type="text"
                          value={profile.lastName}
                          onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))}
                          className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary hover:border-border-light transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-muted mb-1.5 block">Email Address</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary hover:border-border-light transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-muted mb-1.5 block">Organization</label>
                      <input
                        type="text"
                        value={user?.organization || ''}
                        disabled
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-muted cursor-not-allowed"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      {profileError && <p className="text-xs text-danger">{profileError}</p>}
                      {profileSaved && <span className="text-xs text-success flex items-center gap-1"><Check className="w-3 h-3" /> Profile saved</span>}
                      {!profileError && !profileSaved && <span />}
                      <button
                        onClick={handleProfileSave}
                        disabled={profileSaving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-all disabled:opacity-60"
                      >
                        {profileSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : <><Save className="w-3.5 h-3.5" /> Save Profile</>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Change password */}
                <div className="card overflow-hidden">
                  <div className="px-5 py-3 border-b border-border flex items-center gap-2.5 bg-bg/40">
                    <div className="w-7 h-7 rounded-lg bg-info-light flex items-center justify-center"><KeyRound className="w-3.5 h-3.5 text-primary" /></div>
                    <h3 className="text-sm font-semibold text-text-primary">Change Password</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <label className="text-xs font-medium text-text-muted mb-1.5 block">Current Password</label>
                      <input
                        type="password"
                        value={passwords.current}
                        onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
                        placeholder="Enter current password"
                        className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 hover:border-border-light transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-text-muted mb-1.5 block">New Password</label>
                        <input
                          type="password"
                          value={passwords.newPwd}
                          onChange={e => setPasswords(p => ({ ...p, newPwd: e.target.value }))}
                          placeholder="Min. 8 characters"
                          className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 hover:border-border-light transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-text-muted mb-1.5 block">Confirm Password</label>
                        <input
                          type="password"
                          value={passwords.confirm}
                          onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                          placeholder="Repeat new password"
                          className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 hover:border-border-light transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      {pwdError && <p className="text-xs text-danger">{pwdError}</p>}
                      {pwdSaved && <span className="text-xs text-success flex items-center gap-1"><Check className="w-3 h-3" /> Password updated</span>}
                      {!pwdError && !pwdSaved && <span />}
                      <button
                        onClick={handlePasswordSave}
                        disabled={pwdSaving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-all disabled:opacity-60"
                      >
                        {pwdSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...</> : <><KeyRound className="w-3.5 h-3.5" /> Update Password</>}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Config Tabs ── */}
            {activeConfig && (
              <div className="card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center gap-2.5 bg-bg/40">
                  <div className="w-7 h-7 rounded-lg bg-info-light flex items-center justify-center">
                    <activeConfig.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">{activeConfig.title}</h3>
                </div>
                <div className="p-5 space-y-5">
                  {activeConfig.settings.map(st => {
                    const key = toKey(st.label);
                    return (
                      <div key={st.label}>
                        <label className="text-xs font-medium text-text-muted mb-1.5 block">{st.label}</label>
                        {st.type === 'select' ? (
                          <select
                            value={values[key] || ''}
                            onChange={e => handleChange(key, e.target.value)}
                            className="w-full max-w-sm px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary hover:border-border-light transition-all"
                          >
                            <option value="">Select...</option>
                            {st.options?.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        ) : (
                          <input
                            type={st.type}
                            placeholder={st.placeholder}
                            value={values[key] || ''}
                            onChange={e => handleChange(key, e.target.value)}
                            className="w-full max-w-sm px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted/50 hover:border-border-light transition-all"
                          />
                        )}
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    {saved
                      ? <span className="text-xs text-success flex items-center gap-1"><Check className="w-3 h-3" /> Settings saved</span>
                      : <span />
                    }
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-all disabled:opacity-60"
                    >
                      {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AccessGuard>
  );
}
