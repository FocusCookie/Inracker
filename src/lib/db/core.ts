import TauriDatabase from "@tauri-apps/plugin-sql";

const environment = import.meta.env.VITE_ENV;
let dbInstance: TauriDatabase | null = null;

export const createDatabaseError = (message: string, originalError?: unknown) => ({
  name: "DatabaseError",
  message,
  originalError,
});

export const connect = async (): Promise<TauriDatabase> => {
  try {
    if (!dbInstance) {
      dbInstance = await TauriDatabase.load(
        `sqlite:${environment ?? "dev"}.db`,
      );
    }

    return dbInstance;
  } catch (error) {
    throw createDatabaseError("Error establishing database connection", error);
  }
};

export const disconnect = async (): Promise<void> => {
  if (dbInstance) {
    await dbInstance.close?.();
    dbInstance = null;
  }
};
