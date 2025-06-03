import { useState } from "react";
import Catalog from "../Catalog/Catalog";
import { Button } from "../ui/button";
import { DBImmunity } from "@/types/immunitiy";
import ImmunityCard from "../ImmunityCard/ImmunityCard";
import { useTranslation } from "react-i18next";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { MoonIcon } from "@radix-ui/react-icons";
import { useImmunityStore } from "@/stores/useImmunityStore";
import { useShallow } from "zustand/shallow";
import { on } from "events";

type Props = {
  immunities: DBImmunity[];
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onAdd: (id: DBImmunity) => void;
};

function ImmunitiesCatalog({ open, immunities, onAdd, onOpenChange }: Props) {
  const [immunitySearch, setImmunitySearch] = useState<string>("");
  const { t } = useTranslation("ComponentImmunitiesCatalog");

  const { openCreateImmunityDrawer } = useImmunityStore(
    useShallow((state) => ({
      openCreateImmunityDrawer: state.openCreateImmunityDrawer,
    })),
  );

  function handleCreateImmunity() {
    onOpenChange(false);
    openCreateImmunityDrawer();
  }

  return (
    <Catalog
      open={open}
      onOpenChange={onOpenChange}
      title={t("immunities")}
      description={t("description")}
      placeholder={t("placeholderSearch")}
      search={immunitySearch}
      onSearchChange={setImmunitySearch}
    >
      {immunities
        .filter((immunity) =>
          immunity.name
            .toLocaleLowerCase()
            .includes(immunitySearch.toLocaleLowerCase()),
        )
        .map((immunity) => (
          <ImmunityCard
            key={`immunitiy-catalog-${immunity.id}`}
            immunity={immunity}
            actions={<Button onClick={() => onAdd(immunity)}>add</Button>}
          />
        ))}

      {immunities.length === 0 && (
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

export default ImmunitiesCatalog;
