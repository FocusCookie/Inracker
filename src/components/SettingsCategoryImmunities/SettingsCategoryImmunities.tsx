import React, { useState } from "react";
import defaultDb from "@/lib/database";
import { Input } from "../ui/input";
import { DBImmunity } from "@/types/immunitiy";
import { useTranslation } from "react-i18next";
import SettingImmunityCard from "../SettingImmunityCard/SettingImmunityCard";
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

function SettingsCategoryImmunities({ database = defaultDb }: Props) {
  const queryClient = useQueryClient();
  const { t } = useTranslation("ComponentSettingsCategoryImmunities");
  const openOverlay = useOverlayStore((s) => s.open);
  const [search, setSearch] = useState<string>("");

  const immunities = useQueryWithToast({
    queryKey: ["immunities"],
    queryFn: () => database.immunitites.getAll(),
  });

  const createImmunity = useMutationWithErrorToast({
    mutationFn: database.immunitites.create,
    onSuccess: (_immunity: DBImmunity) => {
      queryClient.invalidateQueries({ queryKey: ["immunities"] });
    },
  });

  const editImmunity = useMutationWithErrorToast({
    mutationFn: database.immunitites.update,
    onSuccess: (_immunity: DBImmunity) => {
      queryClient.invalidateQueries({ queryKey: ["immunities"] });
    },
  });

  const deleteImmunity = useMutationWithErrorToast({
    mutationFn: database.immunitites.delete,
    onSuccess: (immunity: DBImmunity) => {
      queryClient.invalidateQueries({ queryKey: ["immunities"] });
      toast({
        title: `Deleted ${immunity.icon} ${immunity.name} successfully`,
      });
    },
  });

  function handleOpenCreateImmunity() {
    openOverlay("immunity.create", {
      onCreate: (immunity) => createImmunity.mutateAsync(immunity),
      onComplete: (immunity) => console.log("crated immunity ", immunity),
    });
  }

  function handleImmunitySearchTerm(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setSearch(event.target.value);
  }

  function handleOpenEditImmunity(immunity: DBImmunity) {
    openOverlay("immunity.edit", {
      immunity,
      onEdit: (immunity: DBImmunity) => editImmunity.mutateAsync(immunity),
    });
  }

  async function handleDeleteImmunity(immunityId: DBImmunity["id"]) {
    await deleteImmunity.mutateAsync(immunityId);
  }

  return (
    <>
      <div className="flex justify-between gap-4">
        <TypographyH1>{t("immunities")}</TypographyH1>

        {immunities.data && immunities.data.length > 0 && (
          <Button onClick={handleOpenCreateImmunity} className="mt-2">
            {t("createImmunity")}
          </Button>
        )}
      </div>

      {!immunities.data ||
        (immunities.data.length === 0 && (
          <Alert>
            <MoonIcon />
            <AlertTitle>{t("noImmunities")}</AlertTitle>
            <AlertDescription>
              {t("noImmunitiesDescription")}
              <div className="flex w-full justify-center">
                <Button onClick={handleOpenCreateImmunity} className="mt-2">
                  {t("createImmunity")}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        ))}

      {immunities.data && immunities.data.length > 0 && (
        <>
          <Input
            className="mt-4"
            placeholder={t("searchPlaceholder")}
            onChange={handleImmunitySearchTerm}
          />

          <div className="scrollable-y h-full overflow-y-scroll p-0.5">
            <div className="flex h-full max-h-96 flex-col gap-4">
              {immunities.data
                .filter((immunity) =>
                  immunity.name.toLowerCase().includes(search.toLowerCase()),
                )

                .map((immunity) => (
                  <SettingImmunityCard
                    key={immunity.id}
                    immunity={immunity}
                    onDelete={() => handleDeleteImmunity(immunity.id)}
                    onEdit={() => handleOpenEditImmunity(immunity)}
                  />
                ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default SettingsCategoryImmunities;
