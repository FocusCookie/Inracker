import { Player } from "@/types/player";
import { create } from "zustand";

interface PlayerState {
  isCreatePlayerDrawerOpen: boolean;
  isEditPlayerDrawerOpen: boolean;
  isCreatingPlayer: boolean;
  isUpdatingPlayer: boolean;
  selectedPlayer: Player | null;
  isPlayersCatalogOpen: boolean;

  setSelectedPlayer: (player: Player | null) => void;
  openCreatePlayerDrawer: () => void;
  closeCreatePlayerDrawer: () => void;
  openEditPlayerDrawer: () => void;
  closeEditPlayerDrawer: () => void;
  setIsCreatingPlayer: (state: boolean) => void;
  setIsUpdatingPlayer: (state: boolean) => void;
  openPlayersCatalog: () => void;
  closePlayersCatalog: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isCreatePlayerDrawerOpen: false,
  isEditPlayerDrawerOpen: false,
  isCreatingPlayer: false,
  isUpdatingPlayer: false,
  selectedPlayer: null,
  isPlayersCatalogOpen: false,

  setSelectedPlayer: (player: Player | null) => set({ selectedPlayer: player }),
  openCreatePlayerDrawer: () => set({ isCreatePlayerDrawerOpen: true }),
  closeCreatePlayerDrawer: () => set({ isCreatePlayerDrawerOpen: false }),
  openEditPlayerDrawer: () => set({ isEditPlayerDrawerOpen: true }),
  closeEditPlayerDrawer: () =>
    set({ isEditPlayerDrawerOpen: false, selectedPlayer: null }),
  setIsCreatingPlayer: (state: boolean) => set({ isCreatingPlayer: state }),
  setIsUpdatingPlayer: (state: boolean) => set({ isUpdatingPlayer: state }),
  openPlayersCatalog: () => set({ isPlayersCatalogOpen: true }),
  closePlayersCatalog: () => set({ isPlayersCatalogOpen: false }),
}));
