import { DBChapter, Chapter, ChapterStatus } from "@/types/chapters";
import { Party } from "@/types/party";
import { execute, select, createDatabaseError } from "./core"; // Updated import
import { deleteImage } from "../utils";
import { getDetailedEncountersByIds, deleteEncounterById } from "./encounters";
import { deleteEncounterOpponentById } from "./opponents";
import {
  createToken,
  deleteTokens,
  getTokensForChapter,
} from "./tokens";
import { getPartyById } from "./parties";

export const getChapterById = async (
  id: number,
): Promise<DBChapter> => {
  const result = await select<DBChapter[]>( // Changed db.select to select
    "SELECT * FROM chapters WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Chapter with ID ${id} not found`);
  }

  return result[0];
};

export const getDetailedChapterById = async (
  id: number,
): Promise<Chapter> => {
  const dbChapters = await select<DBChapter[]>( // Changed db.select to select
    "SELECT * FROM chapters WHERE id = $1",
    [id],
  );

  if (!dbChapters.length) {
    throw createDatabaseError(`Chapter with ID ${id} not found`);
  }

  const dbChapter = dbChapters[0];
  const state = dbChapter.state as ChapterStatus;
  const encounterIds = JSON.parse(dbChapter.encounters) as number[];

  const encounters = await getDetailedEncountersByIds(encounterIds); // Removed db parameter

  const totalExperience = encounters.reduce(
    (acc, enc) => acc + (enc.experience || 0),
    0,
  );

  const completedExperience = encounters
    .filter((enc) => enc.completed)
    .reduce((acc, enc) => acc + (enc.experience || 0), 0);

  return {
    ...dbChapter,
    state,
    encounters: encounterIds,
    totalExperience,
    completedExperience,
  };
};

export const createChapter = async (
  chapter: Omit<Chapter, "id">,
): Promise<DBChapter> => {
  const { name, icon, description, battlemap, state, party, encounters } =
    chapter;

  const result = await execute( // Changed db.execute to execute
    "INSERT INTO chapters(name, icon, description, battlemap, state, party, encounters) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [name, icon, description, battlemap, state, party, encounters],
  );

  const createdChapter = await getChapterById( // Removed db parameter
    result!.lastInsertId as number,
  );

  // Create Tokens for all players in the party
  const partyData = await getPartyById(party); // Removed db parameter
  const playerIds = JSON.parse(partyData.players) as number[];

  for (const playerId of playerIds) {
    await createToken({ // Removed db parameter
      chapter: createdChapter.id,
      entity: playerId,
      coordinates: { x: 0, y: 0 },
      type: "player",
    });
  }

  return createdChapter;
};

export const getAllChaptersForParty = async (
  partyId: Party["id"],
): Promise<Chapter[]> => {
  const dbChapters = await select<DBChapter[]>( // Changed db.select to select
    "SELECT * FROM chapters WHERE party = $1",
    [partyId],
  );
  const prettyfiedChapters: Chapter[] = [];

  for (const dbChapter of dbChapters) {
    const prettyChapter = await getDetailedChapterById(dbChapter.id); // Removed db parameter
    prettyfiedChapters.push(prettyChapter);
  }

  return prettyfiedChapters;
};

export const updateChapter = async (
  chapter: Chapter,
): Promise<Chapter> => {
  const { id, battlemap, description, icon, name, party, state } = chapter;

  await execute( // Changed db.execute to execute
    "UPDATE chapters SET battlemap = $2, description = $3, icon = $4, name = $5, party = $6, state = $7 WHERE id = $1",
    [id, battlemap, description, icon, name, party, state],
  );

  return getDetailedChapterById(id); // Removed db parameter
};

export const updateChapterProperty = async <
  T extends keyof Chapter,
  V extends Chapter[T],
>(
  chapterId: Chapter["id"],
  property: T,
  value: V,
): Promise<Chapter> => {
  const sql = `UPDATE chapters SET ${property} = $2 WHERE id = $1`;

  await execute(sql, [chapterId, value]); // Changed db.execute to execute

  await getDetailedChapterById(chapterId); // Removed db parameter

  return getDetailedChapterById(chapterId); // Removed db parameter
};

export const addEncounterToChapter = async (
  chapterId: number,
  encounterId: number,
): Promise<Chapter> => {
  const chapter = await getChapterById(chapterId); // Removed db parameter
  const encounters = JSON.parse(chapter.encounters) as number[];
  encounters.push(encounterId);

  await execute("UPDATE chapters SET encounters = $2 WHERE id = $1", [ // Changed db.execute to execute
    chapterId,
    JSON.stringify(encounters),
  ]);

  return getDetailedChapterById(chapterId); // Removed db parameter
};

export const removeEncounterFromChapter = async (
  chapterId: number,
  encounterId: number,
): Promise<Chapter> => {
  const chapter = await getChapterById(chapterId); // Removed db parameter
  const encounters = JSON.parse(chapter.encounters) as number[];
  const updatedEncounters = encounters.filter((id) => id !== encounterId);

  await execute("UPDATE chapters SET encounters = $2 WHERE id = $1", [ // Changed db.execute to execute
    chapterId,
    JSON.stringify(updatedEncounters),
  ]);

  return getDetailedChapterById(chapterId); // Removed db parameter
};

export const deleteChapterById = async (
  id: Chapter["id"],
): Promise<DBChapter> => {
  const deletedChapter = await getChapterById(id); // Removed db parameter

  const chapter = await getDetailedChapterById(id); // Removed db parameter
  const encounters = await getDetailedEncountersByIds(chapter.encounters); // Removed db parameter

  for (const encounter of encounters) {
    if (encounter.opponents) {
      for (const opponentId of encounter.opponents) {
        try {
          await deleteEncounterOpponentById(Number(opponentId)); // Removed db parameter
        } catch (error) {
          console.error(
            `Failed to delete opponent ${opponentId} from encounter ${encounter.id}:`,
            error,
          );
        }
      }
    }
  }

  for (const encounter of encounters) {
    try {
      await deleteEncounterById(encounter.id); // Removed db parameter
    } catch (error) {
      console.error(`Failed to delete encounter ${encounter.id}:`, error);
    }
  }

  if (chapter.battlemap) {
    try {
      const imageName = decodeURIComponent(chapter.battlemap).split("/").pop();

      if (imageName) {
        await deleteImage(imageName, "battlemaps");
      }
    } catch (error) {
      console.error(
        `Failed to delete battlemap image ${chapter.battlemap}:`,
        error,
      );
    }
  }

  // Delete all tokens for this chapter
  const tokens = await getTokensForChapter(id); // Removed db parameter
  await deleteTokens( // Removed db parameter
    tokens.map((t) => t.id),
  );

  await execute("DELETE FROM chapters WHERE id = $1", [id]); // Changed db.execute to execute

  return deletedChapter;
};

export const getAllChapters = async (
): Promise<Chapter[]> => {
  const dbChapters = await select<DBChapter[]>("SELECT * FROM chapters"); // Changed db.select to select
  const prettyfiedChapters: Chapter[] = [];

  for (const dbChapter of dbChapters) {
    const prettyChapter = await getDetailedChapterById(dbChapter.id); // Removed db parameter
    prettyfiedChapters.push(prettyChapter);
  }

  return prettyfiedChapters;
};

export const chapters = {
  create: async (chapter: Omit<Chapter, "id">) => {
    return createChapter(chapter); // Removed db parameter
  },
  getAllForParty: async (partyId: number) => {
    return getAllChaptersForParty(partyId); // Removed db parameter
  },
  getAll: async () => {
    return getAllChapters(); // Removed db parameter
  },
  get: async (id: number) => {
    return getDetailedChapterById(id); // Removed db parameter
  },
  update: async (chapter: Chapter) => {
    return updateChapter(chapter); // Removed db parameter
  },
  updateProperty: async <T extends keyof Chapter, V extends Chapter[T]>(
    id: number,
    property: T,
    value: V,
  ) => {
    return updateChapterProperty(id, property, value); // Removed db parameter
  },
  addEncounter: async (chapterId: number, encounterId: number) => {
    return addEncounterToChapter(chapterId, encounterId); // Removed db parameter
  },
  removeEncounter: async (chapterId: number, encounterId: number) => {
    return removeEncounterFromChapter(chapterId, encounterId); // Removed db parameter
  },
  delete: async (id: number) => {
    return deleteChapterById(id); // Removed db parameter
  },
};