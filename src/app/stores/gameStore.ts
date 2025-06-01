// Inracker/src/app/stores/gameStore.ts
import { create } from 'zustand';

interface GameState {
  opponents: string[];
  addOpponent: (name: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  opponents: [],
  addOpponent: (name: string) => set((state) => ({
    opponents: [...state.opponents, name],
  })),
}));
