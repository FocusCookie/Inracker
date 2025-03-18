import { Prettify } from "./utils";
import { Ecounter } from "./encounters";

export type ChapterCharacterToken = {
  type: "player" | "opponent";
  id: number;
  position: { x: number; y: number };
};

export type ChapterStatus = "completed" | "draft" | "ongoing" | "waiting";

export type DBChapter = {
  readonly id: number;
  name: string;
  icon: string;
  description: string | null;
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
  party: number;
};

export type Chapter = Prettify<
  Omit<DBChapter, "state" | "opponents" | "tokens"> & {
    state: ChapterStatus;
    tokens: Array<ChapterCharacterToken>;
    encounters: Array[Ecounter["id"]];
  }
>;
