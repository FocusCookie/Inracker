import { toast } from "@/hooks/use-toast";
import db from "@/lib/database";
import { DBResistance, Resistance } from "@/types/resistances";
import { create } from "zustand";

interface ResistanceState {
  resistances: DBResistance[];
  isCreateDrawerOpen: boolean;
  isCreating: boolean;
  setIsCreateDrawerOpen: (isOpen: boolean) => void;
  createResistance: (Resistance: Resistance) => void;
  getAllResistances: () => void;
}

export const useResistancesStore = create<ResistanceState>((set) => ({
  resistances: [],
  isCreateDrawerOpen: false,
  isCreating: false,

  setIsCreateDrawerOpen: (isOpen) => set({ isCreateDrawerOpen: isOpen }),
  createResistance: async (resistance: Resistance) => {
    set({ isCreating: true });

    try {
      await db.resistances.create(resistance);

      set({ isCreateDrawerOpen: false });
    } catch (error) {
      console.error("ResistancesStore: create an resistance error: ", error);
      //TODO: add translation
      toast({
        variant: "destructive",
        title: "Oopps something went wrong, please try again.",
        // @ts-ignore
        description: error?.message || undefined,
      });
    } finally {
      set({ isCreating: false });

      const resistances = await db.resistances.getAll();
      set({ resistances });

      toast({
        variant: "default",
        title: `Created ${resistance.icon} ${resistance.name}`,
      });
    }
  },
  getAllResistances: async () => {
    try {
      const resistances = await db.resistances.getAll();

      set({ resistances });
    } catch (error) {
      console.error("ResistancesStore: get resistances error: ", error);
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
