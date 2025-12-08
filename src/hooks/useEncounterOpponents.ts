import { useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { EncounterOpponent } from "@/types/opponents";
import { useQueryWithToast } from "./useQueryWithErrorToast";

export function useEncounterOpponentsDetailed(database = defaultDb) {
  return useQueryWithToast({
    queryKey: ["encounter-opponents"],
    queryFn: () => database.encounterOpponents.getAllDetailed(),
  });
}

export function useDeleteEncounterOpponent(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (id: EncounterOpponent["id"]) =>
      database.encounterOpponents.delete(id),
    onSuccess: (opponent: EncounterOpponent) => {
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
      queryClient.invalidateQueries({ queryKey: ["chapter"] });
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });
    },
  });
}

export function useCreateEncounterOpponent(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (data: {
      opponent: Omit<EncounterOpponent, "id">;
      chapterId: number;
    }) =>
      database.encounterOpponents.create(data.opponent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}

export function useCreateMultipleEncounterOpponents(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (opponents: Array<Omit<EncounterOpponent, "id">>) =>
      database.encounterOpponents.createMultiple(opponents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });
    },
  });
}