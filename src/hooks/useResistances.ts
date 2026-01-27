import { useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { DBResistance, Resistance } from "@/types/resistances";
import { useQueryWithToast } from "./useQueryWithErrorToast";

export function useResistances(database = defaultDb) {
  return useQueryWithToast({
    queryKey: ["resistances"],
    queryFn: () => database.resistances.getAll(),
  });
}

export function useCreateResistance(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<DBResistance, Error, Omit<Resistance, "id">>({
    mutationFn: (resistance: Omit<Resistance, "id">) =>
      database.resistances.create(resistance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resistances"] });
    },
  });
}

export function useUpdateResistance(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<DBResistance, Error, DBResistance>({
    mutationFn: (resistance: DBResistance) =>
      database.resistances.update(resistance),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resistances"] });
    },
  });
}

export function useDeleteResistance(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<DBResistance, Error, DBResistance["id"]>({
    mutationFn: (id: DBResistance["id"]) => database.resistances.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resistances"] });
    },
  });
}