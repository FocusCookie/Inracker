import { DBWeakness, Weakness } from "@/types/weakness";
import { execute, select, createDatabaseError } from "./core";
import { getAllPlayers, getDetailedPlayerById } from "./players";
import { getAllOpponents, getDetailedOpponentById } from "./opponents";

export const getAllWeaknesses = async (): Promise<DBWeakness[]> =>
  await select<DBWeakness[]>("SELECT * FROM weaknesses");

export const getWeaknessById = async (
  id: number,
): Promise<DBWeakness> => {
  const result = await select<DBWeakness[]>(
    "SELECT * FROM weaknesses WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Weakness with ID ${id} not found`);
  }

  return result[0];
};

export const createWeakness = async (
  weakness: Omit<Weakness, "id">,
): Promise<DBWeakness> => {
  const { description, icon, name } = weakness;
  const result = await execute(
    "INSERT INTO weaknesses (description, icon, name) VALUES ($1, $2, $3) RETURNING *",
    [description, icon, name],
  );

  return getWeaknessById(result!.lastInsertId as number);
};

export const deleteWeaknessById = async (
  id: DBWeakness["id"],
): Promise<DBWeakness> => {
  const deletedWeakness = await getWeaknessById(id);

  const allPlayers = await getAllPlayers();
  for (const player of allPlayers) {
    const detailedPlayer = await getDetailedPlayerById(player.id);
    const hasWeakness = detailedPlayer.weaknesses.some(
      (weakness) => weakness.id === id,
    );

    if (hasWeakness) {
      const updatedWeaknesses = detailedPlayer.weaknesses.filter(
        (weakness) => weakness.id !== id,
      );
      await execute("UPDATE players SET weaknesses = $2 WHERE id = $1", [
        player.id,
        JSON.stringify(updatedWeaknesses.map((weakness) => weakness.id)),
      ]);
    }
  }

  const allOpponents = await getAllOpponents();
  for (const opponent of allOpponents) {
    const detailedOpponent = await getDetailedOpponentById(opponent.id);
    const hasWeakness = detailedOpponent.weaknesses.some(
      (weakness: DBWeakness) => weakness.id === id,
    );

    if (hasWeakness) {
      const updatedWeaknesses = detailedOpponent.weaknesses.filter(
        (weakness: DBWeakness) => weakness.id !== id,
      );
      await execute("UPDATE opponents SET weaknesses = $2 WHERE id = $1", [
        opponent.id,
        JSON.stringify(
          updatedWeaknesses.map((weakness: DBWeakness) => weakness.id),
        ),
      ]);
    }
  }

  await execute("DELETE FROM weaknesses WHERE id = $1", [id]);

  return deletedWeakness;
};

export const updatedWeakness = async (
  weakness: DBWeakness,
): Promise<DBWeakness> => {
  const { id, name, icon, description } = weakness;

  await execute(
    "UPDATE weaknesses SET name = $2, icon = $3, description = $4 WHERE id = $1",
    [id, name, icon, description],
  );

  return getWeaknessById(id);
};

export const weaknesses = {
  getAll: async () => {
    return getAllWeaknesses();
  },
  getById: async (id: number) => {
    return getWeaknessById(id);
  },
  create: async (weakness: Weakness) => {
    return createWeakness(weakness);
  },
  delete: async (weaknessId: DBWeakness["id"]) => {
    return deleteWeaknessById(weaknessId);
  },
  update: async (weakness: DBWeakness) => {
    return updatedWeakness(weakness);
  },
};
