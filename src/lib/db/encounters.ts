import {
  DBEncounter,
  Encounter,
  EncounterDifficulty,
  EncounterType,
} from "@/types/encounter";
import { CanvasElement } from "@/components/Canvas/Canvas";
import { Chapter } from "@/types/chapters";
import { execute, select, createDatabaseError } from "./core"; // Updated import
import { getDetailedChapterById } from "./chapters";
import { getDetailedEncounterTokens, deleteTokens } from "./tokens";
import { deleteEncounterOpponents } from "./opponents";
import { deleteImage } from "../utils";

export const getAllEncounters = async (): Promise<Encounter[]> => {
  const dbEncounters = await select<DBEncounter[]>("SELECT * FROM encounters");
  const prettyfiedEncounters: Encounter[] = [];

  for (const dbEncounter of dbEncounters) {
    const prettyEncounter = await getDetailedEncounterById(dbEncounter.id);
    prettyfiedEncounters.push(prettyEncounter);
  }

  return prettyfiedEncounters;
};

export const getEncounterById = async (
  id: DBEncounter["id"],
): Promise<DBEncounter> => {
  const result = await select<DBEncounter[]>(
    "SELECT * FROM encounters WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Encounter with ID ${id} not found`);
  }

  return result[0];
};

export const getDetailedEncounterById = async (
  id: number,
): Promise<Encounter> => {
  const dbEncounters = await select<DBEncounter[]>(
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
    musicFile: dbEncounter.music_file,
  } as Encounter;
};

export const getDetailedEncountersByIds = async (
  encounterIds: Array<DBEncounter["id"]>,
): Promise<Encounter[]> => {
  const encounterPromises = encounterIds.map((id) =>
    getDetailedEncounterById(id),
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
  chapterId: Chapter["id"],
): Promise<Encounter[]> => {
  const chapter = await getDetailedChapterById(chapterId);
  const encounterPromises = chapter.encounters.map((id) =>
    getDetailedEncounterById(id),
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
    musicFile,
  } = encounter;

  const result = await execute(
    "INSERT INTO encounters(name,description,color,dice,difficulties,experience,images,opponents,passed,skill,type, element, completed, soundcloud, music_file) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *",
    [
      name,
      description,
      color,
      JSON.stringify(dice), // Ensure dice is stringified if it's an object/array
      JSON.stringify(difficulties),
      experience,
      JSON.stringify(images),
      JSON.stringify(opponents),
      passed,
      skill,
      type,
      JSON.stringify(element),
      completed,
      soundcloud,
      musicFile,
    ],
  );

  const createdEncounter = await getDetailedEncounterById(
    result!.lastInsertId as number,
  );

  return createdEncounter;
};

export const updateEncounter = async (
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
    musicFile,
  } = encounter;

  await execute(
    "UPDATE encounters SET name = $2, description = $3, color = $4, dice = $5, difficulties = $6, experience = $7, images = $8, opponents = $9, passed = $10, skill = $11, type = $12, element = $13, completed = $14, soundcloud = $15, music_file = $16 WHERE id = $1",
    [
      id,
      name,
      description,
      color,
      JSON.stringify(dice),
      JSON.stringify(difficulties),
      experience,
      JSON.stringify(images),
      JSON.stringify(opponents),
      passed,
      skill,
      type,
      JSON.stringify(element),
      completed,
      soundcloud,
      musicFile,
    ],
  );

  return getDetailedEncounterById(id);
};

export const updateEncounterProperty = async <
  T extends keyof Encounter,
  V extends Encounter[T],
>(
  encounterId: Encounter["id"],
  property: T,
  value: V,
): Promise<Encounter> => {
  const sql = `UPDATE encounters SET ${property} = $2 WHERE id = $1`;

  await execute(sql, [encounterId, value]);

  return getDetailedEncounterById(encounterId);
};

export const deleteEncounterById = async (
  id: Encounter["id"],
): Promise<Encounter> => {
  const deletedEncounter = await getDetailedEncounterById(id);
  const opponentTokens = await getDetailedEncounterTokens(deletedEncounter);
  await deleteTokens(
    opponentTokens.map((token) => token.id),
  );

  if (deletedEncounter.opponents && deletedEncounter.opponents.length > 0) {
    // Cast opponent IDs to numbers if stored as strings
    const opponentIds = deletedEncounter.opponents.map((id) => Number(id));
    await deleteEncounterOpponents(opponentIds);
  }

  await execute("DELETE FROM encounters WHERE id = $1", [id]);

  return deletedEncounter;
};

export const encounters = {
  getById: async (id: number) => {
    return getDetailedEncounterById(id);
  },
  getByChapterId: async (chapterId: number) => {
    return getDetailedEncountersByChapterId(chapterId);
  },
  create: async (encounter: Omit<Encounter, "id">) => {
    return createEncounter(encounter);
  },
  update: async (encounter: Encounter) => {
    return updateEncounter(encounter);
  },
  updateProperty: async <T extends keyof Encounter, V extends Encounter[T]>(
    id: number,
    property: T,
    value: V,
  ) => {
    return updateEncounterProperty(id, property, value);
  },
  delete: async (id: number) => {
    return deleteEncounterById(id);
  },
  getAll: async () => {
    return getAllEncounters();
  },
};