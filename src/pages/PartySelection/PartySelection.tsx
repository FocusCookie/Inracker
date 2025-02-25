import Loader from "@/components/Loader/Loader";
import PartyCard from "@/components/PartyCard/PartyCard";
import { Button } from "@/components/ui/button";
import { TypographyH1 } from "@/components/ui/typographyH1";
import { TypographyP } from "@/components/ui/typographyP";
import { Party } from "@/types/party";
import { AnimatePresence } from "framer-motion";
import React from "react";
import { useTranslation } from "react-i18next";

type PartySelectionProps = {
  parties: Party[];
  loading: boolean;
  children?: React.ReactNode;
  onEditParty: (party: Party) => void;
  onPartySelect: (id: Party["id"]) => void;
  onCreateParty: () => void;
};

const PartySelection = ({
  parties,
  loading,
  onEditParty,
  onPartySelect,
  onCreateParty,
}: PartySelectionProps) => {
  const { t } = useTranslation("PagePartySelection");

  function handlePartySelect(partyId: Party["id"]) {
    onPartySelect(partyId);
  }

  return (
    <div className="flex h-full w-full flex-col items-center gap-8 rounded-md bg-white p-2">
      <div className="flex max-w-xl flex-col gap-2">
        <TypographyH1>{t("headline")}</TypographyH1>

        <TypographyP>{t("description")}</TypographyP>
      </div>

      <Button
        onClick={onCreateParty}
        variant={parties.length === 0 ? "default" : "outline"}
      >
        {t("createParty")}
      </Button>

      <AnimatePresence mode="wait">
        {loading && <Loader size="large" title={t("loading")} key="loader" />}

        {!loading && (
          <div className="scrollable-y w-full max-w-xl overflow-y-scroll pr-0.5">
            <div className="flex w-full flex-col gap-4 pb-4">
              {parties.map((party, index) => (
                <PartyCard
                  key={`party-${party.id}`}
                  animationDelay={index * 0.05}
                  party={party}
                  onEdit={onEditParty}
                  onOpen={() => handlePartySelect(party.id)}
                  onPlayerClick={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartySelection;
