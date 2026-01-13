import { useQuery, useQueryClient } from "@tanstack/react-query";
import Database from "@/lib/database";
import { FullCombatState } from "@/types/combat";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";

export function useCombatState(chapterId: number) {
  return useQuery<FullCombatState | null>({
    queryKey: ["combat", chapterId],
    queryFn: async () => {
      const data = await Database.combat.getState(chapterId);
      return data;
    },
  });
}

export function useCombatActions(chapterId: number) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["combat", chapterId] });
  };

  const nextTurn = useMutationWithErrorToast({
    mutationFn: (combatId: string) => Database.combat.nextTurn(combatId),
    onSuccess: invalidate,
  });

  const addEffect = useMutationWithErrorToast({
    mutationFn: (data: {
      combatId: string;
      participantId: string;
      name: string;
      duration: number;
      description?: string;
    }) => Database.combat.addEffect(data),
    onSuccess: invalidate,
  });

  const removeEffect = useMutationWithErrorToast({
    mutationFn: (effectId: string) => Database.combat.removeEffect(effectId),
    onSuccess: invalidate,
  });

  const createCombat = useMutationWithErrorToast({
    mutationFn: (data: {
      chapterId: number;
      encounterId?: number;
      participants: {
        name: string;
        initiative: number;
        entityId: number;
        type: "player" | "opponent";
      }[];
    }) =>
      Database.combat.create(
        data.chapterId,
        data.participants,
        data.encounterId,
      ),
    onSuccess: invalidate,
  });

  const updateInitiative = useMutationWithErrorToast({
    mutationFn: (data: { participantId: string; newInitiative: number }) =>
      Database.combat.updateInitiative(data.participantId, data.newInitiative),
    onSuccess: invalidate,
  });

  const finishCombat = useMutationWithErrorToast({
    mutationFn: (combatId: string) => Database.combat.finish(combatId),
    onSuccess: invalidate,
  });

  const addParticipant = useMutationWithErrorToast({
    mutationFn: (data: {
      combatId: string;
      name: string;
      initiative: number;
      entityId?: number;
      entityType?: "player" | "opponent";
    }) => Database.combat.addParticipant(data),
    onSuccess: invalidate,
  });

  const removeParticipant = useMutationWithErrorToast({
    mutationFn: (participantId: string) =>
      Database.combat.removeParticipant(participantId),
    onSuccess: invalidate,
  });

  return {
    nextTurn,
    addEffect,
    removeEffect,
    createCombat,
    updateInitiative,
    finishCombat,
    addParticipant,
    removeParticipant,
  };
}
