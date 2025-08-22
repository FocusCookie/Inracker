import type { Party } from "@/types/party";
import type { Player, TCreatePlayer } from "@/types/player";
import type { Immunity } from "@/types/immunitiy";
import type { Resistance } from "@/types/resistances";

export type CancelReason = "cancel" | "dismissed";

export type OverlaySuccessMap = {
  "party.create": { partyId: Party["id"] };
  "party.edit": { partyId: Party["id"] };
  "player.create": { playerId: Player["id"] };
  "immunity.create": { immunityId: number };
  "resistance.create": { resistanceId: number };
  "immunity.catalog": { immunityId: number };
  "resistance.catalog": { resistanceId: number };
};

export type OverlayMap = {
  "party.create": {
    onCreate: (party: Omit<Party, "id">) => Promise<{ id: number }>;
    onComplete: (r: OverlaySuccessMap["party.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "party.edit": {
    party: Party;
    onEdit: (party: Party) => Promise<Party>;
    onComplete: (r: OverlaySuccessMap["party.edit"]) => void;
    onCancel?: (reason: CancelReason) => void;
    onDelete: (partyId: Party["id"]) => Promise<Party["id"]>;
  };
  "player.create": {
    onCreate: (player: TCreatePlayer) => Promise<{ id: number }>;
    onComplete: (r: OverlaySuccessMap["player.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "immunity.create": {
    onCreate: (immunity: Immunity) => Promise<{ id: number }>;
    onComplete: (r: OverlaySuccessMap["immunity.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "resistance.create": {
    onCreate: (resistance: Resistance) => Promise<{ id: number }>;
    onComplete: (r: OverlaySuccessMap["resistance.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "immunity.catalog": {
    onSelect: (immunityId: number) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "resistance.catalog": {
    onSelect: (resistanceId: number) => void;
    onCancel?: (reason: CancelReason) => void;
  };

  // add other overlay kinds with the same pattern as you refactor them
};

export type OverlayKind = keyof OverlayMap;
