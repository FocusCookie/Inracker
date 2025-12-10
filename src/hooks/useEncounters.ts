import { useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { Encounter } from "@/types/encounter";
import { useQueryWithToast } from "./useQueryWithErrorToast";

export function useEncounterQuery(id: number, database = defaultDb) {
  return useQueryWithToast({
    queryKey: ["encounters", id],
    queryFn: () => database.encounters.getById(id),
  });
}

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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["chapter"] });
    },
  });
}

export function useSetEncounterCompletion(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (data: { id: number; completed: boolean }) =>
      database.encounters.updateProperty(data.id, "completed", data.completed),
    onSuccess: (updatedEncounter) => {
      queryClient.setQueryData(
        ["encounters", updatedEncounter.id],
        updatedEncounter,
      );
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      queryClient.invalidateQueries({ queryKey: ["encounter"] });
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["chapter"] });
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

export function useEncounters(database = defaultDb) {
  return useQueryWithToast({
    queryKey: ["encounters"],
    queryFn: () => database.encounters.getAll(),
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
    },
  });
}
