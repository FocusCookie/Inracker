import { createPlayerSchema } from "@/schemas/createPlayer";
import { DBImmunity } from "@/types/immunitiy";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import overviewTemplate from "@/translations/templates/overview";
import detailsTemplate from "@/translations/templates/details";
import i18n from "@/i18next";
import { DBResistance } from "@/types/resistances";

export const useCreatePlayer = () => {
  const language = i18n.language as "en" | "de";
  const [picturePreview, setPicturePreview] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState<number>(0); // to reset the input type file path after a reset
  const [selectedImmunities, setSelectedImmunities] = useState<DBImmunity[]>(
    [],
  );
  const [selectedResistances, setSelectedResistances] = useState<
    DBResistance[]
  >([]);

  const formSchema = createPlayerSchema;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      details: detailsTemplate[language],
      ep: 0,
      health: 10,
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

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    const file = event.target.files[0];

    if (file) {
      setPicturePreview(URL.createObjectURL(file));
      form.setValue("picture", file);
    }
  }

  function handleResetPicture() {
    form.setValue("picture", "");
    setRefreshKey((c) => c + 1);
    setPicturePreview("");
  }

  function handleAddImmunity(immunity: DBImmunity) {
    setSelectedImmunities((c) => [...c, immunity]);

    console.log("Added immunity ", immunity);
    const currentImmunities = form.getValues("immunities");
    form.setValue("immunities", [...currentImmunities, immunity.id]);
  }

  function handleAddResistance(resistance: DBResistance) {
    setSelectedResistances((c) => [...c, resistance]);
    const currentResistances = form.getValues("resistances");
    form.setValue("resistances", [...currentResistances, resistance.id]);
  }

  function handleRemoveImmunity(id: DBImmunity["id"]) {
    setSelectedImmunities((c) => c.filter((immunity) => immunity.id !== id));
  }

  function handleRemoveResistance(id: DBResistance["id"]) {
    setSelectedResistances((c) =>
      c.filter((resistance) => resistance.id !== id),
    );
  }

  return {
    form,
    picturePreview,
    refreshKey,
    selectedImmunities,
    selectedResistances,
    handleRemoveResistance,
    handleAddResistance,
    handleFileChange,
    handleResetPicture,
    handleAddImmunity,
    handleRemoveImmunity,
  };
};
