import { create } from "zustand";

interface ChapterStoreState {
  isAsideOpen: boolean;

  openAside: () => void;
  closeAside: () => void;
}

export const useChapterStore = create<ChapterStoreState>((set) => ({
  isAsideOpen: false,

  openAside: () => set({ isAsideOpen: true }),
  closeAside: () => set({ isAsideOpen: false }),
}));
