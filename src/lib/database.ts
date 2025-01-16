import { Chapter, DBChapter } from "@/types/chapters";
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

  return getEffectById(db, result.lastInsertId);
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

  return getImmunityById(db, result.lastInsertId);
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

  return getResistanceById(db, result.lastInsertId);
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
  return getPartyById(db, result.lastInsertId);
};

const updateParty = async (db: TauriDatabase, party: Party): Promise<Party> => {
  const { id, name, icon, description } = party;

  await db.execute(
    "UPDATE parties SET id = $1, name = $2, icon = $3, description = $4 WHERE id = $1",
    [id, name, icon, description],
  );

  return getPartyDetailedById(db, party.id);
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
  const resistances = JSON.parse(dbResistances) as Resistance[];
  const maxHealth = max_health;

  let effects: DBEffect[] = [];
  let immunities: DBImmunity[] = [];

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

  const player: Player = {
    details,
    effects,
    ep,
    health,
    maxHealth,
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
): Promise<DBPlayer> => {
  const {
    details,
    effects,
    ep,
    health,
    maxHealth,
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
    "INSERT INTO players (details, effects, ep, health, max_health, image, icon,immunities, level, name, overview, resistances, role) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)  RETURNING *",
    [
      details,
      JSON.stringify(effects.map((id) => id).join(", ")),
      ep,
      health,
      maxHealth,
      image,
      icon,
      JSON.stringify(immunities.map((id) => id).join(", ")),
      level,
      name,
      overview,
      JSON.stringify(resistances.map((id) => id).join(", ")),
      role,
    ],
  );

  return getPlayerById(db, result.lastInsertId);
};

const deletePartyById = async (
  db: TauriDatabase,
  id: number,
): Promise<boolean> => {
  const res = await db.execute("DELETE FROM parties WHERE id = $1", [id]);

  return Boolean(res.rowsAffected);
};

//* Chapters
const getAllChaptersForParty = async (
  db: TauriDatabase,
  partyId: Party["id"],
): Promise<Chapter[]> => {
  const dbChapters = await db.select<DBChapter[]>(
    "SELECT * FROM chapters WHERE id = $1",
    [partyId],
  );
  const prettyfiedChapters: Chapter[] = [];

  for (const dbChapter of dbChapters) {
    const prettyChapter = {
      ...dbChapter,
      token: dbChapter.tokens ? JSON.parse(dbChapter.tokens) : null,
      encounters: dbChapter.encounters
        ? JSON.parse(dbChapter.encounters)
        : null,
    } as Chapter;

    prettyfiedChapters.push(prettyChapter);
  }

  return prettyfiedChapters;
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
  },

  chapters: {
    getChaptersByPartyId: async (partyId: Party["id"]) => {
      const db = await connect();
      return getAllChaptersForParty(db, partyId);
    },
  },
};

export default Database;
