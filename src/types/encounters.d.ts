import { Prettify } from "./utils";

export type DBEncounter = {
  readonly id: number;
  name: string;
  image: string | null;
  icon: string;
  description: string | null;
  color: string;
  type: string;
  ep: number | null;
  state: string;
  dice: number | null;
  /**
   * skill to make the diffifulty check against
   */
  skill: string | null;
  difficulty: number | null;
  /**
   * array of opponent ids
   */
  opponents: string | null;
};

export type Ecounter = Prettify<
  Omit<DBEncounter, "type" | "string" | "opponents"> & {
    type: "role" | "fight" | "note";
    state: "completed" | "draft" | "ongoing" | "waiting";
    opponents: string[] | null;
  }
>;
