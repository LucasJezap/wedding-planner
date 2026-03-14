"use client";

import { create } from "zustand";

type ShellState = {
  menuOpen: boolean;
  setMenuOpen: (menuOpen: boolean) => void;
  toggleMenu: () => void;
};

export const useShellStore = create<ShellState>((set) => ({
  menuOpen: false,
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  toggleMenu: () => set((state) => ({ menuOpen: !state.menuOpen })),
}));
