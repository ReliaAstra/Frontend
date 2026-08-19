'use client';

import { useEffect, useState } from 'react';
import { usePartnerStore } from '@/stores/partner-store';
import { PublicLayout } from '@/components/partner/public/public-layout';
import { DashboardLayout } from '@/components/partner/dashboard/dashboard-layout';
import type { PartnerPage } from '@/types/partner';

const dashboardPages: PartnerPage[] = [
  'dashboard',
  'referrals',
  'earnings',
  'payouts',
  'settings',
];

export default function Home() {
  const currentPage = usePartnerStore((s) => s.currentPage);
  const authStatus = usePartnerStore((s) => s.authStatus);
  const user = usePartnerStore((s) => s.user);
  const navigate = usePartnerStore((s) => s.navigate);
  const setAuthStatus = usePartnerStore((s) => s.setAuthStatus);
  const setUser = usePartnerStore((s) => s.setUser);
  const [mounted, setMounted] = useState(false);

  // Hydrate auth state from server on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setAuthStatus('authenticated');
        } else {
          setAuthStatus('unauthenticated');
        }
      } catch {
        setAuthStatus('unauthenticated');
      }
      setMounted(true);
    };
    checkAuth();
  }, [setUser, setAuthStatus]);

  // Redirect unauthenticated users away from dashboard pages
  useEffect(() => {
    if (!mounted) return;
    if (dashboardPages.includes(currentPage) && authStatus === 'unauthenticated') {
      navigate('login');
    }
  }, [currentPage, authStatus, mounted, navigate]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="animate-pulse text-foreground"
          >
            <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-mono text-xs tracking-widest uppercase text-muted-foreground">
            RELIASTRA
          </span>
        </div>
      </div>
    );
  }

  const isPublicPage = !dashboardPages.includes(currentPage);

  if (isPublicPage) {
    return <PublicLayout />;
  }

  // Dashboard pages: authenticated users
  if (authStatus === 'authenticated' && user) {
    return <DashboardLayout />;
  }

  // Fallback: redirect to home
  navigate('home');
  return null;
}
