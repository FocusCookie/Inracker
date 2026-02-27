import { useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { EncounterOpponent } from "@/types/opponents";
import { useQueryWithToast } from "./useQueryWithErrorToast";
import { Effect } from "@/types/effect";

export function useEncounterOpponentsDetailed(database = defaultDb) {
  return useQueryWithToast({
    queryKey: ["encounter-opponents"],
    queryFn: () => database.encounterOpponents.getAllDetailed(),
  });
}

export function useDeleteEncounterOpponent(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<any, Error, EncounterOpponent["id"]>({
    mutationFn: (id: EncounterOpponent["id"]) =>
      database.encounterOpponents.delete(id),
    onSuccess: () => {
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
  return useMutationWithErrorToast<EncounterOpponent, Error, {
    opponent: Omit<EncounterOpponent, "id">;
    chapterId: number;
  }>({
    mutationFn: (data: {
      opponent: Omit<EncounterOpponent, "id">;
      chapterId: number;
    }) =>
      database.encounterOpponents.createWithToken(data.opponent, data.chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}

export function useCreateMultipleEncounterOpponents(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<EncounterOpponent[], Error, Array<Omit<EncounterOpponent, "id">>>({
    mutationFn: (opponents: Array<Omit<EncounterOpponent, "id">>) =>
      database.encounterOpponents.createMultiple(opponents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });
    },
  });
}

export function useUpdateEncounterOpponent(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<EncounterOpponent, Error, EncounterOpponent>({
    mutationFn: (opponent: EncounterOpponent) =>
      database.encounterOpponents.update(opponent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}

export function useAddEffectToEncounterOpponent(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<
    EncounterOpponent,
    Error,
    { opponentId: number; effectId: number }
  >({
    mutationFn: (data: { opponentId: number; effectId: number }) =>
      database.encounterOpponents.addEffect(data.opponentId, data.effectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
    },
  });
}

export function useRemoveEffectFromEncounterOpponent(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<
    Effect,
    Error,
    { opponentId: number; effectId: number }
  >({
    mutationFn: (data: { opponentId: number; effectId: number }) =>
      database.encounterOpponents.removeEffect(data.opponentId, data.effectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
    },
  });
}
