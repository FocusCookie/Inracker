import { connect, createDatabaseError } from "./core";
import TauriDatabase from "@tauri-apps/plugin-sql";

export const getSetting = async (
  db: TauriDatabase,
  key: string,
): Promise<string | null> => {
  const result = await db.select<{ key: string; value: string }[]>(
    "SELECT * FROM settings WHERE key = $1",
    [key],
  );

  if (!result.length) {
    return null;
  }

  return result[0].value;
};

export const updateSetting = async (
  db: TauriDatabase,
  key: string,
  value: string,
): Promise<void> => {
  // Check if setting exists
  const existing = await getSetting(db, key);

  if (existing !== null) {
    await db.execute("UPDATE settings SET value = $1 WHERE key = $2", [
      value,
      key,
    ]);
  } else {
    await db.execute("INSERT INTO settings (key, value) VALUES ($1, $2)", [
      key,
      value,
    ]);
  }
};

export const settings = {
  get: async (key: string) => {
    const db = await connect();
    return getSetting(db, key);
  },
  update: async (key: string, value: string) => {
    const db = await connect();
    return updateSetting(db, key, value);
  },
};
