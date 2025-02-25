import { createPlayerSchema } from "@/schemas/createPlayer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import overviewTemplate from "@/translations/templates/overview";
import detailsTemplate from "@/translations/templates/details";
import i18n from "@/i18next";

export const useCreatePlayer = () => {
  const language = i18n.language as "en" | "de";

  const formSchema = createPlayerSchema;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      details: detailsTemplate[language],
      ep: 0,
      level: 1,
      maxHealth: 10,
      name: "",
      overview: overviewTemplate[language],
      icon: "🧙",
      immunities: [],
      picture: "",
      role: "",
      resistances: [],
    },
  });

  return form;
};
