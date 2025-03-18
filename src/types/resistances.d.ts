import { Prettify } from "./utils";

export type DBResistance = {
  readonly id: number;
  name: string;
  icon: string;
  description: string;
};

export type Resistance = Prettify<Omit<Resistance, "id">>;
