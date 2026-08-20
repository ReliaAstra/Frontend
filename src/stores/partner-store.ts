'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PartnerUser, PartnerPage, PartnerDashboardData, Referral, Commission, Payout } from '@/types/partner';

type PartnerAuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface PartnerStore {
  // Navigation
  currentPage: PartnerPage;
  previousPage: PartnerPage | null;
  intendedDestination: PartnerPage | null;
  navigate: (page: PartnerPage) => void;
  setIntendedDestination: (page: PartnerPage) => void;

  // Auth
  authStatus: PartnerAuthStatus;
  user: PartnerUser | null;
  setAuthStatus: (status: PartnerAuthStatus) => void;
  setUser: (user: PartnerUser | null) => void;

  // Partner data
  dashboardData: PartnerDashboardData | null;
  referrals: Referral[];
  commissions: Commission[];
  payouts: Payout[];
  setDashboardData: (data: PartnerDashboardData) => void;
  setReferrals: (data: Referral[]) => void;
  setCommissions: (data: Commission[]) => void;
  setPayouts: (data: Payout[]) => void;

  // UI state
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  currentPage: 'home' as PartnerPage,
  previousPage: null as PartnerPage | null,
  intendedDestination: null as PartnerPage | null,
  authStatus: 'idle' as PartnerAuthStatus,
  user: null as PartnerUser | null,
  dashboardData: null as PartnerDashboardData | null,
  referrals: [] as Referral[],
  commissions: [] as Commission[],
  payouts: [] as Payout[],
  isSidebarOpen: false,
};

export const usePartnerStore = create<PartnerStore>()(
  persist(
    (set) => ({
      ...initialState,

      navigate: (page) =>
        set((state) => ({
          previousPage: state.currentPage,
          currentPage: page,
        })),

      setIntendedDestination: (page) =>
        set({ intendedDestination: page }),

      setAuthStatus: (authStatus) => set({ authStatus }),
      setUser: (user) => set({ user }),

      setDashboardData: (data) => set({ dashboardData: data }),
      setReferrals: (data) => set({ referrals: data }),
      setCommissions: (data) => set({ commissions: data }),
      setPayouts: (data) => set({ payouts: data }),

      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      reset: () => set(initialState),
    }),
    {
      name: 'partner-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        authStatus: state.authStatus,
      }),
    }
  )
);