/* import { Party } from "@/types/party";
import { create } from "zustand";

type PartysStore = {
  partys: Party[];
  addParty: (party: Omit<Party, "id">) => Promise<void>;
  deleteParty: (party: Party) => Promise<void>;
  updateParty: (party: Party) => Promise<void>;
};

const usePartysStore = create<PartysStore>((set) => ({
  partys: [],
  addParty: async (party: Omit<Party, "id">) => {
    try {
      const id = await db.partys.add(party);

      const dbPartyEntry = { ...party, id };

      set((state) => ({
        partys: [...state.partys, dbPartyEntry],
      }));
    } catch (error) {
      console.error("Issue while adding a new party to the state and db");
      console.error(error);
    }
  },
  deleteParty: async (party: Party) =>
    set((state) => ({
      partys: state.partys.filter((pa) => pa.id !== party.id),
    })),
  updateParty: async (party: Party) =>
    set((state) => {
      const partys: Party[] = [...state.partys];
      const indexOfPartyToUpdate = partys.findIndex((pa) => pa.id === party.id);

      if (indexOfPartyToUpdate !== -1) {
        partys[indexOfPartyToUpdate] = party;
      }

      return { partys };
    }),
}));

export default usePartysStore;
 */
//TODO: Implement the new database handler from sql
