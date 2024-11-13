import { Prettify } from "./utils";

export type DBImmunity = {
  readonly id: number;
  name: string;
  icon: string;
  description: string;
};

export type Immunity = Prettify<Omit<DBImmunity, "id">>;
