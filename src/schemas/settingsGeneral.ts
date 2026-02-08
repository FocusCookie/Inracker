import { z } from "zod";

export const settingsGeneralSchema = z.object({
  secondsPerRound: z.coerce.number().min(1, "Must be at least 1 second"),
  language: z.enum(["en", "de"]),
});

export type SettingsGeneral = z.infer<typeof settingsGeneralSchema>;
