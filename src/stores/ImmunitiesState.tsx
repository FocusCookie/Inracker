import { toast } from "@/hooks/use-toast";
import db from "@/lib/database";
import { DBImmunity, Immunity } from "@/types/immunitiy";
import { create } from "zustand";

interface ImmunityState {
  immunities: DBImmunity[];
  isCreateDrawerOpen: boolean;
  isCreating: boolean;
  setIsCreateDrawerOpen: (isOpen: boolean) => void;
  createImmunity: (immunity: Immunity) => void;
  getAllImmunities: () => void;
}

export const useImmunityStore = create<ImmunityState>((set) => ({
  immunities: [],
  isCreateDrawerOpen: false,
  isCreating: false,

  setIsCreateDrawerOpen: (isOpen) => set({ isCreateDrawerOpen: isOpen }),
  createImmunity: async (immunity: Immunity) => {
    set({ isCreating: true });

    try {
      await db.immunitites.create(immunity);

      set({ isCreateDrawerOpen: false });
    } catch (error) {
      console.error("ImmunityStore: create an immunity error: ", error);
      //TODO: add translation
      toast({
        variant: "destructive",
        title: "Oopps something went wrong, please try again.",
        // @ts-ignore
        description: error?.message || undefined,
      });
    } finally {
      set({ isCreating: false });

      const immunities = await db.immunitites.getAll();
      set({ immunities });

      toast({
        variant: "default",
        title: `Created ${immunity.icon} ${immunity.name}`,
      });
    }
  },
  getAllImmunities: async () => {
    try {
      const immunities = await db.immunitites.getAll();

      set({ immunities });
    } catch (error) {
      console.error("ImmunityStore: get immunities error: ", error);
      //TODO: add translation
      toast({
        variant: "destructive",
        title: "Oopps something went wrong, please try again.",
        // @ts-ignore
        description: error?.message || undefined,
      });
    }
  },
}));
