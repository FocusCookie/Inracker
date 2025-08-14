import { DBResistance } from "@/types/resistances";
import { create } from "zustand";

interface ResistanceState {
  resistances: DBResistance[];
  isCreateResistanceDrawerOpen: boolean;
  isEditResistanceDrawerOpen: boolean;
  isCreatingResistance: boolean;
  isResistanceCatalogOpen: boolean;
  selectedResistance: DBResistance | null;
  openCreateResistanceDrawer: () => void;
  closeCreateResistanceDrawer: () => void;
  setIsCreatingResistance: (state: boolean) => void;
  openResistancesCatalog: () => void;
  closeResistancesCatalog: () => void;
  openEditResistanceDrawer: () => void;
  closeEditResistanceDrawer: () => void;
  setSelectedResistance: (resistance: DBResistance | null) => void;
}

export const useResistancesStore = create<ResistanceState>((set) => ({
  resistances: [],
  isCreateResistanceDrawerOpen: false,
  isCreatingResistance: false,
  isResistanceCatalogOpen: false,
  isEditResistanceDrawerOpen: false,
  selectedResistance: null,

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
  openEditResistanceDrawer: () => set({ isEditResistanceDrawerOpen: true }),
  closeEditResistanceDrawer: () => set({ isEditResistanceDrawerOpen: false }),
  setSelectedResistance: (resistance: DBResistance | null) =>
    set({ selectedResistance: resistance }),
}));
