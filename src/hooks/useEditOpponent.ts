import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { editOpponentSchema } from "@/schemas/editOpponent";
import { Opponent } from "@/types/opponents";

export const useEditOpponent = (opponent: Opponent) => {
  const formSchema = editOpponentSchema;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...opponent,
      resistances: opponent.resistances.map((r: { id: number }) => r.id),
      immunities: opponent.immunities.map((i: { id: number }) => i.id),
      effects: opponent.effects.map((e: { id: number }) => e.id),
    },
  });

  return form;
};
