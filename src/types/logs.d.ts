export type LogType = "manual" | "damage" | "heal" | "rest" | "money";

export type DBLog = {
  id: string;
  chapter_id: number;
  title: string;
  description: string | null;
  icon: string;
  type: LogType;
  created_at: string;
};

export type Log = {
  id: string;
  chapterId: number;
  title: string;
  description: string | null;
  icon: string;
  type: LogType;
  createdAt: Date;
};
