import { Prettify } from "./utils";
import { z } from "zod";

export type CombatLogType =
  | "damage"
  | "heal"
  | "effect_expired"
  | "turn_change"
  | "round_change"
  | "note";

export type DBCombatLog = {
  readonly id: string;
  readonly combat_id: string;
  round: number;
  turn_index: number;
  type: CombatLogType;
  payload: string;
  created_at: string;
};

export type LogPayloadDamage = {
  targetName: string; // Name of the target
  amount: number;
  source?: string; // e.g. "Fireball" or "Valeros"
  damageType?: string; // e.g. "fire", "slashing"
};

export type LogPayloadHeal = {
  target: string;
  amount: number;
  source?: string;
};

export type LogPayloadEffectExpired = {
  target: string;
  names: string[]; // List of effect names that expired
};

export type LogPayloadTurnChange = {
  entityId: string;
  name: string;
};

export type LogPayloadRoundChange = {
  round: number;
};

export type LogPayloadNote = {
  text: string;
  author?: string; // Optional: "GM" or Player Name
};

// Discriminated Union for type safety
export type CombatLogPayload =
  | ({ type: "damage" } & LogPayloadDamage)
  | ({ type: "heal" } & LogPayloadHeal)
  | ({ type: "effect_expired" } & LogPayloadEffectExpired)
  | ({ type: "turn_change" } & LogPayloadTurnChange)
  | ({ type: "round_change" } & LogPayloadRoundChange)
  | ({ type: "note" } & LogPayloadNote);

export type CombatLog = Prettify<
  Omit<DBCombatLog, "payload" | "created_at"> & {
    /** * The parsed and typed payload.
     * Use Zod to validate this when mapping from DBCombatLog.
     */
    payload: CombatLogPayload;
    createdAt: Date;
  }
>;

export const CombatLogPayloadSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("damage"),
    target: z.string(),
    amount: z.number(),
    source: z.string().optional(),
    damageType: z.string().optional(),
  }),
  z.object({
    type: z.literal("heal"),
    target: z.string(),
    amount: z.number(),
    source: z.string().optional(),
  }),
  z.object({
    type: z.literal("effect_expired"),
    target: z.string(),
    names: z.array(z.string()),
  }),
  z.object({
    type: z.literal("turn_change"),
    entityId: z.string(),
    name: z.string(),
  }),
  z.object({ type: z.literal("round_change"), round: z.number() }),
  z.object({
    type: z.literal("note"),
    text: z.string(),
    author: z.string().optional(),
  }),
]);
