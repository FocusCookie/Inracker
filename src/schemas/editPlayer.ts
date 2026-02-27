import i18next from "i18next";
import { z } from "zod";

export const editPlayerSchema = z.object({
  ep: z.coerce.number(),
  id: z.coerce.number(),
  details: z.string(),
  effects: z.array(z.number()),
  overview: z.string(),
  health: z.coerce.number(),
  max_health: z.coerce.number(),
  icon: z.string().emoji(),
  immunities: z.array(z.number()),
  level: z.coerce.number(),
  name: z.string().min(2, {
    message: i18next.t("ComponentCreatePlayerDrawer:minName"),
  }),
  role: z.string().min(2, {
    message: i18next.t("ComponentCreatePlayerDrawer:minRole"),
  }),
  picture: z.instanceof(File).or(z.string()),
  resistances: z.array(z.number()),
  weaknesses: z.array(z.number()),
  gold: z.coerce.number(),
  silver: z.coerce.number(),
  copper: z.coerce.number(),
  hero_points: z.coerce.number().min(0).max(3),
});
