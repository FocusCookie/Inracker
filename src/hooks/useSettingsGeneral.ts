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

  const { data: secondsPerRound, isLoading } = useQuery({
    queryKey: ["settings", "secondsPerRound"],
    queryFn: async () => {
      const value = await Database.settings.get("seconds_per_round");
      return value ? parseInt(value, 10) : 6;
    },
  });

  const form = useForm<SettingsGeneral>({
    resolver: zodResolver(settingsGeneralSchema),
    defaultValues: {
      secondsPerRound: 6,
    },
  });

  useEffect(() => {
    if (secondsPerRound !== undefined) {
      form.reset({ secondsPerRound });
    }
  }, [secondsPerRound, form]);

  const mutation = useMutationWithErrorToast({
    mutationFn: async (values: SettingsGeneral) => {
      await Database.settings.update(
        "seconds_per_round",
        values.secondsPerRound.toString(),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  return { form, mutation, isLoading };
};
