import type { Party } from "@/types/party";
import type { Player, TCreatePlayer } from "@/types/player";
import type { DBImmunity, Immunity } from "@/types/immunitiy";
import type { DBResistance, Resistance } from "@/types/resistances";
import { Effect } from "zod";

export type CancelReason = "cancel" | "dismissed";

export type OverlaySuccessMap = {
  "effect.create": Effect;
  "effect.catalog": Effect;
  "party.create": { partyId: Party["id"] };
  "party.edit": { partyId: Party["id"] };
  "player.create": Player;
  "player.catalog": { playerId: Player["id"] };
  "resistance.create": DBResistance;
  "resistance.catalog": DBResistance;
  "immunity.create": DBImmunity;
  "immunity.catalog": DBImmunity;
};

export type OverlayMap = {
  "effect.create": {
    onCreate: (effect: Effect) => Promise<Effect>;
    onComplete: (result: OverlaySuccessMap["effect.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "effect.catalog": {
    onSelect: (effect: DBEffect) => Promise<void>;
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
    onCreate: (player: TCreatePlayer) => Promise<Player>;
    onComplete: (result: OverlaySuccessMap["player.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "player.catalog": {
    onSelect: (partyId: Party["id"], playerId: Player["id"]) => Promis<void>;
    onCancel?: (reason: CancelReason) => void;
    partyId: Party["id"];
    excludedPlayers: Player[];
  };
  "immunity.create": {
    onCreate: (immunity: Immunity) => Promise<DBImmunity>;
    onComplete: (result: OverlaySuccessMap["immunity.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "immunity.catalog": {
    onSelect: (immunity: DBImmunity) => Promise<void>;
    onCancel?: (reason: CancelReason) => void;
  };
  "resistance.create": {
    onCreate: (resistance: Resistance) => Promise<DBResistance>;
    onComplete: (result: OverlaySuccessMap["resistance.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "resistance.catalog": {
    onSelect: (restistance: DBResistance) => Promise<void>;
    onCancel?: (reason: CancelReason) => void;
  };
};

export type OverlayKind = keyof OverlayMap;
