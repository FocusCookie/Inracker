import { EncounterOpponent } from "./opponents";
import { Player } from "./player";

export type EntityType = "player" | "encounterOpponent";

export type InitiativeMenuEntity = {
  type: EntityType;
  properties: Player | EncounterOpponent;
};
