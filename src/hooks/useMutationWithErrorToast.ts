import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useToast } from "./use-toast";
import { useTranslation } from "react-i18next";
import { formatError } from "@/lib/logger";

export function useMutationWithErrorToast<TData, TError, TVariables>(
  options: UseMutationOptions<TData, TError, TVariables>,
) {
  const { toast } = useToast();
  const { t } = useTranslation("HookUseMutationWithErrorTaost");

  return useMutation({
    ...options,
    onError: (error, variables, context) => {
      const formattedError = formatError(error);

      toast({
        variant: "destructive",
        title: t("somethingWentWrong"),
        description: formattedError.message,
      });
    },
  });
}
