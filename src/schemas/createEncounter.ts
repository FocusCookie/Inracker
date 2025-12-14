import { z } from "zod";

export const createEncounterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  experience: z.number().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  dice: z.number().optional(),
  difficulties: z
    .array(
      z.object({
        description: z.string(),
        value: z.number(),
      }),
    )
    .optional(),
  element: z.any(),
  images: z.array(z.string()).optional(),
  opponents: z.array(z.number()).optional(),
  passed: z.boolean().optional(),
  completed: z.boolean().optional(),
  skill: z.string().optional(),
  soundcloud: z.string().optional(),
  type: z.enum(["note", "roll", "fight"]),
});

export type TCreateEncounter = z.infer<typeof createEncounterSchema>;
