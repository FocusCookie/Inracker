import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import detailsTemplate from "@/translations/templates/details";
import i18n from "@/i18next";
import { createOpponentSchema } from "@/schemas/createOpponent";

export const useCreateOpponent = () => {
  const language = i18n.language as "en" | "de";

  const formSchema = createOpponentSchema;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      details: detailsTemplate[language],
      level: 1,
      max_health: 10,
      name: "",
      icon: "🧙",
      labels: [],
      image: "",
      resistances: [],
      immunities: [],
      weaknesses: [],
    },
  });

  return form;
};
