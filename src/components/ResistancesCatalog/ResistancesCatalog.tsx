import { DBResistance } from "@/types/resistances";
import { useState } from "react";
import Catalog from "../Catalog/Catalog";
import ResistanceCard from "../ResistanceCard/ResistanceCard";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { MoonIcon } from "@radix-ui/react-icons";
import { useResistancesStore } from "@/stores/useResistanceStore";
import { useShallow } from "zustand/shallow";

type Props = {
  resistances: DBResistance[];
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onAdd: (id: DBResistance) => void;
};

function ResistancesCatalog({ open, resistances, onAdd, onOpenChange }: Props) {
  const [search, setSearch] = useState<string>("");
  const { t } = useTranslation("ComponentResistanceCatalog");

  const { openCreateResistanceDrawer } = useResistancesStore(
    useShallow((state) => ({
      openCreateResistanceDrawer: state.openCreateResistanceDrawer,
    })),
  );

  function handleCreateResistance() {
    onOpenChange(false);
    openCreateResistanceDrawer();
  }

  return (
    <Catalog
      open={open}
      onOpenChange={onOpenChange}
      title={t("resistances")}
      description={t("description")}
      placeholder={t("placeholderSearch")}
      search={search}
      onSearchChange={setSearch}
    >
      {resistances
        .filter((resistance) =>
          resistance.name
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()),
        )
        .map((resistance) => (
          <ResistanceCard
            key={`resistances-catalog-${resistance.id}`}
            resistance={resistance}
            actions={<Button onClick={() => onAdd(resistance)}>add</Button>}
          />
        ))}

      {resistances.length === 0 && (
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

export default ResistancesCatalog;
