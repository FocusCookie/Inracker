import { useMutationWithErrorToast } from "@/hooks/useMutationWithErrorToast";
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

  const { setCurrentParty } = usePartyStore(
    useShallow((state) => ({
      setCurrentParty: state.setCurrentParty,
    })),
  );

  const partiesQuery = useQueryWithToast({
    queryKey: ["parties"],
    queryFn: db.parties.getAllDetailed,
  });

  const createPartyMutation = useMutationWithErrorToast({
    mutationFn: (party: Omit<Party, "id">) => {
      return db.parties.create(party);
    },
  });

  const editPartyMutation = useMutationWithErrorToast({
    mutationFn: (party: Party) => {
      return db.parties.updateByParty(party);
    },
  });

  const deletePartyMutation = useMutationWithErrorToast({
    mutationFn: (id: Party["id"]) => {
      return db.parties.deleteById(id);
    },
  });

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
      onEditParty={editPartyMutation}
      onDeleteParty={deletePartyMutation}
      onPartySelect={handlePartySelection}
      onCreateParty={createPartyMutation}
    />
  );
}
