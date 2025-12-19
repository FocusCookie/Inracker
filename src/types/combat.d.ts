import { Prettify } from "./utils";

export type CombatStatus = "running" | "paused" | "finished";

export type DBCombat = {
  readonly id: number;
  chapterId: number;
  round: number;
  activeParticipants: string;
  status: CombatStatus;
  started_at: string;
};

export type Combat = {
  readonly id: number;
  chapterId: number;
  round: number;
  activeParticipants: number[];
  status: CombatStatus;
  startedAt: string;
};
