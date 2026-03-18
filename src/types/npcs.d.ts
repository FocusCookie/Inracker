import { DBEffect } from "./effect";
import { DBImmunity } from "./immunitiy";
import { DBResistance } from "./resistances";
import { DBWeakness } from "./weakness";
import { Prettify } from "./utils";

export type DBNPC = {
  readonly id: number;
  name: string;
  icon: string;
  /** markdown notes */
  details: string;
  health: number;
  labels: string;
  max_health: number;
  image: string | null;
  level: number;
  /** array of ids resistances */
  resistances: string;
  /** array of ids effects / which are buffs and debuffs */
  effects: string;
  /** array of ids immunities */
  immunities: string;
  /** array of ids weaknesses */
  weaknesses: string;
};

export type NPC = Prettify<
  Omit<
    DBNPC,
    "labels",
    "effects" | "immunities" | "resistances" | "weaknesses"
  > & {
    effects: DBEffect[];
    immunities: DBImmunity[];
    resistances: DBResistance[];
    weaknesses: DBWeakness[];
    labels: string[];
  }
>;

export type DBEncounterNPC = {
  readonly id: number;
  name: string;
  icon: string;
  /** markdown notes */
  details: string;
  health: number;
  labels: string;
  max_health: number;
  image: string | null;
  level: number;
  /** array of ids resistances */
  resistances: string;
  /** array of ids effects / which are buffs and debuffs */
  effects: string;
  /** array of ids immunities */
  immunities: string;
  /** array of ids weaknesses */
  weaknesses: string;
  blueprint: number;
};

export type EncounterNPC = Prettify<
  Omit<
    DBEncounterNPC,
    "labels",
    "effects" | "immunities" | "resistances" | "weaknesses"
  > & {
    effects: DBEffect[];
    immunities: DBImmunity[];
    resistances: DBResistance[];
    weaknesses: DBWeakness[];
    labels: string[];
  }
>;
