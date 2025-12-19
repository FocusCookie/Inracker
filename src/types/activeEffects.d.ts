import { Effect, EffectDurationType } from "./effect";
import { Prettify } from "./utils";

type EntityType = "player" | "opponent";
type Tick = "start" | "end";

export type DBActiveEffect = {
  readonly id: number;
  effect_id: number;
  entity_id: number;
  entity_type: EntityType;
  remaining_duration: number | null;
  duration_type: EffectDurationType;
  created_at: string;
  /*
   * in seconds
   * */
  total_duration: number;
  tick_on: Tick;
};

export type ActiveEffect = Prettify<{
  id: number;
  effectId: number;
  entityId: number;
  entityType: EntityType;
  remainingDuration: number | null;
  durationType: EffectDurationType;
  createdAt: string;
  /*
   * in seconds
   * */
  totalDuration: number;
  /*
   * defines if an effect ends on a start or end of a round
   * */
  tickOn: Tick;
}>;
