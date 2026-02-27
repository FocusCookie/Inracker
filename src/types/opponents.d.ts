import { Attributes } from "./attributes";
import { Buff, DBEffect, Debuff, Effect, HarmfulEffect } from "./effect";
import { DBImmunity } from "./immunitiy";
import { DBResistance, Resistance } from "./resistances";
import { DBWeakness, Weakness } from "./weakness";
import { Skills } from "./skills";
import { Prettify } from "./utils";
import { CanvasElement } from "../components/Canvas/Canvas";

export type DBOpponent = {
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

export type Opponent = Prettify<
  Omit<
    DBOpponent,
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

export type DBEncounterOpponent = {
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

export type EncounterOpponent = Prettify<
  Omit<
    DBEncounterOpponent,
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
