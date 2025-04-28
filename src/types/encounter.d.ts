import { Attributes } from "./attributes";
import { Buff, DBEffect, Debuff, Effect, HarmfulEffect } from "./effect";
import { DBImmunity } from "./immunitiy";
import { DBResistance, Resistance } from "./resistances";
import { Skills } from "./skills";
import { Prettify } from "./utils";
import { CanvasElement } from "../components/Canvas/Canvas";

export type EncounterType = "fight" | "roll" | "note";
export type EncounterDifficulty = { value: number; description: string };

export type DBEncounter = {
  readonly id: number;
  element: string;
  name: string;
  color: string;
  type: string;
  passed: number;
  experience: number | null;
  /** array of strings */
  images: string | null;
  description: string | null;
  dice: number | null;
  /** array of {dice:number, description: string} */
  difficulties: string | null;
  opponents: string | null;
  skill: string | null;
};

export type Encounter = Prettify<
  Omit<DBEncounter, "images" | "difficulties" | "opponents" | "passed"> & {
    images: string[] | null;
    difficulties: EncounterDifficulty[] | null;
    opponents: string[] | null;
    passed: boolean;
    element: CanvasElement;
  }
>;
