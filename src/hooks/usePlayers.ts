import { useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { Player, TCreatePlayer } from "@/types/player";
import { DBImmunity } from "@/types/immunitiy";
import { DBResistance } from "@/types/resistances";
import { Effect } from "@/types/effect";
import { useQueryWithToast } from "./useQueryWithErrorToast";

export function useAllPlayers(database = defaultDb) {
  return useQueryWithToast({
    queryKey: ["players"],
    queryFn: () => database.players.getAll(),
  });
}

export function useCreatePlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (player: TCreatePlayer) => database.players.create(player),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

export function useUpdatePlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (player: Player) => database.players.update(player),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

export function useDeletePlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (id: Player["id"]) => database.players.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

export function useAddEffectToPlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (data: { playerId: Player["id"]; effectId: Effect["id"] }) =>
      database.players.addEffect(data.playerId, data.effectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

export function useRemoveEffectFromPlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (data: { playerId: Player["id"]; effectId: Effect["id"] }) =>
      database.players.removeEffect(data.playerId, data.effectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

export function useAddImmunityToPlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (data: {
      playerId: Player["id"];
      immunityId: DBImmunity["id"];
    }) => database.players.addImmunity(data.playerId, data.immunityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

export function useRemoveImmunityFromPlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (data: {
      playerId: Player["id"];
      immunityId: DBImmunity["id"];
    }) => database.players.removeImmunity(data.playerId, data.immunityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

export function useAddResistanceToPlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (data: {
      playerId: Player["id"];
      resistanceId: DBResistance["id"];
    }) => database.players.addResistance(data.playerId, data.resistanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

export function useRemoveResistanceFromPlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (data: {
      playerId: Player["id"];
      resistanceId: DBResistance["id"];
    }) => database.players.removeResistance(data.playerId, data.resistanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });
}

