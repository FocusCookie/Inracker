import { DBResistance, Resistance } from "@/types/resistances";
import { execute, select, createDatabaseError } from "./core"; // Updated import
import { getAllPlayers, getDetailedPlayerById } from "./players";
import { getAllOpponents, getDetailedOpponentById } from "./opponents";

export const getAllResistances = async (): Promise<DBResistance[]> =>
  await select<DBResistance[]>("SELECT * FROM resistances"); // Changed db.select to select

export const getResistanceById = async (
  id: number,
): Promise<DBResistance> => {
  const result = await select<DBResistance[]>( // Changed db.select to select
    "SELECT * FROM resistances WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Resistance with ID ${id} not found`);
  }

  return result[0];
};

export const createResistance = async (
  immunity: Omit<Resistance, "id">,
): Promise<DBResistance> => {
  const { description, icon, name } = immunity;
  const result = await execute( // Changed db.execute to execute
    "INSERT INTO resistances (description, icon, name) VALUES ($1, $2, $3) RETURNING *",
    [description, icon, name],
  );

  return getResistanceById(result!.lastInsertId as number); // Removed db parameter
};

export const deleteResistanceById = async (
  id: DBResistance["id"],
): Promise<DBResistance> => {
  const deletedResistance = await getResistanceById(id); // Removed db parameter

  const allPlayers = await getAllPlayers(); // Removed db parameter
  for (const player of allPlayers) {
    const detailedPlayer = await getDetailedPlayerById(player.id); // Removed db parameter
    const hasResistance = detailedPlayer.resistances.some(
      (resistance) => resistance.id === id,
    );

    if (hasResistance) {
      const updatedResistances = detailedPlayer.resistances.filter(
        (resistance) => resistance.id !== id,
      );
      await execute("UPDATE players SET resistances = $2 WHERE id = $1", [ // Changed db.execute to execute
        player.id,
        JSON.stringify(updatedResistances.map((resistance) => resistance.id)),
      ]);
    }
  }

  const allOpponents = await getAllOpponents(); // Removed db parameter
  for (const opponent of allOpponents) {
    const detailedOpponent = await getDetailedOpponentById(opponent.id); // Removed db parameter
    const hasResistance = detailedOpponent.resistances.some(
      (resistance: DBResistance) => resistance.id === id,
    );

    if (hasResistance) {
      const updatedResistances = detailedOpponent.resistances.filter(
        (resistance: DBResistance) => resistance.id !== id,
      );
      await execute("UPDATE opponents SET resistances = $2 WHERE id = $1", [ // Changed db.execute to execute
        opponent.id,
        JSON.stringify(
          updatedResistances.map((resistance: DBResistance) => resistance.id),
        ),
      ]);
    }
  }

  await execute("DELETE FROM resistances WHERE id = $1", [id]); // Changed db.execute to execute

  return deletedResistance;
};

export const updatedResistances = async (
  resistance: DBResistance,
): Promise<DBResistance> => {
  const { id, name, icon, description } = resistance;

  await execute( // Changed db.execute to execute
    "UPDATE resistances SET name = $2, icon = $3, description = $4 WHERE id = $1",
    [id, name, icon, description],
  );

  return getResistanceById(id); // Removed db parameter
};

export const resistances = {
  getAll: async () => {
    return getAllResistances(); // Removed db parameter
  },
  getById: async (id: number) => {
    return getResistanceById(id); // Removed db parameter
  },
  create: async (resistance: Resistance) => {
    return createResistance(resistance); // Removed db parameter
  },
  delete: async (resistanceId: DBResistance["id"]) => {
    return deleteResistanceById(resistanceId); // Removed db parameter
  },
  update: async (resistance: DBResistance) => {
    return updatedResistances(resistance); // Removed db parameter
  },
};