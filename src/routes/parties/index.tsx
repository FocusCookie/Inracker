import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import db from "@/lib/database";
import PartySelection from "@/pages/PartySelection/PartySelection";
import { Party } from "@/types/party";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/parties/")({
  component: Parties,
});

function Parties() {
  const navigate = useNavigate();

  const partiesQuery = useQueryWithToast({
    queryKey: ["parties"],
    queryFn: db.parties.getAllDetailed,
  });

  function handlePartySelection(partyId: Party["id"]) {
    navigate({
      to: `/chapters`,
      search: { partyId },
    });
  }

  return (
    <PartySelection
      loading={partiesQuery.isPending}
      parties={partiesQuery.data || []}
      onEditParty={db.parties.updateByParty}
      onDeleteParty={db.parties.deleteById}
      onPartySelect={handlePartySelection}
      onCreateParty={db.parties.create}
    />
  );
}
