import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { EncounterNPC } from "@/types/npcs";

export function useEncounterNPCs(database = defaultDb) {
  return useQuery({
    queryKey: ["encounter-npcs"],
    queryFn: () => database.encounterNPCs.getAllDetailed(),
  });
}

export function useCreateEncounterNPC(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: ({ npc, chapterId }: { npc: Omit<EncounterNPC, "id">, chapterId: number }) =>
      database.encounterNPCs.createWithToken(npc, chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounter-npcs"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}

export function useUpdateEncounterNPC(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (npc: EncounterNPC) => database.encounterNPCs.update(npc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounter-npcs"] });
    },
  });
}

export function useDeleteEncounterNPC(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (id: number) => database.encounterNPCs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounter-npcs"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}

export function useAddEffectToNPC(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: ({ npcId, effectId }: { npcId: number; effectId: number }) =>
      database.encounterNPCs.addEffect(npcId, effectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounter-npcs"] });
    },
  });
}

export function useRemoveEffectFromNPC(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: ({ npcId, effectId }: { npcId: number; effectId: number }) =>
      database.encounterNPCs.removeEffect(npcId, effectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounter-npcs"] });
    },
  });
}
