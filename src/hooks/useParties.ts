import { useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { Party } from "@/types/party";
import { useQueryWithToast } from "./useQueryWithErrorToast";

export function usePartiesQuery(database = defaultDb) {
  return useQueryWithToast({
    queryKey: ["parties"],
    queryFn: database.parties.getAllDetailed,
  });
}

export function usePartyQuery(partyId: number | null, database = defaultDb) {
  return useQueryWithToast({
    queryKey: ["party", partyId],
    queryFn: () => database.parties.getById(partyId!),
    enabled: !!partyId,
  });
}

export function useAddPlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<any, Error, { partyId: number; playerId: number }> ({
    mutationFn: (data: { partyId: number; playerId: number }) =>
      database.parties.addPlayer(data.partyId, data.playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
    },
  });
}

export function useRemovePlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<any, Error, { partyId: number; playerId: number }> ({
    mutationFn: (data: { partyId: number; playerId: number }) =>
      database.parties.removePlayer(data.partyId, data.playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
    },
  });
}

export function useCreateParty(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<{ id: number }, Error, Omit<Party, "id"> > ({
    mutationFn: (party: Omit<Party, "id">) => database.parties.create(party),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

export function useUpdateParty(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<Party, Error, Party> ({
    mutationFn: (party: Party) => database.parties.update(party),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
    },
  });
}

export function useDeleteParty(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<number, Error, number> ({
    mutationFn: (id: number) => database.parties.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}