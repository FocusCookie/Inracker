import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import db from "@/lib/database";
import PartySelection from "@/pages/PartySelection/PartySelection";
import { usePartyStore } from "@/stores/usePartySTore";
import { Party } from "@/types/party";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useShallow } from "zustand/shallow";

export const Route = createFileRoute("/parties/")({
  component: Parties,
});

function Parties() {
  const navigate = useNavigate();
  const { openCreateDrawer, openEditDrawer, setCurrentParty } = usePartyStore(
    useShallow((state) => ({
      setCurrentParty: state.setCurrentParty,
      openCreateDrawer: state.openCreateDrawer,
      openEditDrawer: state.openEditDrawer,
    })),
  );

  const partiesQuery = useQueryWithToast({
    queryKey: ["parties"],
    queryFn: db.parties.getAllDetailed,
  });

  function handleEditParty(party: Party) {
    openEditDrawer(party);
  }

  function handlePartySelection(partyId: Party["id"]) {
    setCurrentParty(partyId);
    navigate({
      to: `/chapters`,
      search: { partyId },
    });
  }

  return (
    <PartySelection
      loading={partiesQuery.isPending}
      parties={partiesQuery.data || []}
      onEditParty={handleEditParty}
      onPartySelect={handlePartySelection}
      onCreateParty={openCreateDrawer}
    />
  );
}
