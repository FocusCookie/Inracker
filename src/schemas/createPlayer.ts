import { z } from "zod";
// import i18next from "./i18n";
//TODO: Use the  i18next.t('my.key') for translating the messages

export const createPlayerSchema = z.object({
  armor: z.coerce.number(),
  attributes: z.object({
    constitution: z.coerce.number(),
    charisma: z.coerce.number(),
    dexterity: z.coerce.number(),
    intelligence: z.coerce.number(),
    strength: z.coerce.number(),
    wisdom: z.coerce.number(),
  }),
  classSg: z.coerce.number(),
  ep: z.coerce.number(),
  description: z.string(),
  health: z.coerce.number(),
  maxHealth: z.coerce.number(),
  icon: z.string().emoji(),
  immunities: z.array(z.coerce.number()),
  level: z.coerce.number(),
  movement: z.object({
    air: z.coerce.number(),
    ground: z.coerce.number(),
    highJump: z.coerce.number(),
    water: z.coerce.number(),
    wideJump: z.coerce.number(),
  }),
  name: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  perception: z.coerce.number(),
  role: z.string().min(3, {
    message: "The role or class must be at least 3 characters.",
  }),
  savingThrows: z.object({
    reflex: z.coerce.number(),
    will: z.coerce.number(),
    thoughness: z.coerce.number(),
  }),
  shield: z.object({
    value: z.coerce.number(),
    health: z.coerce.number(),
  }),
  picture: z.instanceof(File).or(z.string()),
});
