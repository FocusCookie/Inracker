import { useQueryWithToast } from "./useQueryWithErrorToast";
import defaultDb from "@/lib/database";
import { useQueryClient } from "@tanstack/react-query";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { DBOpponent, Opponent } from "@/types/opponents";

export function useOpponents(database = defaultDb) {
  return useQueryWithToast({
    queryKey: ["opponents"],
    queryFn: () => database.opponents.getAllDetailed(),
  });
}

export function useCreateOpponent(database = defaultDb) {
  const queryClient = useQueryClient();

  return useMutationWithErrorToast<Opponent, Error, Omit<Opponent, "id">>({
    mutationFn: (opponent: Omit<Opponent, "id">) =>
      database.opponents.create(opponent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opponents"] });
    },
  });
}

export function useUpdateOpponent(database = defaultDb) {
  const queryClient = useQueryClient();

  return useMutationWithErrorToast<Opponent, Error, Opponent>({
    mutationFn: (opponent: Opponent) => database.opponents.update(opponent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opponents"] });
    },
  });
}

export function useDeleteOpponent(database = defaultDb) {
  const queryClient = useQueryClient();

  return useMutationWithErrorToast<DBOpponent, Error, DBOpponent["id"]>({
    mutationFn: (id: DBOpponent["id"]) => database.opponents.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opponents"] });
    },
  });
}