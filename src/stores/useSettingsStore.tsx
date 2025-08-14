import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface SettingsState {
  isSettingsDialogOpen: boolean;
  openSettingsDialog: () => void;
  closeSettingsDialog: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  subscribeWithSelector((set) => ({
  isSettingsDialogOpen: false,
  openSettingsDialog: () => set({ isSettingsDialogOpen: true }),
      closeSettingsDialog: () => set({ isSettingsDialogOpen: false }),
  }))
);
