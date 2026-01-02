import { execute, select, createDatabaseError } from "./core"; // Updated import

export const getSetting = async (
  key: string,
): Promise<string | null> => {
  const result = await select<{ key: string; value: string }[]>( // Changed db.select to select
    "SELECT * FROM settings WHERE key = $1",
    [key],
  );

  if (!result.length) {
    return null;
  }

  return result[0].value;
};

export const updateSetting = async (
  key: string,
  value: string,
): Promise<void> => {
  // Check if setting exists
  const existing = await getSetting(key); // Removed db parameter

  if (existing !== null) {
    await execute("UPDATE settings SET value = $1 WHERE key = $2", [ // Changed db.execute to execute
      value,
      key,
    ]);
  } else {
    await execute("INSERT INTO settings (key, value) VALUES ($1, $2)", [ // Changed db.execute to execute
      key,
      value,
    ]);
  }
};

export const settings = {
  get: async (key: string) => {
    return getSetting(key); // Removed db parameter
  },
  update: async (key: string, value: string) => {
    return updateSetting(key, value); // Removed db parameter
  },
};