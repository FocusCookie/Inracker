import { CombatEffect } from "./combat";
import { EncounterOpponent } from "./opponents";
import { Player } from "./player";

export type InitiativeMenuEntity =
  | {
      type: "player";
      properties: Player;
      initiative: number;
      effects?: CombatEffect[];
    }
  | {
      type: "encounterOpponent";
      properties: EncounterOpponent;
      initiative: number;
      effects?: CombatEffect[];
    };
