"use client";

import { create } from "zustand";

/**
 * Lightweight UI state shared across the dashboard shell.
 * Kept intentionally small: command palette visibility + recent navigation
 * (for the palette's "Recent" section).
 */

export interface RecentPage {
  label: string;
  href: string;
  icon?: string;
}

interface UiState {
  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  recentPages: RecentPage[];
  pushRecentPage: (page: RecentPage) => void;
}

const MAX_RECENT = 3;

export const useUiStore = create<UiState>((set) => ({
  commandPaletteOpen: false,
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  toggleCommandPalette: () =>
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  recentPages: [],
  pushRecentPage: (page) =>
    set((state) => {
      const filtered = state.recentPages.filter((p) => p.href !== page.href);
      return { recentPages: [page, ...filtered].slice(0, MAX_RECENT) };
    }),
}));
