import { DBResistance, Resistance } from "@/types/resistances";
import { connect, createDatabaseError } from "./core";
import TauriDatabase from "@tauri-apps/plugin-sql";
import { getAllPlayers, getDetailedPlayerById } from "./players";
import { getAllOpponents, getDetailedOpponentById } from "./opponents";

export const getAllResistances = async (db: TauriDatabase): Promise<DBResistance[]> =>
  await db.select<DBResistance[]>("SELECT * FROM resistances");

export const getResistanceById = async (
  db: TauriDatabase,
  id: number,
): Promise<DBResistance> => {
  const result = await db.select<DBResistance[]>(
    "SELECT * FROM resistances WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Resistance with ID ${id} not found`);
  }

  return result[0];
};

export const createResistance = async (
  db: TauriDatabase,
  immunity: Omit<Resistance, "id">,
): Promise<DBResistance> => {
  const { description, icon, name } = immunity;
  const result = await db.execute(
    "INSERT INTO resistances (description, icon, name) VALUES ($1, $2, $3) RETURNING *",
    [description, icon, name],
  );

  return getResistanceById(db, result!.lastInsertId as number);
};

export const deleteResistanceById = async (
  db: TauriDatabase,
  id: DBResistance["id"],
): Promise<DBResistance> => {
  const deletedResistance = await getResistanceById(db, id);

  const allPlayers = await getAllPlayers(db);
  for (const player of allPlayers) {
    const detailedPlayer = await getDetailedPlayerById(db, player.id);
    const hasResistance = detailedPlayer.resistances.some(
      (resistance) => resistance.id === id,
    );

    if (hasResistance) {
      const updatedResistances = detailedPlayer.resistances.filter(
        (resistance) => resistance.id !== id,
      );
      await db.execute("UPDATE players SET resistances = $2 WHERE id = $1", [
        player.id,
        JSON.stringify(updatedResistances.map((resistance) => resistance.id)),
      ]);
    }
  }

  const allOpponents = await getAllOpponents(db);
  for (const opponent of allOpponents) {
    const detailedOpponent = await getDetailedOpponentById(db, opponent.id);
    const hasResistance = detailedOpponent.resistances.some(
      (resistance: DBResistance) => resistance.id === id,
    );

    if (hasResistance) {
      const updatedResistances = detailedOpponent.resistances.filter(
        (resistance: DBResistance) => resistance.id !== id,
      );
      await db.execute("UPDATE opponents SET resistances = $2 WHERE id = $1", [
        opponent.id,
        JSON.stringify(
          updatedResistances.map((resistance: DBResistance) => resistance.id),
        ),
      ]);
    }
  }

  await db.execute("DELETE FROM resistances WHERE id = $1", [id]);

  return deletedResistance;
};

export const updatedResistances = async (
  db: TauriDatabase,
  resistance: DBResistance,
): Promise<DBResistance> => {
  const { id, name, icon, description } = resistance;

  await db.execute(
    "UPDATE resistances SET name = $2, icon = $3, description = $4 WHERE id = $1",
    [id, name, icon, description],
  );

  return getResistanceById(db, id);
};

export const resistances = {
  getAll: async () => {
    const db = await connect();
    return getAllResistances(db);
  },
  getById: async (id: number) => {
    const db = await connect();
    return getResistanceById(db, id);
  },
  create: async (resistance: Resistance) => {
    const db = await connect();
    return createResistance(db, resistance);
  },
  delete: async (resistanceId: DBResistance["id"]) => {
    const db = await connect();
    return deleteResistanceById(db, resistanceId);
  },
  update: async (resistance: DBResistance) => {
    const db = await connect();
    return updatedResistances(db, resistance);
  },
};
