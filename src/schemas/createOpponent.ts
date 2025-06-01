import i18next from "i18next";
import { z } from "zod";

export const createOpponentSchema = z.object({
  name: z.string().min(2, {
    message: i18next.t("ComponentOpponentForm:minName"),
  }),
  icon: z.string().emoji(),
  details: z.string(),
  maxHealth: z.coerce.number(),
  level: z.coerce.number(),
  labels: z.array(z.string().min(1)),
  picture: z.instanceof(File).or(z.string()),
  resistances: z.array(z.coerce.number()),
  immunities: z.array(z.coerce.number()),
});
