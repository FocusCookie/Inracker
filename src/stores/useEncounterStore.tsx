import { CanvasElement } from "@/components/Canvas/Canvas";
import { Encounter } from "@/types/encounter";
import { create } from "zustand";

interface EncounterStoreState {
  isCreateEncounterDrawerOpen: boolean;
  isEditEncounterDrawerOpen: boolean;
  editingEncounter: Encounter | null;
  currentEncounter: Encounter["id"] | null;
  currentElement: CanvasElement | null;
  currentColor: string;
  currentTitle: string;
  currentIcon: string;
  resetCount: number; // in order to reset the canvas form the encounter form cancelation

  openCreateEncounterDrawer: () => void;
  closeEncounterDrawer: () => void;
  openEditEncounterDrawer: (encounter: Encounter) => void;
  closeEditEncounterDrawer: () => void;
  setCurrentEncounter: (encounterId: Encounter["id"]) => void;
  setCurrentElement: (element: CanvasElement | null) => void;
  setCurrentColor: (color: string) => void;
  setCurrentTitle: (title: string) => void;
  setCurrentIcon: (icon: string) => void;
  setResetCount: (value: number) => void;
}

export const useEncounterStore = create<EncounterStoreState>((set) => ({
  isCreateEncounterDrawerOpen: false,
  isEditEncounterDrawerOpen: false,
  currentEncounter: null,
  editingEncounter: null,
  currentElement: null,
  currentTitle: "",
  currentColor: "#FFFFFF",
  currentIcon: "📝",
  resetCount: 0,

  openCreateEncounterDrawer: () => set({ isCreateEncounterDrawerOpen: true }),
  closeEncounterDrawer: () => set({ isCreateEncounterDrawerOpen: false }),
  openEditEncounterDrawer: (encounter: Encounter) =>
    set({
      isEditEncounterDrawerOpen: true,
      editingEncounter: encounter,
    }),
  closeEditEncounterDrawer: () =>
    set({
      isEditEncounterDrawerOpen: false,
      currentEncounter: null,
    }),
  setCurrentEncounter: (encounterId: Encounter["id"]) =>
    set({
      currentEncounter: encounterId,
    }),
  setCurrentElement: (encounter: CanvasElement | null) =>
    set({ currentElement: encounter }),
  setCurrentColor: (color: string) => set({ currentColor: color }),
  setCurrentTitle: (title: string) => set({ currentTitle: title }),
  setCurrentIcon: (icon: string) => set({ currentIcon: icon }),
  setResetCount: (value: number) => set({ resetCount: value }),
}));
