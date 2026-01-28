import { DBLog, Log, LogType } from "@/types/logs";
import { execute, select } from "./core";

export const getLogsByChapterId = async (chapterId: number): Promise<Log[]> => {
  const dbLogs = await select<DBLog[]>(
    "SELECT * FROM logs WHERE chapter_id = $1 ORDER BY created_at DESC",
    [chapterId],
  );

  return dbLogs.map((log) => ({
    id: log.id,
    chapterId: log.chapter_id,
    title: log.title,
    description: log.description,
    icon: log.icon,
    type: log.type,
    createdAt: new Date(log.created_at),
  }));
};

export const createLog = async (log: {
  chapterId: number;
  title: string;
  description?: string;
  icon: string;
  type: LogType;
}): Promise<Log> => {
  const id = crypto.randomUUID();
  await execute(
    "INSERT INTO logs (id, chapter_id, title, description, icon, type) VALUES ($1, $2, $3, $4, $5, $6)",
    [
      id,
      log.chapterId,
      log.title,
      log.description || null,
      log.icon,
      log.type,
    ],
  );

  return {
    id,
    chapterId: log.chapterId,
    title: log.title,
    description: log.description || null,
    icon: log.icon,
    type: log.type,
    createdAt: new Date(),
  };
};

export const deleteLog = async (id: string) => {
  await execute("DELETE FROM logs WHERE id = $1", [id]);
};

export const updateLog = async (log: {
  id: string;
  title: string;
  description?: string;
  icon: string;
}) => {
  await execute(
    "UPDATE logs SET title = $1, description = $2, icon = $3 WHERE id = $4",
    [log.title, log.description || null, log.icon, log.id],
  );
};

export const logs = {
  getByChapterId: getLogsByChapterId,
  create: createLog,
  delete: deleteLog,
  update: updateLog,
};
