import { useQueryClient } from "@tanstack/react-query";
import db from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { EncounterOpponent } from "@/types/opponents";

export function useCreateEncounterOpponent() {
  const queryClient = useQueryClient();

  return useMutationWithErrorToast({
    mutationFn: (data: { opponent: Omit<EncounterOpponent, "id">; chapterId: number }) =>
      db.encounterOpponents.createWithToken(data.opponent, data.chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}

export function useDeleteEncounterOpponent() {
  const queryClient = useQueryClient();

  return useMutationWithErrorToast({
    mutationFn: (id: number) => db.encounterOpponents.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}
