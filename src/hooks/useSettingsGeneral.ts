import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  settingsGeneralSchema,
  SettingsGeneral,
} from "@/schemas/settingsGeneral";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Database from "@/lib/database";
import { useEffect } from "react";
import { useMutationWithErrorToast } from "./useMutationWithErrorToast";

export const useSettingsGeneral = () => {
  const queryClient = useQueryClient();

  const { data: secondsPerTurn, isLoading } = useQuery({
    queryKey: ["settings", "secondsPerTurn"],
    queryFn: async () => {
      const value = await Database.settings.get("seconds_per_turn");
      return value ? parseInt(value, 10) : 6;
    },
  });

  const form = useForm<SettingsGeneral>({
    resolver: zodResolver(settingsGeneralSchema),
    defaultValues: {
      secondsPerTurn: 6,
    },
  });

  useEffect(() => {
    if (secondsPerTurn !== undefined) {
      form.reset({ secondsPerTurn });
    }
  }, [secondsPerTurn, form]);

  const mutation = useMutationWithErrorToast({
    mutationFn: async (values: SettingsGeneral) => {
      await Database.settings.update(
        "seconds_per_turn",
        values.secondsPerTurn.toString(),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  return { form, mutation, isLoading };
};
