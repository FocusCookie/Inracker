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

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 50; // Initial delay, will increase

async function withRetry<T>(
  operation: (db: TauriDatabase) => Promise<T>,
  isTransaction = false,
): Promise<T> {
  let retries = 0;
  let lastError: any = null;

  while (retries < MAX_RETRIES) {
    try {
      const db = await connect(); // Ensure connected
      return await operation(db);
    } catch (error: any) {
      lastError = error;
      // Check for SQLite "database is locked" error (code 5)
      // The error object from tauri-plugin-sql usually has an error.message with "database is locked"
      const isLockedError =
        error?.message?.includes("database is locked") ||
        (error?.code && error.code === 5); // Check for code 5 if available

      if (isLockedError && !isTransaction) { // Don't retry transactions, they should be handled by caller
        retries++;
        const delay =
          RETRY_DELAY_MS * Math.pow(2, retries - 1) +
          Math.random() * RETRY_DELAY_MS;
        console.warn(
          `Database locked, retrying in ${delay.toFixed(0)}ms (retry ${retries}/${MAX_RETRIES})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        // Not a locked error, or it's a transaction, rethrow immediately
        throw createDatabaseError("Database operation failed", error);
      }
    }
  }
  throw createDatabaseError(
    `Database operation failed after ${MAX_RETRIES} retries`,
    lastError,
  );
}

// Export execute and select functions that use the retry logic
export const execute = async (query: string, bindValues?: any[]): Promise<any> => {
  return withRetry(async (db) => db.execute(query, bindValues));
};

export const select = async <T>(query: string, bindValues?: any[]): Promise<T> => {
  return withRetry(async (db) => db.select<T>(query, bindValues));
};

// Export beginTransaction, commit, rollback for manual transaction management
export const beginTransaction = async (): Promise<any> => {
  const db = await connect();
  return db.execute("BEGIN TRANSACTION");
};

export const commit = async (): Promise<any> => {
  const db = await connect();
  return db.execute("COMMIT");
};

export const rollback = async (): Promise<any> => {
  const db = await connect();
  return db.execute("ROLLBACK");
};