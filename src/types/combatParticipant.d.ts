import { Prettify } from "./utils";

export type DBCombatParticipant = {
  readonly id: number;
  readonly combat_id: number;
  token_id: number;
  name: string;
  initiative: number;
  is_hidden: number;
  has_acted: number;
};

export type CombatParticipant = Prettify<
  Omit<
    DBCombatParticipant,
    "combat_id" | "token_id" | "is_hidden" | "has_acted"
  > & {
    combatId: number;
    tokenId: number;
    /**
     * If true, this participant is visible only to the GM.
     */
    isHidden: boolean;
    /**
     * Tracks if the participant has finished their turn or used their reaction.
     * Useful for visual indicators on the tracker.
     */
    hasActed: boolean;
  }
>;
