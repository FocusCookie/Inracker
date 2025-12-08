import { useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { Encounter } from "@/types/encounter";

export function useCreateEncounterMutation(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (encounter: Omit<Encounter, "id">) =>
      database.encounters.create(encounter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
    },
  });
}

export function useUpdateEncounter(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (encounter: Encounter) => database.encounters.update(encounter),
    onMutate: async (updatedEncounter: Encounter) => {
      await queryClient.cancelQueries({ queryKey: ["encounters"] });
      const previousEncounters = queryClient.getQueryData<Encounter[]>([
        "encounters",
      ]);
      queryClient.setQueryData<Encounter[]>(["encounters"], (old) => {
        if (!old) return [];
        return old.map((enc) =>
          enc.id === updatedEncounter.id ? updatedEncounter : enc,
        );
      });
      return { previousEncounters };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}

export function useDeleteEncounter(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (id: Encounter["id"]) => database.encounters.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
      queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });
      queryClient.invalidateQueries({ queryKey: ["chapter"] });
    },
  });
}

export function useRemoveOpponentFromEncounter(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (data: { encounter: Encounter; opponentId: number }) => {
       const previousOpponents = data.encounter.opponents
        ? [...data.encounter.opponents]
        : [];
      return database.encounters.update({
        ...data.encounter,
        opponents: previousOpponents.filter(
          (opp: number) => opp !== data.opponentId,
        ),
      });
    },
    onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ["encounters"] });
    }
  });
}

