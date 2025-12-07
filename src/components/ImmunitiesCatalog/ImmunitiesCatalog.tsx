import { useState } from "react";
import Catalog from "../Catalog/Catalog";
import { Button } from "../ui/button";
import { DBImmunity } from "@/types/immunitiy";
import ImmunityCard from "../ImmunityCard/ImmunityCard";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { MoonIcon } from "@radix-ui/react-icons";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import type { OverlayMap } from "@/types/overlay";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateImmunity } from "@/hooks/useImmunities";
import { toast } from "@/hooks/use-toast";
import database from "@/lib/database";

type OverlayProps = OverlayMap["immunity.catalog"];

type RuntimeProps = {
  database: typeof database;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};

type Props = OverlayProps & RuntimeProps;

export default function ImmunitiesCatalog({
  database,
  open,
  onSelect,
  onCancel,
  onOpenChange,
  onExitComplete,
}: Props) {
  const { t } = useTranslation("ComponentImmunitiesCatalog");
  const queryClient = useQueryClient();
  const [immunitySearch, setImmunitySearch] = useState<string>("");
  const openOverlay = useOverlayStore((s) => s.open);

  const createImmunity = useCreateImmunity(database);

  const immunities = useQueryWithToast({
    queryKey: ["immunities"],
    queryFn: () => database.immunitites.getAll(),
  });

  function handleCreateImmunity() {
    openOverlay("immunity.create", {
      onCreate: async (immunity) => {
        const created = await createImmunity.mutateAsync(immunity);
        return created;
      },
      onComplete: (immunity) => {
        queryClient.invalidateQueries({ queryKey: ["immunities"] });
        toast({
          title: `Created ${immunity.icon} ${immunity.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Immunity creation cancelled:", reason);
      },
    });
  }

  async function handleSelectImmunity(immunity: DBImmunity) {
    await onSelect(immunity);
    onOpenChange(false);
  }

  function handleCancelClick() {
    onCancel?.("cancel");
    onOpenChange(false);
  }

  function handleOpenChange(state: boolean) {
    if (!state && !immunities.data) {
      onCancel?.("dismissed");
    }

    onOpenChange(state);
  }

  return (
    <Catalog
      open={open}
      onOpenChange={handleOpenChange}
      onExitComplete={onExitComplete}
      title={t("immunities")}
      description={t("description")}
      placeholder={t("placeholderSearch")}
      search={immunitySearch}
      onSearchChange={setImmunitySearch}
      onCancel={handleCancelClick}
    >
      {immunities.data
        ?.filter((immunity) =>
          immunity.name
            .toLocaleLowerCase()
            .includes(immunitySearch.toLocaleLowerCase()),
        )
        .map((immunity) => (
          <ImmunityCard
            key={`immunitiy-catalog-${immunity.id}`}
            immunity={immunity}
            actions={
              <Button onClick={() => handleSelectImmunity(immunity)}>
                {t("add")}
              </Button>
            }
          />
        ))}

      {(!immunities.data || immunities.data.length === 0) && (
        <Alert>
          <MoonIcon />
          <AlertTitle>{t("noImmunities")}</AlertTitle>
          <AlertDescription>
            {t("noImmunitiesDescription")}
            <div className="flex w-full justify-center">
              <Button onClick={handleCreateImmunity} className="mt-2">
                {t("createImmunity")}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </Catalog>
  );
}
