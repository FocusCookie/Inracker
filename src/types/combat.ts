import { Prettify } from "./utils";

export type CombatStatus = "running" | "paused" | "finished";

export type DBCombat = {
  readonly id: string;
  readonly chapter_id: number;
  round: number;
  active_participant_id: string | null;
  status: CombatStatus;
  created_at: string;
};

export type DBCombatParticipant = {
  readonly id: string;
  readonly combat_id: string;
  entity_id: number | null;
  entity_type: "player" | "opponent" | null;
  name: string;
  initiative: number;
};

export type DBCombatEffect = {
  readonly id: string;
  readonly combat_id: string;
  readonly participant_id: string;
  name: string;
  description: string | null;
  duration: number;
  total_duration: number;
};

// --- Frontend Entities ---
export type Combat = Prettify<{
  id: string;
  chapterId: number;
  round: number;
  activeParticipantId: string | null;
  status: CombatStatus;
  createdAt: Date;
}>;

export type CombatParticipant = Prettify<{
  id: string;
  combatId: string;
  name: string;
  initiative: number;
  entityId?: number;
  entityType?: "player" | "opponent";
}>;

export type CombatEffect = Prettify<{
  id: string;
  combatId: string;
  participantId: string;
  name: string;
  description: string | null;
  duration: number;
  totalDuration: number;
}>;

// Helper response type
export type FullCombatState = {
  combat: Combat;
  participants: CombatParticipant[];
  effects: CombatEffect[];
};

