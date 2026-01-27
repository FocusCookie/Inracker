import db from "@/lib/database";
import type { Party } from "@/types/party";
import type { Player, TCreatePlayer } from "@/types/player";
import type { DBImmunity, Immunity } from "@/types/immunitiy";
import type { DBResistance, Resistance } from "@/types/resistances";
import { DBEffect, Effect } from "./effect";
import { Chapter, DBChapter } from "./chapters";
import { Encounter } from "./encounter";
import { EncounterOpponent, Opponent, TCreateOpponent } from "./opponents";

export type CancelReason = "cancel" | "dismissed" | "closed";

export type OverlaySuccessMap = {
  "chapter.create": Chapter;
  "chapter.edit": { chapterId: Chapter["id"] };
  "effect.create": Effect;
  "effect.catalog": Effect;
  "effect.edit": Effect;
  "encounter.create": Encounter;
  "encounter.edit": Encounter;
  "encounter-opponent.edit": EncounterOpponent;
  "opponent.create": Opponent;
  "opponent.edit": Opponent;
  "opponent.catalog": Opponent;
  "party.create": { partyId: Party["id"] };
  "party.edit": { partyId: Party["id"] };
  "player.create": Player;
  "player.catalog": { playerId: Player["id"] };
  "player.edit": Player;
  "resistance.create": DBResistance;
  "resistance.catalog": DBResistance;
  "resistance.edit": DBResistance;
  "immunity.create": DBImmunity;
  "immunity.catalog": DBImmunity;
  "immunity.edit": DBImmunity;
  "health.dialog": number;
  settings: void;
};

export type OverlayMap = {
  "chapter.create": {
    partyId: Party["id"];
    onCreate: (chapter: Omit<Chapter, "id">) => Promise<Chapter>;
    onComplete: (result: OverlaySuccessMap["chapter.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "chapter.edit": {
    chapter: Chapter;
    onEdit: (chapter: Chapter) => Promise<Chapter>;
    onDelete: (chapterId: Chapter["id"]) => Promise<DBChapter>;
    onComplete: (result: Chapter) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "effect.create": {
    onCreate: (effect: Omit<Effect, "id">) => Promise<Effect>;
    onComplete: (result: OverlaySuccessMap["effect.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "effect.edit": {
    effect: Effect;
    onEdit: (effect: Effect) => Promise<Effect>;
    onComplete?: (result: OverlaySuccessMap["effect.edit"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "effect.catalog": {
    database?: typeof db;
    onSelect: (effect: Effect) => Promise<void>;
    onCancel?: (reason: CancelReason) => void;
  };
  "encounter.create": {
    onCreate: (encounter: Omit<Encounter, "id">) => Promise<Encounter>;
    onComplete: (result: OverlaySuccessMap["encounter.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "encounter.selection": {
    encounterId: Encounter["id"];
    chapterId: Chapter["id"];
    onCancel?: (reason: CancelReason) => void;
    onOpponentSelect?: (opponentId: number) => void;
    onStartFight?: () => void;
    isCombatActive?: boolean;
  };
  "encounter.edit": {
    encounter: Encounter;
    onEdit: (encounter: Encounter) => Promise<Encounter>;
    onComplete?: (result: OverlaySuccessMap["encounter.edit"]) => void;
    onCancel?: (reason: CancelReason) => void;
    onDelete: (encounter: Encounter["id"]) => Promise<DBEncounter>;
  };
  "encounter-opponent.edit": {
    opponent: EncounterOpponent;
    onEdit: (opponent: EncounterOpponent) => Promise<EncounterOpponent>;
    onComplete: (result: OverlaySuccessMap["encounter-opponent.edit"]) => void;
    onDelete: (opponentId: number) => Promise<void>;
    onCancel?: (reason: CancelReason) => void;
  };
  "opponent.create": {
    onCreate: (opponent: Omit<Opponent, "id">) => Promise<Opponent>;
    onComplete: (result: OverlaySuccessMap["opponent.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "opponent.edit": {
    opponent: Opponent;
    onEdit: (opponent: Opponent) => Promise<Opponent>;
    onComplete: (result: OverlaySuccessMap["opponent.edit"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "opponent.catalog": {
    database: typeof db;
    onSelect: (opponent: Opponent) => void;
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
    database?: typeof db;
    onCreate: (player: TCreatePlayer) => Promise<Player>;
    onComplete: (result: OverlaySuccessMap["player.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "player.edit": {
    player: Player;
    onEdit: (player: Player) => Promise<Player>;
    onComplete: (result: OverlaySuccessMap["player.edit"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "player.catalog": {
    database?: typeof db;
    onSelect: (partyId: Party["id"], playerId: Player["id"]) => Promise<void>;
    onCancel?: (reason: CancelReason) => void;
    partyId: Party["id"];
    excludedPlayers: Player[];
  };
  "immunity.create": {
    onCreate: (immunity: Immunity) => Promise<DBImmunity>;
    onComplete?: (result: OverlaySuccessMap["immunity.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "immunity.catalog": {
    database?: typeof db;
    onSelect: (immunity: DBImmunity) => Promise<void>;
    onCancel?: (reason: CancelReason) => void;
  };
  "immunity.edit": {
    immunity: DBImmunity;
    onEdit: (immunity: DBImmunity) => Promise<DBImmunity>;
    onComplete?: (result: OverlaySuccessMap["immunity.edit"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "health.dialog": {
    currentHealth: number;
    maxHealth: number;
    entityName: string;
    type: "heal" | "damage";
    onConfirm: (amount: number) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "resistance.create": {
    onCreate: (resistance: Resistance) => Promise<DBResistance>;
    onComplete: (result: OverlaySuccessMap["resistance.create"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  "resistance.catalog": {
    database?: typeof db;
    onSelect: (restistance: DBResistance) => Promise<void>;
    onCancel?: (reason: CancelReason) => void;
  };
  "resistance.edit": {
    resistance: DBResistance;
    onEdit: (resistance: DBResistance) => Promise<DBResistance>;
    onComplete?: (result: OverlaySuccessMap["resistance.edit"]) => void;
    onCancel?: (reason: CancelReason) => void;
  };
  settings: void;
};

export type OverlayKind = keyof OverlayMap;
