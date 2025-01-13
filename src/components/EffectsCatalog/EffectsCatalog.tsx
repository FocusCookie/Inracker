import { DBEffect } from "@/types/effect";
import { UseQueryResult } from "@tanstack/react-query";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import Catalog from "../Catalog/Catalog";
import { ScrollArea } from "../ui/scroll-area";
import EffectCard from "../EffectCard/EffectCard";
import { Button } from "../ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import Loader from "../Loader/Loader";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

type Props = {
  query: UseQueryResult<DBEffect[], unknown>;
  selection: DBEffect[];
  onAddEffect: (effect: DBEffect) => void;
};

type TType = "all" | "negative" | "positive";

function EffectsCatalog({ query, selection, onAddEffect }: Props) {
  const { t } = useTranslation("ComponentEffectsCatalog");
  const [searchTerm, setSearchTerm] = useState("");
  const [type, setType] = useState<TType>("all");

  function handleSearchTerm(search: string) {
    setSearchTerm(search);
  }

  function handleTypeSelection(type: string) {
    setType(type as TType);
  }

  return (
    <>
      {!query.isLoading && query?.data && (
        <Catalog
          disabled={query.isLoading}
          triggerName={t("effects")}
          title={t("effects")}
          description={t("description")}
          onSearchChange={handleSearchTerm}
        >
          <Tabs
            onValueChange={handleTypeSelection}
            defaultValue="all"
            className="w-full pb-4 pr-4"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="positive">Positive</TabsTrigger>
              <TabsTrigger value="negative">Negative</TabsTrigger>
            </TabsList>
          </Tabs>

          <ScrollArea className="h-full">
            <div className="flex h-full flex-col gap-4 p-0.5 pr-4">
              {query.data
                .filter((effect) =>
                  type === "positive" || type === "negative"
                    ? effect.type === type
                    : true,
                )
                .filter((effect) =>
                  effect.name.toLowerCase().includes(searchTerm.toLowerCase()),
                )
                .filter(
                  (effect) => !selection.some((item) => item.id === effect.id),
                )
                .map((effect) => (
                  <EffectCard
                    key={effect.id}
                    effect={effect}
                    actions={
                      <Button size="icon" onClick={() => onAddEffect(effect)}>
                        <PlusIcon />
                      </Button>
                    }
                  />
                ))}
            </div>
          </ScrollArea>
        </Catalog>
      )}

      {!query.isLoading && !query?.data && t("nothingFound")}

      {query.isLoading && (
        <Loader size="large" title={t("loading")} key="loader-effect-catalog" />
      )}
    </>
  );
}

export default EffectsCatalog;
