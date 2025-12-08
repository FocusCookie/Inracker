import React, { useState } from "react";
import defaultDb from "@/lib/database";
import { Input } from "../ui/input";
import { DBResistance } from "@/types/resistances";
import { useTranslation } from "react-i18next";
import SettingResistanceCard from "../SettingResistanceCard/SettingResistanceCard";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { TypographyH1 } from "../ui/typographyH1";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { MoonIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  useCreateResistance,
  useDeleteResistance,
  useResistances,
  useUpdateResistance,
} from "@/hooks/useResistances";

type Props = {
  database?: typeof defaultDb;
};

function SettingsCategoryResistances({ database = defaultDb }: Props) {
  const { t } = useTranslation("ComponentSettingsCategoryResistances");
  const openOverlay = useOverlayStore((s) => s.open);
  const [search, setSearch] = useState<string>("");

  const resistances = useResistances(database);
  const createResistance = useCreateResistance(database);
  const editResistance = useUpdateResistance(database);
  const deleteResistance = useDeleteResistance(database);

  function handleOpenCreateResistance() {
    openOverlay("resistance.create", {
      onCreate: (resistance) => createResistance.mutateAsync(resistance),
      onComplete: (resistance) => {
        toast({
          variant: "default",
          title: `Created ${resistance.icon} ${resistance.name}`,
        });
      },
    });
  }

  function handleResistanceSearchTerm(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setSearch(event.target.value);
  }

  function handleOpenEditResistance(resistance: DBResistance) {
    openOverlay("resistance.edit", {
      resistance,
      onEdit: (resistance: DBResistance) =>
        editResistance.mutateAsync(resistance),
    });
  }

  async function handleDeleteResistance(resistanceId: DBResistance["id"]) {
    const resistance = await deleteResistance.mutateAsync(resistanceId);

    toast({
      title: `Deleted ${resistance.icon} ${resistance.name} successfully`,
    });
  }

  return (
    <>
      <div className="flex justify-between gap-4">
        <TypographyH1>{t("resistances")}</TypographyH1>

        {resistances.data && resistances.data.length > 0 && (
          <Button onClick={handleOpenCreateResistance} className="mt-2">
            {t("createResistance")}
          </Button>
        )}
      </div>

      {!resistances.data ||
        (resistances.data.length === 0 && (
          <Alert>
            <MoonIcon />
            <AlertTitle>{t("noResistances")}</AlertTitle>
            <AlertDescription>
              {t("noResistancesDescription")}
              <div className="flex w-full justify-center">
                <Button onClick={handleOpenCreateResistance} className="mt-2">
                  {t("createResistance")}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ))}

      {resistances.data && resistances.data.length > 0 && (
        <>
          <Input
            className="mt-4"
            placeholder={t("searchPlaceholder")}
            onChange={handleResistanceSearchTerm}
          />

          <div className="scrollable-y h-full overflow-y-scroll p-0.5">
            <div className="flex h-full max-h-96 flex-col gap-4">
              {resistances.data
                .filter((resistance) =>
                  resistance.name.toLowerCase().includes(search.toLowerCase()),
                )

                .map((resistance) => (
                  <SettingResistanceCard
                    key={resistance.id}
                    resistance={resistance}
                    onDelete={() => handleDeleteResistance(resistance.id)}
                    onEdit={() => handleOpenEditResistance(resistance)}
                  />
                ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default SettingsCategoryResistances;