'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider } from '@/context/SidebarContext';
import { useSidebar } from '@/context/SidebarContext';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { ToastProvider } from '@/components/ui';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();
  const sidebarWidth = collapsed ? '60px' : '240px';
  
  return (
    <>
      <Sidebar />
      <div
        className="min-h-screen bg-bg flex flex-col"
        style={{ paddingLeft: sidebarWidth, transition: 'padding-left 0.2s ease' }}
      >
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <ToastProvider />
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Show nothing while checking auth, or if not authenticated (will redirect)
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
