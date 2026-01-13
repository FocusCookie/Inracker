import { EncounterOpponent } from "./opponents";
import { Player } from "./player";

export type InitiativeMenuEntity =
  | {
      type: "player";
      properties: Player;
      initiative: number;
    }
  | {
      type: "encounterOpponent";
      properties: EncounterOpponent;
      initiative: number;
    };
