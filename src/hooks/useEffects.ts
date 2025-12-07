import { useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { Effect } from "@/types/effect";

export function useCreateEffect(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (effect: Omit<Effect, "id">) =>
      database.effects.create(effect),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["effects"] });
    },
  });
}

export function useUpdateEffect(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (effect: Effect) => database.effects.update(effect),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["effects"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

export function useDeleteEffect(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (id: Effect["id"]) => database.effects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["effects"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}