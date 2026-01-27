import { useQueryClient } from "@tanstack/react-query";
import Database from "@/lib/database";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";

export function useRests() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["players"] });
    queryClient.invalidateQueries({ queryKey: ["party"] });
    queryClient.invalidateQueries({ queryKey: ["parties"] });
    queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });
  };

  const shortRest = useMutationWithErrorToast({
    mutationFn: (_: void) => Database.rests.short(),
    onSuccess: invalidate,
  });

  const longRest = useMutationWithErrorToast({
    mutationFn: (_: void) => Database.rests.long(),
    onSuccess: invalidate,
  });

  return {
    shortRest,
    longRest,
  };
}
