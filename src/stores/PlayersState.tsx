import { toast } from "@/hooks/use-toast";
import db from "@/lib/database";
import { ImageFolder, storeImage } from "@/lib/utils";
import { Player, TCreatePlayer } from "@/types/player";
import { create } from "zustand";

interface PlayerState {
  /** all available players across all campaigns */
  players: Player[];
  /** state of the player createion drawer */
  isCreateDrawerOpen: boolean;
  /** state of the creation */
  isCreating: boolean;
  /** state of the image storing process */
  isStoringImage: boolean;
  /** setter for the player creation drawer */
  setIsCreateDrawerOpen: (isOpen: boolean) => void;
  /** create a new player */
  createPlayer: (player: TCreatePlayer) => void;
  getAllPlayers: () => void;
  storePlayerImage: (
    picture: File | string,
    folder: ImageFolder,
  ) => Promise<string | null>;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  players: [],
  isCreateDrawerOpen: false,
  isCreating: false,
  isStoringImage: false,

  setIsCreateDrawerOpen: (isOpen) => set({ isCreateDrawerOpen: isOpen }),
  createPlayer: async (player: TCreatePlayer) => {
    try {
      set({ isCreating: true });

      await db.players.create(player);

      toast({
        variant: "default",
        title: `${player.icon} ${player.name} created.`,
      });
    } catch (error) {
      console.error("PlayerState: create a player error: ", error);
      //TODO: add translation
      toast({
        variant: "destructive",
        title: "Oopps something went wrong, please try again.",
        // @ts-ignore
        description: error?.message || undefined,
      });
    } finally {
      set({ isCreateDrawerOpen: false });
      set({ isCreating: false });
    }
  },
  getAllPlayers: async () => {
    try {
      const players = await db.players.getAllDetailed();

      set({ players });
    } catch (error) {
      console.error("PlayerState: get all players error: ", error);
      //TODO: add translation
      toast({
        variant: "destructive",
        title: "Oopps something went wrong, please try again.",
        // @ts-ignore
        description: error?.message || undefined,
      });
    }
  },
  storePlayerImage: async (picture: File | string, folder: ImageFolder) => {
    try {
      set({ isStoringImage: true });

      const filePath = await storeImage(picture, folder);

      set({ isStoringImage: false });
      return filePath;
    } catch (error) {
      console.error("PlayerState: store player image: ", error);

      toast({
        variant: "destructive",
        title: "Oopps something went wrong, please try again.",
        // @ts-ignore
        description: error?.message || undefined,
      });

      set({ isStoringImage: false });
    } finally {
      return null;
    }
  },
}));
