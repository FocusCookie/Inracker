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

export function useRemovePlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: ({
      partyId,
      playerId,
    }: {
      partyId: number;
      playerId: number;
    }) => database.parties.removePlayer(partyId, playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}

export function useAddPlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: ({
      partyId,
      playerId,
    }: {
      partyId: number;
      playerId: number;
    }) => database.parties.addPlayer(partyId, playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}

export function useDeleteParty(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (id: number) => database.parties.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

export function useCreateParty(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (party: Omit<Party, "id">) => database.parties.create(party),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

export function useUpdateParty(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (party: Party) => database.parties.update(party),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
    },
  });
}