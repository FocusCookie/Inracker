import { DBChapter, Chapter, ChapterStatus } from "@/types/chapters";
import { Party } from "@/types/party";
import { connect, createDatabaseError } from "./core";
import TauriDatabase from "@tauri-apps/plugin-sql";
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

export const getDetailedChapterById = async (
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
  const state = dbChapter.state as ChapterStatus;
  const encounterIds = JSON.parse(dbChapter.encounters) as number[];

  const encounters = await getDetailedEncountersByIds(db, encounterIds);

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
  db: TauriDatabase,
  chapter: Omit<Chapter, "id">,
): Promise<DBChapter> => {
  const { name, icon, description, battlemap, state, party, encounters } =
    chapter;

  const result = await db.execute(
    "INSERT INTO chapters(name, icon, description, battlemap, state, party, encounters) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [name, icon, description, battlemap, state, party, encounters],
  );

  const createdChapter = await getChapterById(
    db,
    result!.lastInsertId as number,
  );

  // Create Tokens for all players in the party
  const partyData = await getPartyById(db, party);
  const playerIds = JSON.parse(partyData.players) as number[];

  for (const playerId of playerIds) {
    await createToken(db, {
      chapter: createdChapter.id,
      entity: playerId,
      coordinates: { x: 0, y: 0 },
      type: "player",
    });
  }

  return createdChapter;
};

export const getAllChaptersForParty = async (
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

  return prettyfiedChapters;
};

export const updateChapter = async (
  db: TauriDatabase,
  chapter: Chapter,
): Promise<Chapter> => {
  const { id, battlemap, description, icon, name, party, state } = chapter;

  await db.execute(
    "UPDATE chapters SET battlemap = $2, description = $3, icon = $4, name = $5, party = $6, state = $7 WHERE id = $1",
    [id, battlemap, description, icon, name, party, state],
  );

  return getDetailedChapterById(db, id);
};

export const updateChapterProperty = async <
  T extends keyof Chapter,
  V extends Chapter[T],
>(
  db: TauriDatabase,
  chapterId: Chapter["id"],
  property: T,
  value: V,
): Promise<Chapter> => {
  const sql = `UPDATE chapters SET ${property} = $2 WHERE id = $1`;

  await db.execute(sql, [chapterId, value]);

  await getDetailedChapterById(db, chapterId);

  return getDetailedChapterById(db, chapterId);
};

export const deleteChapterById = async (
  db: TauriDatabase,
  id: Chapter["id"],
): Promise<DBChapter> => {
  const deletedChapter = await getChapterById(db, id);

  const chapter = await getDetailedChapterById(db, id);
  const encounters = await getDetailedEncountersByIds(db, chapter.encounters);

  for (const encounter of encounters) {
    if (encounter.opponents) {
      for (const opponentId of encounter.opponents) {
        try {
          await deleteEncounterOpponentById(db, Number(opponentId));
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
      await deleteEncounterById(db, encounter.id);
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
  const tokens = await getTokensForChapter(db, id);
  await deleteTokens(
    db,
    tokens.map((t) => t.id),
  );

  await db.execute("DELETE FROM chapters WHERE id = $1", [id]);

  return deletedChapter;
};

export const getAllChapters = async (
  db: TauriDatabase,
): Promise<Chapter[]> => {
  const dbChapters = await db.select<DBChapter[]>("SELECT * FROM chapters");
  const prettyfiedChapters: Chapter[] = [];

  for (const dbChapter of dbChapters) {
    const prettyChapter = await getDetailedChapterById(db, dbChapter.id);
    prettyfiedChapters.push(prettyChapter);
  }

  return prettyfiedChapters;
};

export const chapters = {
  create: async (chapter: Omit<Chapter, "id">) => {
    const db = await connect();
    return createChapter(db, chapter);
  },
  getAllForParty: async (partyId: number) => {
    const db = await connect();
    return getAllChaptersForParty(db, partyId);
  },
  getAll: async () => {
    const db = await connect();
    return getAllChapters(db);
  },
  get: async (id: number) => {
    const db = await connect();
    return getDetailedChapterById(db, id);
  },
  update: async (chapter: Chapter) => {
    const db = await connect();
    return updateChapter(db, chapter);
  },
  delete: async (id: number) => {
    const db = await connect();
    return deleteChapterById(db, id);
  },
};
