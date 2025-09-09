import React, { useState } from "react";
import defaultDb from "@/lib/database";
import { Input } from "../ui/input";
import { DBResistance } from "@/types/resistances";
import { useTranslation } from "react-i18next";
import SettingResistanceCard from "../SettingResistanceCard/SettingResistanceCard";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { useQueryClient } from "@tanstack/react-query";
import { useMutationWithErrorToast } from "@/hooks/useMutationWithErrorToast";
import { TypographyH1 } from "../ui/typographyH1";
import { toast } from "@/hooks/use-toast";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { MoonIcon } from "lucide-react";
import { Button } from "../ui/button";

type Props = {
  database?: typeof defaultDb;
};

function SettingsCategoryResistances({ database = defaultDb }: Props) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("ComponentSettingsCategoryResistances");
  const openOverlay = useOverlayStore((s) => s.open);
  const [search, setSearch] = useState<string>("");

  const resistances = useQueryWithToast({
    queryKey: ["resistances"],
    queryFn: () => database.resistances.getAll(),
  });

  const createResistance = useMutationWithErrorToast({
    mutationFn: database.resistances.create,
    onSuccess: (_resistance: DBResistance) => {
      queryClient.invalidateQueries({ queryKey: ["resistances"] });
    },
  });

  const editResistance = useMutationWithErrorToast({
    mutationFn: database.resistances.update,
    onSuccess: (_resistance: DBResistance) => {
      queryClient.invalidateQueries({ queryKey: ["resistances"] });
    },
  });

  const deleteResistance = useMutationWithErrorToast({
    mutationFn: database.resistances.delete,
    onSuccess: (resistance: DBResistance) => {
      queryClient.invalidateQueries({ queryKey: ["resistances"] });
      toast({
        title: `Deleted ${resistance.icon} ${resistance.name} successfully`,
      });
    },
  });

  function handleOpenCreateResistance() {
    openOverlay("resistance.create", {
      onCreate: (resistance) => createResistance.mutateAsync(resistance),
      onComplete: (resistance) => console.log("created resistance ", resistance),
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
      onEdit: (resistance: DBResistance) => editResistance.mutateAsync(resistance),
    });
  }

  async function handleDeleteResistance(resistanceId: DBResistance["id"]) {
    await deleteResistance.mutateAsync(resistanceId);
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