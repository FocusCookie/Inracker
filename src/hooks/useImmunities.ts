import { useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { DBImmunity, Immunity } from "@/types/immunitiy";
import { useQueryWithToast } from "./useQueryWithErrorToast";

export function useImmunities(database = defaultDb) {
  return useQueryWithToast({
    queryKey: ["immunities"],
    queryFn: () => database.immunities.getAll(),
  });
}

export function useCreateImmunity(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<DBImmunity, Error, Immunity>({
    mutationFn: (immunity: Immunity) => database.immunities.create(immunity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immunities"] });
    },
  });
}

export function useUpdateImmunity(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<DBImmunity, Error, DBImmunity>({
    mutationFn: (immunity: DBImmunity) =>
      database.immunities.update(immunity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immunities"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

export function useDeleteImmunity(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<DBImmunity, Error, DBImmunity["id"]>({
    mutationFn: (id: DBImmunity["id"]) => database.immunities.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immunities"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}