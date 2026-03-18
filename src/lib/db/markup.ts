import { MarkupElement } from "@/types/markup";
import { Chapter } from "@/types/chapters";
import { execute, select, createDatabaseError } from "./core";

export const getMarkupById = async (id: number): Promise<MarkupElement> => {
  const result = await select<MarkupElement[]>(
    "SELECT * FROM markup WHERE id = $1",
    [id],
  );

  if (!result.length) {
    throw createDatabaseError(`Markup with ID ${id} not found`);
  }

  return result[0];
};

export const getMarkupForChapter = async (
  chapterId: Chapter["id"],
): Promise<MarkupElement[]> => {
  const result = await select<MarkupElement[]>(
    "SELECT * FROM markup WHERE chapter = $1",
    [chapterId],
  );

  return result;
};

export const createMarkup = async (
  markup: Omit<MarkupElement, "id">,
): Promise<MarkupElement> => {
  const { chapter, x, y, width, height, rotation, color } = markup;

  const result = await execute(
    "INSERT INTO markup(chapter, x, y, width, height, rotation, color) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    [chapter, x, y, width, height, rotation || 0, color],
  );

  const createdMarkup = await getMarkupById(result!.lastInsertId as number);

  return createdMarkup;
};

export const updateMarkup = async (
  markup: MarkupElement,
): Promise<MarkupElement> => {
  const { id, x, y, width, height, rotation, color } = markup;

  await execute(
    "UPDATE markup SET x = $2, y = $3, width = $4, height = $5, rotation = $6, color = $7 WHERE id = $1",
    [id, x, y, width, height, rotation, color],
  );

  return getMarkupById(id);
};

export const deleteMarkupById = async (id: number): Promise<MarkupElement> => {
  const deletedMarkup = await getMarkupById(id);
  await execute("DELETE FROM markup WHERE id = $1", [id]);
  return deletedMarkup;
};

export const markup = {
  getById: getMarkupById,
  getByChapter: getMarkupForChapter,
  create: createMarkup,
  update: updateMarkup,
  delete: deleteMarkupById,
};
