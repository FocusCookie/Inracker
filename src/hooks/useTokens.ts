import { useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";
import { Token } from "@/types/tokens";
import { Chapter } from "@/types/chapters";
import { Encounter } from "@/types/encounter";
import { CanvasElement } from "@/components/Canvas/Canvas";

export function useUpdateToken(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (token: Token) => database.tokens.update(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}

export function useCreateTokensForEncounter(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (data: { chapterId: Chapter["id"]; encounter: Encounter }) =>
      database.tokens.createOpponentsTokensByEncounter(
        data.chapterId,
        data.encounter,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}

export function useGroupTokensIntoElement(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast({
    mutationFn: (data: {
      tokens: Array<Token["entity"]>;
      element: CanvasElement;
    }) => database.tokens.groupIntoElement(data.tokens, data.element),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      queryClient.invalidateQueries({ queryKey: ["chapter"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });
}
