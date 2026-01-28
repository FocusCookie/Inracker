import { useQuery, useQueryClient } from "@tanstack/react-query";
import defaultDb from "@/lib/database";
import { Log, LogType } from "@/types/logs";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";

export function useLogs(chapterId: number, database = defaultDb) {
  return useQuery({
    queryKey: ["logs", chapterId],
    queryFn: () => database.logs.getByChapterId(chapterId),
  });
}

export function useCreateLog(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<Log, Error, {
    chapterId: number;
    title: string;
    description?: string;
    icon: string;
    type: LogType;
  }>({
    mutationFn: (log) => database.logs.create(log),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["logs", variables.chapterId] });
    },
  });
}

export function useDeleteLog(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<void, Error, { id: string; chapterId: number }>({
    mutationFn: ({ id }) => database.logs.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["logs", variables.chapterId] });
    },
  });
}

export function useUpdateLog(database = defaultDb) {
  const queryClient = useQueryClient();
  return useMutationWithErrorToast<
    void,
    Error,
    {
      id: string;
      chapterId: number;
      title: string;
      description?: string;
      icon: string;
    }
  >({
    mutationFn: (log) => database.logs.update(log),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["logs", variables.chapterId],
      });
    },
  });
}
