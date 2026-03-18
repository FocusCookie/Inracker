import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { editNPCSchema } from "@/schemas/editNPC";
import { NPC, EncounterNPC } from "@/types/npcs";

export const useEditNPC = (npc: NPC | EncounterNPC) => {
  const formSchema = editNPCSchema;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...npc,
      resistances: npc.resistances.map((r: { id: number }) => r.id),
      immunities: npc.immunities.map((i: { id: number }) => i.id),
      weaknesses: npc.weaknesses.map((w: { id: number }) => w.id),
      effects: npc.effects.map((e: { id: number }) => e.id),
    },
  });

  return form;
};
