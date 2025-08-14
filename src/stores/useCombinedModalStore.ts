import { create } from "zustand";
import { settingsDialogMiddleware } from "./middleware/settingsDialogMiddleware";
import { useSettingsStore } from "./useSettingsStore";
import { usePlayerStore } from "./usePlayerStore";
import { useEffectStore } from "./useEffectStore";
import { useImmunityStore } from "./useImmunityStore";
import { useResistancesStore } from "./useResistanceStore";

// Combined modal state interface
interface CombinedModalState {
  // Settings Dialog
  isSettingsDialogOpen: boolean;
  openSettingsDialog: () => void;
  closeSettingsDialog: () => void;
  
  // Player Edit Modal
  isEditPlayerDrawerOpen: boolean;
  selectedPlayer: any;
  closeEditPlayerDrawer: () => void;
  openEditPlayerDrawer: () => void;
  setSelectedPlayer: (player: any) => void;
  
  // Effect Edit Modal
  isEditEffectDrawerOpen: boolean;
  selectedEffect: any;
  closeEditEffectDrawer: () => void;
  openEditEffectDrawer: () => void;
  setSelectedEffect: (effect: any) => void;
  
  // Immunity Edit Modal
  isEditImmunityDrawerOpen: boolean;
  selectedImmunity: any;
  closeEditImmunityDrawer: () => void;
  openEditImmunityDrawer: () => void;
  setSelectedImmunity: (immunity: any) => void;
  
  // Resistance Edit Modal
  isEditResistanceDrawerOpen: boolean;
  selectedResistance: any;
  closeEditResistanceDrawer: () => void;
  openEditResistanceDrawer: () => void;
  setSelectedResistance: (resistance: any) => void;
}

export const useCombinedModalStore = create<CombinedModalState>()(
  settingsDialogMiddleware((set, get) => ({
    // Settings Dialog
    isSettingsDialogOpen: false,
    openSettingsDialog: () => set({ isSettingsDialogOpen: true }),
    closeSettingsDialog: () => set({ isSettingsDialogOpen: false }),
    
    // Player Edit Modal
    isEditPlayerDrawerOpen: false,
    selectedPlayer: null,
    closeEditPlayerDrawer: () => set({ isEditPlayerDrawerOpen: false }),
    openEditPlayerDrawer: () => set({ isEditPlayerDrawerOpen: true }),
    setSelectedPlayer: (player) => set({ selectedPlayer: player }),
    
    // Effect Edit Modal
    isEditEffectDrawerOpen: false,
    selectedEffect: null,
    closeEditEffectDrawer: () => set({ isEditEffectDrawerOpen: false }),
    openEditEffectDrawer: () => set({ isEditEffectDrawerOpen: true }),
    setSelectedEffect: (effect) => set({ selectedEffect: effect }),
    
    // Immunity Edit Modal
    isEditImmunityDrawerOpen: false,
    selectedImmunity: null,
    closeEditImmunityDrawer: () => set({ isEditImmunityDrawerOpen: false }),
    openEditImmunityDrawer: () => set({ isEditImmunityDrawerOpen: true }),
    setSelectedImmunity: (immunity) => set({ selectedImmunity: immunity }),
    
    // Resistance Edit Modal
    isEditResistanceDrawerOpen: false,
    selectedResistance: null,
    closeEditResistanceDrawer: () => set({ isEditResistanceDrawerOpen: false }),
    openEditResistanceDrawer: () => set({ isEditResistanceDrawerOpen: true }),
    setSelectedResistance: (resistance) => set({ selectedResistance: resistance }),
  }))
);
