import { ClickableCanvasElement, InrackerCanvasElement } from "@/types/canvas";
import { Effect } from "@/types/effect";

export type { ClickableCanvasElement, InrackerCanvasElement };

export type CanvasElementWithId = ClickableCanvasElement & { id: string | number };

export type TokenEntity = {
  id: number;
  name: string;
  icon: string;
  image: string | null;
  effects: Effect[];
};
