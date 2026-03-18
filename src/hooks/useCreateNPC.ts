import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const npcSchema = z.object({
  name: z.string().min(1, "Name is required"),
  details: z.string().optional(),
  max_health: z.number().min(1, "Health must be at least 1"),
  level: z.number().min(0, "Level must be at least 0"),
  icon: z.string().min(1, "Icon is required"),
  image: z.any().optional(),
  labels: z.array(z.string()).optional(),
  immunities: z.array(z.number()).optional(),
  resistances: z.array(z.number()).optional(),
  weaknesses: z.array(z.number()).optional(),
});

export type TCreateNPC = z.infer<typeof npcSchema>;

export function useCreateNPC() {
  const form = useForm<TCreateNPC>({
    resolver: zodResolver(npcSchema),
    defaultValues: {
      name: "",
      details: "",
      max_health: 10,
      level: 1,
      icon: "👤",
      labels: [],
      immunities: [],
      resistances: [],
      weaknesses: [],
    },
  });

  return form;
}
