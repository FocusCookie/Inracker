import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { NPC } from "@/types/npcs";

export function useNPCs(database = defaultDb) {
  return useQuery({
    queryKey: ["npcs"],
    queryFn: () => database.npcs.getAllDetailed(),
  });
}

export function useDeleteNPC(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (id: number) => database.npcs.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["npcs"] });
    },
  });
}

export function useUpdateNPC(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (npc: NPC) => database.npcs.update(npc),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["npcs"] });
    },
  });
}
