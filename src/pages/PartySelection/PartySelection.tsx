import Loader from "@/components/Loader/Loader";
import PartyCard from "@/components/PartyCard/PartyCard";
import { Button } from "@/components/ui/button";
import { TypographyH1 } from "@/components/ui/typographyH1";
import { TypographyP } from "@/components/ui/typographyP";
import { useMutationWithErrorToast } from "@/hooks/useMutationWithErrorToast";
import { useOverlayStore } from "@/stores/useOverlayStore";
import type { DBParty, Party } from "@/types/party";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

type PartySelectionProps = {
  parties: Party[];
  loading: boolean;
  onEditParty: (party: Party) => Promise<Party>;
  onPartySelect: (id: Party["id"]) => void;
  onCreateParty: (party: Omit<Party, "id">) => Promise<DBParty>;
  onDeleteParty: (id: Party["id"]) => Promise<number>;
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

  const createPartyMutation = useMutationWithErrorToast({
    mutationFn: onCreateParty,
  });

  const editPartyMutation = useMutationWithErrorToast({
    mutationFn: onEditParty,
  });

  const deletePartyMutation = useMutationWithErrorToast({
    mutationFn: onDeleteParty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });

  function handleOpenCreateParty() {
    openOverlay("party.create", {
      onCreate: (party) => createPartyMutation.mutateAsync(party),
      onComplete: ({ partyId }) => {
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["parties"] });
        onPartySelect(partyId);
      },
    });
  }

  function handleOpenEditParty(party: Party) {
    openOverlay("party.edit", {
      party,
      onEdit: (party) => editPartyMutation.mutateAsync(party),
      onComplete: (_partyId) => {
        queryClient.invalidateQueries({ queryKey: ["parties"] });
      },
      onDelete: (partyId: Party["id"]) =>
        deletePartyMutation.mutateAsync(partyId),
    });
  }

  return (
    <div className="flex h-full w-full flex-col items-center gap-8 rounded-md bg-white p-2">
      <div className="md:w-content flex w-full flex-col items-center gap-4">
        <div className="flex w-full flex-col gap-2">
          <TypographyH1>{t("headline")}</TypographyH1>
          <TypographyP>{t("description")}</TypographyP>
        </div>

        <Button
          variant={parties.length === 0 ? "default" : "outline"}
          onClick={handleOpenCreateParty}
          className="w-fit"
        >
          {t("createParty")}
        </Button>

        <AnimatePresence mode="wait">
          {loading && <Loader size="large" title={t("loading")} key="loader" />}

          {!loading && (
            <div className="scrollable-y w-full overflow-y-scroll pr-0.5">
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
    </div>
  );
};

export default PartySelection;
