import { DBImmunity, Immunity } from "@/types/immunitiy";
import { connect, createDatabaseError } from "./core";
import TauriDatabase from "@tauri-apps/plugin-sql";
import { getAllPlayers, getDetailedPlayerById } from "./players";
import { getAllOpponents, getDetailedOpponentById } from "./opponents";

export const getAllImmunities = async (db: TauriDatabase): Promise<DBImmunity[]> =>
  await db.select<DBImmunity[]>("SELECT * FROM immunities");

export const getImmunityById = async (
  db: TauriDatabase,
  id: number,
): Promise<DBImmunity> => {
  const result = await db.select<DBImmunity[]>(
    "SELECT * FROM immunities WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Immunity with ID ${id} not found`);
  }

  return result[0];
};

export const createImmunitiy = async (
  db: TauriDatabase,
  immunity: Omit<Immunity, "id">,
): Promise<DBImmunity> => {
  const { description, icon, name } = immunity;
  const result = await db.execute(
    "INSERT INTO immunities (description, icon, name) VALUES ($1, $2, $3) RETURNING *",
    [description, icon, name],
  );

  return getImmunityById(db, result!.lastInsertId as number);
};

export const deleteImmunityById = async (
  db: TauriDatabase,
  id: DBImmunity["id"],
): Promise<DBImmunity> => {
  const deletedImmunity = await getImmunityById(db, id);

  const allPlayers = await getAllPlayers(db);
  for (const player of allPlayers) {
    const detailedPlayer = await getDetailedPlayerById(db, player.id);
    const hasImmunity = detailedPlayer.immunities.some(
      (immunity) => immunity.id === id,
    );

    if (hasImmunity) {
      const updatedImmunities = detailedPlayer.immunities.filter(
        (immunity) => immunity.id !== id,
      );
      await db.execute("UPDATE players SET immunities = $2 WHERE id = $1", [
        player.id,
        JSON.stringify(updatedImmunities.map((im) => im.id)),
      ]);
    }
  }

  const allOpponents = await getAllOpponents(db);
  for (const opponent of allOpponents) {
    const detailedOpponent = await getDetailedOpponentById(db, opponent.id);
    const hasImmunity = detailedOpponent.immunities.some(
      (immunity: DBImmunity) => immunity.id === id,
    );

    if (hasImmunity) {
      const updatedImmunities = detailedOpponent.immunities.filter(
        (immunity: DBImmunity) => immunity.id !== id,
      );
      await db.execute("UPDATE opponents SET immunities = $2 WHERE id = $1", [
        opponent.id,
        JSON.stringify(
          updatedImmunities.map((immunity: DBImmunity) => immunity.id),
        ),
      ]);
    }
  }

  await db.execute("DELETE FROM immunities WHERE id = $1", [id]);

  return deletedImmunity;
};

export const updateImmunity = async (
  db: TauriDatabase,
  immunity: DBImmunity,
): Promise<DBImmunity> => {
  const { id, name, icon, description } = immunity;

  await db.execute(
    "UPDATE immunities SET name = $2, icon = $3, description = $4 WHERE id = $1",
    [id, name, icon, description],
  );

  return getImmunityById(db, id);
};

export const immunitites = {
  getAll: async () => {
    const db = await connect();
    return getAllImmunities(db);
  },
  getById: async (id: number) => {
    const db = await connect();
    return getImmunityById(db, id);
  },
  create: async (immunity: Omit<DBImmunity, "id">) => {
    const db = await connect();
    return createImmunitiy(db, immunity);
  },
  delete: async (immunityId: DBImmunity["id"]) => {
    const db = await connect();
    return deleteImmunityById(db, immunityId);
  },
  update: async (immunity: DBImmunity) => {
    const db = await connect();
    return updateImmunity(db, immunity);
  },
};
