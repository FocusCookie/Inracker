import { DBEffect, Effect } from "@/types/effect";
import { connect, createDatabaseError } from "./core";
import TauriDatabase from "@tauri-apps/plugin-sql";
import { getAllPlayers, getDetailedPlayerById } from "./players";
import { getAllOpponents, getDetailedOpponentById } from "./opponents";

export const getAllEffects = async (db: TauriDatabase): Promise<Effect[]> => {
  const dbEffects = await db.select<DBEffect[]>("SELECT * FROM effects");

  return dbEffects.map((dbEffect) => {
    const { duration_type, ...rest } = dbEffect;
    return {
      ...rest,
      durationType: duration_type,
    } as Effect;
  });
};

export const getEffectById = async (
  db: TauriDatabase,
  effectId: number,
): Promise<Effect> => {
  const result = await db.select<DBEffect[]>(
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
  db: TauriDatabase,
  effect: Omit<Effect, "id">,
): Promise<Effect> => {
  const { name, icon, description, duration, durationType, type, value } =
    effect;
  const result = await db.execute(
    "INSERT INTO effects (name, icon, description, duration, duration_type, type, value) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [name, icon, description, duration, durationType, type, value],
  );

  return getEffectById(db, result!.lastInsertId as number);
};

export const updateEffect = async (
  db: TauriDatabase,
  effect: Effect,
): Promise<Effect> => {
  const { id, name, icon, description, duration, durationType, type, value } =
    effect;

  await db.execute(
    "UPDATE effects SET name = $2, icon = $3, description = $4, duration = $5, duration_type = $6, type = $7, value = $8 WHERE id = $1",
    [id, name, icon, description, duration, durationType, type, value],
  );

  return getEffectById(db, id);
};

export const deleteEffect = async (
  db: TauriDatabase,
  id: Effect["id"],
): Promise<DBEffect> => {
  const deletedEffect = await db.select<DBEffect[]>(
    "SELECT * FROM effects WHERE id = $1",
    [id],
  );

  // Clean up references in players
  const allPlayers = await getAllPlayers(db);

  for (const player of allPlayers) {
    const detailedPlayer = await getDetailedPlayerById(db, player.id);
    const effects = detailedPlayer.effects;
    const hasEffect = effects.some((effect: Effect) => effect.id === id);

    if (hasEffect) {
      const update = effects.filter((effect) => effect.id !== id);

      await db.execute("UPDATE players SET effects = $2 WHERE id = $1", [
        player.id,
        JSON.stringify(update.map((eff) => eff.id)),
      ]);
    }
  }

  // Clean up references in opponents
  const allOpponents = await getAllOpponents(db);

  for (const opponent of allOpponents) {
    const detailedOpponent = await getDetailedOpponentById(db, opponent.id);
    const effects = detailedOpponent.effects;
    const hasEffect = effects.some((effect: Effect) => effect.id === id);

    if (hasEffect) {
      const update = effects.filter((effect: Effect) => effect.id !== id);

      await db.execute("UPDATE opponents SET effects = $2 WHERE id = $1", [
        opponent.id,
        JSON.stringify(update.map((eff: Effect) => eff.id)),
      ]);
    }
  }
  if (!deletedEffect.length) {
    throw createDatabaseError(`Effect with ID ${id} not found`);
  }

  await db.execute("DELETE FROM effects WHERE id = $1", [id]);

  return deletedEffect[0];
};

export const effects = {
  getAll: async () => {
    const db = await connect();
    return getAllEffects(db);
  },
  getById: async (id: number) => {
    const db = await connect();
    return getEffectById(db, id);
  },
  create: async (effect: Omit<Effect, "id">) => {
    const db = await connect();
    return createEffect(db, effect);
  },
  update: async (effect: Effect) => {
    const db = await connect();
    return updateEffect(db, effect);
  },
  delete: async (id: Effect["id"]) => {
    const db = await connect();
    return deleteEffect(db, id);
  },
};
