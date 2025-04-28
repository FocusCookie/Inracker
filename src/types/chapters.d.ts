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
};

export type Chapter = Prettify<
  Omit<DBChapter, "state" | "opponents"> & {
    state: ChapterStatus;
  }
>;
