import { DEFAULT_PLAYER_VALUES } from "@/constants/player";
import { createPlayerSchema } from "@/schemas/createPlayer";
import { DBImmunity } from "@/types/immunitiy";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export const useCreatePlayer = () => {
  const [picturePreview, setPicturePreview] = useState<string>("");
  const [refreshKey, setRefreshKey] = useState<number>(0); // to reset the input type file path after a reset
  const [selectedImmunities, setSelectedImmunities] = useState<DBImmunity[]>(
    [],
  );
  const [immunitySearch, setImmunitySearch] = useState<string>("");

  const formSchema = createPlayerSchema;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: DEFAULT_PLAYER_VALUES,
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
    const currentImmunities = form.getValues("immunities");
    form.setValue("immunities", [...currentImmunities, immunity.id]);
  }

  function handleRemoveImmunity(id: DBImmunity["id"]) {
    setSelectedImmunities((c) => c.filter((immunity) => immunity.id !== id));
  }

  return {
    form,
    picturePreview,
    refreshKey,
    handleFileChange,
    handleResetPicture,
    selectedImmunities,
    immunitySearch,
    handleAddImmunity,
    handleRemoveImmunity,
    setImmunitySearch,
  };
};
