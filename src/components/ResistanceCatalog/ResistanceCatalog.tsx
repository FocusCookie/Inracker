import { UseQueryResult } from "@tanstack/react-query";
import ImmunityCard from "../ImmunityCard/ImmunityCard";
import { Button } from "../ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import Catalog from "../Catalog/Catalog";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useState } from "react";
import Loader from "../Loader/Loader";
import { DBResistance } from "@/types/resistances";
import ResistanceCard from "../ResistanceCard/ResistanceCard";
import { useTranslation } from "react-i18next";

type Props = {
  query: UseQueryResult<DBResistance[], unknown>;
  selection: DBResistance[];
  onAddResistance: (immunity: DBResistance) => void;
};

function ResistanceCatalog({ query, selection, onAddResistance }: Props) {
  const { t } = useTranslation("ComponentResistanceCatalog");
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearchTerm(search: string) {
    setSearchTerm(search);
  }

  return (
    <>
      {!query.isLoading && query?.data && (
        <Catalog
          disabled={false}
          triggerName={t("resistances")}
          title={t("resistances")}
          description={t("description")}
          onSearchChange={handleSearchTerm}
          children={
            <ScrollArea className="h-full">
              <div className="flex h-full flex-col gap-4 p-0.5 pr-4">
                {query.data
                  .filter((resistance) =>
                    resistance.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()),
                  )
                  .filter(
                    (resistance) =>
                      !selection.some((item) => item.id === resistance.id),
                  )
                  .map((resistance) => (
                    <ResistanceCard
                      key={resistance.id}
                      resistance={resistance}
                      actions={
                        <Button
                          size="icon"
                          onClick={() => onAddResistance(resistance)}
                        >
                          <PlusIcon />
                        </Button>
                      }
                    />
                  ))}
              </div>
            </ScrollArea>
          }
        />
      )}

      {!query.isLoading && !query?.data && "nothing found create one"}

      {query.isLoading && (
        <Loader
          size="large"
          title="Loading Immunities..."
          key="loader-immunity-catalog"
        />
      )}
    </>
  );
}

export default ResistanceCatalog;
