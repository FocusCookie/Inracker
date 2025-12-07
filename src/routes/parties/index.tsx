import { usePartiesQuery } from "@/hooks/useParties";
import db from "@/lib/database";
import PartySelection from "@/pages/PartySelection/PartySelection";
import { Party } from "@/types/party";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/parties/")({
  component: Parties,
});

function Parties() {
  const navigate = useNavigate();
  const partiesQuery = usePartiesQuery(db);

  function handlePartySelection(partyId: Party["id"]) {
    navigate({
      to: `/chapters`,
      search: { partyId },
    });
  }

  return (
    <PartySelection
      database={db}
      isLoading={partiesQuery.isPending}
      parties={partiesQuery.data || []}
      onPartySelect={handlePartySelection}
    />
  );
}
