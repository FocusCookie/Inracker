// Inracker/src/app/stores/useOpponentStore.ts
import { create } from 'zustand';

interface OpponentState {
  opponents: string[];
  isLoading: boolean;
  createOpponent: (name: string) => Promise<void>;
}

export const useOpponentStore = create<OpponentState>((set) => ({
  opponents: [],
  isLoading: false,
  createOpponent: async (name: string) => {
    set({ isLoading: true });
    try {
      // const response = await db.opponents.create({ name });
      // const newOpponent = response.data;
      set((state) => ({
        opponents: [...state.opponents, name],
      }));
      // alert('Opponent created successfully'); // Replace with a better toast implementation
    } catch (error: any) {
      console.error("Failed to create opponent", error);
      alert('Failed to create opponent'); // Replace with a better toast implementation
    } finally {
      set({ isLoading: false });
    }
  },
}));
