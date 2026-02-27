import React, { useState } from "react";
import defaultDb from "@/lib/database";
import { Input } from "../ui/input";
import { DBWeakness } from "@/types/weakness";
import { useTranslation } from "react-i18next";
import SettingWeaknessCard from "../SettingWeaknessCard/SettingWeaknessCard";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { TypographyH1 } from "../ui/typographyH1";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { MoonIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  useCreateWeakness,
  useDeleteWeakness,
  useWeaknesses,
  useUpdateWeakness,
} from "@/hooks/useWeaknesses";

type Props = {
  database?: typeof defaultDb;
};

function SettingsCategoryWeaknesses({ database = defaultDb }: Props) {
  const { t } = useTranslation("ComponentSettingsCategoryWeaknesses");
  const openOverlay = useOverlayStore((s) => s.open);
  const [search, setSearch] = useState<string>("");

  const weaknesses = useWeaknesses(database);
  const createWeakness = useCreateWeakness(database);
  const editWeakness = useUpdateWeakness(database);
  const deleteWeakness = useDeleteWeakness(database);

  function handleOpenCreateWeakness() {
    openOverlay("weakness.create", {
      onCreate: (weakness) => createWeakness.mutateAsync(weakness),
      onComplete: (weakness) => {
        toast({
          variant: "default",
          title: `${t("createdToast")} ${weakness.icon} ${weakness.name}`,
        });
      },
    });
  }

  function handleWeaknessSearchTerm(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setSearch(event.target.value);
  }

  function handleOpenEditWeakness(weakness: DBWeakness) {
    openOverlay("weakness.edit", {
      weakness,
      onEdit: (weakness: DBWeakness) =>
        editWeakness.mutateAsync(weakness),
    });
  }

  async function handleDeleteWeakness(weaknessId: DBWeakness["id"]) {
    const weakness = await deleteWeakness.mutateAsync(weaknessId);

    toast({
      title: `${t("deletedToast")} ${weakness.icon} ${weakness.name} ${t("successfully")}`,
    });
  }

  return (
    <>
      <div className="flex justify-between gap-4">
        <TypographyH1>{t("weaknesses")}</TypographyH1>

        {weaknesses.data && weaknesses.data.length > 0 && (
          <Button onClick={handleOpenCreateWeakness} className="mt-2">
            {t("createWeakness")}
          </Button>
        )}
      </div>

      {!weaknesses.data ||
        (weaknesses.data.length === 0 && (
          <Alert>
            <MoonIcon />
            <AlertTitle>{t("noWeaknesses")}</AlertTitle>
            <AlertDescription>
              {t("noWeaknessesDescription")}
              <div className="flex w-full justify-center">
                <Button onClick={handleOpenCreateWeakness} className="mt-2">
                  {t("createWeakness")}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ))}

      {weaknesses.data && weaknesses.data.length > 0 && (
        <>
          <Input
            className="mt-4"
            placeholder={t("searchPlaceholder")}
            onChange={handleWeaknessSearchTerm}
          />

          <div className="scrollable-y h-full overflow-y-scroll p-0.5">
            <div className="flex h-full max-h-96 flex-col gap-4">
              {weaknesses.data
                .filter((weakness) =>
                  weakness.name.toLowerCase().includes(search.toLowerCase()),
                )

                .map((weakness) => (
                  <SettingWeaknessCard
                    key={weakness.id}
                    weakness={weakness}
                    onDelete={() => handleDeleteWeakness(weakness.id)}
                    onEdit={() => handleOpenEditWeakness(weakness)}
                  />
                ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default SettingsCategoryWeaknesses;
