import { Party } from "@/types/party";
import { create } from "zustand";

interface PartyStoreState {
  isCreateDrawerOpen: boolean;
  isEditDrawerOpen: boolean;
  editingParty: Party | null;
  currentParty: Party["id"] | null;

  openCreateDrawer: () => void;
  closeCreateDrawer: () => void;
  openEditDrawer: (party: Party) => void;
  closeEditDrawer: () => void;
  setCurrentParty: (partyId: Party["id"]) => void;
}

export const usePartyStore = create<PartyStoreState>((set) => ({
  isCreateDrawerOpen: false,
  isEditDrawerOpen: false,
  editingParty: null,
  currentParty: null,

  openCreateDrawer: () => set({ isCreateDrawerOpen: true }),
  closeCreateDrawer: () => set({ isCreateDrawerOpen: false }),
  openEditDrawer: (party) =>
    set({ isEditDrawerOpen: true, editingParty: party }),
  closeEditDrawer: () => set({ isEditDrawerOpen: false, editingParty: null }),
  setCurrentParty: (partyId: Party["id"]) => set({ currentParty: partyId }),
}));
