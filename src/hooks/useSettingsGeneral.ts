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
import i18n from "@/i18next";

export const useSettingsGeneral = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", "general"],
    queryFn: async () => {
      const secondsPerRound = await Database.settings.get("seconds_per_round");
      const language = await Database.settings.get("language");
      return {
        secondsPerRound: secondsPerRound ? parseInt(secondsPerRound, 10) : 6,
        language: (language as "en" | "de") || "en",
      };
    },
  });

  const form = useForm<SettingsGeneral>({
    resolver: zodResolver(settingsGeneralSchema),
    defaultValues: {
      secondsPerRound: 6,
      language: "en",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const mutation = useMutationWithErrorToast({
    mutationFn: async (values: SettingsGeneral) => {
      await Database.settings.update(
        "seconds_per_round",
        values.secondsPerRound.toString(),
      );
      await Database.settings.update("language", values.language);
      await i18n.changeLanguage(values.language);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  return { form, mutation, isLoading };
};
