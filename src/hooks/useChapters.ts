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

export function useAddEncounterToChapter(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (data: {
      chapterId: Chapter["id"];
      encounterId: number;
    }) => database.chapters.addEncounter(data.chapterId, data.encounterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapter"] });
    },
  });
}

export function useUpdateChapterProperty(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (data: {
      chapterId: Chapter["id"];
      property: keyof Chapter;
      value: any;
    }) =>
      database.chapters.updateProperty(
        data.chapterId,
        data.property,
        data.value,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapter"] });
    },
  });
}

export function useRemoveEncounterFromChapter(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: async (data: { chapterId: Chapter["id"], encounterId: number }) => {
        await database.chapters.removeEncounter(data.chapterId, data.encounterId);
        return database.encounters.delete(data.encounterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapter"] });
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    }
  });
}