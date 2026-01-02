import { connect, createDatabaseError } from "./core";
import {
  DBCombat,
  DBCombatEffect,
  DBCombatParticipant,
  FullCombatState,
} from "@/types/combat";

export const createCombat = async (
  chapterId: number,
  participantsData: {
    name: string;
    initiative: number;
    entityId: number;
    type: "player" | "opponent";
  }[],
): Promise<string> => {
  const db = await connect();
  const combatId = crypto.randomUUID();

  await db.execute("BEGIN TRANSACTION");

  try {
    await db.execute(
      "INSERT INTO combats (id, chapter_id, round, status) VALUES ($1, $2, 1, 'running')",
      [combatId, chapterId],
    );

    if (participantsData.length !== 0) {
      for (const participant of participantsData) {
        await db.execute(
          `INSERT INTO combat_participants 
                (id, combat_id, name, initiative, entity_id, entity_type) 
                VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            crypto.randomUUID(),
            combatId,
            participant.name,
            participant.initiative,
            participant.entityId,
            participant.type,
          ],
        );
      }

      const sorted = await db.select<any[]>(
        "SELECT id FROM combat_participants WHERE combat_id = $1 ORDER BY initiative DESC LIMIT 1",
        [combatId],
      );

      if (sorted.length > 0) {
        await db.execute(
          "UPDATE combats SET active_participant_id = $1 WHERE id = $2",
          [sorted[0].id, combatId],
        );
      }
    }

    await db.execute("COMMIT");

    return combatId;
  } catch (e) {
    await db.execute("ROLLBACK");
    throw createDatabaseError("Failed to create combat", e);
  }
};

export const nextTurn = async (combatId: string) => {
  const db = await connect();
  await db.execute("BEGIN TRANSACTION");

  try {
    const combatRes = await db.select<DBCombat[]>(
      "SELECT * FROM combats WHERE id = $1",
      [combatId],
    );
    if (!combatRes.length) throw new Error("Combat not found");
    const combat = combatRes[0];

    const participants = await db.select<DBCombatParticipant[]>(
      "SELECT id FROM combat_participants WHERE combat_id = $1 ORDER BY initiative DESC",
      [combatId],
    );

    if (participants.length === 0) {
      await db.execute("COMMIT");

      return;
    }

    const currentIndex = participants.findIndex(
      (p) => p.id === combat.active_participant_id,
    );

    let nextIndex = currentIndex + 1;
    let nextRound = combat.round;
    let isNewRound = false;

    if (nextIndex >= participants.length) {
      nextIndex = 0;
      nextRound += 1;
      isNewRound = true;
    }

    if (isNewRound) {
      await db.execute(
        "UPDATE combat_effects SET duration = duration - 1 WHERE combat_id = $1",
        [combatId],
      );
      await db.execute(
        "DELETE FROM combat_effects WHERE combat_id = $1 AND duration <= 0",
        [combatId],
      );
    }

    const nextParticipantId = participants[nextIndex].id;
    await db.execute(
      "UPDATE combats SET round = $1, active_participant_id = $2 WHERE id = $3",
      [nextRound, nextParticipantId, combatId],
    );

    await db.execute("COMMIT");
  } catch (e) {
    await db.execute("ROLLBACK");
    throw createDatabaseError("Failed to advance turn", e);
  }
};

export const addEffect = async (effect: {
  combatId: string;
  participantId: string;
  name: string;
  description?: string;
  duration: number;
}) => {
  const db = await connect();
  await db.execute(
    `INSERT INTO combat_effects (id, combat_id, participant_id, name, description, duration, total_duration)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      crypto.randomUUID(),
      effect.combatId,
      effect.participantId,
      effect.name,
      effect.description || null,
      effect.duration,
      effect.duration,
    ],
  );
};

export const removeEffect = async (effectId: string) => {
  const db = await connect();
  await db.execute("DELETE FROM combat_effects WHERE id = $1", [effectId]);
};

export const updateInitiative = async (
  participantId: string,
  newInitiative: number,
) => {
  const db = await connect();
  await db.execute(
    "UPDATE combat_participants SET initiative = $1 WHERE id = $2",
    [newInitiative, participantId],
  );
};

export const getCombatState = async (
  chapterId: number,
): Promise<FullCombatState | null> => {
  const db = await connect();

  const combats = await db.select<DBCombat[]>(
    "SELECT * FROM combats WHERE chapter_id = $1 AND status != 'finished'",
    [chapterId],
  );
  if (!combats.length) return null;
  const currentCombat = combats[0];

  const participants = await db.select<DBCombatParticipant[]>(
    "SELECT * FROM combat_participants WHERE combat_id = $1 ORDER BY initiative DESC",
    [currentCombat.id],
  );

  const effects = await db.select<DBCombatEffect[]>(
    "SELECT * FROM combat_effects WHERE combat_id = $1",
    [currentCombat.id],
  );

  return {
    combat: {
      ...currentCombat,
      chapterId: currentCombat.chapter_id,
      activeParticipantId: currentCombat.active_participant_id,
      createdAt: new Date(currentCombat.created_at),
    },
    participants: participants.map((p) => ({
      ...p,
      combatId: p.combat_id,
      entityId: p.entity_id ?? undefined,
      entityType: p.entity_type ?? undefined,
    })),
    effects: effects.map((e) => ({
      ...e,
      combatId: e.combat_id,
      participantId: e.participant_id,
      totalDuration: e.total_duration,
    })),
  };
};

export const combat = {
  create: createCombat,
  nextTurn,
  addEffect,
  removeEffect,
  updateInitiative,
  getState: getCombatState,
};

