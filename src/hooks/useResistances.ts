import { useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { DBResistance, Resistance } from "@/types/resistances";

export function useCreateResistance(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (resistance: Resistance) =>
      database.resistances.create(resistance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resistances"] });
    },
  });
}

export function useUpdateResistance(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (resistance: DBResistance) =>
      database.resistances.update(resistance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resistances"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

export function useDeleteResistance(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (id: DBResistance["id"]) => database.resistances.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resistances"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}