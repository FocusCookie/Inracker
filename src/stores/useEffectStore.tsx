import { Effect } from "@/types/effect";
import { create } from "zustand";

interface EffectState {
  isCreateEffectDrawerOpen: boolean;
  isEffectsCatalogOpen: boolean;
  selectedEffect: null | Effect;
  isEditingEffectDrawerOpen: boolean;
  openCreateEffectDrawer: () => void;
  closeCreateEffectDrawer: () => void;
  openEffectsCatalog: () => void;
  closeEffectsCatalog: () => void;
  setSelectedEffect: (effect: Effect | null) => void;
  openEditEffectDrawer: () => void;
  closeEditEffectDrawer: () => void;
}

export const useEffectStore = create<EffectState>((set) => ({
  isCreateEffectDrawerOpen: false,
  isEffectsCatalogOpen: false,
  selectedEffect: null,
  isEditingEffectDrawerOpen: false,

  closeCreateEffectDrawer: () => {
    set({ isCreateEffectDrawerOpen: false });
  },
  openCreateEffectDrawer: () => {
    set({ isCreateEffectDrawerOpen: true });
  },
  closeEffectsCatalog: () => set({ isEffectsCatalogOpen: false }),
  openEffectsCatalog: () => set({ isEffectsCatalogOpen: true }),
  setSelectedEffect: (effect: Effect | null) => set({ selectedEffect: effect }),
  openEditEffectDrawer: () => set({ isEditingEffectDrawerOpen: true }),
  closeEditEffectDrawer: () => set({ isEditingEffectDrawerOpen: false }),
}));
