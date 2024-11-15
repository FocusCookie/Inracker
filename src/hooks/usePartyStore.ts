import { Party } from "@/types/party";
import { create } from "zustand";
import db from "@/lib/database";

type PartyStore = {
  parties: Party[];
  createParty: (party: Omit<Party, "id">) => Promise<void>;
  deleteParty: (party: Party) => Promise<void>;
  getParties: () => Promise<void>;
  updateParty: (party: Party) => Promise<void>;
};

const usePartyStore = create<PartyStore>((set) => ({
  parties: [],
  createParty: async (party: Omit<Party, "id">) => {
    try {
      const createdParty = await db.parties.create(party);
      const detailedParty = await db.parties.getDetailedById(createdParty.id);

      set((state) => ({
        parties: [...state.parties, detailedParty],
      }));
    } catch (error) {
      console.error("Issue while adding a new party to the state and db");
      console.error(error);
    }
  },
  deleteParty: async (party: Party) =>
    set((state) => ({
      parties: state.parties.filter((pa) => pa.id !== party.id),
    })),
  getParties: async () => {
    const dbParties = await db.parties.getAll();
    const parties: Party[] = [];

    for (const dbParty of dbParties) {
      const party = await db.parties.getDetailedById(dbParty.id);
      parties.push(party);
    }

    set(() => ({
      parties: parties,
    }));
  },
  updateParty: async (party: Party) =>
    set((state) => {
      const parties: Party[] = [...state.parties];
      const indexOfPartyToUpdate = parties.findIndex(
        (pa) => pa.id === party.id,
      );

      if (indexOfPartyToUpdate !== -1) {
        parties[indexOfPartyToUpdate] = party;
      }

      return { parties };
    }),
}));

export default usePartyStore;
