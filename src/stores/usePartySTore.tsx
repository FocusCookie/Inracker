import { Party } from "@/types/party";
import { create } from "zustand";

interface PartyStoreState {
  isCreateDrawerOpen: boolean;
  isEditDrawerOpen: boolean;
  editingParty: Party | null;

  openCreateDrawer: () => void;
  closeCreateDrawer: () => void;
  openEditDrawer: (party: Party) => void;
  closeEditDrawer: () => void;
}

export const usePartyStore = create<PartyStoreState>((set) => ({
  isCreateDrawerOpen: false,
  isEditDrawerOpen: false,
  editingParty: null,

  openCreateDrawer: () => set({ isCreateDrawerOpen: true }),
  closeCreateDrawer: () => set({ isCreateDrawerOpen: false }),

  openEditDrawer: (party) =>
    set({ isEditDrawerOpen: true, editingParty: party }),
  closeEditDrawer: () => set({ isEditDrawerOpen: false, editingParty: null }),
}));
