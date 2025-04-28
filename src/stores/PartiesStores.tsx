import { toast } from "@/hooks/use-toast";
import db from "@/lib/database";
import { Party } from "@/types/party";
import { DBPlayer } from "@/types/player";
import { create } from "zustand";

interface PartyState {
  parties: Party[];
  isLoading: boolean;
  currentParty: Party | null;
  createParty: (party: Omit<Party, "id">) => Promise<void>;
  deleteParty: (party: Party) => Promise<void>;
  updateParty: (party: Party) => Promise<void>;
  setCurrentParty: (partyId: Party["id"]) => void;
  getAllParties: () => void;
  addPlayerToParty: (
    partyId: Party["id"],
    playerId: DBPlayer["id"],
  ) => Promise<void>;
  removePlayerFromParty: (
    partyId: Party["id"],
    playerId: DBPlayer["id"],
  ) => Promise<void>;
}

export const usePartiesStore = create<PartyState>((set, get) => ({
  parties: [],
  isLoading: false,
  currentParty: null,

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
    const parties = await db.parties.getAllDetailed();

    set(() => ({
      parties,
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
  setCurrentParty: async (id: Party["id"]) => {
    try {
      const party = await db.parties.getDetailedById(id);
      set({ currentParty: party });
    } catch (error) {
      console.error("PartiesStore: set current party error: ", error);
      //TODO: add translation
      toast({
        variant: "destructive",
        title: "Oopps something went wrong, please try again.",
        // @ts-ignore
        description: error?.message || undefined,
      });
    }
  },
  getAllParties: async () => {
    try {
      set({ isLoading: true });
      const parties = await db.parties.getAllDetailed();

      set({ parties });
    } catch (error) {
      console.error("PartiesStore: get all parties error: ", error);
      //TODO: add translation
      toast({
        variant: "destructive",
        title: "Oopps something went wrong, please try again.",
        // @ts-ignore
        description: error?.message || undefined,
      });
    } finally {
      set({ isLoading: false });
    }
  },
  addPlayerToParty: async (partyId: Party["id"], playerId: DBPlayer["id"]) => {
    try {
      set({ isLoading: true });
      const party = await db.parties.getDetailedById(partyId);
      const isAlreadyInParty = party.players.some(
        (player) => player.id === playerId,
      );

      if (isAlreadyInParty) {
        console.info("player is already in party");
        return;
      }

      await db.parties.addPlayerToParty(partyId, playerId);
      const updatedParty = await db.parties.getDetailedById(partyId);

      set({ currentParty: updatedParty });
    } catch (error) {
      console.error("PartyStore: add player to party error: ", error);
      //TODO: add translation
      toast({
        variant: "destructive",
        title: "Oopps something went wrong, please try again.",
        // @ts-ignore
        description: error?.message || undefined,
      });
    } finally {
      set({ isLoading: false });
    }
  },
  removePlayerFromParty: async (
    partyId: Party["id"],
    playerId: DBPlayer["id"],
  ) => {
    try {
      set({ isLoading: true });

      await db.parties.removePlayerFromParty(partyId, playerId);
      const updatedParty = await db.parties.getDetailedById(partyId);

      set({ currentParty: updatedParty });
    } catch (error) {
      console.error("PartyStore: remove player from party error: ", error);
      //TODO: add translation
      toast({
        variant: "destructive",
        title: "Oopps something went wrong, please try again.",
        // @ts-ignore
        description: error?.message || undefined,
      });
    } finally {
      set({ isLoading: false });
    }
  },
}));
