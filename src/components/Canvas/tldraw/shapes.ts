import { TLShape } from "tldraw";

export const ENCOUNTER_TYPE = "encounter" as const;
export const TOKEN_TYPE = "token" as const;
export const BACKGROUND_TYPE = "battlemap" as const;

declare module "@tldraw/tlschema" {
  interface TLGlobalShapePropsMap {
    [ENCOUNTER_TYPE]: {
      w: number;
      h: number;
      color: string;
      icon: string;
      name: string;
      completed?: boolean;
      isCombatActive?: boolean;
    };
    [TOKEN_TYPE]: {
      w: number;
      h: number;
      tokenId: number;
      entityId: number;
      tokenType: "player" | "opponent";
    };
    [BACKGROUND_TYPE]: {
      w: number;
      h: number;
      url: string;
    };
  }
}

export type EncounterShape = TLShape<typeof ENCOUNTER_TYPE>;
export type TokenShape = TLShape<typeof TOKEN_TYPE>;
export type BackgroundShape = TLShape<typeof BACKGROUND_TYPE>;

export type InrackerShape = EncounterShape | TokenShape | BackgroundShape;
