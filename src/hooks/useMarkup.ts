import { useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { MarkupElement } from "@/types/markup";
import { useQueryWithToast } from "./useQueryWithErrorToast";

export function useMarkupQuery(chapterId: number | null, database = defaultDb) {
  return useQueryWithToast({
    queryKey: ["markup", chapterId],
    queryFn: () => database.markup.getByChapter(chapterId!),
    enabled: !!chapterId,
  });
}

export function useCreateMarkup(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<MarkupElement, Error, Omit<MarkupElement, "id">>({
    mutationFn: (markup: Omit<MarkupElement, "id">) =>
      database.markup.create(markup),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markup"] });
    },
  });
}

export function useUpdateMarkup(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<MarkupElement, Error, MarkupElement>({
    mutationFn: (markup: MarkupElement) => database.markup.update(markup),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markup"] });
    },
  });
}

export function useDeleteMarkup(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<MarkupElement, Error, number>({
    mutationFn: (id: number) => database.markup.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["markup"] });
    },
  });
}
