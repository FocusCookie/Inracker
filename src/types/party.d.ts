import { Player } from "./player";

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

export type Party = Omit<DBParty, "players"> & {
  players: Player[];
};
