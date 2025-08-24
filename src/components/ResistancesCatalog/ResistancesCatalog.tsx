import { DBResistance } from "@/types/resistances";
import { useState } from "react";
import Catalog from "../Catalog/Catalog";
import ResistanceCard from "../ResistanceCard/ResistanceCard";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { MoonIcon } from "@radix-ui/react-icons";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import db from "@/lib/database";
import type { OverlayMap } from "@/types/overlay";

type OverlayProps = OverlayMap["resistance.catalog"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};
type Props = OverlayProps & RuntimeProps;

export default function ResistancesCatalog({
  open,
  onSelect,
  onCancel,
  onOpenChange,
  onExitComplete,
}: Props) {
  const [search, setSearch] = useState<string>("");
  const { t } = useTranslation("ComponentResistanceCatalog");
  const openOverlay = useOverlayStore((s) => s.open);

  const resistances = useQueryWithToast({
    queryKey: ["resistances"],
    queryFn: () => db.resistances.getAll(),
  });

  function handleCreateResistance() {
    openOverlay("resistance.create", {
      onCreate: async (resistance) => {
        const created = await db.resistances.create(resistance);
        return created;
      },
      onComplete: () => {
        resistances.refetch();
      },
      onCancel: (reason) => {
        console.log("Resistance creation cancelled:", reason);
      },
    });
  }

  function handleSelectResistance(resistance: DBResistance) {
    onSelect(resistance);
    onOpenChange(false);
  }

  function handleCancelClick() {
    onCancel?.("cancel");
    onOpenChange(false);
  }

  function handleOpenChange(state: boolean) {
    if (!state && !resistances.data) {
      onCancel?.("dismissed");
    }

    onOpenChange(state);
  }

  return (
    <Catalog
      open={open}
      onOpenChange={handleOpenChange}
      onExitComplete={onExitComplete}
      title={t("resistances")}
      description={t("description")}
      placeholder={t("placeholderSearch")}
      search={search}
      onSearchChange={setSearch}
      onCancel={handleCancelClick}
    >
      {resistances.data
        ?.filter((resistance) =>
          resistance.name
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()),
        )
        .map((resistance) => (
          <ResistanceCard
            key={`resistances-catalog-${resistance.id}`}
            resistance={resistance}
            actions={
              <Button onClick={() => handleSelectResistance(resistance)}>
                {t("add")}
              </Button>
            }
          />
        ))}

      {(!resistances.data || resistances.data.length === 0) && (
        <Alert>
          <MoonIcon />
          <AlertTitle>{t("noResistances")}</AlertTitle>
          <AlertDescription>
            {t("noResistancesDescription")}
            <div className="flex w-full justify-center">
              <Button onClick={handleCreateResistance} className="mt-2">
                {t("createResistance")}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </Catalog>
  );
}
