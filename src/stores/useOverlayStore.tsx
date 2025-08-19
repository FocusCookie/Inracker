import { create } from "zustand";
import { nanoid } from "nanoid";
import type { OverlayKind, OverlayMap } from "@/types/overlay";

export type OverlayItem<K extends OverlayKind = OverlayKind> = {
  id: string; // instance id
  type: K; // e.g. "party.create"
  props: OverlayMap[K]; // props passed to the drawer
  open: boolean; // drives enter/exit animation
  createdAt: number; // for debugging
};

type State = {
  stack: OverlayItem[];

  // Add a new overlay to the top of the stack
  open: <K extends OverlayKind>(type: K, props: OverlayMap[K]) => string;

  // Start closing: set open=false so Framer can play exit
  close: (id: string) => void;

  // Final removal: call from Drawer.onExitComplete
  remove: (id: string) => void;
};

export const useOverlayStore = create<State>()((set) => ({
  stack: [],

  open: (type, props) => {
    const id = nanoid();

    set((s) => ({
      stack: [
        ...s.stack,
        { id, type, props, open: true, createdAt: Date.now() },
      ],
    }));
    return id;
  },

  close: (id) => {
    set((s) => {
      const idx = s.stack.findIndex((i) => i.id === id);
      if (idx === -1) return s;

      const cur = s.stack[idx];
      if (!cur.open) return s; // idempotent

      const next = s.stack.slice();
      next[idx] = { ...cur, open: false };
      return { stack: next };
    });
  },

  remove: (id) => {
    set((s) => {
      const idx = s.stack.findIndex((i) => i.id === id);
      if (idx === -1) return s; // idempotent
      const next = s.stack.slice();
      next.splice(idx, 1);
      return { stack: next };
    });
  },
}));
