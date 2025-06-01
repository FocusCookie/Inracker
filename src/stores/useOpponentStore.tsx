import { Opponent } from "@/types/opponents";
import { create } from "zustand";

interface OpponentState {
  isCreateOpponentDrawerOpen: boolean;
  isEditOpponentDrawerOpen: boolean;
  isCreatingOpponent: boolean;
  isUpdatingOpponent: boolean;
  selectedOpponent: Opponent | null;
  isOpponentsCatalogOpen: boolean;

  setSelectedOpponent: (opponent: Opponent | null) => void;
  openCreateOpponentDrawer: () => void;
  closeCreateOpponentDrawer: () => void;
  openEditOpponentDrawer: () => void;
  closeEditOpponentDrawer: () => void;
  setIsCreatingOpponent: (state: boolean) => void;
  setIsUpdatingOpponent: (state: boolean) => void;
  openOpponentsCatalog: () => void;
  closeOpponentsCatalog: () => void;
}

export const useOpponentStore = create<OpponentState>((set) => ({
  isCreateOpponentDrawerOpen: false,
  isEditOpponentDrawerOpen: false,
  isCreatingOpponent: false,
  isUpdatingOpponent: false,
  selectedOpponent: null,
  isOpponentsCatalogOpen: false,

  setSelectedOpponent: (opponent: Opponent | null) =>
    set({ selectedOpponent: opponent }),
  openCreateOpponentDrawer: () => set({ isCreateOpponentDrawerOpen: true }),
  closeCreateOpponentDrawer: () => set({ isCreateOpponentDrawerOpen: false }),
  openEditOpponentDrawer: () => set({ isEditOpponentDrawerOpen: true }),
  closeEditOpponentDrawer: () =>
    set({ isEditOpponentDrawerOpen: false, selectedOpponent: null }),
  setIsCreatingOpponent: (state: boolean) => set({ isCreatingOpponent: state }),
  setIsUpdatingOpponent: (state: boolean) => set({ isUpdatingOpponent: state }),
  openOpponentsCatalog: () => set({ isOpponentsCatalogOpen: true }),
  closeOpponentsCatalog: () => set({ isOpponentsCatalogOpen: false }),
}));
