import { useState } from "react";
import { useTranslation } from "react-i18next";
import Catalog from "../Catalog/Catalog";
import EffectCard from "../EffectCard/EffectCard";
import { Button } from "../ui/button";
import { MoonIcon } from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { OverlayMap } from "@/types/overlay";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import { useQueryClient } from "@tanstack/react-query";
import { Effect } from "@/types/effect";
import { useCreateEffect } from "@/hooks/useEffects";
import { toast } from "@/hooks/use-toast";
import database from "@/lib/database";

type OverlayProps = OverlayMap["effect.catalog"];

type RuntimeProps = {
  database: typeof database;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};

type Props = OverlayProps & RuntimeProps;

function EffectsCatalog({
  database,
  open,
  onOpenChange,
  onExitComplete,
  onCancel,
  onSelect,
}: Props) {
  const { t } = useTranslation("ComponentEffectsCatalog");
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const openOverlay = useOverlayStore((s) => s.open);

  const createEffect = useCreateEffect(database);

  const effects = useQueryWithToast({
    queryKey: ["effects"],
    queryFn: () => database.effects.getAll(),
  });

  function handleCreateEffect() {
    openOverlay("effect.create", {
      onCreate: async (effect: Omit<Effect, "id">) => {
        const created = await createEffect.mutateAsync(effect);
        return created;
      },
      onComplete: (effect) => {
        queryClient.invalidateQueries({ queryKey: ["effects"] });
        toast({
          title: `Created ${effect.icon} ${effect.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Effect creation cancelled:", reason);
      },
    });
  }

  async function handleSelectEffect(effect: Effect) {
    await onSelect(effect);
    onOpenChange(false);
  }

  function handleCancelClick() {
    onCancel?.("cancel");
    onOpenChange(false);
  }

  function handleOpenChange(state: boolean) {
    if (!state && !effects.data) {
      onCancel?.("dismissed");
    }

    onOpenChange(state);
  }

  return (
    <Catalog
      onCancel={handleCancelClick}
      onExitComplete={onExitComplete}
      open={open}
      onOpenChange={handleOpenChange}
      title={t("effects")}
      description={t("description")}
      placeholder={t("placeholderSearch")}
      search={searchTerm}
      onSearchChange={setSearchTerm}
    >
      {effects.data
        ?.filter((effect) =>
          effect.name
            .toLocaleLowerCase()
            .includes(searchTerm.toLocaleLowerCase()),
        )
        .map((effect) => (
          <EffectCard
            key={`effect-catalog-${effect.id}`}
            effect={effect}
            actions={
              <Button onClick={() => handleSelectEffect(effect)}>add</Button>
            }
          />
        ))}

      {effects.data?.length === 0 && (
        <Alert>
          <MoonIcon />
          <AlertTitle>{t("noEffects")}</AlertTitle>
          <AlertDescription>
            {t("noEffectsDescription")}
            <div className="flex w-full justify-center">
              <Button onClick={handleCreateEffect} className="mt-2">
                {t("createEffect")}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </Catalog>
  );
}

export default EffectsCatalog;
