import { Chapter } from "@/types/chapters";
import { create } from "zustand";

interface ChapterStoreState {
  isCreateChapterDrawerOpen: boolean;
  isEditChapterDrawerOpen: boolean;
  isAsideOpen: boolean;
  editingChapter: Chapter | null;
  currentChapter: Chapter["id"] | null;

  openAside: () => void;
  closeAside: () => void;
  openCreateChapterDrawer: () => void;
  closeCreateChapterDrawer: () => void;
  openEditChapterDrawer: (chapter: Chapter) => void;
  closeEditChapterDrawer: () => void;
  setCurrentChapter: (chapterId: Chapter["id"]) => void;
}

export const useChapterStore = create<ChapterStoreState>((set) => ({
  isCreateChapterDrawerOpen: false,
  isEditChapterDrawerOpen: false,
  isAsideOpen: false,
  currentChapter: null,
  editingChapter: null,

  closeAside: () => set({ isAsideOpen: false }),
  openAside: () => set({ isAsideOpen: true }),
  openCreateChapterDrawer: () => set({ isCreateChapterDrawerOpen: true }),
  closeCreateChapterDrawer: () => set({ isCreateChapterDrawerOpen: false }),
  openEditChapterDrawer: (chapter: Chapter) =>
    set({
      isEditChapterDrawerOpen: true,
      editingChapter: chapter,
    }),
  closeEditChapterDrawer: () =>
    set({
      isEditChapterDrawerOpen: false,
      currentChapter: null,
    }),
  setCurrentChapter: (chapterId: Chapter["id"]) =>
    set({
      currentChapter: chapterId,
    }),
}));
