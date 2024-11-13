import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "./use-toast";
import { useTranslation } from "react-i18next";

export function useQueryWithToast<TQueryFnData, TError, TData = TQueryFnData>(
  options: UseQueryOptions<TQueryFnData, TError, TData> & {
    errorMessage?: string;
  },
): UseQueryResult<TData, TError> {
  const { errorMessage, ...queryOptions } = options;
  const { toast } = useToast();
  const { t } = useTranslation("HookUseMutationWithErrorTaost");

  const query = useQuery(queryOptions);

  useEffect(() => {
    if (query.isError) {
      console.log("Query Error on ", queryOptions.queryKey);

      toast({
        variant: "destructive",
        title: t("somethingWentWrong"),
        description: `${query.error || `Failed to load ${queryOptions.queryKey}`}`,
      });
    }
  }, [query.isError, errorMessage]);

  return query;
}
