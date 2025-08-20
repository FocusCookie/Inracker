import Loader from "@/components/Loader/Loader";
import PartyCard from "@/components/PartyCard/PartyCard";
import { TypographyH1 } from "@/components/ui/typographyH1";
import { TypographyP } from "@/components/ui/typographyP";
import { Button } from "@/components/ui/button";
import { useOverlayStore } from "@/stores/useOverlayStore";
import type { DBParty, Party } from "@/types/party";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { Player } from "@/types/player";

type PartySelectionProps = {
  parties: Party[];
  loading: boolean;
  onEditParty: UseMutationResult<
    {
      description: string;
      readonly id: number;
      name: string;
      icon: string;
      players: Player[];
    },
    unknown,
    {
      description: string;
      readonly id: number;
      name: string;
      icon: string;
      players: Player[];
    },
    unknown
  >;
  onPartySelect: (id: Party["id"]) => void;
  onCreateParty: UseMutationResult<
    DBParty,
    unknown,
    Omit<
      {
        readonly id: number;
        name: string;
        icon: string;
        description: string;
        players: Player[];
      },
      "id"
    >,
    unknown
  >;
  onDeleteParty: UseMutationResult<number, unknown, number, unknown>;
};

const PartySelection = ({
  parties,
  loading,
  onEditParty,
  onPartySelect,
  onCreateParty,
  onDeleteParty,
}: PartySelectionProps) => {
  const { t } = useTranslation("PagePartySelection");
  const openOverlay = useOverlayStore((s) => s.open);
  const queryClient = useQueryClient();

  function handleOpenCreateParty() {
    openOverlay("party.create", {
      onCreate: (party) => onCreateParty.mutateAsync(party),
      onComplete: ({ partyId }) => {
        queryClient.invalidateQueries({ queryKey: ["parties"] });
        onPartySelect(partyId);
      },
    });
  }

  function handleOpenEditParty(party: Party) {
    openOverlay("party.edit", {
      party,
      onEdit: (party) => onEditParty.mutateAsync(party),
      onComplete: (_partyId) => {
        queryClient.invalidateQueries({ queryKey: ["parties"] });
      },
      onDelete: (partyId: Party["id"]) => onDeleteParty.mutateAsync(partyId),
    });
  }

  return (
    <div className="flex h-full w-full flex-col items-center gap-8 rounded-md bg-white p-2">
      <div className="w-content flex flex-col gap-2">
        <TypographyH1>{t("headline")}</TypographyH1>
        <TypographyP>{t("description")}</TypographyP>
      </div>

      <Button onClick={handleOpenCreateParty}>{t("createParty")}</Button>

      <AnimatePresence mode="wait">
        {loading && <Loader size="large" title={t("loading")} key="loader" />}

        {!loading && (
          <div className="scrollable-y w-content overflow-y-scroll pr-0.5">
            <div className="flex w-full flex-col gap-4 pb-4">
              {parties.map((party, index) => (
                <PartyCard
                  key={`party-${party.id}`}
                  animationDelay={index * 0.05}
                  party={party}
                  onEdit={() => handleOpenEditParty(party)}
                  onOpen={() => onPartySelect(party.id)}
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
