import { Prettify } from "./utils";

export type TokenCoordinates = { x: number; y: number };
type TokenType = "player" | "opponent";

export type DBToken = {
  coordinates: string;
  id: number;
  /** Player or Opponent id */
  entity: number;
  /** id of the chapter where the token belongs to */
  chapter: number;
  type: TokenType;
};

export type Token = Prettify<Omit<DBToken, "coordinates">> & {
  coordinates: TokenCoordinates;
};
