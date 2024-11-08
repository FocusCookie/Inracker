export type DBEffect = {
  description: string;
  duration: number;
  /**
   * devided in rounds and time
   */
  duration_type: string;
  icon: string;
  readonly id: number;
  name: string;
  /** positive or negative */
  type: string;
};

/**
 * This is an effect that causes positive or negative  or harmful. Positive means a buff, negative is a debuff and harmful is negative and makes damage on the player.
 */
export type Effect = Omit<DBEffect, "duration_type"> & {
  durationType: "rounds" | "time";
};
