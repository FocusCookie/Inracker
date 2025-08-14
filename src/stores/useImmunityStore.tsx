import { DBImmunity } from "@/types/immunitiy";
import { create } from "zustand";

interface ImmunityState {
  immunities: DBImmunity[];
  isCreateImmunityDrawerOpen: boolean;
  isEditImmunityDrawerOpen: boolean;
  isCreatingImmunity: boolean;
  isImmunitiesCatalogOpen: boolean;
  selectedImmunity: DBImmunity | null;
  openCreateImmunityDrawer: () => void;
  closeCreateImmunityDrawer: () => void;
  closeEditImmunityDrawer: () => void;
  openEditImmunityDrawer: () => void;
  openImmunititesCatalog: () => void;
  closeImmunitiesCatalog: () => void;
  setIsCreatingImmunity: (state: boolean) => void;
  setSelectedImmunity: (immunity: DBImmunity | null) => void;
}

export const useImmunityStore = create<ImmunityState>((set) => ({
  immunities: [],
  isCreateImmunityDrawerOpen: false,
  isEditImmunityDrawerOpen: false,
  isCreatingImmunity: false,
  isImmunitiesCatalogOpen: false,
  selectedImmunity: null,

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
  closeEditImmunityDrawer: () => set({ isEditImmunityDrawerOpen: false }),
  openEditImmunityDrawer: () => set({ isEditImmunityDrawerOpen: true }),
  setSelectedImmunity: (immunity: DBImmunity | null) =>
    set({ selectedImmunity: immunity }),
}));
