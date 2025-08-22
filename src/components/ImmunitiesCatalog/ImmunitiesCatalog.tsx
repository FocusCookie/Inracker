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
import db from "@/lib/database";
import type {
  CancelReason,
  OverlayMap,
  OverlaySuccessMap,
} from "@/types/overlay";

type OverlayProps = OverlayMap["immunity.catalog"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void; // host toggles open; exit anim plays
  onExitComplete: () => void; // host removes after exit
};
type Props = OverlayProps & RuntimeProps;

export default function ImmunitiesCatalog({
  open,
  onSelect,
  onCancel,
  onOpenChange,
  onExitComplete,
}: Props) {
  const [immunitySearch, setImmunitySearch] = useState<string>("");
  const { t } = useTranslation("ComponentImmunitiesCatalog");
  const openOverlay = useOverlayStore((s) => s.open);

  // Fetch immunities from database
  const immunities = useQueryWithToast({
    queryKey: ["immunities"],
    queryFn: () => db.immunitites.getAll(),
  });

  function handleCreateImmunity() {
    openOverlay("immunity.create", {
      onCreate: async (immunity) => {
        // Create the immunity in the database
        const created = await db.immunitites.create(immunity);
        return { id: created.id };
      },
      onComplete: ({ immunityId }) => {
        // Immunity created successfully, refresh the catalog
        immunities.refetch();
      },
      onCancel: (reason) => {
        console.log("Immunity creation cancelled:", reason);
      },
    });
  }

  function handleSelectImmunity(immunity: DBImmunity) {
    onSelect(immunity.id);
    onOpenChange(false);
  }

  function handleCancelClick() {
    onCancel?.("cancel");
    onOpenChange(false);
  }

  // Only emit dismissed if we didn't already emit success/cancel
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
