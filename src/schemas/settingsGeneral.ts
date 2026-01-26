import { z } from "zod";

export const settingsGeneralSchema = z.object({
  secondsPerTurn: z.coerce.number().min(1, "Must be at least 1 second"),
});

export type SettingsGeneral = z.infer<typeof settingsGeneralSchema>;
