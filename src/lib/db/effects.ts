import { DBEffect, Effect } from "@/types/effect";
import { execute, select, createDatabaseError } from "./core"; // Updated import
import { getAllPlayers, getDetailedPlayerById } from "./players";
import { getAllOpponents, getDetailedOpponentById } from "./opponents";

export const getAllEffects = async (): Promise<Effect[]> => {
  const dbEffects = await select<DBEffect[]>("SELECT * FROM effects"); // Changed db.select to select

  return dbEffects.map((dbEffect) => {
    const { duration_type, ...rest } = dbEffect;
    return {
      ...rest,
      durationType: duration_type,
    } as Effect;
  });
};

export const getEffectById = async (
  effectId: number,
): Promise<Effect> => {
  const result = await select<DBEffect[]>( // Changed db.select to select
    "SELECT * FROM effects WHERE id = $1",
    [effectId],
  );

  if (!result.length) {
    throw createDatabaseError(`Effect with ID ${effectId} not found`);
  }

  const { description, duration, duration_type, icon, id, name, type, value } =
    result[0];

  const effect: Effect = {
    description,
    duration,
    durationType: duration_type,
    icon,
    id,
    name,
    type,
    value,
  };

  return effect;
};

export const createEffect = async (
  effect: Omit<Effect, "id">,
): Promise<Effect> => {
  const { name, icon, description, duration, durationType, type, value } =
    effect;
  const result = await execute( // Changed db.execute to execute
    "INSERT INTO effects (name, icon, description, duration, duration_type, type, value) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [name, icon, description, duration, durationType, type, value],
  );

  return getEffectById(result!.lastInsertId as number); // Removed db parameter
};

export const updateEffect = async (
  effect: Effect,
): Promise<Effect> => {
  const { id, name, icon, description, duration, durationType, type, value } =
    effect;

  await execute( // Changed db.execute to execute
    "UPDATE effects SET name = $2, icon = $3, description = $4, duration = $5, duration_type = $6, type = $7, value = $8 WHERE id = $1",
    [id, name, icon, description, duration, durationType, type, value],
  );

  return getEffectById(id); // Removed db parameter
};

export const deleteEffect = async (
  id: Effect["id"],
): Promise<Effect> => {
  const deletedEffect = await select<DBEffect[]>( // Changed db.select to select
    "SELECT * FROM effects WHERE id = $1",
    [id],
  );

  // Clean up references in players
  const allPlayers = await getAllPlayers(); // Removed db parameter

  for (const player of allPlayers) {
    const detailedPlayer = await getDetailedPlayerById(player.id); // Removed db parameter
    const effects = detailedPlayer.effects;
    const hasEffect = effects.some((effect: Effect) => effect.id === id);

    if (hasEffect) {
      const update = effects.filter((effect: Effect) => effect.id !== id);

      await execute("UPDATE players SET effects = $2 WHERE id = $1", [ // Changed db.execute to execute
        player.id,
        JSON.stringify(update.map((eff) => eff.id)),
      ]);
    }
  }

  // Clean up references in opponents
  const allOpponents = await getAllOpponents(); // Removed db parameter

  for (const opponent of allOpponents) {
    const detailedOpponent = await getDetailedOpponentById(opponent.id); // Removed db parameter
    const effects = detailedOpponent.effects;
    const hasEffect = effects.some((effect: Effect) => effect.id === id);

    if (hasEffect) {
      const update = effects.filter((effect: Effect) => effect.id !== id);

      await execute("UPDATE opponents SET effects = $2 WHERE id = $1", [ // Changed db.execute to execute
        opponent.id,
        JSON.stringify(update.map((eff: Effect) => eff.id)),
      ]);
    }
  }
  if (!deletedEffect.length) {
    throw createDatabaseError(`Effect with ID ${id} not found`);
  }

  await execute("DELETE FROM effects WHERE id = $1", [id]); // Changed db.execute to execute

  const { duration_type, ...rest } = deletedEffect[0];
  return {
    ...rest,
    durationType: duration_type,
  } as Effect;
};

export const effects = {
  getAll: async () => {
    return getAllEffects(); // Removed db parameter
  },
  getById: async (id: number) => {
    return getEffectById(id); // Removed db parameter
  },
  create: async (effect: Omit<Effect, "id">) => {
    return createEffect(effect); // Removed db parameter
  },
  update: async (effect: Effect) => {
    return updateEffect(effect); // Removed db parameter
  },
  delete: async (id: Effect["id"]) => {
    return deleteEffect(id); // Removed db parameter
  },
};