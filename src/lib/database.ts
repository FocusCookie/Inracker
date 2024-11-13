import { Attributes } from "@/types/attributes";
import { DBEffect, Effect } from "@/types/effect";
import { DBParty, Party } from "@/types/party";
import {
  DBPlayer,
  Immunity,
  Movement,
  Player,
  SavingThrows,
  Shield,
} from "@/types/player";
import { Skills } from "@/types/skills";
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

//* Attributes
const getAttributesById = async (
  db: TauriDatabase,
  id: number,
): Promise<Attributes> => {
  const result = await db.select<Attributes[]>(
    "SELECT * FROM attributes WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Attributes with ID ${id} not found`);
  }

  return result[0];
};

const createAttributes = async (
  db: TauriDatabase,
  attributes: Omit<Attributes, "id">,
): Promise<Attributes> => {
  const {
    charisma,
    constitution,
    dexterity,
    intelligence,
    player,
    strength,
    wisdom,
  } = attributes;
  const result = await db.execute(
    "INSERT INTO attributes (charisma, constitution, dexterity, intelligence, player, strength, wisdom) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [charisma, constitution, dexterity, intelligence, player, strength, wisdom],
  );

  return getAttributesById(db, result.lastInsertId);
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
const getAllImmunities = async (db: TauriDatabase): Promise<Immunity[]> =>
  await db.select<Immunity[]>("SELECT * FROM immunities");

const getImmunityById = async (
  db: TauriDatabase,
  id: number,
): Promise<Immunity> => {
  const result = await db.select<Immunity[]>(
    "SELECT * FROM immunitites WHERE id = $1",
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
): Promise<Immunity> => {
  const { description, icon, name } = immunity;
  const result = await db.execute(
    "INSERT INTO immunities (description, icon, name) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [description, icon, name],
  );

  return getImmunityById(db, result.lastInsertId);
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
    movement: dbMovement,
    effects: dbEffects,
    saving_throws: dbSavingThrows,
    shield: dbShield,
    immunities: dbImmunities,
    skills: dbSkills,
    attributes: dbAttributes,

    armor,
    class_sg,
    description,
    ep,
    health,
    icon,
    id,
    level,
    name,
    perception,
    role,
  } = dbPlayer;

  const movement = JSON.parse(dbMovement) as Movement;
  const shield = JSON.parse(dbShield) as Shield;
  const savingThrows = JSON.parse(dbSavingThrows) as SavingThrows;

  const attributes = await getAttributesById(db, dbAttributes);
  const effectsIds = JSON.parse(dbEffects) as number[];
  const immunitiesIds = JSON.parse(dbImmunities) as number[];
  const skills = await getSkillsById(db, dbSkills);

  let effects: Effect[] = [];
  let immunities: Immunity[] = [];

  for (const effectId of effectsIds) {
    const buff = await getEffectById(db, effectId);

    const { description, duration, duration_type, icon, id, name, type } = buff;

    effects.push({
      description,
      duration,
      durationType: duration_type === "rounds" ? "rounds" : "time",
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
    movement,
    shield,
    savingThrows,
    attributes,
    effects,
    immunities,
    skills,
    armor,
    classSg: class_sg,
    description,
    ep,
    health,
    icon,
    id,
    level,
    name,
    perception,
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
  player: Omit<Player, "id">,
): Promise<DBPlayer> => {
  const {
    armor,
    attributes,
    classSg,
    description,
    ep,
    effects,
    health,
    icon,
    immunities,
    level,
    movement,
    name,
    perception,
    role,
    savingThrows,
    shield,
    skills,
  } = player;

  const result = await db.execute(
    "INSERT INTO players (armor, attributes, class_sg, description, ep, effects, health, icon, immunities, level, movement, name, perception, role, saving_throws, shield, skills) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)  RETURNING *",
    [
      armor,
      attributes.id,
      classSg,
      description,
      ep,
      JSON.stringify(effects.map((effect) => effect.id).join(", ")),
      health,
      icon,
      JSON.stringify(immunities.map((immunity) => immunity.id).join(", ")),
      level,
      JSON.stringify(movement),
      name,
      perception,
      role,
      JSON.stringify(savingThrows),
      JSON.stringify(shield),
      skills.id,
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

//* Skills
const getSkillsById = async (
  db: TauriDatabase,
  id: number,
): Promise<Skills> => {
  const result = await db.select<Skills[]>(
    "SELECT * FROM skills WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Skills with ID ${id} not found`);
  }

  return result[0];
};

const createSkills = async (
  db: TauriDatabase,
  skills: Omit<Skills, "id">,
): Promise<Skills> => {
  const {
    acrobatics,
    arcane,
    athletics,
    craftmanship,
    custom_1,
    custom_2,
    deception,
    diplomacy,
    healing,
    intimidation,
    nature,
    occultism,
    performance,
    player,
    religion,
    social,
    stealth,
    survival,
    thievery,
  } = skills;
  const result = await db.execute(
    "INSERT INTO skills (acrobatics, arcane, athletics, craftmanship, custom_1, custom_2, deception, diplomacy, healing, intimidation, nature, occultism, performance, player, religion, social, stealth, survival, thievery) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *",
    [
      acrobatics,
      arcane,
      athletics,
      craftmanship,
      custom_1,
      custom_2,
      deception,
      diplomacy,
      healing,
      intimidation,
      nature,
      occultism,
      performance,
      player,
      religion,
      social,
      stealth,
      survival,
      thievery,
    ],
  );

  return getSkillsById(db, result.lastInsertId);
};

export const Database = {
  connect,
  disconnect,

  attributes: {
    getById: async (id: number) => {
      const db = await connect();
      return getAttributesById(db, id);
    },
    create: async (attributes: Omit<Attributes, "id">) => {
      const db = await connect();
      return createAttributes(db, attributes);
    },
  },

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
    create: async (immunity: Omit<Immunity, "id">) => {
      const db = await connect();
      return createImmunitiy(db, immunity);
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
    create: async (player: Omit<Player, "id">) => {
      const db = await connect();
      return createPlayer(db, player);
    },
  },

  skills: {
    getById: async (id: number) => {
      const db = await connect();
      return getSkillsById(db, id);
    },
    create: async (skills: Omit<Skills, "id">) => {
      const db = await connect();
      return createSkills(db, skills);
    },
  },
};

export default Database;
