// src/stores/playerStore.ts
import { DBPlayer, TCreatePlayer } from "@/types/player";
import { create } from "zustand";
import db from "@/lib/database";
import { toast } from "@/hooks/use-toast";

interface PlayerState {
  /** all available players across all campaigns */
  players: DBPlayer[];
  /** state of the player createion drawer */
  isCreateDrawerOpen: boolean;
  /** state of the creation */
  isCreating: boolean;
  /** setter for the player creation drawer */
  setIsCreateDrawerOpen: (isOpen: boolean) => void;
  /** create a new player */
  createPlayer: (player: TCreatePlayer) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  players: [],
  isCreateDrawerOpen: false,
  isCreating: false,

  setIsCreateDrawerOpen: (isOpen) => set({ isCreateDrawerOpen: isOpen }),
  createPlayer: async (player: TCreatePlayer) => {
    set({ isCreating: true });

    try {
      await db.players.create(player);

      set({ isCreateDrawerOpen: false });
    } catch (error) {
      console.error("PlayerState: create a player error: ", error);

      toast({
        variant: "destructive",
        title: "Oopps something went wrong, please try again.",
        // @ts-ignore
        description: error?.message || undefined,
      });
    } finally {
      set({ isCreating: false });
    }
  },
}));
