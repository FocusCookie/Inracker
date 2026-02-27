import { useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { DBWeakness, Weakness } from "@/types/weakness";
import { useQueryWithToast } from "./useQueryWithErrorToast";

export function useWeaknesses(database = defaultDb) {
  return useQueryWithToast({
    queryKey: ["weaknesses"],
    queryFn: () => database.weaknesses.getAll(),
  });
}

export function useCreateWeakness(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<DBWeakness, Error, Omit<Weakness, "id">>({
    mutationFn: (weakness: Omit<Weakness, "id">) =>
      database.weaknesses.create(weakness),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weaknesses"] });
    },
  });
}

export function useUpdateWeakness(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<DBWeakness, Error, DBWeakness>({
    mutationFn: (weakness: DBWeakness) =>
      database.weaknesses.update(weakness),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weaknesses"] });
    },
  });
}

export function useDeleteWeakness(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<DBWeakness, Error, DBWeakness["id"]>({
    mutationFn: (id: DBWeakness["id"]) => database.weaknesses.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weaknesses"] });
    },
  });
}
