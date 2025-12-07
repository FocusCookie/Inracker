import { DBParty, Party } from "@/types/party";
import { connect, createDatabaseError } from "./core";
import TauriDatabase from "@tauri-apps/plugin-sql";
import { getDetailedPlayerById } from "./players";
import { getAllChaptersForParty } from "./chapters";
import { deleteChapterById } from "./chapters";
import { getDetailedEncountersByIds, deleteEncounterById } from "./encounters";
import { deleteEncounterOpponentById } from "./opponents";
import { createToken, deleteTokens, getTokensForChapter } from "./tokens";

export const getAllParties = async (db: TauriDatabase): Promise<DBParty[]> =>
  await db.select<DBParty[]>("SELECT * FROM parties");

export const getPartyById = async (
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

export const getPartyDetailedById = async (
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
  let playersList = [];

  for (const id of playerIds) {
    const player = await getDetailedPlayerById(db, id);
    playersList.push(player);
  }

  return { ...dbParty, players: playersList };
};

export const createParty = async (
  db: TauriDatabase,
  party: Omit<Party, "id">,
): Promise<DBParty> => {
  const { name, icon, description, players } = party;
  const result = await db.execute(
    "INSERT INTO parties (name, icon, description, players ) VALUES ($1, $2, $3, $4) RETURNING *",
    [
      name,
      icon,
      description,
      JSON.stringify(players.map((p) => p.id)),
    ],
  );

  const createdParty = await getPartyById(db, result!.lastInsertId as number);

  return createdParty;
};

export const updateParty = async (
  db: TauriDatabase,
  party: Party,
): Promise<Party> => {
  const { id, name, icon, description } = party;

  await db.execute(
    "UPDATE parties SET id = $1, name = $2, icon = $3, description = $4 WHERE id = $1",
    [id, name, icon, description],
  );

  const updatedParty = getPartyDetailedById(db, party.id);

  return updatedParty;
};

export const addPlayerToParty = async (
  db: TauriDatabase,
  partyId: number,
  playerId: number,
) => {
  const dbParty = await getPartyById(db, partyId);
  const player = await getDetailedPlayerById(db, playerId);
  const players = JSON.parse(dbParty.players) as number[];
  players.push(playerId);

  await db.execute("UPDATE parties SET id = $1, players = $2 WHERE id = $1", [
    partyId,
    JSON.stringify(players),
  ]);

  // Create Tokens for the new player in all chapters of the party
  const chapters = await getAllChaptersForParty(db, partyId);
  for (const chapter of chapters) {
    await createToken(db, {
      chapter: chapter.id,
      entity: playerId,
      coordinates: { x: 0, y: 0 },
      type: "player",
    });
  }

  return player;
};

export const removePlayerFromParty = async (
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

  // Remove Tokens for the player in all chapters of the party
  const chapters = await getAllChaptersForParty(db, partyId);
  for (const chapter of chapters) {
    const tokens = await getTokensForChapter(db, chapter.id);
    const playerTokens = tokens.filter(
      (token) => token.entity === playerId && token.type === "player",
    );
    await deleteTokens(
      db,
      playerTokens.map((t) => t.id),
    );
  }
};

export const deletePartyById = async (
  db: TauriDatabase,
  id: number,
): Promise<Party["id"]> => {
  const deletedParty = await getPartyById(db, id);
  const chapters = await getAllChaptersForParty(db, id);

  for (const chapter of chapters) {
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
  }

  for (const chapter of chapters) {
    const encounters = await getDetailedEncountersByIds(db, chapter.encounters);
    for (const encounter of encounters) {
      try {
        await deleteEncounterById(db, encounter.id);
      } catch (error) {
        console.error(`Failed to delete encounter ${encounter.id}:`, error);
      }
    }
  }

  for (const chapter of chapters) {
    try {
      await deleteChapterById(db, chapter.id);
    } catch (error) {
      console.error(`Failed to delete chapter ${chapter.id}:`, error);
    }
  }

  await db.execute("DELETE FROM parties WHERE id = $1", [id]);

  return deletedParty.id;
};

export const getAllPartiesDetailed = async (
  db: TauriDatabase,
): Promise<Party[]> => {
  const partiesRaw = await getAllParties(db);
  const detailedParties: Party[] = [];

  for (const party of partiesRaw) {
    const detailedParty = await getPartyDetailedById(db, party.id);
    detailedParties.push(detailedParty);
  }

  return detailedParties;
};

export const parties = {
  getAll: async () => {
    const db = await connect();
    return getAllParties(db);
  },
  getAllDetailed: async () => {
    const db = await connect();
    return getAllPartiesDetailed(db);
  },
  getById: async (id: number) => {
    const db = await connect();
    return getPartyDetailedById(db, id);
  },
  create: async (party: Omit<Party, "id">) => {
    const db = await connect();
    return createParty(db, party);
  },
  update: async (party: Party) => {
    const db = await connect();
    return updateParty(db, party);
  },
  delete: async (id: number) => {
    const db = await connect();
    return deletePartyById(db, id);
  },
  addPlayer: async (partyId: number, playerId: number) => {
    const db = await connect();
    return addPlayerToParty(db, partyId, playerId);
  },
  removePlayer: async (partyId: number, playerId: number) => {
    const db = await connect();
    return removePlayerFromParty(db, partyId, playerId);
  },
};
