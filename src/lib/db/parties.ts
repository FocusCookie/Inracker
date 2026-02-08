import { DBParty, Party } from "@/types/party";
import { execute, select, createDatabaseError } from "./core"; // Updated import
import { getDetailedPlayerById } from "./players";
import { getAllChaptersForParty } from "./chapters";
import { deleteChapterById } from "./chapters";
import { getDetailedEncountersByIds, deleteEncounterById } from "./encounters";
import { deleteEncounterOpponentById } from "./opponents";
import { createToken, deleteTokens, getTokensForChapter } from "./tokens";

export const getAllParties = async (): Promise<DBParty[]> =>
  await select<DBParty[]>("SELECT * FROM parties"); // Changed db.select to select

export const getPartyById = async (
  id: number,
): Promise<DBParty> => {
  const result = await select<DBParty[]>( // Changed db.select to select
    "SELECT * FROM parties WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Party with ID ${id} not found`);
  }

  return result[0];
};

export const getPartyDetailedById = async (
  id: number,
): Promise<Party> => {
  const dbParties = await select<DBParty[]>( // Changed db.select to select
    "SELECT * FROM parties WHERE id = $1",
    [id],
  );

  if (!dbParties.length) {
    throw createDatabaseError(`Party with ID ${id} not found`);
  }

  const dbParty = dbParties[0];
  const playerIds = JSON.parse(dbParty.players) as number[];
  let playersList = [];

  for (const playerId of playerIds) {
    const player = await getDetailedPlayerById(playerId); // Removed db parameter
    playersList.push(player);
  }

  return { ...dbParty, players: playersList };
};

export const createParty = async (
  party: Omit<Party, "id">,
): Promise<DBParty> => {
  const { name, icon, description, players } = party;
  const result = await execute( // Changed db.execute to execute
    "INSERT INTO parties (name, icon, description, players ) VALUES ($1, $2, $3, $4) RETURNING *",
    [
      name,
      icon,
      description,
      JSON.stringify(players.map((p) => p.id)),
    ],
  );

  const createdParty = await getPartyById(result!.lastInsertId as number); // Removed db parameter

  return createdParty;
};

export const updateParty = async (
  party: Party,
): Promise<Party> => {
  const { id, name, icon, description } = party;

  await execute( // Changed db.execute to execute
    "UPDATE parties SET id = $1, name = $2, icon = $3, description = $4 WHERE id = $1",
    [id, name, icon, description],
  );

  const updatedParty = getPartyDetailedById(party.id); // Removed db parameter

  return updatedParty;
};

export const addPlayerToParty = async (
  partyId: number,
  playerId: number,
) => {
  const dbParty = await getPartyById(partyId); // Removed db parameter
  const player = await getDetailedPlayerById(playerId); // Removed db parameter
  const players = JSON.parse(dbParty.players) as number[];
  players.push(playerId);

  await execute("UPDATE parties SET id = $1, players = $2 WHERE id = $1", [ // Changed db.execute to execute
    partyId,
    JSON.stringify(players),
  ]);

  // Create Tokens for the new player in all chapters of the party
  const chapters = await getAllChaptersForParty(partyId); // Removed db parameter
  for (const chapter of chapters) {
    await createToken({ // Removed db parameter
      chapter: chapter.id,
      entity: playerId,
      coordinates: { x: 0, y: 0 },
      type: "player",
    });
  }

  return player;
};

export const removePlayerFromParty = async (
  partyId: number,
  playerId: number,
) => {
  const dbParty = await getPartyById(partyId); // Removed db parameter
  const players = JSON.parse(dbParty.players) as number[];
  const newPlayers = players.filter((id) => id !== playerId);

  await execute("UPDATE parties SET id = $1, players = $2 WHERE id = $1", [ // Changed db.execute to execute
    partyId,
    JSON.stringify(newPlayers),
  ]);

  // Remove Tokens for the player in all chapters of the party
  const chapters = await getAllChaptersForParty(partyId); // Removed db parameter
  for (const chapter of chapters) {
    const tokens = await getTokensForChapter(chapter.id); // Removed db parameter
    const playerTokens = tokens.filter(
      (token) => token.entity === playerId && token.type === "player",
    );
    await deleteTokens( // Removed db parameter
      playerTokens.map((t) => t.id),
    );
  }
};

export const deletePartyById = async (
  id: number,
): Promise<Party["id"]> => {
  const deletedParty = await getPartyById(id); // Removed db parameter
  const chapters = await getAllChaptersForParty(id); // Removed db parameter

  for (const chapter of chapters) {
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
  }

  for (const chapter of chapters) {
    const encounters = await getDetailedEncountersByIds(chapter.encounters); // Removed db parameter
    for (const encounter of encounters) {
      try {
        await deleteEncounterById(encounter.id); // Removed db parameter
      } catch (error) {
        console.error(`Failed to delete encounter ${encounter.id}:`, error);
      }
    }
  }

  for (const chapter of chapters) {
    try {
      await deleteChapterById(chapter.id); // Removed db parameter
    } catch (error) {
      console.error(`Failed to delete chapter ${chapter.id}:`, error);
    }
  }

  await execute("DELETE FROM parties WHERE id = $1", [id]); // Changed db.execute to execute

  return deletedParty.id;
};

export const getAllPartiesDetailed = async (): Promise<Party[]> => {
  const partiesRaw = await getAllParties(); // Removed db parameter
  const detailedParties: Party[] = [];

  for (const party of partiesRaw) {
    const detailedParty = await getPartyDetailedById(party.id); // Removed db parameter
    detailedParties.push(detailedParty);
  }

  return detailedParties;
};

export const parties = {
  getAll: async () => {
    return getAllParties(); // Removed db parameter
  },
  getAllDetailed: async () => {
    return getAllPartiesDetailed(); // Removed db parameter
  },
  getById: async (id: number) => {
    return getPartyDetailedById(id); // Removed db parameter
  },
  create: async (party: Omit<Party, "id">) => {
    return createParty(party); // Removed db parameter
  },
  update: async (party: Party) => {
    return updateParty(party); // Removed db parameter
  },
  delete: async (id: number) => {
    return deletePartyById(id); // Removed db parameter
  },
  addPlayer: async (partyId: number, playerId: number) => {
    return addPlayerToParty(partyId, playerId); // Removed db parameter
  },
  removePlayer: async (partyId: number, playerId: number) => {
    return removePlayerFromParty(partyId, playerId); // Removed db parameter
  },
};