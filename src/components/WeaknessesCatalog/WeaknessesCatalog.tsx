import { DBWeakness } from "@/types/weakness";
import { useState } from "react";
import Catalog from "../Catalog/Catalog";
import WeaknessCard from "../WeaknessCard/WeaknessCard";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { MoonIcon } from "@radix-ui/react-icons";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import type { OverlayMap } from "@/types/overlay";
import { useCreateWeakness } from "@/hooks/useWeaknesses";
import { toast } from "@/hooks/use-toast";
import defaultDb from "@/lib/database";

type OverlayProps = OverlayMap["weakness.catalog"];

type RuntimeProps = {
  database?: typeof defaultDb;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};
type Props = OverlayProps & RuntimeProps;

export default function WeaknessesCatalog({
  database = defaultDb,
  open,
  onSelect,
  onCancel,
  onOpenChange,
  onExitComplete,
}: Props) {
  const [search, setSearch] = useState<string>("");
  const { t } = useTranslation("ComponentWeaknessCatalog");
  const openOverlay = useOverlayStore((s) => s.open);

  const createWeakness = useCreateWeakness(database);

  const weaknesses = useQueryWithToast({
    queryKey: ["weaknesses"],
    queryFn: () => database.weaknesses.getAll(),
  });

  function handleCreateWeakness() {
    openOverlay("weakness.create", {
      onCreate: async (weakness) => {
        const created = await createWeakness.mutateAsync(weakness);
        return created;
      },
      onComplete: (weakness) => {
        weaknesses.refetch();
        toast({
          title: `${t("createdToast")} ${weakness.icon} ${weakness.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Weakness creation cancelled:", reason);
      },
    });
  }

  function handleSelectWeakness(weakness: DBWeakness) {
    onSelect(weakness);
    onOpenChange(false);
  }

  function handleCancelClick() {
    onCancel?.("cancel");
    onOpenChange(false);
  }

  function handleOpenChange(state: boolean) {
    if (!state && !weaknesses.data) {
      onCancel?.("dismissed");
    }

    onOpenChange(state);
  }

  return (
    <Catalog
      open={open}
      onOpenChange={handleOpenChange}
      onExitComplete={onExitComplete}
      title={t("weaknesses")}
      description={t("description")}
      placeholder={t("placeholderSearch")}
      search={search}
      onSearchChange={setSearch}
      onCancel={handleCancelClick}
    >
      {weaknesses.data
        ?.filter((weakness) =>
          weakness.name
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()),
        )
        .map((weakness) => (
          <WeaknessCard
            key={`weaknesses-catalog-${weakness.id}`}
            weakness={weakness}
            actions={
              <Button onClick={() => handleSelectWeakness(weakness)}>
                {t("add")}
              </Button>
            }
          />
        ))}

      {(!weaknesses.data || weaknesses.data.length === 0) && (
        <Alert>
          <MoonIcon />
          <AlertTitle>{t("noWeaknesses")}</AlertTitle>
          <AlertDescription>
            {t("noWeaknessesDescription")}
            <div className="flex w-full justify-center">
              <Button onClick={handleCreateWeakness} className="mt-2">
                {t("createWeakness")}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </Catalog>
  );
}
