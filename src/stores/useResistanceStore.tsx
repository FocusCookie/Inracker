import { DBResistance } from "@/types/resistances";
import { create } from "zustand";

interface ResistanceState {
  resistances: DBResistance[];
  isCreateResistanceDrawerOpen: boolean;
  isCreatingResistance: boolean;
  isResistanceCatalogOpen: boolean;
  openCreateResistanceDrawer: () => void;
  closeCreateResistanceDrawer: () => void;
  setIsCreatingResistance: (state: boolean) => void;
  openResistancesCatalog: () => void;
  closeResistancesCatalog: () => void;
}

export const useResistancesStore = create<ResistanceState>((set) => ({
  resistances: [],
  isCreateResistanceDrawerOpen: false,
  isCreatingResistance: false,
  isResistanceCatalogOpen: false,

  closeCreateResistanceDrawer: () => {
    set({ isCreateResistanceDrawerOpen: false });
  },
  openCreateResistanceDrawer: () => {
    set({ isCreateResistanceDrawerOpen: true });
  },
  setIsCreatingResistance: (state: boolean) => {
    set({ isCreatingResistance: state });
  },
  openResistancesCatalog: () => set({ isResistanceCatalogOpen: true }),
  closeResistancesCatalog: () => set({ isResistanceCatalogOpen: false }),
}));
