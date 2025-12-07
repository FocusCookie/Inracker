import i18next from "i18next";
import { z } from "zod";

export const editOpponentSchema = z.object({
  id: z.number(),
  name: z.string().min(2, {
    message: i18next.t("ComponentEditOpponentDrawer:minName"),
  }),
  icon: z.string().emoji(),
  details: z.string(),
  max_health: z.coerce.number(),
  level: z.coerce.number(),
  labels: z.array(z.string().min(1)),
  image: z.instanceof(File).or(z.string()),
  resistances: z.array(z.coerce.number()),
  immunities: z.array(z.coerce.number()),
  effects: z.array(z.coerce.number()),
});

export type TCreateOpponent = z.infer<typeof editOpponentSchema>;
