import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { editOpponentSchema } from "@/schemas/editOpponent";
import { Opponent } from "@/types/opponents";

export const useEditOpponent = (opponent: Opponent) => {
  const formSchema = editOpponentSchema;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: opponent,
  });

  return form;
};
