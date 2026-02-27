import { DBPlayer, Player, TCreatePlayer } from "@/types/player";
import { DBImmunity } from "@/types/immunitiy";
import { DBResistance } from "@/types/resistances";
import { DBWeakness } from "@/types/weakness";
import { Effect } from "@/types/effect";
import { execute, select, createDatabaseError } from "./core"; // Updated import
import { getEffectById } from "./effects";
import { getImmunityById } from "./immunities";
import { getResistanceById } from "./resistances";
import { getWeaknessById } from "./weaknesses";
import { getAllParties } from "./parties";
import { DBToken } from "@/types/tokens";
import { deleteTokenById } from "./tokens";

export const getPlayerById = async (
  id: number,
): Promise<DBPlayer> => {
  const result = await select<DBPlayer[]>( // Changed db.select to select
    "SELECT * FROM players WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Player with ID ${id} not found`);
  }

  return result[0];
};

export const getDetailedPlayerById = async (
  playerId: Player["id"],
): Promise<Player> => {
  const dbPlayer = await getPlayerById(playerId); // Removed db parameter
  const {
    effects: dbEffects,
    image,
    immunities: dbImmunities,
    details,
    ep,
    health,
    icon,
    id,
    level,
    name,
    max_health,
    resistances: dbResistances,
    weaknesses: dbWeaknesses,
    role,
    overview,
    gold,
    silver,
    copper,
    hero_points,
  } = dbPlayer;

  const effectsIds = JSON.parse(dbEffects) as number[];
  const immunitiesIds = JSON.parse(dbImmunities) as number[];
  const resistancesIds = JSON.parse(dbResistances) as number[];
  const weaknessesIds = JSON.parse(dbWeaknesses || "[]") as number[];

  let effects: Effect[] = [];
  let immunities: DBImmunity[] = [];
  let resistances: DBResistance[] = [];
  let weaknesses: DBWeakness[] = [];

  for (const effectId of effectsIds) {
    try {
      const buff = await getEffectById(effectId); // Removed db parameter

      const {
        description,
        duration: catalogDuration,
        durationType,
        icon,
        id,
        name,
        type,
        value,
      } = buff;

      // Try to get remaining duration from active_effects
      const activeEffect = await select<{ remaining_duration: number }[]>(
        "SELECT remaining_duration FROM active_effects WHERE entity_id = $1 AND entity_type = 'player' AND effect_id = $2",
        [playerId, effectId],
      );

      const duration = activeEffect.length > 0 ? activeEffect[0].remaining_duration : catalogDuration;

      effects.push({
        description,
        duration,
        durationType,
        icon,
        id,
        name,
        type,
        value,
      });
    } catch (e) {
      console.warn(`Failed to load effect ${effectId}`, e);
    }
  }

  for (const immunityId of immunitiesIds) {
    try {
      const immunity = await getImmunityById(immunityId); // Removed db parameter
      immunities.push(immunity);
    } catch (e) {
      console.warn(`Failed to load immunity ${immunityId}`, e);
    }
  }

  for (const resistanceId of resistancesIds) {
    try {
      const resistance = await getResistanceById(resistanceId); // Removed db parameter
      resistances.push(resistance);
    } catch (e) {
      console.warn(`Failed to load resistance ${resistanceId}`, e);
    }
  }

  for (const weaknessId of weaknessesIds) {
    try {
      const weakness = await getWeaknessById(weaknessId);
      weaknesses.push(weakness);
    } catch (e) {
      console.warn(`Failed to load weakness ${weaknessId}`, e);
    }
  }

  const player: Player = {
    details,
    effects,
    ep,
    health,
    max_health,
    id,
    image,
    icon,
    immunities,
    level,
    name,
    overview,
    resistances,
    weaknesses,
    role,
    gold,
    silver,
    copper,
    hero_points,
  };

  return player;
};

export const getAllPlayers = async (): Promise<DBPlayer[]> =>
  await select<DBPlayer[]>("SELECT * FROM players"); // Changed db.select to select

export const getAllDetailedPlayers = async (): Promise<Player[]> => {
  const playersRaw = await getAllPlayers(); // Removed db parameter
  const detailedPlayers: Player[] = [];

  for (const player of playersRaw) {
    const detailedPlayer = await getDetailedPlayerById(player.id); // Removed db parameter
    detailedPlayers.push(detailedPlayer);
  }

  return detailedPlayers;
};

export const createPlayer = async (
  player: TCreatePlayer,
): Promise<Player> => {
  const {
    details,
    effects,
    ep,
    health,
    max_health,
    image,
    icon,
    immunities,
    level,
    name,
    overview,
    resistances,
    weaknesses,
    role,
    gold,
    silver,
    copper,
    hero_points,
  } = player;

  const result = await execute( // Changed db.execute to execute
    "INSERT INTO players (details, effects, ep, health, max_health, image, icon, immunities, level, name, overview, resistances, weaknesses, role, gold, silver, copper, hero_points) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)  RETURNING *",
    [
      details,
      effects.length > 0 ? JSON.stringify(effects.map((id) => id)) : "[]",
      ep,
      health,
      max_health,
      image,
      icon,
      immunities.length > 0
        ? JSON.stringify(immunities.map((id) => id))
        : "[]",
      level,
      name,
      overview,
      resistances.length > 0
        ? JSON.stringify(resistances.map((id) => id))
        : "[]",
      weaknesses.length > 0
        ? JSON.stringify(weaknesses.map((id) => id))
        : "[]",
      role,
      gold,
      silver,
      copper,
      hero_points,
    ],
  );

  return getDetailedPlayerById(result!.lastInsertId as number); // Removed db parameter
};

export const updatePlayer = async (
  player: Player,
): Promise<Player> => {
  const {
    details,
    effects,
    ep,
    health,
    max_health,
    id,
    image,
    icon,
    immunities,
    level,
    name,
    overview,
    resistances,
    weaknesses,
    role,
    gold,
    silver,
    copper,
    hero_points,
  } = player;

  await execute( // Changed db.execute to execute
    "UPDATE players SET details = $2, effects = $3, ep = $4, health = $5, max_health = $6, image = $7, icon = $8, immunities = $9, level = $10, name = $11, overview = $12, resistances = $13, weaknesses = $14, role = $15, gold = $16, silver = $17, copper = $18, hero_points = $19 WHERE id = $1",
    [
      id, // 1
      details, // 2
      JSON.stringify(effects.map((e) => e.id)), // 3
      ep, // 4
      health, // 5
      max_health, // 6
      image, // 7
      icon, // 8
      JSON.stringify(immunities.map((i) => i.id)), // 9
      level, // 10
      name, // 11
      overview, // 12
      JSON.stringify(resistances.map((r) => r.id)), // 13
      JSON.stringify(weaknesses.map((w) => w.id)), // 14
      role, // 15
      gold, // 16
      silver, // 17
      copper, // 18
      hero_points, // 19
    ],
  );

  return getDetailedPlayerById(id); // Removed db parameter
};

export const addImmunityToPlayer = async (
  playerId: Player["id"],
  immunityId: DBImmunity["id"],
): Promise<Player> => {
  const { immunities } = await getDetailedPlayerById(playerId); // Removed db parameter
  const isAlreadySet = immunities.some(
    (immunity) => immunity.id === immunityId,
  );
  const update = immunities.map((immunity) => immunity.id);

  if (!isAlreadySet) {
    update.push(immunityId);

    await execute("UPDATE players SET immunities = $2 WHERE id = $1", [ // Changed db.execute to execute
      playerId,
      JSON.stringify(update.map((id: number) => id)),
    ]);
  }

  return getDetailedPlayerById(playerId); // Removed db parameter
};

export const removeImmunityFromPlayer = async (
  playerId: Player["id"],
  immunityId: DBImmunity["id"],
) => {
  const { immunities } = await getDetailedPlayerById(playerId); // Removed db parameter
  const removedImmunity = immunities.find(
    (immunity) => immunity.id === immunityId,
  );
  const update = immunities.filter(
    (immunity) => immunity.id !== immunityId,
  );

  await execute("UPDATE players SET immunities = $2 WHERE id = $1", [ // Changed db.execute to execute
    playerId,
    JSON.stringify(
      update
        .map((im) => im.id)
        .map((id: number) => id),
    ),
  ]);

  return removedImmunity as DBImmunity;
};

export const addResistanceToPlayer = async (
  playerId: Player["id"],
  resistanceId: DBResistance["id"],
): Promise<Player> => {
  const { resistances } = await getDetailedPlayerById(playerId); // Removed db parameter
  const isAlreadySet = resistances.some(
    (resistance) => resistance.id === resistanceId,
  );
  const update = resistances.map((resistance) => resistance.id);

  if (!isAlreadySet) {
    update.push(resistanceId);

    await execute("UPDATE players SET resistances = $2 WHERE id = $1", [ // Changed db.execute to execute
      playerId,
      JSON.stringify(update.map((id: number) => id)),
    ]);
  }

  return getDetailedPlayerById(playerId); // Removed db parameter
};

export const removeResistanceFromPlayer = async (
  playerId: Player["id"],
  resistanceId: DBResistance["id"],
) => {
  const { resistances } = await getDetailedPlayerById(playerId); // Removed db parameter
  const removedResistance = resistances.find(
    (resistance) => resistance.id === resistanceId,
  ) as DBResistance;
  const update = resistances.filter(
    (resistance) => resistance.id !== resistanceId,
  );

  await execute("UPDATE players SET resistances = $2 WHERE id = $1", [ // Changed db.execute to execute
    playerId,
    JSON.stringify(
      update
        .map((im) => im.id)
        .map((id: number) => id),
    ),
  ]);

  return removedResistance;
};

export const addWeaknessToPlayer = async (
  playerId: Player["id"],
  weaknessId: DBWeakness["id"],
): Promise<Player> => {
  const { weaknesses } = await getDetailedPlayerById(playerId);
  const isAlreadySet = weaknesses.some(
    (weakness) => weakness.id === weaknessId,
  );
  const update = weaknesses.map((weakness) => weakness.id);

  if (!isAlreadySet) {
    update.push(weaknessId);

    await execute("UPDATE players SET weaknesses = $2 WHERE id = $1", [
      playerId,
      JSON.stringify(update.map((id: number) => id)),
    ]);
  }

  return getDetailedPlayerById(playerId);
};

export const removeWeaknessFromPlayer = async (
  playerId: Player["id"],
  weaknessId: DBWeakness["id"],
) => {
  const { weaknesses } = await getDetailedPlayerById(playerId);
  const removedWeakness = weaknesses.find(
    (weakness) => weakness.id === weaknessId,
  ) as DBWeakness;
  const update = weaknesses.filter(
    (weakness) => weakness.id !== weaknessId,
  );

  await execute("UPDATE players SET weaknesses = $2 WHERE id = $1", [
    playerId,
    JSON.stringify(
      update
        .map((w) => w.id)
        .map((id: number) => id),
    ),
  ]);

  return removedWeakness;
};

export const deletePlayerById = async (
  id: Player["id"],
): Promise<Player> => {
  const deletedPlayer = await getDetailedPlayerById(id); // Removed db parameter
  const allParties = await getAllParties(); // Removed db parameter
  const partiesWithPlayer = allParties.filter((party) =>
    party.players.includes(id.toString()),
  );

  // Delete all tokens for this player
  const playerTokens = await select<DBToken[]>( // Changed db.select to select
    "SELECT * FROM tokens WHERE entity = $1 AND type = $2",
    [id, "player"],
  );
  
  for (const token of playerTokens) {
    await deleteTokenById(token.id); // Removed db parameter
  }

  await execute("DELETE FROM players WHERE id = $1", [id]); // Changed db.execute to execute
  //TODO: Implement deletion of the image

  for (const party of partiesWithPlayer) {
    const players = JSON.parse(party.players) as number[];
    const updatedPlayers = players.filter(
      (playerId: number) => playerId !== id,
    );

    await execute("UPDATE parties SET id = $1, players = $2 WHERE id = $1", [ // Changed db.execute to execute
      party.id,
      JSON.stringify(updatedPlayers),
    ]);
  }

  return deletedPlayer;
};

export const addEffectToPlayer = async (
  playerId: Player["id"],
  effectId: Effect["id"],
): Promise<Player> => {
  const { effects } = await getDetailedPlayerById(playerId); // Removed db parameter
  const isAlreadySet = effects.some((effect) => effect.id === effectId);
  const update = effects.map((effect) => effect.id);

  if (!isAlreadySet) {
    update.push(effectId);

    await execute("UPDATE players SET effects = $2 WHERE id = $1", [ // Changed db.execute to execute
      playerId,
      JSON.stringify(update.map((id: number) => id)),
    ]);

    // Populate active_effects
    const catalogEffect = await getEffectById(effectId);
    await execute(
      "INSERT INTO active_effects (id, effect_id, entity_id, entity_type, remaining_duration, duration_type) VALUES ($1, $2, $3, $4, $5, $6)",
      [
        crypto.randomUUID(),
        effectId,
        playerId,
        "player",
        catalogEffect.duration,
        catalogEffect.durationType,
      ],
    );
  }

  return getDetailedPlayerById(playerId); // Removed db parameter
};

export const removeEffectFromPlayer = async (
  playerId: Player["id"],
  effectId: Effect["id"],
) => {
  const { effects } = await getDetailedPlayerById(playerId); // Removed db parameter
  const removedEffect = effects.find((effect) => effect.id === effectId);
  const update = effects.filter((effect) => effect.id !== effectId);

  await execute("UPDATE players SET effects = $2 WHERE id = $1", [ // Changed db.execute to execute
    playerId,
    JSON.stringify(
      update
        .map((eff) => eff.id)
        .map((id: number) => id),
    ),
  ]);

  // Remove from active_effects tracking
  await execute(
    "DELETE FROM active_effects WHERE entity_id = $1 AND entity_type = 'player' AND effect_id = $2",
    [playerId, effectId],
  );

  return removedEffect as Effect;
};

export const players = {
  getAll: async () => {
    return getAllDetailedPlayers(); // Removed db parameter
  },
  getById: async (id: number) => {
    return getDetailedPlayerById(id); // Removed db parameter
  },
  create: async (player: TCreatePlayer) => {
    return createPlayer(player); // Removed db parameter
  },
  update: async (player: Player) => {
    return updatePlayer(player); // Removed db parameter
  },
  delete: async (id: Player["id"]) => {
    return deletePlayerById(id); // Removed db parameter
  },
  addEffect: async (playerId: Player["id"], effectId: Effect["id"]) => {
    return addEffectToPlayer(playerId, effectId); // Removed db parameter
  },
  removeEffect: async (playerId: Player["id"], effectId: Effect["id"]) => {
    return removeEffectFromPlayer(playerId, effectId); // Removed db parameter
  },
  addImmunity: async (
    playerId: Player["id"],
    immunityId: DBImmunity["id"],
  ) => {
    return addImmunityToPlayer(playerId, immunityId); // Removed db parameter
  },
  removeImmunity: async (
    playerId: Player["id"],
    immunityId: DBImmunity["id"],
  ) => {
    return removeImmunityFromPlayer(playerId, immunityId); // Removed db parameter
  },
  addResistance: async (
    playerId: Player["id"],
    resistanceId: DBResistance["id"],
  ) => {
    return addResistanceToPlayer(playerId, resistanceId); // Removed db parameter
  },
  removeResistance: async (
    playerId: Player["id"],
    resistanceId: DBResistance["id"],
  ) => {
    return removeResistanceFromPlayer(playerId, resistanceId); // Removed db parameter
  },
  addWeakness: async (
    playerId: Player["id"],
    weaknessId: DBWeakness["id"],
  ) => {
    return addWeaknessToPlayer(playerId, weaknessId);
  },
  removeWeakness: async (
    playerId: Player["id"],
    weaknessId: DBWeakness["id"],
  ) => {
    return removeWeaknessFromPlayer(playerId, weaknessId);
  },
};