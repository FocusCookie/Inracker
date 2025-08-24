import type { Party } from "@/types/party";
import type { Player, TCreatePlayer } from "@/types/player";
import type { Immunity } from "@/types/immunitiy";
import type { Resistance } from "@/types/resistances";
import { Effect } from "zod";

export type CancelReason = "cancel" | "dismissed";

export type OverlaySuccessMap = {
  "party.create": { partyId: Party["id"] };
  "party.edit": { partyId: Party["id"] };
  "player.create": { playerId: Player["id"] };
  "player.catalog": { playerId: Player["id"] };
  "resistance.create": { resistanceId: Resistance["id"] };
  "resistance.catalog": { resistanceId: Resistance[""] };
  "immunity.create": { immunityId: Immunity["id"] };
  "immunity.catalog": { immunityId: Immunity["id"] };
  "effect.create": { effectId: Effect["id"] };
};

export type OverlayMap = {
  "effect.create": {
    onCreate: (effect: Omit<Effect, "id">) => Promise<{ id: Effect["id"] }>;
    onComplete: (result: OverlaySuccessMap["effect.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "party.create": {
    onCreate: (party: Omit<Party, "id">) => Promise<{ id: Party["id"] }>;
    onComplete: (result: OverlaySuccessMap["party.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "party.edit": {
    party: Party;
    onEdit: (party: Party) => Promise<Party>;
    onComplete: (result: OverlaySuccessMap["party.edit"]) => void;
    onCancel?: (reason: CancelReason) => void;
    onDelete: (partyId: Party["id"]) => Promise<Party["id"]>;
  };
  "player.create": {
    onCreate: (player: TCreatePlayer) => Promise<{ id: Player["id"] }>;
    onComplete: (result: OverlaySuccessMap["player.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "player.catalog": {
    onAdd: (partyId: Party["id"], playerId: Player["id"]) => void;
    onCancel?: (reason: CancelReason) => void;
    partyId: Party["id"];
    excludedPlayers: Player[];
  };
  "immunity.create": {
    onCreate: (immunity: Immunity) => Promise<{ id: Immunity["id"] }>;
    onComplete: (result: OverlaySuccessMap["immunity.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "immunity.catalog": {
    onSelect: (immunityId: number) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "resistance.create": {
    onCreate: (resistance: Resistance) => Promise<{ id: Resistance["id"] }>;
    onComplete: (result: OverlaySuccessMap["resistance.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "resistance.catalog": {
    onSelect: (resistanceId: number) => void;
    onCancel?: (reason: CancelReason) => void;
  };
};

export type OverlayKind = keyof OverlayMap;
