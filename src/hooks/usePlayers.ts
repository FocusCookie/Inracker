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
  return useMutationWithErrorToast<Player, Error, TCreatePlayer>({
    mutationFn: (player: TCreatePlayer) => database.players.create(player),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

export function useUpdatePlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<Player, Error, Player>({
    mutationFn: (player: Player) => database.players.update(player),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

export function useDeletePlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<Player, Error, Player["id"]>({
    mutationFn: (id: Player["id"]) => database.players.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

export function useAddEffectToPlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<Player, Error, { playerId: Player["id"]; effectId: number }>({
    mutationFn: (data: { playerId: Player["id"]; effectId: number }) =>
      database.players.addEffect(data.playerId, data.effectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

export function useRemoveEffectFromPlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<Effect, Error, { playerId: Player["id"]; effectId: number }>({
    mutationFn: (data: { playerId: Player["id"]; effectId: number }) =>
      database.players.removeEffect(data.playerId, data.effectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

export function useAddImmunityToPlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<Player, Error, { playerId: Player["id"]; immunityId: number }>({
    mutationFn: (data: { playerId: Player["id"]; immunityId: number }) =>
      database.players.addImmunity(data.playerId, data.immunityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

export function useRemoveImmunityFromPlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<DBImmunity, Error, { playerId: Player["id"]; immunityId: number }>({
    mutationFn: (data: { playerId: Player["id"]; immunityId: number }) =>
      database.players.removeImmunity(data.playerId, data.immunityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

export function useAddResistanceToPlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<Player, Error, { playerId: Player["id"]; resistanceId: number }>({
    mutationFn: (data: { playerId: Player["id"]; resistanceId: number }) =>
      database.players.addResistance(data.playerId, data.resistanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

export function useRemoveResistanceFromPlayer(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<DBResistance, Error, { playerId: Player["id"]; resistanceId: number }>({
    mutationFn: (data: { playerId: Player["id"]; resistanceId: number }) =>
      database.players.removeResistance(data.playerId, data.resistanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
  });
}

