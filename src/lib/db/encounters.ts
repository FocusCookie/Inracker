import {
  DBEncounter,
  Encounter,
  EncounterDifficulty,
  EncounterType,
} from "@/types/encounter";
import { CanvasElement } from "@/components/Canvas/Canvas";
import { Chapter } from "@/types/chapters";
import { connect, createDatabaseError } from "./core";
import TauriDatabase from "@tauri-apps/plugin-sql";
import { getDetailedChapterById } from "./chapters";
import { getDetailedEncounterTokens, deleteTokens } from "./tokens";
import { deleteEncounterOpponents } from "./opponents";

export const getAllEncounters = async (db: TauriDatabase): Promise<Encounter[]> => {
  const dbEncounters = await db.select<DBEncounter[]>("SELECT * FROM encounters");
  const prettyfiedEncounters: Encounter[] = [];

  for (const dbEncounter of dbEncounters) {
    const prettyEncounter = await getDetailedEncounterById(db, dbEncounter.id);
    prettyfiedEncounters.push(prettyEncounter);
  }

  return prettyfiedEncounters;
};

export const getEncounterById = async (
  db: TauriDatabase,
  id: DBEncounter["id"],
): Promise<DBEncounter> => {
  const result = await db.select<DBEncounter[]>(
    "SELECT * FROM encounters WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Encounter with ID ${id} not found`);
  }

  return result[0];
};

export const getDetailedEncounterById = async (
  db: TauriDatabase,
  id: number,
): Promise<Encounter> => {
  const dbEncounters = await db.select<DBEncounter[]>(
    "SELECT * FROM encounters WHERE id = $1",
    [id],
  );

  if (!dbEncounters.length) {
    throw createDatabaseError(`Encounter with ID ${id} not found`);
  }

  const dbEncounter = dbEncounters[0];
  const type = dbEncounter.type as EncounterType;
  let difficulties: EncounterDifficulty[] | null = null;
  let images: string[] | null = null;
  let opponents: string[] | null = null;
  let element: CanvasElement | null = null;

  if (dbEncounter.difficulties) {
    difficulties = JSON.parse(
      dbEncounter.difficulties,
    ) as EncounterDifficulty[];
  }

  if (dbEncounter.images) {
    images = JSON.parse(dbEncounter.images) as string[];
  }

  if (dbEncounter.opponents) {
    opponents = JSON.parse(dbEncounter.opponents) as string[];
  }

  if (dbEncounter.element) {
    element = JSON.parse(dbEncounter.element) as CanvasElement;
  }

  return {
    ...dbEncounter,
    type: type,
    difficulties,
    images,
    opponents,
    passed: Boolean(dbEncounter.passed),
    element,
    completed: JSON.parse(dbEncounter.completed) as Boolean,
  } as Encounter;
};

export const getDetailedEncountersByIds = async (
  db: TauriDatabase,
  encounterIds: Array<DBEncounter["id"]>,
): Promise<Encounter[]> => {
  const encounterPromises = encounterIds.map((id) =>
    getDetailedEncounterById(db, id),
  );
  const encounters = await Promise.allSettled(encounterPromises);

  return encounters
    .filter(
      (enc): enc is PromiseFulfilledResult<Encounter> =>
        enc.status === "fulfilled",
    )
    .map((enc) => enc.value);
};

export const getDetailedEncountersByChapterId = async (
  db: TauriDatabase,
  chapterId: Chapter["id"],
): Promise<Encounter[]> => {
  const chapter = await getDetailedChapterById(db, chapterId);
  const encounterPromises = chapter.encounters.map((id) =>
    getDetailedEncounterById(db, id),
  );
  const encounters = await Promise.allSettled(encounterPromises);

  return encounters
    .filter(
      (enc): enc is PromiseFulfilledResult<Encounter> =>
        enc.status === "fulfilled",
    )
    .map((enc) => enc.value);
};

export const createEncounter = async (
  db: TauriDatabase,
  encounter: Omit<Encounter, "id">,
): Promise<Encounter> => {
  const {
    name,
    description,
    color,
    dice,
    difficulties,
    experience,
    images,
    opponents,
    passed,
    skill,
    type,
    element,
    completed,
    soundcloud,
  } = encounter;

  let result;
  try {
    result = await db.execute(
      "INSERT INTO encounters(name,description,color,dice,difficulties,experience,images,opponents,passed,skill,type, element, completed, soundcloud) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *",
      [
        name,
        description,
        color,
        dice,
        difficulties,
        experience,
        images,
        opponents,
        passed,
        skill,
        type,
        element,
        completed,
        soundcloud,
      ],
    );
  } catch (error: any) {
    if (error.toString().includes("no column named soundcloud")) {
      console.warn(
        "SoundCloud column missing, saving without it. Restart app to fix.",
      );
      result = await db.execute(
        "INSERT INTO encounters(name,description,color,dice,difficulties,experience,images,opponents,passed,skill,type, element, completed) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
        [
          name,
          description,
          color,
          dice,
          difficulties,
          experience,
          images,
          opponents,
          passed,
          skill,
          type,
          element,
          completed,
        ],
      );
    } else {
      throw error;
    }
  }

  const createdEncounter = await getDetailedEncounterById(
    db,
    result!.lastInsertId as number,
  );

  return createdEncounter;
};

export const updateEncounter = async (
  db: TauriDatabase,
  encounter: Encounter,
): Promise<Encounter> => {
  const {
    id,
    name,
    description,
    color,
    dice,
    difficulties,
    experience,
    images,
    opponents,
    passed,
    skill,
    type,
    element,
    completed,
    soundcloud,
  } = encounter;

  try {
    await db.execute(
      "UPDATE encounters SET name = $2, description = $3, color = $4, dice = $5, difficulties = $6, experience = $7, images = $8, opponents = $9, passed = $10, skill = $11, type = $12, element = $13, completed = $14, soundcloud = $15 WHERE id = $1",
      [
        id,
        name,
        description,
        color,
        dice,
        difficulties,
        experience,
        images,
        opponents,
        passed,
        skill,
        type,
        element,
        completed,
        soundcloud,
      ],
    );
  } catch (error: any) {
    if (error.toString().includes("no column named soundcloud")) {
      console.warn(
        "SoundCloud column missing, saving without it. Restart app to fix.",
      );
      await db.execute(
        "UPDATE encounters SET name = $2, description = $3, color = $4, dice = $5, difficulties = $6, experience = $7, images = $8, opponents = $9, passed = $10, skill = $11, type = $12, element = $13, completed = $14 WHERE id = $1",
        [
          id,
          name,
          description,
          color,
          dice,
          difficulties,
          experience,
          images,
          opponents,
          passed,
          skill,
          type,
          element,
          completed,
        ],
      );
    } else {
      throw error;
    }
  }

  return getDetailedEncounterById(db, id);
};

export const updateEncounterProperty = async <
  T extends keyof Encounter,
  V extends Encounter[T],
>(
  db: TauriDatabase,
  encounterId: Encounter["id"],
  property: T,
  value: V,
): Promise<Encounter> => {
  const sql = `UPDATE encounters SET ${property} = $2 WHERE id = $1`;

  await db.execute(sql, [encounterId, value]);

  return getDetailedEncounterById(db, encounterId);
};

export const deleteEncounterById = async (
  db: TauriDatabase,
  id: Encounter["id"],
): Promise<Encounter> => {
  const deletedEncounter = await getDetailedEncounterById(db, id);
  const opponentTokens = await getDetailedEncounterTokens(db, deletedEncounter);
  await deleteTokens(
    db,
    opponentTokens.map((token) => token.id),
  );

  if (deletedEncounter.opponents && deletedEncounter.opponents.length > 0) {
    // Cast opponent IDs to numbers if stored as strings
    const opponentIds = deletedEncounter.opponents.map((id) => Number(id));
    await deleteEncounterOpponents(db, opponentIds);
  }

  await db.execute("DELETE FROM encounters WHERE id = $1", [id]);

  return deletedEncounter;
};

export const encounters = {
  getById: async (id: number) => {
    const db = await connect();
    return getDetailedEncounterById(db, id);
  },
  getByChapterId: async (chapterId: number) => {
    const db = await connect();
    return getDetailedEncountersByChapterId(db, chapterId);
  },
  create: async (encounter: Omit<Encounter, "id">) => {
    const db = await connect();
    return createEncounter(db, encounter);
  },
  update: async (encounter: Encounter) => {
    const db = await connect();
    return updateEncounter(db, encounter);
  },
  updateProperty: async <T extends keyof Encounter, V extends Encounter[T]>(
    id: number,
    property: T,
    value: V,
  ) => {
    const db = await connect();
    return updateEncounterProperty(db, id, property, value);
  },
  delete: async (id: number) => {
    const db = await connect();
    return deleteEncounterById(db, id);
  },
  getAll: async () => {
    const db = await connect();
    return getAllEncounters(db);
  },
};
