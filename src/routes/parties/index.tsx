import PartyCreateDrawer from "@/components/PartyCreateDrawer/PartyCreateDrawer";
import PartyEditDrawer from "@/components/PartyEditDrawer/PartyEditDrawer";
import { useMutationWithErrorToast } from "@/hooks/useMutationWithErrorToast";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import db from "@/lib/database";
import PartySelection from "@/pages/PartySelection/PartySelection";
import { Party } from "@/types/party";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/parties/")({
  component: Parties,
});

function Parties() {
  const [isCreatDrawerOpen, setIsCreatDrawerOpen] = useState<boolean>(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState<boolean>(false);
  const [createdParties, setCreatedCount] = useState<number>(0);
  const [partyToEdit, setPartyToEdit] = useState<Party>({
    id: -1,
    description: "",
    icon: "",
    name: "",
    players: [],
  });

  const queryClient = useQueryClient();
  const partiesQuery = useQueryWithToast({
    queryKey: ["parties"],
    queryFn: db.parties.getAllDetailed,
  });

  const createPartyMutation = useMutation({
    mutationFn: (party: Omit<Party, "id">) => {
      return db.parties.create(party);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      setIsCreatDrawerOpen(false);
      setTimeout(() => {
        setCreatedCount((c) => c + 1);
      }, 350);
    },
  });

  const deletePartyMutation = useMutation({
    mutationFn: (id: Party["id"]) => {
      return db.parties.deleteById(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      setIsEditDrawerOpen(false);
    },
  });

  const updatePartyMutation = useMutationWithErrorToast({
    mutationFn: (party: Party) => {
      return db.parties.updateByParty(party);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      setIsEditDrawerOpen(false);
    },
    onError: (error) => console.log(error),
  });

  function handleEditParty(party: Party) {
    setPartyToEdit(party);
    setIsEditDrawerOpen(true);
  }

  return (
    <>
      <PartySelection
        loading={partiesQuery.isPending}
        parties={partiesQuery.data || []}
        renderCreatePartyDrawer={
          <PartyCreateDrawer
            key={`parties-${createdParties}`}
            open={isCreatDrawerOpen}
            onOpenChange={setIsCreatDrawerOpen}
            isCreating={createPartyMutation.isPending}
            onCreate={createPartyMutation.mutate}
          />
        }
        onEditParty={handleEditParty}
      />

      <PartyEditDrawer
        key={`selected-party-${partyToEdit.id}`}
        open={isEditDrawerOpen}
        onOpenChange={setIsEditDrawerOpen}
        party={partyToEdit}
        isUpdating={deletePartyMutation.isPending}
        onUpdate={updatePartyMutation.mutate}
        onDelete={deletePartyMutation.mutate}
      />
    </>
  );
}
