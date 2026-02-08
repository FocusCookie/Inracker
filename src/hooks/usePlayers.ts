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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["players"] });
    queryClient.invalidateQueries({ queryKey: ["party"] });
    queryClient.invalidateQueries({ queryKey: ["parties"] });
  };

  return useMutationWithErrorToast<Player, Error, TCreatePlayer>({
    mutationFn: (player: TCreatePlayer) => database.players.create(player),
    onSuccess: invalidate,
  });
}

export function useUpdatePlayer(database = defaultDb) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["players"] });
    queryClient.invalidateQueries({ queryKey: ["party"] });
    queryClient.invalidateQueries({ queryKey: ["parties"] });
  };

  return useMutationWithErrorToast<Player, Error, Player>({
    mutationFn: (player: Player) => database.players.update(player),
    onSuccess: invalidate,
  });
}

export function useDeletePlayer(database = defaultDb) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["players"] });
    queryClient.invalidateQueries({ queryKey: ["party"] });
    queryClient.invalidateQueries({ queryKey: ["parties"] });
  };

  return useMutationWithErrorToast<Player, Error, Player["id"]>({
    mutationFn: (id: Player["id"]) => database.players.delete(id),
    onSuccess: invalidate,
  });
}

export function useAddEffectToPlayer(database = defaultDb) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["players"] });
    queryClient.invalidateQueries({ queryKey: ["party"] });
    queryClient.invalidateQueries({ queryKey: ["parties"] });
  };

  return useMutationWithErrorToast<
    Player,
    Error,
    { playerId: Player["id"]; effectId: number }
  >({
    mutationFn: (data: { playerId: Player["id"]; effectId: number }) =>
      database.players.addEffect(data.playerId, data.effectId),
    onSuccess: invalidate,
  });
}

export function useRemoveEffectFromPlayer(database = defaultDb) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["players"] });
    queryClient.invalidateQueries({ queryKey: ["party"] });
    queryClient.invalidateQueries({ queryKey: ["parties"] });
  };

  return useMutationWithErrorToast<
    Effect,
    Error,
    { playerId: Player["id"]; effectId: number }
  >({
    mutationFn: (data: { playerId: Player["id"]; effectId: number }) =>
      database.players.removeEffect(data.playerId, data.effectId),
    onSuccess: invalidate,
  });
}

export function useAddImmunityToPlayer(database = defaultDb) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["players"] });
    queryClient.invalidateQueries({ queryKey: ["party"] });
    queryClient.invalidateQueries({ queryKey: ["parties"] });
  };

  return useMutationWithErrorToast<
    Player,
    Error,
    { playerId: Player["id"]; immunityId: number }
  >({
    mutationFn: (data: { playerId: Player["id"]; immunityId: number }) =>
      database.players.addImmunity(data.playerId, data.immunityId),
    onSuccess: invalidate,
  });
}

export function useRemoveImmunityFromPlayer(database = defaultDb) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["players"] });
    queryClient.invalidateQueries({ queryKey: ["party"] });
    queryClient.invalidateQueries({ queryKey: ["parties"] });
  };

  return useMutationWithErrorToast<
    DBImmunity,
    Error,
    { playerId: Player["id"]; immunityId: number }
  >({
    mutationFn: (data: { playerId: Player["id"]; immunityId: number }) =>
      database.players.removeImmunity(data.playerId, data.immunityId),
    onSuccess: invalidate,
  });
}

export function useAddResistanceToPlayer(database = defaultDb) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["players"] });
    queryClient.invalidateQueries({ queryKey: ["party"] });
    queryClient.invalidateQueries({ queryKey: ["parties"] });
  };

  return useMutationWithErrorToast<
    Player,
    Error,
    { playerId: Player["id"]; resistanceId: number }
  >({
    mutationFn: (data: { playerId: Player["id"]; resistanceId: number }) =>
      database.players.addResistance(data.playerId, data.resistanceId),
    onSuccess: invalidate,
  });
}

export function useRemoveResistanceFromPlayer(database = defaultDb) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["players"] });
    queryClient.invalidateQueries({ queryKey: ["party"] });
    queryClient.invalidateQueries({ queryKey: ["parties"] });
  };

  return useMutationWithErrorToast<
    DBResistance,
    Error,
    { playerId: Player["id"]; resistanceId: number }
  >({
    mutationFn: (data: { playerId: Player["id"]; resistanceId: number }) =>
      database.players.removeResistance(data.playerId, data.resistanceId),
    onSuccess: invalidate,
  });
}

