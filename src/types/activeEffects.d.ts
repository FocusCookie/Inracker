import { Effect, EffectDurationType } from "./effect";
import { Prettify } from "./utils";

type EntityType = "player" | "opponent";

export type DBActiveEffect = {
  readonly id: number;
  effect_id: number;
  entity_id: number;
  entity_type: EntityType;
  remaining_duration: number | null;
  duration_type: EffectDurationType;
  created_at: string;
};

export type ActiveEffect = Prettify<{
  id: number;
  effectId: number;
  entityId: number;
  entityType: EntityType;
  remainingDuration: number | null;
  durationType: EffectDurationType;
  createdAt: string;
}>;
