import { execute, select, createDatabaseError } from "./core";

/**
 * Performs a Short Rest for all players in the database.
 * 1. Heals all players to max health.
 * 2. Removes all effects with duration_type = 'short'.
 */
export const shortRest = async () => {
  try {
    // 1. Heal all players
    await execute("UPDATE players SET health = max_health");

    // 2. Identify all 'short' effects currently active
    const shortEffects = await select<{ entity_id: number; effect_id: number; entity_type: string }[]>(
      "SELECT entity_id, effect_id, entity_type FROM active_effects WHERE duration_type = 'short'"
    );

    // 3. Remove these effects from their entities' JSON arrays
    for (const effect of shortEffects) {
      const table = effect.entity_type === 'player' ? 'players' : 'encounter_opponents';
      const res = await select<{ effects: string }[]>(`SELECT effects FROM ${table} WHERE id = $1`, [effect.entity_id]);
      
      if (res.length > 0) {
        const currentEffects = JSON.parse(res[0].effects) as number[];
        const updatedEffects = currentEffects.filter(id => id !== effect.effect_id);
        await execute(`UPDATE ${table} SET effects = $1 WHERE id = $2`, [JSON.stringify(updatedEffects), effect.entity_id]);
      }
    }

    // 4. Delete from active_effects tracking
    await execute("DELETE FROM active_effects WHERE duration_type = 'short'");

  } catch (e) {
    throw createDatabaseError("Failed to perform short rest", e);
  }
};

/**
 * Performs a Long Rest for all players in the database.
 * 1. Heals all players to max health.
 * 2. Removes all effects with duration_type = 'short' OR 'long'.
 */
export const longRest = async () => {
  try {
    // 1. Heal all players
    await execute("UPDATE players SET health = max_health");

    // 2. Identify all 'short' and 'long' effects
    const expiringEffects = await select<{ entity_id: number; effect_id: number; entity_type: string }[]>(
      "SELECT entity_id, effect_id, entity_type FROM active_effects WHERE duration_type IN ('short', 'long')"
    );

    // 3. Remove from JSON
    for (const effect of expiringEffects) {
      const table = effect.entity_type === 'player' ? 'players' : 'encounter_opponents';
      const res = await select<{ effects: string }[]>(`SELECT effects FROM ${table} WHERE id = $1`, [effect.entity_id]);
      
      if (res.length > 0) {
        const currentEffects = JSON.parse(res[0].effects) as number[];
        const updatedEffects = currentEffects.filter(id => id !== effect.effect_id);
        await execute(`UPDATE ${table} SET effects = $1 WHERE id = $2`, [JSON.stringify(updatedEffects), effect.entity_id]);
      }
    }

    // 4. Delete from tracking
    await execute("DELETE FROM active_effects WHERE duration_type IN ('short', 'long')");

  } catch (e) {
    throw createDatabaseError("Failed to perform long rest", e);
  }
};
