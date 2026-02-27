import { Prettify } from "./utils";

export type DBWeakness = {
  readonly id: number;
  name: string;
  icon: string;
  description: string;
};

export type Weakness = Prettify<Omit<DBWeakness, "id">>;
