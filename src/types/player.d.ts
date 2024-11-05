/**
 * Player movement in meter
 */
type Movement = {
  ground: number;
  air: number;
  water: number;
  highJump: number;
  wideJump: number;
};

/**
 * Specify how a buff, debuff or harmful effect is done over time or rounds
 */
type BuffAndHarmfulEffectDuration = {
  type: "rounds" | "time";
  /**
   * value of rounds or time in seconds
   */
  value: number;
};

/**
 * This is an effect that causes positive or negative effects which cause no damage on the character. But they improve or decrause the character stats or attributes and others.
 */
type Effect = {
  type: "positive" | "negative";
  icon: string;
  name: string;
  description: string;
  duration: BuffAndHarmfulEffectDuration;
  readonly id: number;
};

/**
 * A positive effect for the player. Increase strength for example for 3 rounds.
 */
type Buff = Omit<Effect, "type"> & { type: "positive" };
/**
 * A negative effect for the player. For example decrease perecption for a day.
 */
type Debuff = Omit<Effect, "type"> & { type: "negative" };

/**
 * This is an effect that causes damage over time on the player
 */
type HarmfulEffect = {
  name: string;
  description: string;
  duration: BuffAndHarmfulEffectDuration;
  damage: number;
  readonly id: number;
};

type SavingThrows = {
  reflex: number;
  will: number;
  toughness: number;
};

/**
 * All the shiled related stats
 */
type Shield = {
  /**
   * value which is added against the attack throw
   */
  value: number;
  health: number;
};

export type Player = {
  armor: number;
  buffs: Array<Buff["id"]>;
  /**
   * Player character class such as rouque or mage for example.
   */
  class: string;
  /**
   * Difficulty to throw against a player.
   */
  classSg: number;
  debuffs: Array<Buff["id"]>;
  description: string;
  harmfulEffects: HarmfulEffect[];
  icon: string;
  readonly id: number;
  immunities: string[];
  name: string;
  movement: Movement;
  perception: number;
  savingThrows: SavingThrows;
  shield: Shield;
};
