import i18next from "i18next";
import { z } from "zod";

export const editPlayerSchema = z.object({
  ep: z.coerce.number(),
  id: z.coerce.number(),
  details: z.string(),
  effects: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      icon: z.string(),
      type: z.enum(["positive", "negative"]),
      description: z.string(),
      duration: z.number(),
      durationType: z.enum(["rounds", "time"]),
    }),
  ),
  overview: z.string(),
  health: z.coerce.number(),
  max_health: z.coerce.number(),
  icon: z.string().emoji(),
  immunities: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      icon: z.string(),
      description: z.string(),
    }),
  ),
  level: z.coerce.number(),
  name: z.string().min(2, {
    message: i18next.t("ComponentCreatePlayerDrawer:minName"),
  }),
  role: z.string().min(2, {
    message: i18next.t("ComponentCreatePlayerDrawer:minRole"),
  }),
  picture: z.instanceof(File).or(z.string()),
  resistances: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      icon: z.string(),
      description: z.string(),
    }),
  ),
});
