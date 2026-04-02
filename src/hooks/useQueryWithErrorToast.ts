import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "./use-toast";
import { useTranslation } from "react-i18next";
import { formatError } from "@/lib/logger";

export function useQueryWithToast<TQueryFnData, TError, TData = TQueryFnData>(
  options: UseQueryOptions<TQueryFnData, TError, TData> & {
    errorMessage?: string;
  },
): UseQueryResult<TData, TError> {
  const { errorMessage, ...queryOptions } = options;
  const { toast } = useToast();
  const { t } = useTranslation("HookUseMutationWithErrorTaost");

  const query = useQuery<TQueryFnData, TError, TData>(queryOptions);

  useEffect(() => {
    if (query.isError) {
      const formattedError = formatError(query.error);

      toast({
        variant: "destructive",
        title: t("somethingWentWrong"),
        description: errorMessage || formattedError.message,
      });
    }
  }, [query.isError, errorMessage, query.error]);

  return query;
}
