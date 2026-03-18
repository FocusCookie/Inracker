import { createContext, useContext } from "react";
import type db from "@/lib/database";
import type { Player } from "@/types/player";
import type { EncounterOpponent } from "@/types/opponents";
import type { EncounterNPC } from "@/types/npcs";
import type { Token } from "@/types/tokens";
import type { CanvasElementWithId } from "../types";

type CanvasTldrawContextValue = {
  database: typeof db;
  playersById: Map<number, Player>;
  opponentsById: Map<number, EncounterOpponent>;
  npcsById: Map<number, EncounterNPC>;
  elementsByShapeId: Map<string, CanvasElementWithId>;
  tokensById: Map<number, Token>;
  selectedToken: Token | null;
  tokenVisibility: Record<string, boolean>;
  setTokenVisibility: (tokenId: number, isVisible: boolean) => void;
  onTokenSelect: (token: Token | null) => void;
  onOpenEffectsCatalog?: (
    entityId: number,
    type: "player" | "opponent" | "npc",
  ) => void;
  onHealPlayer?: (playerId: number) => void;
  onDamagePlayer?: (playerId: number) => void;
  onHealOpponent?: (opponentId: number) => void;
  onDamageOpponent?: (opponentId: number) => void;
  onHealNPC?: (npcId: number) => void;
  onDamageNPC?: (npcId: number) => void;
  onRemoveFromInitiative?: (
    entityId: number,
    type: "player" | "opponent" | "npc",
  ) => void;
  onAddToInitiative?: (
    entityId: number,
    type: "player" | "opponent" | "npc",
    name: string,
  ) => void;
  initiativeEntityIds?: { id: number; type: "player" | "opponent" | "npc" }[];
};

const CanvasTldrawContext = createContext<CanvasTldrawContextValue | null>(
  null,
);

export function useCanvasTldrawContext() {
  const context = useContext(CanvasTldrawContext);
  return context;
}

export const CanvasTldrawProvider = CanvasTldrawContext.Provider;
