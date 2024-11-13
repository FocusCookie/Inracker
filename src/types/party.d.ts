import { Player } from "./player";
import { Prettify } from "./utils";

export type DBParty = {
  readonly id: number;
  name: string;
  icon: string;
  description: string;
  /**
   * string of Array Player IDs
   */
  players: string;
};

export type Party = Prettify<
  Omit<DBParty, "players"> & {
    players: Player[];
  }
>;
