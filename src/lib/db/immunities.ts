import { DBImmunity, Immunity } from "@/types/immunitiy";
import { execute, select, createDatabaseError } from "./core"; // Updated import
import { getAllPlayers, getDetailedPlayerById } from "./players";
import { getAllOpponents, getDetailedOpponentById } from "./opponents";

export const getAllImmunities = async (): Promise<DBImmunity[]> =>
  await select<DBImmunity[]>("SELECT * FROM immunities"); // Changed db.select to select

export const getImmunityById = async (
  id: number,
): Promise<DBImmunity> => {
  const result = await select<DBImmunity[]>( // Changed db.select to select
    "SELECT * FROM immunities WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Immunity with ID ${id} not found`);
  }

  return result[0];
};

export const createImmunitiy = async (
  immunity: Omit<Immunity, "id">,
): Promise<DBImmunity> => {
  const { description, icon, name } = immunity;
  const result = await execute( // Changed db.execute to execute
    "INSERT INTO immunities (description, icon, name) VALUES ($1, $2, $3) RETURNING *",
    [description, icon, name],
  );

  return getImmunityById(result!.lastInsertId as number); // Removed db parameter
};

export const deleteImmunityById = async (
  id: DBImmunity["id"],
): Promise<DBImmunity> => {
  const deletedImmunity = await getImmunityById(id); // Removed db parameter

  const allPlayers = await getAllPlayers(); // Removed db parameter
  for (const player of allPlayers) {
    const detailedPlayer = await getDetailedPlayerById(player.id); // Removed db parameter
    const hasImmunity = detailedPlayer.immunities.some(
      (immunity) => immunity.id === id,
    );

    if (hasImmunity) {
      const updatedImmunities = detailedPlayer.immunities.filter(
        (immunity) => immunity.id !== id,
      );
      await execute("UPDATE players SET immunities = $2 WHERE id = $1", [ // Changed db.execute to execute
        player.id,
        JSON.stringify(updatedImmunities.map((im) => im.id)),
      ]);
    }
  }

  const allOpponents = await getAllOpponents(); // Removed db parameter
  for (const opponent of allOpponents) {
    const detailedOpponent = await getDetailedOpponentById(opponent.id); // Removed db parameter
    const hasImmunity = detailedOpponent.immunities.some(
      (immunity: DBImmunity) => immunity.id === id,
    );

    if (hasImmunity) {
      const updatedImmunities = detailedOpponent.immunities.filter(
        (immunity: DBImmunity) => immunity.id !== id,
      );
      await execute("UPDATE opponents SET immunities = $2 WHERE id = $1", [ // Changed db.execute to execute
        opponent.id,
        JSON.stringify(
          updatedImmunities.map((immunity: DBImmunity) => immunity.id),
        ),
      ]);
    }
  }

  await execute("DELETE FROM immunities WHERE id = $1", [id]); // Changed db.execute to execute

  return deletedImmunity;
};

export const updateImmunity = async (
  immunity: DBImmunity,
): Promise<DBImmunity> => {
  const { id, name, icon, description } = immunity;

  await execute( // Changed db.execute to execute
    "UPDATE immunities SET name = $2, icon = $3, description = $4 WHERE id = $1",
    [id, name, icon, description],
  );

  return getImmunityById(id); // Removed db parameter
};

export const immunitites = {
  getAll: async () => {
    return getAllImmunities(); // Removed db parameter
  },
  getById: async (id: number) => {
    return getImmunityById(id); // Removed db parameter
  },
  create: async (immunity: Omit<DBImmunity, "id">) => {
    return createImmunitiy(immunity); // Removed db parameter
  },
  delete: async (immunityId: DBImmunity["id"]) => {
    return deleteImmunityById(immunityId); // Removed db parameter
  },
  update: async (immunity: DBImmunity) => {
    return updateImmunity(immunity); // Removed db parameter
  },
};