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

// URL integration: the source partner-network app was a single-page app that
// kept the current page purely in the zustand store. Mounted on main's app
// router under /partner, each PartnerPage gets a real URL so deep links,
// refreshes and the browser back/forward buttons keep working.
// Store <-> URL syncing is handled here so the rest of the partner
// implementation is untouched.
const PARTNER_ROOT = '/partner';

const pagePaths: Record<PartnerPage, string> = {
  home: PARTNER_ROOT,
  earn: `${PARTNER_ROOT}/earn`,
  'how-it-works': `${PARTNER_ROOT}/how-it-works`,
  commission: `${PARTNER_ROOT}/commission`,
  faq: `${PARTNER_ROOT}/faq`,
  resources: `${PARTNER_ROOT}/resources`,
  apply: `${PARTNER_ROOT}/apply`,
  login: `${PARTNER_ROOT}/login`,
  signup: `${PARTNER_ROOT}/signup`,
  activation: `${PARTNER_ROOT}/activation`,
  'forgot-password': `${PARTNER_ROOT}/forgot-password`,
  support: `${PARTNER_ROOT}/support`,
  privacy: `${PARTNER_ROOT}/privacy`,
  terms: `${PARTNER_ROOT}/terms`,
  dashboard: `${PARTNER_ROOT}/dashboard`,
  referrals: `${PARTNER_ROOT}/dashboard/referrals`,
  earnings: `${PARTNER_ROOT}/dashboard/earnings`,
  payouts: `${PARTNER_ROOT}/dashboard/payouts`,
  settings: `${PARTNER_ROOT}/dashboard/settings`,
};

const pathPages: Record<string, PartnerPage> = Object.fromEntries(
  Object.entries(pagePaths).map(([page, path]) => [path, page as PartnerPage])
);

function normalizePath(pathname: string): string {
  let path = pathname;
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  return path;
}

function pageFromPath(pathname: string): PartnerPage {
  return pathPages[normalizePath(pathname)] ?? 'home';
}

export function PartnerApp() {
  const currentPage = usePartnerStore((s) => s.currentPage);
  const authStatus = usePartnerStore((s) => s.authStatus);
  const user = usePartnerStore((s) => s.user);
  const navigate = usePartnerStore((s) => s.navigate);
  const setAuthStatus = usePartnerStore((s) => s.setAuthStatus);
  const setUser = usePartnerStore((s) => s.setUser);
  const [mounted, setMounted] = useState(false);

  // Sync the store from the URL on entry (deep links) and on browser
  // history navigation (back/forward). pushState does not fire popstate,
  // so this never loops with the URL-mirroring effect below.
  useEffect(() => {
    const syncFromLocation = () => {
      const urlPage = pageFromPath(window.location.pathname);
      if (usePartnerStore.getState().currentPage !== urlPage) {
        navigate(urlPage);
      }
    };
    syncFromLocation();
    window.addEventListener('popstate', syncFromLocation);
    return () => window.removeEventListener('popstate', syncFromLocation);
  }, [navigate]);

  // Mirror store navigation into the address bar.
  useEffect(() => {
    const path = pagePaths[currentPage];
    if (path && normalizePath(window.location.pathname) !== path) {
      window.history.pushState(null, '', path);
    }
  }, [currentPage]);

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
  // Redirect to home if authenticated user tries a non-existent dashboard page
  useEffect(() => {
    if (!mounted) return;
    const isDashboardPage = dashboardPages.includes(currentPage);
    if (isDashboardPage && authStatus === 'unauthenticated') {
      navigate('login');
      return;
    }
    // Fallback: redirect non-authenticated users from dashboard pages to home
    if (isDashboardPage && authStatus !== 'unauthenticated' && authStatus !== 'authenticated') {
      navigate('home');
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

  // For dashboard pages that aren't yet authenticated, show nothing (useEffect handles redirect)
  if (dashboardPages.includes(currentPage)) {
    return null;
  }

  // Public pages fallback
  return <PublicLayout />;
}
