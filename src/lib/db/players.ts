import { DBPlayer, Player, TCreatePlayer } from "@/types/player";
import { DBImmunity } from "@/types/immunitiy";
import { DBResistance } from "@/types/resistances";
import { Effect } from "@/types/effect";
import { connect, createDatabaseError } from "./core";
import TauriDatabase from "@tauri-apps/plugin-sql";
import { getEffectById } from "./effects";
import { getImmunityById } from "./immunities";
import { getResistanceById } from "./resistances";
import { getAllParties } from "./parties";

export const getPlayerById = async (
  db: TauriDatabase,
  id: number,
): Promise<DBPlayer> => {
  const result = await db.select<DBPlayer[]>(
    "SELECT * FROM players WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Player with ID ${id} not found`);
  }

  return result[0];
};

export const getDetailedPlayerById = async (
  db: TauriDatabase,
  playerId: Player["id"],
): Promise<Player> => {
  const dbPlayer = await getPlayerById(db, playerId);
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
    role,
    overview,
  } = dbPlayer;

  const effectsIds = JSON.parse(dbEffects) as number[];
  const immunitiesIds = JSON.parse(dbImmunities) as number[];
  const resistancesIds = JSON.parse(dbResistances) as number[];

  let effects: Effect[] = [];
  let immunities: DBImmunity[] = [];
  let resistances: DBResistance[] = [];

  for (const effectId of effectsIds) {
    const buff = await getEffectById(db, effectId);

    const { description, duration, durationType, icon, id, name, type, value } =
      buff;

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
  }

  for (const immunityId of immunitiesIds) {
    const immunity = await getImmunityById(db, immunityId);
    immunities.push(immunity);
  }

  for (const resistanceId of resistancesIds) {
    const resistance = await getResistanceById(db, resistanceId);
    resistances.push(resistance);
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
    role,
  };

  return player;
};

export const getAllPlayers = async (db: TauriDatabase): Promise<DBPlayer[]> =>
  await db.select<DBPlayer[]>("SELECT * FROM players");

export const getAllDetailedPlayers = async (db: TauriDatabase): Promise<Player[]> => {
  const playersRaw = await getAllPlayers(db);
  const detailedPlayers: Player[] = [];

  for (const player of playersRaw) {
    const detailedPlayer = await getDetailedPlayerById(db, player.id);
    detailedPlayers.push(detailedPlayer);
  }

  return detailedPlayers;
};

export const createPlayer = async (
  db: TauriDatabase,
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
    role,
  } = player;

  const result = await db.execute(
    "INSERT INTO players (details, effects, ep, health, max_health, image, icon, immunities, level, name, overview, resistances, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)  RETURNING *",
    [
      details,
      effects.length > 0
        ? JSON.stringify(effects.map((id) => id).join(", "))
        : "[]",
      ep,
      health,
      max_health,
      image,
      icon,
      immunities.length > 0
        ? JSON.stringify(immunities.map((id) => id).join(", "))
        : "[]",
      level,
      name,
      overview,
      resistances.length > 0
        ? JSON.stringify(resistances.map((id) => id).join(", "))
        : "[]",
      role,
    ],
  );

  return getDetailedPlayerById(db, result!.lastInsertId as number);
};

export const updatePlayer = async (
  db: TauriDatabase,
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
    role,
  } = player;

  await db.execute(
    "UPDATE players SET details = $2, effects = $3, ep = $4, health = $5, max_health = $6, image = $7, icon = $8, immunities = $9, level = $10, name = $11, overview = $12, resistances = $13, role = $14 WHERE id = $1",
    [
      id, // 1
      details, // 2
      JSON.stringify(effects.map((id) => id).join(", ")), // 3
      ep, // 4
      health, // 5
      max_health, // 6
      image, // 7
      icon, // 8
      JSON.stringify(immunities.map((id) => id).join(", ")), // 9
      level, // 10
      name, // 11
      overview, // 12
      JSON.stringify(resistances.map((id) => id).join(", ")), // 13
      role, // 14
    ],
  );

  return getDetailedPlayerById(db, id);
};

export const addImmunityToPlayer = async (
  db: TauriDatabase,
  playerId: Player["id"],
  immunityId: DBImmunity["id"],
): Promise<Player> => {
  const { immunities } = await getDetailedPlayerById(db, playerId);
  const isAlreadySet = immunities.some(
    (immunity) => immunity.id === immunityId,
  );
  const update = immunities.map((immunity) => immunity.id);

  if (!isAlreadySet) {
    update.push(immunityId);

    await db.execute("UPDATE players SET immunities = $2 WHERE id = $1", [
      playerId,
      JSON.stringify(update.map((id: number) => id).join(", ")),
    ]);
  }

  return getDetailedPlayerById(db, playerId);
};

export const removeImmunityFromPlayer = async (
  db: TauriDatabase,
  playerId: Player["id"],
  immunityId: DBImmunity["id"],
) => {
  const { immunities } = await getDetailedPlayerById(db, playerId);
  const removedImmunity = immunities.find(
    (immunity) => immunity.id === immunityId,
  );
  const update = immunities.filter((immunity) => immunity.id !== immunityId);

  await db.execute("UPDATE players SET immunities = $2 WHERE id = $1", [
    playerId,
    JSON.stringify(
      update
        .map((im) => im.id)
        .map((id: number) => id)
        .join(", "),
    ),
  ]);

  return removedImmunity as DBImmunity;
};

export const addResistanceToPlayer = async (
  db: TauriDatabase,
  playerId: Player["id"],
  resistanceId: DBResistance["id"],
): Promise<Player> => {
  const { resistances } = await getDetailedPlayerById(db, playerId);
  const isAlreadySet = resistances.some(
    (resistance) => resistance.id === resistanceId,
  );
  const update = resistances.map((resistance) => resistance.id);

  if (!isAlreadySet) {
    update.push(resistanceId);

    await db.execute("UPDATE players SET resistances = $2 WHERE id = $1", [
      playerId,
      JSON.stringify(update.map((id: number) => id).join(", ")),
    ]);
  }

  return getDetailedPlayerById(db, playerId);
};

export const removeResistanceFromPlayer = async (
  db: TauriDatabase,
  playerId: Player["id"],
  resistanceId: DBResistance["id"],
) => {
  const { resistances } = await getDetailedPlayerById(db, playerId);
  const removedResistance = resistances.find(
    (resistance) => resistance.id === resistanceId,
  ) as DBResistance;
  const update = resistances.filter(
    (resistance) => resistance.id !== resistanceId,
  );

  await db.execute("UPDATE players SET resistances = $2 WHERE id = $1", [
    playerId,
    JSON.stringify(
      update
        .map((im) => im.id)
        .map((id: number) => id)
        .join(", "),
    ),
  ]);

  return removedResistance;
};

export const deletePlayerById = async (
  db: TauriDatabase,
  id: Player["id"],
): Promise<Player> => {
  const deletedPlayer = await getDetailedPlayerById(db, id);
  const allParties = await getAllParties(db);
  const partiesWithPlayer = allParties.filter((party) =>
    party.players.includes(id.toString()),
  );

  await db.execute("DELETE FROM players WHERE id = $1", [id]);
  //TODO: Implement deletion of the image

  for (const party of partiesWithPlayer) {
    const players = JSON.parse(party.players) as number[];
    const updatedPlayers = players.filter(
      (playerId: number) => playerId !== id,
    );

    await db.execute("UPDATE parties SET id = $1, players = $2 WHERE id = $1", [
      party.id,
      JSON.stringify(updatedPlayers),
    ]);
  }

  return deletedPlayer;
};

export const players = {
  getAll: async () => {
    const db = await connect();
    return getAllDetailedPlayers(db);
  },
  getById: async (id: number) => {
    const db = await connect();
    return getDetailedPlayerById(db, id);
  },
  create: async (player: TCreatePlayer) => {
    const db = await connect();
    return createPlayer(db, player);
  },
  update: async (player: Player) => {
    const db = await connect();
    return updatePlayer(db, player);
  },
  delete: async (id: Player["id"]) => {
    const db = await connect();
    return deletePlayerById(db, id);
  },
  addImmunity: async (
    playerId: Player["id"],
    immunityId: DBImmunity["id"],
  ) => {
    const db = await connect();
    return addImmunityToPlayer(db, playerId, immunityId);
  },
  removeImmunity: async (
    playerId: Player["id"],
    immunityId: DBImmunity["id"],
  ) => {
    const db = await connect();
    return removeImmunityFromPlayer(db, playerId, immunityId);
  },
  addResistance: async (
    playerId: Player["id"],
    resistanceId: DBResistance["id"],
  ) => {
    const db = await connect();
    return addResistanceToPlayer(db, playerId, resistanceId);
  },
  removeResistance: async (
    playerId: Player["id"],
    resistanceId: DBResistance["id"],
  ) => {
    const db = await connect();
    return removeResistanceFromPlayer(db, playerId, resistanceId);
  },
};
