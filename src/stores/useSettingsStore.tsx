import { create } from "zustand";

interface SettingsState {
  isSettingsDialogOpen: boolean;
  openSettingsDialog: () => void;
  closeSettingsDialog: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isSettingsDialogOpen: false,
  openSettingsDialog: () => set({ isSettingsDialogOpen: true }),
  closeSettingsDialog: () => set({ isSettingsDialogOpen: false }),
}));
