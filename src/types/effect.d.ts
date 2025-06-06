import { Prettify } from "./utils";

export type DBEffect = {
  description: string;
  /** Rounds or seconds */
  duration: number;
  /**
   * devided in rounds and time
   */
  duration_type: "rounds" | "time";
  icon: string;
  readonly id: number;
  name: string;
  /** positive or negative */
  type: "positive" | "negative";
  value: number;
};

/**
 * This is an effect that causes positive or negative  or harmful. Positive means a buff, negative is a debuff and harmful is negative and makes damage on the player.
 */
export type Effect = Prettify<
  Omit<DBEffect, "duration_type"> & {
    durationType: "rounds" | "time";
  }
>;
