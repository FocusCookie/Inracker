import { DBEffect } from "@/types/effect";
import { create } from "zustand";

interface EffectState {
  effects: DBEffect[];
  isCreateEffectDrawerOpen: boolean;
  isCreatingEffect: boolean;
  isEffectsCatalogOpen: boolean;
  openCreateEffectDrawer: () => void;
  closeCreateEffectDrawer: () => void;
  openEffectsCatalog: () => void;
  closeEffectsCatalog: () => void;
  setIsCreatingEffect: (state: boolean) => void;
}

export const useEffectStore = create<EffectState>((set) => ({
  effects: [],
  isCreateEffectDrawerOpen: false,
  isCreatingEffect: false,
  isEffectsCatalogOpen: false,

  closeCreateEffectDrawer: () => {
    set({ isCreateEffectDrawerOpen: false });
  },
  openCreateEffectDrawer: () => {
    set({ isCreateEffectDrawerOpen: true });
  },
  setIsCreatingEffect: (state: boolean) => {
    set({ isCreatingEffect: state });
  },
  closeEffectsCatalog: () => set({ isEffectsCatalogOpen: false }),
  openEffectsCatalog: () => set({ isEffectsCatalogOpen: true }),
}));
