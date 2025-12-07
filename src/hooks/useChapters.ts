import { useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { Chapter } from "@/types/chapters";
import { useQueryWithToast } from "./useQueryWithErrorToast";

export function useChaptersQuery(
  partyId: number | null,
  database = defaultDb,
) {
  return useQueryWithToast({
    queryKey: ["chapters", partyId],
    queryFn: () => database.chapters.getAllForParty(partyId!),
    enabled: !!partyId,
  });
}

export function useCreateChapter(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (chapter: Omit<Chapter, "id">) =>
      database.chapters.create(chapter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
    },
  });
}

export function useUpdateChapter(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (chapter: Chapter) => database.chapters.update(chapter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
    },
  });
}

export function useDeleteChapter(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (id: Chapter["id"]) => database.chapters.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
    },
  });
}