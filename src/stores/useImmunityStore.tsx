import { DBImmunity } from "@/types/immunitiy";
import { create } from "zustand";

interface ImmunityState {
  immunities: DBImmunity[];
  isCreateImmunityDrawerOpen: boolean;
  isCreatingImmunity: boolean;
  isImmunitiesCatalogOpen: boolean;
  openCreateImmunityDrawer: () => void;
  closeCreateImmunityDrawer: () => void;
  openImmunititesCatalog: () => void;
  closeImmunitiesCatalog: () => void;
  setIsCreatingImmunity: (state: boolean) => void;
}

export const useImmunityStore = create<ImmunityState>((set) => ({
  immunities: [],
  isCreateImmunityDrawerOpen: false,
  isCreatingImmunity: false,
  isImmunitiesCatalogOpen: false,

  closeCreateImmunityDrawer: () => {
    set({ isCreateImmunityDrawerOpen: false });
  },
  openCreateImmunityDrawer: () => {
    set({ isCreateImmunityDrawerOpen: true });
  },
  setIsCreatingImmunity: (state: boolean) => {
    set({ isCreatingImmunity: state });
  },
  closeImmunitiesCatalog: () => set({ isImmunitiesCatalogOpen: false }),
  openImmunititesCatalog: () => set({ isImmunitiesCatalogOpen: true }),
}));
