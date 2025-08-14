import { Effect } from "@/types/effect";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Catalog from "../Catalog/Catalog";
import EffectCard from "../EffectCard/EffectCard";
import { Button } from "../ui/button";
import { MoonIcon } from "@radix-ui/react-icons";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useEffectStore } from "@/stores/useEffectStore";
import { useShallow } from "zustand/shallow";

type Props = {
  effects: Effect[];
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onAdd: (effect: Effect) => void;
};

function EffectsCatalog({ effects, open, onOpenChange, onAdd }: Props) {
  const { t } = useTranslation("ComponentEffectsCatalog");
  const [searchTerm, setSearchTerm] = useState("");

  const { openCreateEffectDrawer } = useEffectStore(
    useShallow((state) => ({
      openCreateEffectDrawer: state.openCreateEffectDrawer,
    })),
  );

  function handleCreateEffect() {
    onOpenChange(false);
    openCreateEffectDrawer();
  }

  return (
    <Catalog
      open={open}
      onOpenChange={onOpenChange}
      title={t("effects")}
      description={t("description")}
      placeholder={t("placeholderSearch")}
      search={searchTerm}
      onSearchChange={setSearchTerm}
    >
      {effects
        .filter((effect) =>
          effect.name
            .toLocaleLowerCase()
            .includes(searchTerm.toLocaleLowerCase()),
        )
        .map((effect) => (
          <EffectCard
            key={`effect-catalog-${effect.id}`}
            effect={effect}
            actions={<Button onClick={() => onAdd(effect)}>add</Button>}
          />
        ))}

      {effects.length === 0 && (
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
