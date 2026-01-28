import {
  execute,
  select,
  createDatabaseError,
} from "./core";
import { createLog } from "./logs";
import i18n from "@/i18next";
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
    entityId?: number;
    type?: "player" | "opponent";
  }[],
  encounterId?: number,
): Promise<string> => {
  const combatId = crypto.randomUUID();

  // Generate IDs and prepare participants
  const participants = participantsData.map((p) => ({
    ...p,
    id: crypto.randomUUID(),
  }));

  try {
    await execute(
      "INSERT INTO combats (id, chapter_id, encounter_id, round, status) VALUES ($1, $2, $3, 1, 'running')",
      [combatId, chapterId, encounterId || null],
    );

    if (participants.length > 0) {
      // Batch insert participants
      const valueGroups: string[] = [];
      const args: any[] = [];
      let idx = 1;

      for (const p of participants) {
        valueGroups.push(
          `($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`,
        );
        args.push(
          p.id,
          combatId,
          p.name,
          p.initiative,
          p.entityId || null,
          p.type || null,
        );
      }

      const insertParticipantsQuery = `INSERT INTO combat_participants 
                (id, combat_id, name, initiative, entity_id, entity_type) 
                VALUES ${valueGroups.join(", ")}`;

      await execute(insertParticipantsQuery, args);

      // Determine active participant (highest initiative)
      const sorted = [...participants].sort(
        (a, b) => b.initiative - a.initiative,
      );

      if (sorted.length > 0) {
        await execute(
          "UPDATE combats SET active_participant_id = $1 WHERE id = $2",
          [sorted[0].id, combatId],
        );
      }
    }

    return combatId;
  } catch (e) {
    throw createDatabaseError("Failed to create combat", e);
  }
};

export const nextTurn = async (combatId: string) => {
  try {
    const combatRes = await select<DBCombat[]>(
      "SELECT * FROM combats WHERE id = $1",
      [combatId],
    );
    if (!combatRes.length) throw new Error("Combat not found");
    const combat = combatRes[0];

    const participants = await select<DBCombatParticipant[]>(
      "SELECT * FROM combat_participants WHERE combat_id = $1 ORDER BY initiative DESC",
      [combatId],
    );

    if (participants.length === 0) {
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
      // 0. Fetch seconds_per_round
      const sprRes = await select<{ value: string }[]>(
        "SELECT value FROM settings WHERE key = 'seconds_per_round'",
      );
      const secondsPerRound =
        sprRes.length > 0 ? parseInt(sprRes[0].value, 10) : 6;

      // 1. Bulk Decrement manual combat-only effects
      await execute(
        "UPDATE combat_effects SET duration = duration - 1 WHERE combat_id = $1",
        [combatId],
      );
      await execute(
        "DELETE FROM combat_effects WHERE combat_id = $1 AND duration <= 0",
        [combatId],
      );

      // 2. Decrement linked active_effects for participants in THIS combat
      for (const p of participants) {
        if (!p.entity_id || !p.entity_type) continue;

        // Apply health changes from active effects (value != 0)
        const activeEffects = await select<{ value: number; name: string }[]>(
          `SELECT e.value, e.name 
             FROM active_effects ae
             JOIN effects e ON ae.effect_id = e.id
             WHERE ae.entity_id = $1 AND ae.entity_type = $2`,
          [p.entity_id, p.entity_type],
        );

        const totalChange = activeEffects.reduce(
          (sum, eff) => sum + eff.value,
          0,
        );

        if (totalChange !== 0) {
          const table =
            p.entity_type === "player" ? "players" : "encounter_opponents";

          const entityRes = await select<
            { health: number; max_health: number; name: string }[]
          >(`SELECT health, max_health, name FROM ${table} WHERE id = $1`, [
            p.entity_id,
          ]);

          if (entityRes.length > 0) {
            const { health, max_health, name } = entityRes[0];
            let newHealth = health + totalChange;

            // If healing (positive change), cap at max_health
            if (totalChange > 0) {
              newHealth = Math.min(newHealth, max_health);
            }

            await execute(`UPDATE ${table} SET health = $1 WHERE id = $2`, [
              newHealth,
              p.entity_id,
            ]);

            // Log each individual effect that had an impact
            for (const eff of activeEffects) {
              if (eff.value !== 0) {
                await createLog({
                  chapterId: combat.chapter_id,
                  title:
                    eff.value > 0
                      ? i18n.t("PagePlay:healedByEffect", {
                          name,
                          amount: eff.value,
                          effect: eff.name,
                        })
                      : i18n.t("PagePlay:damagedByEffect", {
                          name,
                          amount: Math.abs(eff.value),
                          effect: eff.name,
                        }),
                  icon: eff.value > 0 ? "💚" : "💔",
                  type: eff.value > 0 ? "heal" : "damage",
                });
              }
            }
          }
        }

        // a. Decrement Rounds
        await execute(
          "UPDATE active_effects SET remaining_duration = remaining_duration - 1 WHERE entity_id = $1 AND entity_type = $2 AND duration_type = 'rounds'",
          [p.entity_id, p.entity_type],
        );
        // b. Decrement Time
        await execute(
          "UPDATE active_effects SET remaining_duration = remaining_duration - $1 WHERE entity_id = $2 AND entity_type = $3 AND duration_type = 'time'",
          [secondsPerRound, p.entity_id, p.entity_type],
        );

        // 3. Cleanup expired
        const expiredEffects = await select<
          { effect_id: number; entity_id: number; entity_type: string }[]
        >(
          "SELECT effect_id, entity_id, entity_type FROM active_effects WHERE entity_id = $1 AND entity_type = $2 AND remaining_duration <= 0",
          [p.entity_id, p.entity_type],
        );

        for (const expired of expiredEffects) {
          const table =
            expired.entity_type === "player" ? "players" : "encounter_opponents";

          const entityRes = await select<{ effects: string }[]>(
            `SELECT effects FROM ${table} WHERE id = $1`,
            [expired.entity_id],
          );

          if (entityRes.length > 0) {
            const currentEffects = JSON.parse(entityRes[0].effects) as number[];
            const updatedEffects = currentEffects.filter(
              (id) => id !== expired.effect_id,
            );

            await execute(`UPDATE ${table} SET effects = $1 WHERE id = $2`, [
              JSON.stringify(updatedEffects),
              expired.entity_id,
            ]);
          }
        }

        // Delete from tracking table
        await execute(
          "DELETE FROM active_effects WHERE entity_id = $1 AND entity_type = $2 AND remaining_duration <= 0",
          [p.entity_id, p.entity_type],
        );
      }
    }

    const nextParticipantId = participants[nextIndex].id;
    await execute(
      "UPDATE combats SET round = $1, active_participant_id = $2 WHERE id = $3",
      [nextRound, nextParticipantId, combatId],
    );
  } catch (e) {
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
  await execute(
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
  await execute("DELETE FROM combat_effects WHERE id = $1", [effectId]);
};

export const updateInitiative = async (
  participantId: string,
  newInitiative: number,
) => {
  try {
    // 1. Get combat_id and current info
    const participantRes = await select<{ combat_id: string }[]>(
      "SELECT combat_id FROM combat_participants WHERE id = $1",
      [participantId],
    );
    if (!participantRes.length) {
      throw new Error("Participant not found");
    }
    const combatId = participantRes[0].combat_id;

    const combatRes = await select<DBCombat[]>(
      "SELECT * FROM combats WHERE id = $1",
      [combatId],
    );
    if (!combatRes.length) {
      throw new Error("Combat not found");
    }
    const combat = combatRes[0];

    // 2. Check if we are in the "first turn" (Round 1, active participant is top of list)
    let shouldUpdateActive = false;
    if (combat.round === 1) {
      const currentParticipants = await select<DBCombatParticipant[]>(
        "SELECT id FROM combat_participants WHERE combat_id = $1 ORDER BY initiative DESC",
        [combatId],
      );
      if (
        currentParticipants.length > 0 &&
        currentParticipants[0].id === combat.active_participant_id
      ) {
        shouldUpdateActive = true;
      }
    }

    // 3. Update initiative
    await execute(
      "UPDATE combat_participants SET initiative = $1 WHERE id = $2",
      [newInitiative, participantId],
    );

    // 4. If we were in the first turn, ensure active participant is the new top
    if (shouldUpdateActive) {
      const newParticipants = await select<DBCombatParticipant[]>(
        "SELECT id FROM combat_participants WHERE combat_id = $1 ORDER BY initiative DESC",
        [combatId],
      );
      if (newParticipants.length > 0) {
        await execute(
          "UPDATE combats SET active_participant_id = $1 WHERE id = $2",
          [newParticipants[0].id, combatId],
        );
      }
    }
  } catch (e) {
    throw createDatabaseError("Failed to update initiative", e);
  }
};

export const getCombatState = async (
  chapterId: number,
): Promise<FullCombatState | null> => {
  const combats = await select<DBCombat[]>(
    "SELECT * FROM combats WHERE chapter_id = $1 AND status != 'finished'",
    [chapterId],
  );
  if (!combats.length) return null;
  const currentCombat = combats[0];

  const participants = await select<DBCombatParticipant[]>(
    "SELECT * FROM combat_participants WHERE combat_id = $1 ORDER BY initiative DESC",
    [currentCombat.id],
  );

  const effects = await select<DBCombatEffect[]>(
    "SELECT * FROM combat_effects WHERE combat_id = $1",
    [currentCombat.id],
  );

  return {
    combat: {
      ...currentCombat,
      chapterId: currentCombat.chapter_id,
      encounterId: currentCombat.encounter_id,
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

export const addParticipant = async (data: {
  combatId: string;
  name: string;
  initiative: number;
  entityId?: number;
  entityType?: "player" | "opponent";
}) => {
  await execute(
    `INSERT INTO combat_participants 
      (id, combat_id, name, initiative, entity_id, entity_type) 
      VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      crypto.randomUUID(),
      data.combatId,
      data.name,
      data.initiative,
      data.entityId || null,
      data.entityType || null,
    ],
  );
};

export const removeParticipant = async (participantId: string) => {
  try {
    await execute("DELETE FROM combat_effects WHERE participant_id = $1", [
      participantId,
    ]);
    await execute("DELETE FROM combat_participants WHERE id = $1", [
      participantId,
    ]);
  } catch (e) {
    throw createDatabaseError("Failed to remove participant", e);
  }
};

export const finishCombat = async (combatId: string) => {
  await execute("UPDATE combats SET status = 'finished' WHERE id = $1", [
    combatId,
  ]);
};

export const resetInitiative = async (combatId: string) => {
  await execute(
    "UPDATE combat_participants SET initiative = 0 WHERE combat_id = $1",
    [combatId],
  );
};

export const combat = {
  create: createCombat,
  nextTurn,
  finish: finishCombat,
  addEffect,
  removeEffect,
  updateInitiative,
  resetInitiative,
  getState: getCombatState,
  removeParticipant: removeParticipant,
  addParticipant: addParticipant,
};