import { Prettify } from "./utils";
import { Ecounter } from "./encounters";

export type ChapterCharacterToken = {
  type: "player" | "opponent";
  id: number;
  position: { x: number; y: number };
};

export type DBChapter = {
  readonly id: number;
  name: string;
  icon: string;
  description: string | null;
  experience: number | null;
  state: string;
  battlemap: string | null;
  /**
   * array of token objects for players and opponents
   */
  tokens: string | null;
  /**
   * array of encounter ids
   */
  encounters: string | null;
};

export type Chapter = Prettify<
  Omit<DBChapter, "type" | "string" | "opponents"> & {
    state: "completed" | "draft" | "ongoing" | "waiting";
    tokens: ChapterCharacterToken | null;
    encounters: Array[Ecounter["id"]];
  }
>;
