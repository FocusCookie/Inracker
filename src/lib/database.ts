import {
  Chapter,
  ChapterCharacterToken,
  ChapterStatus,
  DBChapter,
} from "@/types/chapters";
import { DBEffect, Effect } from "@/types/effect";
import { DBImmunity, Immunity } from "@/types/immunitiy";
import { DBParty, Party } from "@/types/party";
import { DBPlayer, Player, TCreatePlayer } from "@/types/player";
import { DBResistance, Resistance } from "@/types/resistances";
import TauriDatabase from "@tauri-apps/plugin-sql";

const environment = import.meta.env.VITE_ENV;
let dbInstance: TauriDatabase | null = null;

const createDatabaseError = (message: string, originalError?: unknown) => ({
  name: "DatabaseError",
  message,
  originalError,
});

const connect = async (): Promise<TauriDatabase> => {
  try {
    if (!dbInstance) {
      dbInstance = await TauriDatabase.load(
        `sqlite:${environment ?? "dev"}.db`,
      );
    }

    return dbInstance;
  } catch (error) {
    throw createDatabaseError("Error establishing database connection", error);
  }
};

const disconnect = async (): Promise<void> => {
  if (dbInstance) {
    await dbInstance.close?.();
    dbInstance = null;
  }
};

//* Effects
const getAllEffects = async (db: TauriDatabase): Promise<DBEffect[]> =>
  await db.select<DBEffect[]>("SELECT * FROM effects");

const getEffectById = async (
  db: TauriDatabase,
  id: number,
): Promise<DBEffect> => {
  const result = await db.select<DBEffect[]>(
    "SELECT * FROM effects WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Effect with ID ${id} not found`);
  }

  return result[0];
};

const createEffect = async (
  db: TauriDatabase,
  effect: Omit<Effect, "id">,
): Promise<DBEffect> => {
  const { name, icon, description, duration, durationType, type } = effect;
  const result = await db.execute(
    "INSERT INTO effects (name, icon, description, duration, duration_type, type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [name, icon, description, duration, durationType, type],
  );

  return getEffectById(db, result!.lastInsertId as number);
};

//* Immunities
const getAllImmunities = async (db: TauriDatabase): Promise<DBImmunity[]> =>
  await db.select<DBImmunity[]>("SELECT * FROM immunities");

const getImmunityById = async (
  db: TauriDatabase,
  id: number,
): Promise<DBImmunity> => {
  const result = await db.select<DBImmunity[]>(
    "SELECT * FROM immunities WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Immunity with ID ${id} not found`);
  }

  return result[0];
};

const createImmunitiy = async (
  db: TauriDatabase,
  immunity: Omit<Immunity, "id">,
): Promise<DBImmunity> => {
  const { description, icon, name } = immunity;
  const result = await db.execute(
    "INSERT INTO immunities (description, icon, name) VALUES ($1, $2, $3) RETURNING *",
    [description, icon, name],
  );

  return getImmunityById(db, result!.lastInsertId as number);
};

//* Resistances
const getAllResistances = async (db: TauriDatabase): Promise<DBResistance[]> =>
  await db.select<DBResistance[]>("SELECT * FROM resistances");

const getResistanceById = async (
  db: TauriDatabase,
  id: number,
): Promise<DBResistance> => {
  const result = await db.select<DBResistance[]>(
    "SELECT * FROM resistances WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Resistance with ID ${id} not found`);
  }

  return result[0];
};

const createResistance = async (
  db: TauriDatabase,
  immunity: Omit<Resistance, "id">,
): Promise<DBResistance> => {
  const { description, icon, name } = immunity;
  const result = await db.execute(
    "INSERT INTO resistances (description, icon, name) VALUES ($1, $2, $3) RETURNING *",
    [description, icon, name],
  );

  return getResistanceById(db, result!.lastInsertId as number);
};

//* Party
const getAllParties = async (db: TauriDatabase): Promise<DBParty[]> =>
  await db.select<DBParty[]>("SELECT * FROM parties");

const getPartyById = async (
  db: TauriDatabase,
  id: number,
): Promise<DBParty> => {
  const result = await db.select<DBParty[]>(
    "SELECT * FROM parties WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Party with ID ${id} not found`);
  }

  return result[0];
};

const getPartyDetailedById = async (
  db: TauriDatabase,
  id: number,
): Promise<Party> => {
  const dbParties = await db.select<DBParty[]>(
    "SELECT * FROM parties WHERE id = $1",
    [id],
  );

  if (!dbParties.length) {
    throw createDatabaseError(`Party with ID ${id} not found`);
  }

  const dbParty = dbParties[0];
  const playerIds = JSON.parse(dbParty.players) as number[];
  let players: Player[] = [];

  for (const id of playerIds) {
    const player = await getDetailedPlayerById(db, id);
    players.push(player);
  }

  return { ...dbParty, players };
};

const createParty = async (
  db: TauriDatabase,
  party: Omit<Party, "id">,
): Promise<DBParty> => {
  const { name, icon, description, players } = party;
  const result = await db.execute(
    "INSERT INTO parties (name, icon, description, players ) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, icon, description, JSON.stringify(players)],
  );

  const createdParty = await getPartyById(db, result!.lastInsertId as number);

  return createdParty;
};

const updateParty = async (db: TauriDatabase, party: Party): Promise<Party> => {
  const { id, name, icon, description } = party;

  await db.execute(
    "UPDATE parties SET id = $1, name = $2, icon = $3, description = $4 WHERE id = $1",
    [id, name, icon, description],
  );

  const updatedParty = getPartyDetailedById(db, party.id);

  return updatedParty;
};

const addPlayerToParty = async (
  db: TauriDatabase,
  partyId: number,
  playerId: number,
) => {
  const dbParty = await getPartyById(db, partyId);
  const players = JSON.parse(dbParty.players) as number[];
  players.push(playerId);

  await db.execute("UPDATE parties SET id = $1, players = $2 WHERE id = $1", [
    partyId,
    JSON.stringify(players),
  ]);

  const updatedParty = await getPartyDetailedById(db, partyId);

  return updatedParty;
};

const removePlayerFromParty = async (
  db: TauriDatabase,
  partyId: number,
  playerId: number,
) => {
  const dbParty = await getPartyById(db, partyId);
  const players = JSON.parse(dbParty.players) as number[];
  const newPlayers = players.filter((id) => id !== playerId);

  await db.execute("UPDATE parties SET id = $1, players = $2 WHERE id = $1", [
    partyId,
    JSON.stringify(newPlayers),
  ]);
};

const deletePartyById = async (
  db: TauriDatabase,
  id: number,
): Promise<DBParty> => {
  const deletedParty = await getPartyById(db, id);
  await db.execute("DELETE FROM parties WHERE id = $1", [id]);

  return deletedParty;
};

//* Player
const getDetailedPlayerById = async (
  db: TauriDatabase,
  playerId: Player["id"],
) => {
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

  let effects: DBEffect[] = [];
  let immunities: DBImmunity[] = [];
  let resistances: DBResistance[] = [];

  for (const effectId of effectsIds) {
    const buff = await getEffectById(db, effectId);

    const { description, duration, duration_type, icon, id, name, type } = buff;

    effects.push({
      description,
      duration,
      duration_type,
      icon,
      id,
      name,
      type,
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

const getAllPlayers = async (db: TauriDatabase): Promise<DBPlayer[]> =>
  await db.select<DBPlayer[]>("SELECT * FROM players");

const getPlayerById = async (
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

const createPlayer = async (
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

const updatePlayer = async (
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

const addImmunityToPlayer = async (
  db: TauriDatabase,
  playerId: Player["id"],
  immunityId: DBImmunity["id"],
) => {
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

const removeImmunityFromPlayer = async (
  db: TauriDatabase,
  playerId: Player["id"],
  immunityId: DBImmunity["id"],
) => {
  const { immunities } = await getDetailedPlayerById(db, playerId);
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

  return getDetailedPlayerById(db, playerId);
};

const addResistanceToPlayer = async (
  db: TauriDatabase,
  playerId: Player["id"],
  resistanceId: DBResistance["id"],
) => {
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

const removeResistanceFromPlayer = async (
  db: TauriDatabase,
  playerId: Player["id"],
  resistanceId: DBResistance["id"],
) => {
  const { resistances } = await getDetailedPlayerById(db, playerId);
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

  return getDetailedPlayerById(db, playerId);
};

const deletePlayerById = async (
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

//* Chapters
const getChapterById = async (
  db: TauriDatabase,
  id: number,
): Promise<DBChapter> => {
  const result = await db.select<DBChapter[]>(
    "SELECT * FROM chapters WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Chapter with ID ${id} not found`);
  }

  return result[0];
};

const getDetailedChapterById = async (
  db: TauriDatabase,
  id: number,
): Promise<Chapter> => {
  const dbChapters = await db.select<DBChapter[]>(
    "SELECT * FROM chapters WHERE id = $1",
    [id],
  );

  if (!dbChapters.length) {
    throw createDatabaseError(`Chapter with ID ${id} not found`);
  }

  const dbChapter = dbChapters[0];
  const encounters = dbChapter.encounters
    ? (JSON.parse(dbChapter.encounters) as number[])
    : [];
  const tokens = dbChapter.tokens
    ? (JSON.parse(dbChapter.tokens) as ChapterCharacterToken[])
    : [];
  const state = dbChapter.state as ChapterStatus;

  return { ...dbChapter, encounters, tokens, state };
};

const createChapter = async (
  db: TauriDatabase,
  chapter: Omit<Chapter, "id">,
): Promise<DBChapter> => {
  const {
    name,
    icon,
    description,
    battlemap,
    encounters,
    state,
    tokens,
    party,
  } = chapter;

  const result = await db.execute(
    "INSERT INTO chapters(name, icon, description, battlemap,encounters, state, tokens, party, position) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
    [
      name,
      icon,
      description,
      battlemap,
      JSON.stringify(encounters),
      state,
      JSON.stringify(tokens),
      party,
    ],
  );

  const createdChapter = await getChapterById(
    db,
    result!.lastInsertId as number,
  );

  return createdChapter;
};

const getAllChaptersForParty = async (
  db: TauriDatabase,
  partyId: Party["id"],
): Promise<Chapter[]> => {
  const dbChapters = await db.select<DBChapter[]>(
    "SELECT * FROM chapters WHERE party = $1",
    [partyId],
  );
  const prettyfiedChapters: Chapter[] = [];

  for (const dbChapter of dbChapters) {
    const prettyChapter = await getDetailedChapterById(db, dbChapter.id);
    prettyfiedChapters.push(prettyChapter);
  }

  console.log({ prettyfiedChapters });

  return prettyfiedChapters;
};

const updateChapter = async (
  db: TauriDatabase,
  chapter: Chapter,
): Promise<Chapter> => {
  const {
    id,
    battlemap,
    description,
    encounters,
    icon,
    name,
    party,
    state,
    tokens,
  } = chapter;

  await db.execute(
    "UPDATE chapters SET battlemap = $2, description = $3, encounters = $4, icon = $5, name = $6, party = $7, state = $8, tokens = $9 WHERE id = $1",
    [
      id,
      battlemap,
      description,
      JSON.stringify(encounters.map((enc: any) => enc.id).join), // TODO: create encounter type
      icon,
      name,
      party,
      state,
      JSON.stringify(
        tokens.map((token: ChapterCharacterToken) => token.id).join,
      ),
    ],
  );

  return getDetailedChapterById(db, id);
};

export const Database = {
  connect,
  disconnect,

  effects: {
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
  },

  immunitites: {
    getAll: async () => {
      const db = await connect();
      return getAllImmunities(db);
    },
    getById: async (id: number) => {
      const db = await connect();
      return getImmunityById(db, id);
    },
    create: async (immunity: Omit<DBResistance, "id">) => {
      const db = await connect();
      return createImmunitiy(db, immunity);
    },
  },

  resistances: {
    getAll: async () => {
      const db = await connect();
      return getAllResistances(db);
    },
    getById: async (id: number) => {
      const db = await connect();
      return getResistanceById(db, id);
    },
    create: async (resistance: Omit<DBResistance, "id">) => {
      const db = await connect();
      return createResistance(db, resistance);
    },
  },

  parties: {
    getAll: async () => {
      const db = await connect();
      return getAllParties(db);
    },
    getAllDetailed: async () => {
      const db = await connect();
      const dbParties = await getAllParties(db);
      const parties: Party[] = [];

      for (const dbParty of dbParties) {
        const party = await getPartyDetailedById(db, dbParty.id);
        parties.push(party);
      }

      return parties;
    },
    getById: async (id: number) => {
      const db = await connect();
      return getPartyById(db, id);
    },
    getDetailedById: async (id: number) => {
      const db = await connect();
      return getPartyDetailedById(db, id);
    },
    create: async (party: Omit<Party, "id">) => {
      const db = await connect();
      return createParty(db, party);
    },
    deleteById: async (id: Party["id"]) => {
      const db = await connect();
      console.log("DB DELETE");
      return deletePartyById(db, id);
    },
    updateByParty: async (party: Party) => {
      const db = await connect();
      return updateParty(db, party);
    },
    addPlayerToParty: async (partyId: Party["id"], playerId: Player["id"]) => {
      const db = await connect();
      return addPlayerToParty(db, partyId, playerId);
    },
    removePlayerFromParty: async (
      partyId: Party["id"],
      playerId: Player["id"],
    ) => {
      const db = await connect();
      return removePlayerFromParty(db, partyId, playerId);
    },
  },

  players: {
    getAll: async () => {
      const db = await connect();
      return getAllPlayers(db);
    },
    getById: async (id: number) => {
      const db = await connect();
      return getPlayerById(db, id);
    },
    getDetailedById: async (id: number) => {
      const db = await connect();
      return getDetailedPlayerById(db, id);
    },
    getAllDetailed: async () => {
      const db = await connect();
      const playersRaw = await getAllPlayers(db);
      const detailedPlayers: Player[] = [];

      for (const player of playersRaw) {
        const detailedPlayer = await getDetailedPlayerById(db, player.id);
        detailedPlayers.push(detailedPlayer);
      }

      return detailedPlayers;
    },
    create: async (player: TCreatePlayer) => {
      const db = await connect();
      return createPlayer(db, player);
    },
    /**
     * Updates a specific player
     * @param player
     * @returns  the updated player
     */
    update: async (player: Player) => {
      const db = await connect();
      return updatePlayer(db, player);
    },
    addImmunityToPlayer: async (
      playerId: Player["id"],
      immunityId: DBImmunity["id"],
    ) => {
      const db = await connect();
      return addImmunityToPlayer(db, playerId, immunityId);
    },
    removeImmunityFromPlayer: async (
      playerId: Player["id"],
      immunityId: DBImmunity["id"],
    ) => {
      const db = await connect();
      return removeImmunityFromPlayer(db, playerId, immunityId);
    },
    addResistanceToPlayer: async (
      playerId: Player["id"],
      resistanceId: DBResistance["id"],
    ) => {
      const db = await connect();
      return addResistanceToPlayer(db, playerId, resistanceId);
    },
    removeResistanceFromPlayer: async (
      playerId: Player["id"],
      resistanceId: DBResistance["id"],
    ) => {
      const db = await connect();
      return removeResistanceFromPlayer(db, playerId, resistanceId);
    },
    deletePlayerById: async (playerId: Player["id"]) => {
      const db = await connect();
      return deletePlayerById(db, playerId);
    },
  },

  chapters: {
    create: async (chapter: Omit<Chapter, "id">) => {
      const db = await connect();
      return createChapter(db, chapter);
    },
    getById: async (id: Chapter["id"]) => {
      const db = await connect();
      return getChapterById(db, id);
    },
    getByIdDetailed: async (id: Chapter["id"]) => {
      const db = await connect();
      return getDetailedChapterById(db, id);
    },
    getChaptersByPartyId: async (partyId: Party["id"]) => {
      const db = await connect();
      return getAllChaptersForParty(db, partyId);
    },
    update: async (chapter: Chapter) => {
      const db = await connect();
      return updateChapter(db, chapter);
    },
  },
};

export default Database;
