import { Attributes } from "./attributes";
import { Buff, DBEffect, Debuff, Effect, HarmfulEffect } from "./effect";
import { DBImmunity } from "./immunitiy";
import { DBResistance, Resistance } from "./resistances";
import { Skills } from "./skills";
import { Prettify } from "./utils";

export type DBPlayer = {
  /** markdown notes */
  details: string;
  /** array of ids effects / which are buffs and debuffs */
  effects: string;
  ep: number;
  health: number;
  image: string | null;
  icon: string;
  readonly id: number;
  /** array of ids immunities */
  immunities: string;
  level: number;
  max_health: number;
  /** array of ids resistances */
  name: string;
  /** markdown notes that are shown first on player info */
  overview: string;
  resistances: string;
  role: string;
  gold: number;
  silver: number;
  copper: number;
  hero_points: number;
};

export type Player = Prettify<
  Omit<DBPlayer, "effects" | "immunities" | "resistances"> & {
    effects: Effect[];
    immunities: DBImmunity[];
    resistances: DBResistance[];
  }
>;

export type TCreatePlayer = Prettify<
  Omit<DBPlayer, "effects" | "immunities" | "id" | "resistances"> & {
    effects: Array<Effect["id"]>;
    immunities: Array<DBImmunity["id"]>;
    resistances: Array<Resistance["id"]>;
  }
>;
