'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

export function normalizePartnerPath(path: string) {
  if (!path.startsWith('/')) return `/${path}`;
  return path;
}

function getProductOrigin() {
  if (typeof window === 'undefined') return '';

  const host = window.location.host;
  if (host === 'partnership.frontend.zevcloud.app') return 'https://frontend.zevcloud.app';
  if (host === 'partners.reliastra.com' || host === 'partnership.reliastra.com') return 'https://reliastra.com';
  return '';
}

export function usePartnerHref() {
  const pathname = usePathname();

  return useMemo(() => {
    const prefixed = pathname === '/partner' || pathname.startsWith('/partner/');

    return (path = '/') => {
      const normalized = normalizePartnerPath(path);
      if (!prefixed) return normalized;
      if (normalized === '/') return '/partner';
      return `/partner${normalized}`;
    };
  }, [pathname]);
}

export function useProductHref() {
  const pathname = usePathname();

  return useMemo(() => {
    const origin = getProductOrigin();

    return (path = '/') => {
      const normalized = normalizePartnerPath(path);
      return origin ? `${origin}${normalized}` : normalized;
    };
  }, [pathname]);
}
