import React from "react";
import Loader from "@/components/Loader/Loader";
import PartyCard from "@/components/PartyCard/PartyCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TypographyH1 } from "@/components/ui/typographyH1";
import { TypographyP } from "@/components/ui/typographyP";
import { usePartiesStore } from "@/stores/PartiesStores";
import { Party } from "@/types/party";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

type PartySelectionProps = {
  parties: Party[];
  loading: boolean;
  children?: React.ReactNode;
  onEditParty: (party: Party) => void;
  onPartySelect: (id: Party["id"]) => void;
};

const PartySelection = ({
  parties,
  loading,
  children,
  onEditParty,
  onPartySelect,
}: PartySelectionProps) => {
  const { t } = useTranslation("PagePartySelection");

  const drawerChild = React.Children.toArray(children).find((child) => {
    return (
      React.isValidElement(child) &&
      (child.type as any).displayName === "PartySelectionCreateDrawer"
    );
  });

  function handlePartySelect(partyId: Party["id"]) {
    onPartySelect(partyId);
  }

  return (
    <div className="flex h-full w-full flex-col items-center gap-8 rounded-md bg-white p-2">
      <div className="flex max-w-xl flex-col gap-2">
        <TypographyH1>{t("headline")}</TypographyH1>
        <TypographyP>{t("description")}</TypographyP>
        <div className="flex w-full justify-center">{drawerChild}</div>
      </div>

      <AnimatePresence mode="wait">
        {loading && <Loader size="large" title={t("loading")} key="loader" />}

        {!loading && (
          <ScrollArea className="w-full max-w-xl pr-3">
            <div className="flex flex-col gap-4 pb-4">
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
          </ScrollArea>
        )}
      </AnimatePresence>
    </div>
  );
};

type PartySelectionCreateDrawerProps = {
  children: React.ReactNode;
};

const CreateDrawer = ({ children }: PartySelectionCreateDrawerProps) => {
  return <>{children}</>;
};
CreateDrawer.displayName = "PartySelectionCreateDrawer";
PartySelection.CreateDrawer = CreateDrawer;

export default PartySelection;
