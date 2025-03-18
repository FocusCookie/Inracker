import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import overviewTemplate from "@/translations/templates/overview";
import detailsTemplate from "@/translations/templates/details";
import i18n from "@/i18next";
import { editPlayerSchema } from "@/schemas/editPlayer";

export const useEditPlayer = () => {
  const language = i18n.language as "en" | "de";

  const formSchema = editPlayerSchema;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      details: detailsTemplate[language],
      ep: 0,
      level: 1,
      max_health: 10,
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
