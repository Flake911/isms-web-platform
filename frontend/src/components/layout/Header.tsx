'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';
import { Search, Bell, ChevronDown, LogOut, User, Settings, X, Check, Shield, AlertTriangle, FileText, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPut } from '@/lib/api';

interface SearchResult { id: string; name: string; module: string; }
interface Notification { id: string; title: string; message: string; type: string; link?: string; read: boolean; createdAt: string; }

const moduleIcons: Record<string, string> = {
  risks: '⚠️', controls: '🛡️', assets: '📦', incidents: '🚨', policies: '📋',
  audits: '📝', vendors: '🚛', training: '🎓', capa: '🔄', threats: '⚡',
  evidence: '📁', legal: '⚖️',
};

export default function Header() {
  const { collapsed } = useSidebar();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const [notifs, countData] = await Promise.all([
        apiGet<Notification[]>('/notifications'),
        apiGet<number>('/notifications/unread-count'),
      ]);
      setNotifications(notifs);
      setUnreadCount(typeof countData === 'number' ? countData : 0);
    } catch (e) { /* silent fail if not authed */ }
  }, []);

  useEffect(() => { fetchNotifications(); const i = setInterval(fetchNotifications, 30000); return () => clearInterval(i); }, [fetchNotifications]);

  // Search debounce
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); setShowSearch(false); return; }
    const timer = setTimeout(async () => {
      try {
        const results = await apiGet<SearchResult[]>(`/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(results);
        setShowSearch(true);
      } catch (e) { console.error(e); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearchSelect = (result: SearchResult) => {
    setShowSearch(false); setSearchQuery('');
    router.push(`/${result.module}`);
  };

  const handleMarkAllRead = async () => {
    try { await apiPut('/notifications/mark-all-read', {}); fetchNotifications(); } catch (e) { console.error(e); }
  };

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.read) { try { await apiPut(`/notifications/${notif.id}/read`, {}); fetchNotifications(); } catch (e) {} }
    if (notif.link) router.push(notif.link);
    setShowNotifications(false);
  };

  const handleSignOut = () => { setShowProfile(false); logout(); };
  const handleSettings = () => { setShowProfile(false); router.push('/settings'); };

  const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'A';
  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Admin';
  const displayRole = user?.role || 'Admin';

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 bg-surface/95 backdrop-blur-sm border-b border-border flex-shrink-0">
      {/* Global Search */}
      <div ref={searchRef} className="relative w-full max-w-sm">
        <div className="flex items-center gap-2.5 px-3 py-2 bg-bg border border-border rounded-xl hover:border-border-light focus-within:border-primary/50 transition-all">
          <Search className="w-4 h-4 text-text-muted flex-shrink-0" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search risks, controls, assets…"
            className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted/50 outline-none border-none min-w-0"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setShowSearch(false); }}
              className="text-text-muted hover:text-text-primary flex-shrink-0 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {showSearch && searchResults.length > 0 && (
          <div className="absolute top-full mt-2 left-0 w-full bg-surface border border-border rounded-2xl shadow-2xl max-h-80 overflow-y-auto animate-slide-down z-50">
            <div className="px-3 py-2 border-b border-border/50">
              <span className="text-[10px] text-text-muted uppercase tracking-widest font-semibold">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</span>
            </div>
            {searchResults.map(r => (
              <button key={`${r.module}-${r.id}`} onClick={() => handleSearchSelect(r)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-light transition-all">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-sm flex-shrink-0">
                  {moduleIcons[r.module] || '📄'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate font-medium">{r.name}</p>
                  <p className="text-[10px] text-text-muted capitalize">{r.module}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        {showSearch && searchQuery.length >= 2 && searchResults.length === 0 && (
          <div className="absolute top-full mt-2 left-0 w-full bg-surface border border-border rounded-2xl shadow-2xl p-6 text-center animate-slide-down z-50">
            <p className="text-sm text-text-muted">No results for &ldquo;{searchQuery}&rdquo;</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5 ml-4">
        {/* Notifications Bell */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-secondary hover:bg-surface-light transition-all">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-0.5 bg-danger rounded-full text-[10px] text-white font-bold flex items-center justify-center animate-pulse-dot">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 bg-surface rounded-2xl border border-border shadow-2xl animate-slide-down z-50 max-h-[420px] flex flex-col overflow-hidden">
              <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-accent to-primary/20" />
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <h3 className="text-xs font-bold text-text-primary">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead}
                    className="flex items-center gap-1 text-[10px] text-primary hover:text-primary-light transition-colors font-medium">
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-text-muted/20 mx-auto mb-3" />
                    <p className="text-sm text-text-muted">No notifications yet</p>
                  </div>
                ) : notifications.slice(0, 20).map(n => (
                  <button key={n.id} onClick={() => handleNotifClick(n)}
                    className={`w-full text-left px-4 py-3 border-b border-border/50 last:border-0 hover:bg-surface-light transition-all ${!n.read ? 'bg-primary/5' : ''}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        n.type === 'danger' ? 'bg-danger' :
                        n.type === 'warning' ? 'bg-warning' :
                        n.type === 'success' ? 'bg-success' : 'bg-primary'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-primary truncate">{n.title}</p>
                        <p className="text-[11px] text-text-muted line-clamp-2 mt-0.5">{n.message}</p>
                        <p className="text-[10px] text-text-muted/60 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-surface-light transition-all">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-sm font-medium text-text-secondary block leading-tight">{displayName}</span>
              <span className="text-[10px] text-text-muted block leading-tight">{displayRole}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted hidden sm:inline" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-60 bg-surface rounded-2xl border border-border shadow-2xl animate-slide-down z-50 overflow-hidden">
              <div className="h-0.5 w-full bg-gradient-to-r from-primary/40 via-accent to-primary/20" />
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">{displayName}</p>
                    <p className="text-[11px] text-text-muted truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">{displayRole}</span>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <button onClick={handleSettings}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-text-secondary hover:bg-surface-light hover:text-text-primary transition-all">
                  <User className="w-3.5 h-3.5" /> Profile
                </button>
                <button onClick={handleSettings}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-text-secondary hover:bg-surface-light hover:text-text-primary transition-all">
                  <Settings className="w-3.5 h-3.5" /> Settings
                </button>
                <div className="border-t border-border my-1.5 mx-1" />
                <button onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-danger hover:bg-danger/10 transition-all">
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
