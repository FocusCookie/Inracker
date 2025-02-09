import CreatePartyDrawer from "@/components/CreatePartyDrawer/CreatePartyDrawer";
import PartyEditDrawer from "@/components/PartyEditDrawer/PartyEditDrawer";
import { useMutationWithErrorToast } from "@/hooks/useMutationWithErrorToast";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import db from "@/lib/database";
import PartySelection from "@/pages/PartySelection/PartySelection";
import { usePartyStore } from "@/stores/usePartySTore";
import { Party } from "@/types/party";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useShallow } from "zustand/shallow";

export const Route = createFileRoute("/parties/")({
  component: Parties,
});

function Parties() {
  const navigate = useNavigate();
  const {
    isCreateDrawerOpen,
    isEditDrawerOpen,
    editingParty,
    openCreateDrawer,
    closeCreateDrawer,
    openEditDrawer,
    closeEditDrawer,
  } = usePartyStore(
    useShallow((state) => ({
      isCreateDrawerOpen: state.isCreateDrawerOpen,
      isEditDrawerOpen: state.isEditDrawerOpen,
      editingParty: state.editingParty,
      closeCreateDrawer: state.closeCreateDrawer,
      openCreateDrawer: state.openCreateDrawer,
      openEditDrawer: state.openEditDrawer,
      closeEditDrawer: state.closeEditDrawer,
    })),
  );

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
      closeCreateDrawer();
    },
  });

  const deletePartyMutation = useMutation({
    mutationFn: (id: Party["id"]) => {
      return db.parties.deleteById(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      closeEditDrawer();
    },
  });

  const updatePartyMutation = useMutationWithErrorToast({
    mutationFn: (party: Party) => {
      return db.parties.updateByParty(party);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      closeEditDrawer();
    },
    onError: (error) => console.log(error),
  });

  function handleEditParty(party: Party) {
    openEditDrawer(party);
  }

  function handleCreateDrawerChange(state: boolean) {
    if (state) {
      openCreateDrawer();
    } else {
      closeCreateDrawer();
    }
  }

  function handlePartySelection(partyId: Party["id"]) {
    navigate({
      to: `/chapters`,
      search: { partyId },
    });
  }

  return (
    <>
      <PartySelection
        loading={partiesQuery.isPending}
        parties={partiesQuery.data || []}
        onEditParty={handleEditParty}
        onPartySelect={handlePartySelection}
      >
        <PartySelection.CreateDrawer>
          <CreatePartyDrawer
            open={isCreateDrawerOpen}
            onOpenChange={handleCreateDrawerChange}
            isCreating={createPartyMutation.isPending}
            onCreate={createPartyMutation.mutate}
          />
        </PartySelection.CreateDrawer>
      </PartySelection>

      <PartyEditDrawer
        open={isEditDrawerOpen}
        onOpenChange={closeEditDrawer}
        party={editingParty}
        isUpdating={
          deletePartyMutation.isPending || deletePartyMutation.isPending
        }
        onUpdate={updatePartyMutation.mutate}
        onDelete={deletePartyMutation.mutate}
      />
    </>
  );
}
