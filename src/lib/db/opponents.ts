import {
  DBEncounterOpponent,
  DBOpponent,
  EncounterOpponent,
  Opponent,
} from "@/types/opponents";
import { Effect } from "@/types/effect";
import { DBImmunity } from "@/types/immunitiy";
import { DBResistance } from "@/types/resistances";
import { connect, createDatabaseError } from "./core";
import TauriDatabase from "@tauri-apps/plugin-sql";
import { getEffectById } from "./effects";
import { getImmunityById } from "./immunities";
import { getResistanceById } from "./resistances";
import {
  deleteTokenById,
  createToken,
  getEncounterOpponentToken,
} from "./tokens";

//* OPPONENTS (Blueprints)

export const getAllOpponents = async (
  db: TauriDatabase,
): Promise<DBOpponent[]> =>
  await db.select<DBOpponent[]>("SELECT * FROM opponents");

export const getOpponentById = async (
  db: TauriDatabase,
  id: DBOpponent["id"],
): Promise<DBOpponent> => {
  const result = await db.select<DBOpponent[]>(
    "SELECT * FROM opponents WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Opponent with ID ${id} not found`);
  }

  return result[0];
};

export const getDetailedOpponentById = async (
  db: TauriDatabase,
  opponentId: Opponent["id"],
): Promise<Opponent> => {
  const dbOpponent = await getOpponentById(db, opponentId);
  const {
    details,
    effects: dbEffects,
    health,
    icon,
    id,
    image,
    immunities: dbImmunities,
    labels,
    level,
    max_health,
    name,
    resistances: dbResistances,
  } = dbOpponent;

  const effectsIds = (JSON.parse(dbEffects) as number[]).filter((id) => id != null);
  const immunitiesIds = (JSON.parse(dbImmunities) as number[]).filter((id) => id != null);
  const resistancesIds = (JSON.parse(dbResistances) as number[]).filter((id) => id != null);
  const labelList = JSON.parse(labels) as string[];

  let effects: Effect[] = [];
  let immunities: DBImmunity[] = [];
  let resistances: DBResistance[] = [];

  for (const effectId of effectsIds) {
    try {
      const effect = await getEffectById(db, effectId);
      effects.push(effect);
    } catch (e) {
      console.warn(`Failed to load effect ${effectId}`, e);
    }
  }

  for (const immunityId of immunitiesIds) {
    try {
      const immunity = await getImmunityById(db, immunityId);
      immunities.push(immunity);
    } catch (e) {
      console.warn(`Failed to load immunity ${immunityId}`, e);
    }
  }

  for (const resistanceId of resistancesIds) {
    try {
      const resistance = await getResistanceById(db, resistanceId);
      resistances.push(resistance);
    } catch (e) {
      console.warn(`Failed to load resistance ${resistanceId}`, e);
    }
  }

  const opponent: Opponent = {
    details,
    effects,
    health,
    icon,
    id,
    image,
    immunities,
    labels: labelList,
    level,
    max_health,
    name,
    resistances,
  };

  return opponent;
};

export const getAllDetailedOpponents = async (
  db: TauriDatabase,
): Promise<Opponent[]> => {
  const opponentsRaw = await getAllOpponents(db);
  const detailedOpponents: Opponent[] = [];

  for (const opponent of opponentsRaw) {
    const detailedOpponent = await getDetailedOpponentById(db, opponent.id);
    detailedOpponents.push(detailedOpponent);
  }

  return detailedOpponents as unknown as Opponent[];
};

export const createOpponent = async (
  db: TauriDatabase,
  opponent: Omit<Opponent, "id">,
): Promise<Opponent> => {
  const {
    details,
    effects,
    health,
    icon,
    image,
    immunities,
    labels,
    level,
    max_health,
    name,
    resistances,
  } = opponent;

  const result = await db.execute(
    "INSERT INTO opponents (details, effects, health, icon, image, immunities, labels, level, max_health, name, resistances) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *",
    [
      details,
      JSON.stringify(effects.map((e: Effect) => e.id)),
      health,
      icon,
      image,
      JSON.stringify(immunities.map((i: DBImmunity) => i.id)),
      JSON.stringify(labels),
      level,
      max_health,
      name,
      JSON.stringify(resistances.map((r: DBResistance) => r.id)),
    ],
  );

  return getDetailedOpponentById(db, result!.lastInsertId as number);
};

export const updateOpponent = async (
  db: TauriDatabase,
  opponent: Opponent,
): Promise<Opponent> => {
  const {
    details,
    effects,
    health,
    icon,
    id,
    image,
    immunities,
    labels,
    level,
    max_health,
    name,
    resistances,
  } = opponent;

  await db.execute(
    "UPDATE opponents SET details = $2, effects = $3, health = $4, icon = $5, image = $6, immunities = $7, labels = $8, level = $9, max_health = $10, name = $11, resistances = $12 WHERE id = $1",
    [
      id,
      details,
      JSON.stringify(effects.map((effect: Effect) => effect.id)),
      health,
      icon,
      image,
      JSON.stringify(immunities.map((immunity: DBImmunity) => immunity.id)),
      JSON.stringify(labels),
      level,
      max_health,
      name,
      JSON.stringify(
        resistances.map((resistance: DBResistance) => resistance.id),
      ),
    ],
  );

  return getDetailedOpponentById(db, id);
};

export const deleteOpponentById = async (
  db: TauriDatabase,
  id: Opponent["id"],
): Promise<DBOpponent> => {
  const deletedOpponent = await getOpponentById(db, id);

  await db.execute("DELETE FROM opponents WHERE id = $1", [id]);

  return deletedOpponent;
};

//* ENCOUNTER OPPONENTS (Instances)

export const getEncounterOpponentById = async (
  db: TauriDatabase,
  id: DBEncounterOpponent["id"],
): Promise<DBEncounterOpponent> => {
  const result = await db.select<DBEncounterOpponent[]>(
    "SELECT * FROM encounter_opponents WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Encounter Opponent with ID ${id} not found`);
  }

  return result[0];
};

export const getAllEncounterOpponents = async (
  db: TauriDatabase,
): Promise<DBEncounterOpponent[]> =>
  await db.select<DBEncounterOpponent[]>("SELECT * FROM encounter_opponents");

export const getDetailedEncounterOpponentById = async (
  db: TauriDatabase,
  encounterOpponentId: DBEncounterOpponent["id"],
): Promise<EncounterOpponent> => {
  const dbOpponent = await getEncounterOpponentById(db, encounterOpponentId);
  const {
    details,
    effects: dbEffects,
    health,
    icon,
    id,
    image,
    immunities: dbImmunities,
    labels,
    level,
    max_health,
    name,
    resistances: dbResistances,
    blueprint,
  } = dbOpponent;

  const effectsIds = (JSON.parse(dbEffects) as number[]).filter((id) => id != null);
  const immunitiesIds = (JSON.parse(dbImmunities) as number[]).filter((id) => id != null);
  const resistancesIds = (JSON.parse(dbResistances) as number[]).filter((id) => id != null);
  const labelList = JSON.parse(labels) as string[];

  let effects: Effect[] = [];
  let immunities: DBImmunity[] = [];
  let resistances: DBResistance[] = [];

  for (const effectId of effectsIds) {
    try {
      const effect = await getEffectById(db, effectId);
      effects.push(effect);
    } catch (e) {
      console.warn(`Failed to load effect ${effectId}`, e);
    }
  }

  for (const immunityId of immunitiesIds) {
    try {
      const immunity = await getImmunityById(db, immunityId);
      immunities.push(immunity);
    } catch (e) {
      console.warn(`Failed to load immunity ${immunityId}`, e);
    }
  }

  for (const resistanceId of resistancesIds) {
    try {
      const resistance = await getResistanceById(db, resistanceId);
      resistances.push(resistance);
    } catch (e) {
      console.warn(`Failed to load resistance ${resistanceId}`, e);
    }
  }

  const encounterOpponent: EncounterOpponent = {
    details,
    effects,
    health,
    icon,
    id,
    image,
    immunities,
    labels: labelList,
    level,
    max_health,
    name,
    resistances,
    blueprint,
  };

  return encounterOpponent;
};

export const getAllEncounterOpponentsDetailed = async (
  db: TauriDatabase,
): Promise<EncounterOpponent[]> => {
  const encounterOpponentsRaw = await getAllEncounterOpponents(db);
  const detailedEncounterOpponents: EncounterOpponent[] = [];

  for (const opponent of encounterOpponentsRaw) {
    const detailedOpponent = await getDetailedEncounterOpponentById(
      db,
      opponent.id,
    );
    detailedEncounterOpponents.push(detailedOpponent);
  }

  return detailedEncounterOpponents; // Return the array of detailed encounter opponents
};

export const getDetailedEncounterOpponentsByIds = async (
  db: TauriDatabase,
  ids: Array<DBEncounterOpponent["id"]>,
): Promise<EncounterOpponent[]> => {
  const promises = ids.map((id) => getDetailedEncounterOpponentById(db, id));
  const settled = await Promise.allSettled(promises);

  const detailed = settled
    .filter(
      (s): s is PromiseFulfilledResult<EncounterOpponent> =>
        s.status === "fulfilled",
    )
    .map((s) => s.value);

  return detailed;
};

export const createEncounterOpponent = async (
  db: TauriDatabase,
  opponent: Omit<EncounterOpponent, "id">,
): Promise<EncounterOpponent> => {
  const {
    details,
    effects,
    health,
    icon,
    image,
    immunities,
    labels,
    level,
    max_health,
    name,
    resistances,
  } = opponent;

  const blueprint = opponent.blueprint;

  const result = await db.execute(
    "INSERT INTO encounter_opponents (details, effects, health, icon, image, immunities, labels, level, max_health, name, resistances, blueprint) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *",
    [
      details,
      JSON.stringify(effects.map((e: Effect) => e.id)),
      health,
      icon,
      image,
      JSON.stringify(immunities.map((i: DBImmunity) => i.id)),
      JSON.stringify(labels),
      level,
      max_health,
      name,
      JSON.stringify(resistances.map((r: DBResistance) => r.id)),
      blueprint,
    ],
  );

  return getDetailedEncounterOpponentById(db, result!.lastInsertId as number);
};

export const createEncounterOpponents = async (
  db: TauriDatabase,
  opponents: Array<Omit<EncounterOpponent, "id">>,
): Promise<EncounterOpponent[]> => {
  const createOpponentPromises = opponents.map((opponent) => {
    return createEncounterOpponent(db, opponent);
  });

  const createOpponentsResult = await Promise.allSettled(
    createOpponentPromises,
  );
  const createdOpponents = createOpponentsResult
    .filter(
      (s): s is PromiseFulfilledResult<DBEncounterOpponent> =>
        s.status === "fulfilled",
    )
    .map((s) => s.value);

  return createdOpponents;
};

// NEW FUNCTION: Atomic creation of Opponent + Token
export const createEncounterOpponentWithToken = async (
  db: TauriDatabase,
  opponent: Omit<EncounterOpponent, "id">,
  chapterId: number,
): Promise<EncounterOpponent> => {
  // 1. Create the Encounter Opponent
  const createdOpponent = await createEncounterOpponent(db, opponent);

  // 2. Create the Token
  // Defaulting to 0,0 or a safe spawn position.
  await createToken(db, {
    chapter: chapterId,
    type: "opponent",
    // @ts-ignore
    entity: createdOpponent.id, // encounter_opponents id
    coordinates: { x: 0, y: 0 },
  });

  return createdOpponent;
};

export const updateEncounterOpponent = async (
  db: TauriDatabase,
  encounterOpponent: EncounterOpponent,
): Promise<EncounterOpponent> => {
  const {
    details,
    effects,
    health,
    icon,
    id,
    image,
    immunities,
    labels,
    level,
    max_health,
    name,
    resistances,
    blueprint,
  } = encounterOpponent;

  await db.execute(
    "UPDATE encounter_opponents SET details = $2, effects = $3, health = $4, icon = $5, image = $6, immunities = $7, labels = $8, level = $9, max_health = $10, name = $11, resistances = $12, blueprint = $13 WHERE id = $1",
    [
      id,
      details,
      JSON.stringify(effects.map((effect: Effect) => effect.id)),
      health,
      icon,
      image,
      JSON.stringify(immunities.map((immunity: DBImmunity) => immunity.id)),
      JSON.stringify(labels),
      level,
      max_health,
      name,
      JSON.stringify(
        resistances.map((resistance: DBResistance) => resistance.id),
      ),
      blueprint,
    ],
  );

  return getDetailedEncounterOpponentById(db, id);
};

export const deleteEncounterOpponentById = async (
  db: TauriDatabase,
  id: EncounterOpponent["id"],
): Promise<DBEncounterOpponent> => {
  const deletedEncounterOpponent = await getEncounterOpponentById(db, id);
  const token = await getEncounterOpponentToken(db, id);

  if (token) {
    await deleteTokenById(db, token.id);
  }

  await db.execute("DELETE FROM encounter_opponents WHERE id = $1", [id]);

  return deletedEncounterOpponent;
};

export const deleteEncounterOpponents = async (
  db: TauriDatabase,
  ids: Array<EncounterOpponent["id"]>,
): Promise<DBEncounterOpponent[]> => {
  const deletePromises = ids.map((id) => {
    return deleteEncounterOpponentById(db, id);
  });
  const deleteOpponentsResults = await Promise.allSettled(deletePromises);

  const deletedOpponents = deleteOpponentsResults
    .filter(
      (s): s is PromiseFulfilledResult<DBEncounterOpponent> =>
        s.status === "fulfilled",
    )
    .map((s) => s.value);

  return deletedOpponents;
};

export const opponents = {
  getAllDetailed: async () => {
    const db = await connect();
    return getAllDetailedOpponents(db);
  },
  create: async (opponent: Omit<Opponent, "id">) => {
    const db = await connect();
    return createOpponent(db, opponent);
  },
  update: async (opponent: Opponent) => {
    const db = await connect();
    return updateOpponent(db, opponent);
  },
  delete: async (id: number) => {
    const db = await connect();
    return deleteOpponentById(db, id);
  },
};

export const encounterOpponents = {
  getAllDetailed: async () => {
    const db = await connect();
    return getAllEncounterOpponentsDetailed(db);
  },
  create: async (opponent: Omit<EncounterOpponent, "id">) => {
    const db = await connect();
    return createEncounterOpponent(db, opponent);
  },
  createWithToken: async (
    opponent: Omit<EncounterOpponent, "id">,
    chapterId: number,
  ) => {
    const db = await connect();
    return createEncounterOpponentWithToken(db, opponent, chapterId);
  },
  createMultiple: async (opponents: Array<Omit<EncounterOpponent, "id">>) => {
    const db = await connect();
    return createEncounterOpponents(db, opponents);
  },
  update: async (opponent: EncounterOpponent) => {
    const db = await connect();
    return updateEncounterOpponent(db, opponent);
  },
  delete: async (id: number) => {
    const db = await connect();
    return deleteEncounterOpponentById(db, id);
  },
};
