import { DBImmunity } from "@/types/immunitiy";
import { UseQueryResult } from "@tanstack/react-query";
import ImmunityCard from "../ImmunityCard/ImmunityCard";
import { Button } from "../ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import Catalog from "../Catalog/Catalog";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useState } from "react";
import Loader from "../Loader/Loader";
import { useTranslation } from "react-i18next";

type Props = {
  query: UseQueryResult<DBImmunity[], unknown>;
  selection: DBImmunity[];
  onAddImmunity: (immunity: DBImmunity) => void;
};

function ImmunitiesCatalog({ query, selection, onAddImmunity }: Props) {
  const { t } = useTranslation("ComponentImmunitiesCatalog");
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearchTerm(search: string) {
    setSearchTerm(search);
  }

  return (
    <>
      {!query.isLoading && query?.data && (
        <Catalog
          disabled={false}
          triggerName={t("immunities")}
          title={t("immunities")}
          description={t("description")}
          onSearchChange={handleSearchTerm}
          children={
            <ScrollArea className="h-full">
              <div className="flex h-full flex-col gap-4 p-0.5 pr-4">
                {query.data
                  .filter((immunity) =>
                    immunity.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()),
                  )
                  .filter(
                    (immunity) =>
                      !selection.some((item) => item.id === immunity.id),
                  )
                  .map((immunity) => (
                    <ImmunityCard
                      key={immunity.id}
                      immunity={immunity}
                      actions={
                        <Button
                          size="icon"
                          onClick={() => onAddImmunity(immunity)}
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

export default ImmunitiesCatalog;
