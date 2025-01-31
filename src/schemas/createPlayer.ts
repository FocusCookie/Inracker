import i18next from "i18next";
import { z } from "zod";

export const createPlayerSchema = z.object({
  ep: z.coerce.number(),
  details: z.string(),
  overview: z.string(),
  health: z.coerce.number(),
  maxHealth: z.coerce.number(),
  icon: z.string().emoji(),
  immunities: z.array(z.coerce.number()),
  level: z.coerce.number(),
  name: z.string().min(2, {
    message: i18next.t("ComponentCreatePlayerDrawer:minName"),
  }),
  role: z.string().min(2, {
    message: i18next.t("ComponentCreatePlayerDrawer:minRole"),
  }),
  picture: z.instanceof(File).or(z.string()),
  resistances: z.array(z.coerce.number()),
});
