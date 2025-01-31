import { toast } from "@/hooks/use-toast";
import db from "@/lib/database";
import { DBChapter } from "@/types/chapters";
import { DBParty } from "@/types/party";
import { create } from "zustand";

interface ChapterState {
  chapters: DBChapter[];
  isLoading: boolean;
  getAllChapters: (partyId: DBParty["id"]) => void;
}

export const useChapterStore = create<ChapterState>((set) => ({
  chapters: [],
  isLoading: false,

  getAllChapters: async (partyId: DBParty["id"]) => {
    try {
      set({ isLoading: true });
      const chapters = await db.chapters.getChaptersByPartyId(partyId);

      set({ chapters });
    } catch (error) {
      console.error("ChapterStore: get all chapters error: ", error);
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
