import { create } from "zustand";

type MusicStore = {
  currentTrackUrl: string | null;
  isPlaying: boolean;
  isMinimized: boolean;
  setTrack: (url: string) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  minimize: (state: boolean) => void;
};

export const useMusicStore = create<MusicStore>((set) => ({
  currentTrackUrl: null,
  isPlaying: false,
  isMinimized: false,
  setTrack: (url) => set({ currentTrackUrl: url, isPlaying: true, isMinimized: false }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  stop: () => set({ currentTrackUrl: null, isPlaying: false }),
  minimize: (state) => set({ isMinimized: state }),
}));
