import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useTranslation } from "react-i18next";

export function useMutationWithErrorToast<TData, TError, TVariables>(
  options: UseMutationOptions<TData, TError, TVariables>,
) {
  const { toast } = useToast();
  const { t } = useTranslation("HookUseMutationWithErrorTaost");

  return useMutation({
    ...options,
    onError: (error, variables, context) => {
      console.log("Mutation Error");
      console.error({ error, variables, context });

      toast({
        variant: "destructive",
        title: t("somethingWentWrong"),
        // @ts-ignore
        description: error?.message || undefined,
      });
    },
  });
}
