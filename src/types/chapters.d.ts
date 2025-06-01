import { Encounter } from "./encounter";
import { Prettify } from "./utils";

export type ChapterStatus = "completed" | "draft" | "ongoing" | "waiting";

export type DBChapter = {
  readonly id: number;
  name: string;
  icon: string;
  description: string | null;
  state: string;
  battlemap: string | null;
  party: number;
  encounters: string;
};

export type Chapter = Prettify<
  Omit<DBChapter, "state" | "encounters"> & {
    state: ChapterStatus;
    encounters: Array<Encounter["id"]>;
  }
>;
