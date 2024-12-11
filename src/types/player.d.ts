import { Attributes } from "./attributes";
import { Buff, Debuff, Effect, HarmfulEffect } from "./effect";
import { Resistance } from "./resistances";
import { Skills } from "./skills";
import { Prettify } from "./utils";

/**
 * Player movement in meter
 */
export type Movement = {
  ground: number;
  air: number;
  water: number;
  highJump: number;
  wideJump: number;
};

export type SavingThrows = {
  reflex: number;
  will: number;
  toughness: number;
};

export type Immunity = {
  readonly id: number;
  name: string;
  description: string;
  icon: string;
};

/**
 * All the shiled related stats
 */
export type Shield = {
  /**
   * value which is added against the attack throw
   */
  value: number;
  health: number;
};

export type DBPlayer = {
  armor: number;
  /** id to look up in the attributes table */
  attributes: number;
  class_sg: number;
  description: string;
  /** array of ids effects / which are buffs and debuffs */
  effects: string;
  ep: number;
  health: number;
  icon: string;
  readonly id: number;
  immunities: string;
  level: number;
  max_health: number;
  /** json string of type Movement */
  movement: string;
  name: string;
  perception: number;
  /** Character Class such as rouqe, mage, ... */
  role: string;
  /** character resistances */
  resistances: string;
  /** json string of type Skills */
  saving_throws: string;
  /** json string  or null of type Skills */
  shield: string;
  /** id to look up in the skills table */
  skills: number;
};

export type Player = Prettify<
  Omit<
    DBPlayer,
    | "id"
    | "movement"
    | "effects"
    | "saving_throws"
    | "shield"
    | "immunities"
    | "attributes"
    | "skills"
    | "class_sg"
    | "max_health"
    | "resistances"
  > & {
    id: DBPlayer["id"];
    effects: Effect[];
    immunities: Immunity[];
    movement: Movement;
    savingThrows: SavingThrows;
    shield: Shield | null;
    attributes: Attributes;
    skills: Skills;
    classSg: number;
    maxHealth: number;
    resistances: Resistance[];
  }
>;
