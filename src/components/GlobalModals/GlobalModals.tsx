import { toast } from "@/hooks/use-toast";
import { useCreatePlayer } from "@/hooks/useCreatePlayer";
import { useEditPlayer } from "@/hooks/useEditPlayer";
import { useMutationWithErrorToast } from "@/hooks/useMutationWithErrorToast";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import db from "@/lib/database";
import { useImmunityStore } from "@/stores/useImmunityStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useResistancesStore } from "@/stores/useResistanceStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { DBImmunity, Immunity } from "@/types/immunitiy";
import { DBParty, Party } from "@/types/party";
import { Player, TCreatePlayer } from "@/types/player";
import { DBResistance, Resistance } from "@/types/resistances";
import { useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/shallow";
import CreateImmunityDrawer from "../CreateImmunityDrawer/CreateImmunityDrawer";
import CreatePartyDrawer from "../CreatePartyDrawer/CreatePartyDrawer";
import CreatePlayerDrawer from "../CreatePlayerDrawer/CreatePlayerDrawer";
import CreateResistanceDrawer from "../CreateResistanceDrawer/CreateResistanceDrawer";
import EditPlayerDrawer from "../EditPlayerDrawer/EditPlayerDrawer";
import ImmunitiesCatalog from "../ImmunitiesCatalog/ImmunitiesCatalog";
import PartyEditDrawer from "../PartyEditDrawer/PartyEditDrawer";
import PlayerCatalog from "../PlayerCatalog/PlayerCatalog";
import ResistancesCatalog from "../ResistancesCatalog/ResistancesCatalog";
import SettingsDialog from "../SettingsDialog/SettingsDialog";
import { useChapterStore } from "@/stores/useChapterStore";
// @ts-ignore //TODO: fix error here
import { usePartyStore } from "@/stores/usePartySTore";
import { Chapter, DBChapter } from "@/types/chapters";
import CreateChapterDrawer from "../CreateChapterDrawer/CreateChapterDrawer";
import EditChapterDrawer from "../EditChapterDrawer/EditChapterDrawer";
import { useEncounterStore } from "@/stores/useEncounterStore";
import CreateEncounterDrawer from "../CreateEncounterDrawer/CreateEncounterDrawer";
import CreateOpponentDrawer from "../CreateOpponentDrawer/CreateOpponentDrawer";
import { useOpponentStore } from "@/stores/useOpponentStore";
import { useCreateOpponent } from "@/hooks/useCreateOpponent";
import { EncounterOpponent, Opponent } from "@/types/opponents";
import OpponentsCatalog from "../OpponentsCatalog/OpponentsCatalog";
import { useCreateEncounter } from "@/hooks/useCreateEncounter";
import { useState } from "react";
import { DBEffect, Effect } from "@/types/effect";
import { Encounter } from "@/types/encounter";
import CreateEffectDrawer from "../CreateEffectDrawer/CreateEffectDrawer";
import { useEffectStore } from "@/stores/useEffectStore";
import { create } from "domain";

type Props = {};

function GlobalModals({}: Props) {
  const queryClient = useQueryClient();
  const createPlayerForm = useCreatePlayer();
  const createOpponentForm = useCreateOpponent();
  const editPlayerForm = useEditPlayer();
  const createEncounterForm = useCreateEncounter();
  const [selectedEncounterOpponents, setSelectedEncounterOpponents] = useState<
    EncounterOpponent[]
  >([]);

  const { closeSettingsDialog, isSettingsDialogOpen, openSettingsDialog } =
    useSettingsStore(
      useShallow((state) => ({
        isSettingsDialogOpen: state.isSettingsDialogOpen,
        closeSettingsDialog: state.closeSettingsDialog,
        openSettingsDialog: state.openSettingsDialog,
      })),
    );

  const {
    isCreateEncounterDrawerOpen,
    currentEncounterElement,
    openCreateEncounterDrawer,
    closeEncounterDrawer,
    setCurrentElement,
    setCurrentColor,
    setCurrentIcon,
    setResetCount,
    resetCount,
  } = useEncounterStore(
    useShallow((state) => ({
      isCreateEncounterDrawerOpen: state.isCreateEncounterDrawerOpen,
      currentEncounterElement: state.currentElement,
      openCreateEncounterDrawer: state.openCreateEncounterDrawer,
      closeEncounterDrawer: state.closeEncounterDrawer,
      setCurrentElement: state.setCurrentElement,
      setCurrentColor: state.setCurrentColor,
      setCurrentIcon: state.setCurrentIcon,
      setResetCount: state.setResetCount,
      resetCount: state.resetCount,
    })),
  );

  const {
    editingChapter,
    isEditChapterDrawerOpen,
    isCreateChapterDrawerOpen,
    closeEditChapterDrawer,
    closeCreateChapterDrawer,
    openCreateChapterDrawer,
    currentChapter,
  } = useChapterStore(
    useShallow((state) => ({
      isCreateChapterDrawerOpen: state.isCreateChapterDrawerOpen,
      isEditChapterDrawerOpen: state.isEditChapterDrawerOpen,
      editingChapter: state.editingChapter,
      closeCreateChapterDrawer: state.closeCreateChapterDrawer,
      openCreateChapterDrawer: state.openCreateChapterDrawer,
      closeEditChapterDrawer: state.closeEditChapterDrawer,
      currentChapter: state.currentChapter,
    })),
  );

  const {
    isPlayersCatalogOpen,
    isCreatePlayerDrawerOpen,
    selectedPlayer,
    isEditPlayerDrawerOpen,
    setIsUpdatingPlayer,
    setIsCreatingPlayer,
    closeCreatePlayerDrawer,
    openCreatePlayerDrawer,
    openPlayersCatalog,
    closePlayersCatalog,
    setSelectedPlayer,
    openEditPlayerDrawer,
    closeEditPlayerDrawer,
  } = usePlayerStore(
    useShallow((state) => ({
      isCreatePlayerDrawerOpen: state.isCreatePlayerDrawerOpen,
      isPlayersCatalogOpen: state.isPlayersCatalogOpen,
      selectedPlayer: state.selectedPlayer,
      isEditPlayerDrawerOpen: state.isEditPlayerDrawerOpen,
      setIsUpdatingPlayer: state.setIsUpdatingPlayer,
      setSelectedPlayer: state.setSelectedPlayer,
      setIsCreatingPlayer: state.setIsCreatingPlayer,
      openPlayersCatalog: state.openPlayersCatalog,
      closePlayersCatalog: state.closePlayersCatalog,
      openCreatePlayerDrawer: state.openCreatePlayerDrawer,
      closeCreatePlayerDrawer: state.closeCreatePlayerDrawer,
      openEditPlayerDrawer: state.openEditPlayerDrawer,
      closeEditPlayerDrawer: state.closeEditPlayerDrawer,
    })),
  );

  const {
    closeCreateOpponentDrawer,
    closeEditOpponentDrawer,
    closeOpponentsCatalog,
    isCreateOpponentDrawerOpen,
    isCreatingOpponent,
    isEditOpponentDrawerOpen,
    isOpponentsCatalogOpen,
    isUpdatingOpponent,
    openCreateOpponentDrawer,
    openEditOpponentDrawer,
    openOpponentsCatalog,
    selectedOpponent,
    setIsCreatingOpponent,
    setIsUpdatingOpponent,
    setSelectedOpponent,
  } = useOpponentStore(
    useShallow((state) => ({
      isCreateOpponentDrawerOpen: state.isCreateOpponentDrawerOpen,
      isEditOpponentDrawerOpen: state.isEditOpponentDrawerOpen,
      isCreatingOpponent: state.isCreatingOpponent,
      isUpdatingOpponent: state.isUpdatingOpponent,
      selectedOpponent: state.selectedOpponent,
      isOpponentsCatalogOpen: state.isOpponentsCatalogOpen,

      setSelectedOpponent: state.setSelectedOpponent,
      openCreateOpponentDrawer: state.openCreateOpponentDrawer,
      closeCreateOpponentDrawer: state.closeCreateOpponentDrawer,
      openEditOpponentDrawer: state.openEditOpponentDrawer,
      closeEditOpponentDrawer: state.closeEditOpponentDrawer,
      setIsCreatingOpponent: state.setIsCreatingOpponent,
      setIsUpdatingOpponent: state.setIsUpdatingOpponent,
      openOpponentsCatalog: state.openOpponentsCatalog,
      closeOpponentsCatalog: state.closeOpponentsCatalog,
    })),
  );

  const {
    currentParty,
    isCreateDrawerOpen,
    isEditDrawerOpen,
    editingParty,
    openCreateDrawer,
    closeCreateDrawer,
    closeEditDrawer,
  } = usePartyStore(
    useShallow((state) => ({
      currentParty: state.currentParty,
      isCreateDrawerOpen: state.isCreateDrawerOpen,
      isEditDrawerOpen: state.isEditDrawerOpen,
      editingParty: state.editingParty,
      closeCreateDrawer: state.closeCreateDrawer,
      openCreateDrawer: state.openCreateDrawer,
      closeEditDrawer: state.closeEditDrawer,
    })),
  );

  const {
    isImmunitiesCatalogOpen,
    isCreateImmunityDrawerOpen,
    setIsCreatingImmunity,
    closeCreateImmunityDrawer,
    openCreateImmunityDrawer,
    openImmunititesCatalog,
    closeImmunitiesCatalog,
  } = useImmunityStore(
    useShallow((state) => ({
      isImmunitiesCatalogOpen: state.isImmunitiesCatalogOpen,
      isCreateImmunityDrawerOpen: state.isCreateImmunityDrawerOpen,
      setIsCreatingImmunity: state.setIsCreatingImmunity,
      openCreateImmunityDrawer: state.openCreateImmunityDrawer,
      closeCreateImmunityDrawer: state.closeCreateImmunityDrawer,
      openImmunititesCatalog: state.openImmunititesCatalog,
      closeImmunitiesCatalog: state.closeImmunitiesCatalog,
    })),
  );

  const {
    isResistanceCatalogOpen,
    isCreateResistanceDrawerOpen,
    setIsCreatingResistance,
    closeCreateResistanceDrawer,
    openCreateResistanceDrawer,
    closeResistancesCatalog,
    openResistancesCatalog,
  } = useResistancesStore(
    useShallow((state) => ({
      isResistanceCatalogOpen: state.isResistanceCatalogOpen,
      isCreateResistanceDrawerOpen: state.isCreateResistanceDrawerOpen,
      setIsCreatingResistance: state.setIsCreatingResistance,
      openCreateResistanceDrawer: state.openCreateResistanceDrawer,
      closeCreateResistanceDrawer: state.closeCreateResistanceDrawer,
      closeResistancesCatalog: state.closeResistancesCatalog,
      openResistancesCatalog: state.openResistancesCatalog,
    })),
  );

  const {
    effects,
    isCreateEffectDrawerOpen,
    isCreatingEffect,
    isEffectsCatalogOpen,
    openCreateEffectDrawer,
    closeCreateEffectDrawer,
    openEffectsCatalog,
    closeEffectsCatalog,
    setIsCreatingEffect,
  } = useEffectStore(
    useShallow((state) => ({
      effects: state.effects,
      isCreateEffectDrawerOpen: state.isCreateEffectDrawerOpen,
      isCreatingEffect: state.isCreatingEffect,
      isEffectsCatalogOpen: state.isEffectsCatalogOpen,
      openCreateEffectDrawer: state.openCreateEffectDrawer,
      closeCreateEffectDrawer: state.closeCreateEffectDrawer,
      openEffectsCatalog: state.openEffectsCatalog,
      closeEffectsCatalog: state.closeEffectsCatalog,
      setIsCreatingEffect: state.setIsCreatingEffect,
    })),
  );

  const players = useQueryWithToast({
    queryKey: ["players"],
    queryFn: () => db.players.getAllDetailed(),
  });

  const party = useQueryWithToast({
    queryKey: ["party"],
    queryFn: () => db.parties.getDetailedById(currentParty!),
    enabled: !!currentParty,
  });

  const immunities = useQueryWithToast({
    queryKey: ["immunities"],
    queryFn: () => db.immunitites.getAll(),
  });

  const resistances = useQueryWithToast({
    queryKey: ["resistances"],
    queryFn: () => db.resistances.getAll(),
  });

  const opponents = useQueryWithToast({
    queryKey: ["opponents"],
    queryFn: () => db.opponents.getAllDetailed(),
  });

  const addPlayerToParty = useMutationWithErrorToast({
    mutationFn: ({
      partyId,
      playerId,
    }: {
      partyId: Party["id"];
      playerId: Player["id"];
    }) => {
      return db.parties.addPlayerToParty(partyId, playerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["party"],
      });
      queryClient.invalidateQueries({
        queryKey: ["parties"],
      });
      closePlayersCatalog();
    },
  });

  const createPlayer = useMutationWithErrorToast({
    mutationFn: (player: TCreatePlayer) => {
      setIsCreatingPlayer(true);

      return db.players.create(player);
    },
    onSuccess: (player: Player) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      setIsCreatingPlayer(false);
      createPlayerForm.reset();
      closeCreatePlayerDrawer();
      toast({
        variant: "default",
        title: `Created ${player.icon} ${player.name}`,
      });
    },
  });

  const addImmunityToPlayer = useMutationWithErrorToast({
    mutationFn: async ({
      playerId,
      immunityId,
    }: {
      playerId: Player["id"];
      immunityId: DBImmunity["id"];
    }) => {
      return db.players.addImmunityToPlayer(playerId, immunityId);
    },
    onError: (error) => {
      console.log(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["party"],
      });
      queryClient.invalidateQueries({
        queryKey: ["players"],
      });
    },
  });

  const addResistanceToPlayer = useMutationWithErrorToast({
    mutationFn: async ({
      playerId,
      resistanceId,
    }: {
      playerId: Player["id"];
      resistanceId: DBResistance["id"];
    }) => {
      return db.players.addResistanceToPlayer(playerId, resistanceId);
    },
    onError: (error) => {
      console.log(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["party"],
      });
      queryClient.invalidateQueries({
        queryKey: ["players"],
      });
    },
  });

  const createImmunity = useMutationWithErrorToast({
    mutationFn: (immunity: Immunity) => {
      setIsCreatingImmunity(true);
      return db.immunitites.create(immunity);
    },
    onSuccess: (immunity: DBImmunity) => {
      queryClient.invalidateQueries({ queryKey: ["immunities"] });
      setIsCreatingImmunity(false);
      closeCreateImmunityDrawer();
      toast({
        variant: "default",
        title: `Created ${immunity.icon} ${immunity.name}`,
      });
    },
  });

  const createResistance = useMutationWithErrorToast({
    mutationFn: (resistance: Resistance) => {
      setIsCreatingResistance(true);
      return db.resistances.create(resistance);
    },
    onSuccess: (resistance: DBResistance) => {
      queryClient.invalidateQueries({ queryKey: ["resistances"] });
      setIsCreatingResistance(false);
      closeCreateResistanceDrawer();
      toast({
        variant: "default",
        title: `Created ${resistance.icon} ${resistance.name}`,
      });
    },
  });

  const createEffect = useMutationWithErrorToast({
    mutationFn: (effect: Omit<Effect, "id">) => {
      setIsCreatingEffect(true);
      return db.effects.create(effect);
    },
    onSuccess: (effect: DBEffect) => {
      queryClient.invalidateQueries({ queryKey: ["effects"] });
      setIsCreatingEffect(false);
      closeCreateEffectDrawer();
      toast({
        variant: "default",
        title: `Created ${effect.icon} ${effect.name}`,
      });
    },
  });

  const updatePlayer = useMutationWithErrorToast({
    mutationFn: (player: Player) => {
      setIsUpdatingPlayer(true);
      return db.players.update(player);
    },
    onSuccess: (player: Player) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });

      setIsUpdatingPlayer(false);
      closeEditPlayerDrawer();

      toast({
        variant: "default",
        title: `Updated ${player.icon} ${player.name}`,
      });
    },
  });

  const deletePartyMutation = useMutationWithErrorToast({
    mutationFn: (id: Party["id"]) => {
      return db.parties.deleteById(id);
    },
    onSuccess: (deletedParty: DBParty) => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      closeEditDrawer();

      toast({
        variant: "default",
        title: `Deleted ${deletedParty.icon} ${deletedParty.name}`,
      });
    },
  });

  const createPartyMutation = useMutationWithErrorToast({
    mutationFn: (party: Omit<Party, "id">) => {
      return db.parties.create(party);
    },
    onSuccess: (party: DBParty) => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      closeCreateDrawer();

      toast({
        variant: "default",
        title: `Created ${party.icon} ${party.name}`,
      });
    },
  });

  const createChapterMutation = useMutationWithErrorToast({
    mutationFn: (chapter: Omit<Chapter, "id">) => {
      return db.chapters.create(chapter);
    },
    onSuccess: (chapter: DBChapter) => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      closeCreateChapterDrawer();

      toast({
        variant: "default",
        title: `Created ${chapter.icon} ${chapter.name}`,
      });
    },
  });

  const updateChapterMutation = useMutationWithErrorToast({
    mutationFn: (chapter: Chapter) => {
      return db.chapters.update(chapter);
    },
    onSuccess: (chapter: Chapter) => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["chapter"] });

      closeEditChapterDrawer();

      toast({
        variant: "default",
        title: `Updated ${chapter.icon} ${chapter.name}`,
      });
    },
  });

  const deleteChapter = useMutationWithErrorToast({
    mutationFn: (id: Chapter["id"]) => {
      return db.chapters.delete(id);
    },
    onSuccess: (deletedChapter: DBChapter) => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["chapter"] });

      toast({
        variant: "default",
        title: `Deleted ${deletedChapter.icon} ${deletedChapter.name}`,
      });
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

  const deletePlayer = useMutationWithErrorToast({
    mutationFn: (id: Player["id"]) => {
      return db.players.deletePlayerById(id);
    },
    onSuccess: (deletedPlayer: Player) => {
      queryClient.invalidateQueries({ queryKey: ["parties"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });

      toast({
        variant: "default",
        title: `Deleted ${deletedPlayer.icon} ${deletedPlayer.name}`,
      });
    },
    onSettled: () => {
      closeEditDrawer();
    },
  });

  const createOpponentMutation = useMutationWithErrorToast({
    mutationFn: (opponent: Omit<Opponent, "id">) => {
      return db.opponents.create(opponent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["opponents"],
      });
    },
    onSettled: () => {
      closeCreateOpponentDrawer();
      createOpponentForm.reset();
    },
  });

  const createEncounterOpponentMutation = useMutationWithErrorToast({
    mutationFn: (opponent: Opponent) => {
      return db.encounterOpponents.create(opponent);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["opponents"],
      });
    },
    onSettled: () => {
      closeCreateOpponentDrawer();
    },
  });

  const deleteEncounterOpponentMutation = useMutationWithErrorToast({
    mutationFn: (id: EncounterOpponent["id"]) => {
      return db.encounterOpponents.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["encounterOpponents"],
      });
    },
  });

  const createEncounterMutation = useMutationWithErrorToast({
    mutationFn: (encounter: Omit<Encounter, "id">) => {
      return db.encounters
        .create(encounter)
        .then((createdEncounter: Encounter) => {
          if (currentChapter) {
            return db.chapters
              .addEncounter(currentChapter, createdEncounter.id)
              .then(() => createdEncounter);
          }
          return createdEncounter;
        });
    },
    onSuccess: () => {
      closeEncounterDrawer();
      createEncounterForm.form.reset();

      setCurrentElement(null);
      setCurrentColor("#FFFFFF");
      setCurrentIcon("📝");
      setResetCount(resetCount + 1);

      //TODO: Make a more specific invalidation this causes a lot of re-fetches and a tiny flicker
      queryClient.removeQueries();

      setCurrentElement(null);
      setCurrentColor("#FFFFFF");
      setCurrentIcon("📝");
      setResetCount(resetCount + 1);
    },
  });

  function handlePlayersCatalogOpen(state: boolean) {
    state ? openPlayersCatalog() : closePlayersCatalog();
  }

  function handleAddImmunity(immunity: DBImmunity) {
    if (isCreatePlayerDrawerOpen) {
      const currentImmunities = createPlayerForm.getValues("immunities");
      const isAlreadyAdded = currentImmunities.some((id) => id === immunity.id);

      if (!isAlreadyAdded) {
        createPlayerForm.setValue("immunities", [
          ...currentImmunities,
          immunity.id,
        ]);

        toast({
          variant: "default",
          title: `Added ${immunity.icon} ${immunity.name} `,
        });
      } else {
        toast({
          variant: "default",
          title: "Already Added",
        });
      }
    }

    if (selectedPlayer && isImmunitiesCatalogOpen) {
      const isAlreadyAdded = selectedPlayer.immunities.some(
        (cImm) => cImm.id === immunity.id,
      );

      if (!isAlreadyAdded) {
        addImmunityToPlayer.mutate({
          playerId: selectedPlayer.id,
          immunityId: immunity.id,
        });

        toast({
          variant: "default",
          title: `Added ${immunity.icon} ${immunity.name} to ${selectedPlayer!.name}`,
        });

        const updateSelectedPlayer = Object.assign({}, selectedPlayer);
        updateSelectedPlayer.immunities.push(immunity);

        setSelectedPlayer(null);
      } else {
        toast({
          variant: "default",
          title: "Already Added",
        });
      }
    }

    //TODO: Opponensdrawer open and than add to opponensform .../
    if (isCreateOpponentDrawerOpen) {
      const currentImmunities = createOpponentForm.getValues("immunities");
      const isAlreadyAdded = currentImmunities.some((id) => id === immunity.id);

      if (!isAlreadyAdded) {
        createOpponentForm.setValue("immunities", [
          ...currentImmunities,
          immunity.id,
        ]);

        toast({
          variant: "default",
          title: `Added ${immunity.icon} ${immunity.name} `,
        });
      } else {
        toast({
          variant: "default",
          title: "Already Added",
        });
      }
    }
  }

  function handleAddResistance(resistance: DBResistance) {
    if (isCreatePlayerDrawerOpen) {
      const currentResistances = createPlayerForm.getValues("resistances");
      const isAlreadyAdded = currentResistances.some(
        (cRe) => cRe === resistance.id,
      );

      if (!isAlreadyAdded) {
        createPlayerForm.setValue("resistances", [
          ...currentResistances,
          resistance.id,
        ]);

        toast({
          variant: "default",
          title: `Added ${resistance.icon} ${resistance.name} `,
        });
      } else {
        toast({
          variant: "default",
          title: "Already Added",
        });
      }
    }

    if (selectedPlayer && isResistanceCatalogOpen) {
      const isAlreadyAdded = selectedPlayer.resistances.some(
        (sRe) => sRe.id === resistance.id,
      );

      if (!isAlreadyAdded) {
        addResistanceToPlayer.mutate({
          playerId: selectedPlayer.id,
          resistanceId: resistance.id,
        });

        toast({
          variant: "default",
          title: `Added ${resistance.icon} ${resistance.name} to ${selectedPlayer!.name}`,
        });

        const updateSelectedPlayer = Object.assign({}, selectedPlayer);
        updateSelectedPlayer.resistances.push(resistance);

        setSelectedPlayer(null);
      } else {
        toast({
          variant: "default",
          title: "Already Added",
        });
      }
    }

    if (isCreateOpponentDrawerOpen) {
      const currentResistances = createOpponentForm.getValues("resistances");
      const isAlreadyAdded = currentResistances.some(
        (cRe) => cRe === resistance.id,
      );

      if (!isAlreadyAdded) {
        createOpponentForm.setValue("resistances", [
          ...currentResistances,
          resistance.id,
        ]);

        toast({
          variant: "default",
          title: `Added ${resistance.icon} ${resistance.name} `,
        });
      } else {
        toast({
          variant: "default",
          title: "Already Added",
        });
      }
    }
  }

  function handleCreateDrawerChange(state: boolean) {
    if (state) {
      openCreateDrawer();
    } else {
      closeCreateDrawer();
    }
  }

  function handleEncounterDrawerOpenChange(state: boolean) {
    if (state) {
      openCreateEncounterDrawer();
    } else {
      closeEncounterDrawer();
      setCurrentElement(null);
    }
  }

  async function handleAddOpponentToEncounter(opponentId: Opponent["id"]) {
    // @ts-expect-error
    const opponent = opponents.data.find(
      (opponent) => opponent.id === opponentId,
    );

    if (opponent) {
      const encounterOpponent = Object.assign(opponent, {
        immunities: opponent.immunities.map((im: DBImmunity) => im.id),
        resistances: opponent.resistances.map((res: DBResistance) => res.id),
        effects: opponent.effects.map((effect: DBEffect) => effect.id),
        blueprint: opponent.id,
      });

      delete encounterOpponent.id;

      const createdEncounterOpponent =
        await createEncounterOpponentMutation.mutateAsync(opponent);

      createEncounterForm.form.setValue("opponents", [
        ...createEncounterForm.form.getValues("opponents"),
        createdEncounterOpponent.id,
      ]);

      setSelectedEncounterOpponents((prev) => [
        ...prev,
        createdEncounterOpponent,
      ]);

      closeOpponentsCatalog();
    }
  }

  function handleRemoveEncounterOpponent(opponentId: EncounterOpponent["id"]) {
    deleteEncounterOpponentMutation.mutate(opponentId);

    setSelectedEncounterOpponents((prev) =>
      prev.filter((opponent) => opponent.id !== opponentId),
    );
  }

  function handleCreateEncounter(encounter: Omit<Encounter, "id">) {
    createEncounterMutation.mutate(encounter);

    setSelectedEncounterOpponents([]);
    createEncounterForm.form.reset();
  }

  return (
    <>
      {party.data && players.data && (
        <PlayerCatalog
          partyId={party.data.id}
          open={isPlayersCatalogOpen}
          onOpenChange={handlePlayersCatalogOpen}
          onAdd={(partyId, playerId) =>
            addPlayerToParty.mutate({ partyId, playerId })
          }
          excludedPlayers={party.data.players}
          players={players.data}
        />
      )}

      {immunities.data && resistances.data && (
        <CreatePlayerDrawer
          form={createPlayerForm}
          open={isCreatePlayerDrawerOpen}
          loading={createPlayer.isPending}
          immunities={immunities.data || []}
          resistances={resistances.data || []}
          onOpenChange={(state) =>
            state ? openCreatePlayerDrawer() : closeCreatePlayerDrawer()
          }
          onCreate={createPlayer.mutate}
          onOpenImmunityCatalog={openImmunititesCatalog}
          onOpenResistanceCatalog={openResistancesCatalog}
          onCreateImmunity={openCreateImmunityDrawer}
          onCreateResistance={openCreateResistanceDrawer}
        />
      )}

      <EditPlayerDrawer
        player={selectedPlayer}
        open={isEditPlayerDrawerOpen}
        loading={updatePlayer.isPending}
        form={editPlayerForm}
        onOpenChange={(state: boolean) =>
          state ? openEditPlayerDrawer() : closeEditPlayerDrawer()
        }
        onSave={updatePlayer.mutate}
      />

      {immunities.data && resistances.data && (
        <CreateOpponentDrawer
          form={createOpponentForm}
          open={isCreateOpponentDrawerOpen}
          loading={false} //TODO mutation isLoading
          immunities={immunities.data || []}
          resistances={resistances.data || []}
          onOpenChange={(state) =>
            state ? openCreateOpponentDrawer() : closeCreateOpponentDrawer()
          }
          onCreate={createOpponentMutation.mutate}
          onOpenImmunityCatalog={openImmunititesCatalog}
          onOpenResistanceCatalog={openResistancesCatalog}
          onCreateImmunity={openCreateImmunityDrawer}
          onCreateResistance={openCreateResistanceDrawer}
        />
      )}

      <CreatePartyDrawer
        open={isCreateDrawerOpen}
        onOpenChange={handleCreateDrawerChange}
        isCreating={createPartyMutation.isPending}
        onCreate={createPartyMutation.mutate}
      />

      {currentParty && (
        <CreateChapterDrawer
          isCreating={createChapterMutation.isPending}
          open={isCreateChapterDrawerOpen && !!currentParty}
          onOpenChange={(state: boolean) =>
            state ? openCreateChapterDrawer() : closeCreateChapterDrawer()
          }
          onCreate={createChapterMutation.mutate}
          partyId={currentParty}
        />
      )}

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

      {immunities.data && (
        <ImmunitiesCatalog
          immunities={immunities.data}
          open={isImmunitiesCatalogOpen}
          onOpenChange={(state: boolean) =>
            state ? openImmunititesCatalog() : closeImmunitiesCatalog()
          }
          onAdd={handleAddImmunity}
        />
      )}

      {resistances.data && (
        <ResistancesCatalog
          resistances={resistances.data}
          open={isResistanceCatalogOpen}
          onOpenChange={(state: boolean) =>
            state ? openResistancesCatalog() : closeResistancesCatalog()
          }
          onAdd={handleAddResistance}
        />
      )}

      <CreateEncounterDrawer
        form={createEncounterForm}
        opponents={opponents.data || []}
        element={currentEncounterElement}
        onCreate={handleCreateEncounter}
        isCreating={false}
        open={isCreateEncounterDrawerOpen}
        onOpenChange={handleEncounterDrawerOpenChange}
        onCreateOpponent={() => {
          openCreateOpponentDrawer();
        }}
        onOpenOpponentsCatalog={() => openOpponentsCatalog()}
        selectedOpponents={selectedEncounterOpponents}
        onRemoveOpponent={handleRemoveEncounterOpponent}
      />

      <OpponentsCatalog
        open={isOpponentsCatalogOpen}
        onOpenChange={(state) =>
          state ? openOpponentsCatalog() : closeOpponentsCatalog()
        }
        onAdd={handleAddOpponentToEncounter}
        opponents={opponents.data || []}
      />

      <CreateImmunityDrawer
        isCreating={createImmunity.isPending}
        open={isCreateImmunityDrawerOpen}
        onOpenChange={(state: boolean) =>
          state ? openCreateImmunityDrawer() : closeCreateImmunityDrawer()
        }
        onCreate={createImmunity.mutate}
      />

      <CreateResistanceDrawer
        isCreating={createResistance.isPending}
        open={isCreateResistanceDrawerOpen}
        onOpenChange={(state: boolean) =>
          state ? openCreateResistanceDrawer() : closeCreateResistanceDrawer()
        }
        onCreate={createResistance.mutate}
      />

      <CreateEffectDrawer
        isCreating={createEffect.isPending}
        open={true}
        onOpenChange={(state: boolean) =>
          state ? openCreateEffectDrawer() : closeCreateEffectDrawer()
        }
        onCreate={createEffect.mutate}
      />

      <SettingsDialog
        open={isSettingsDialogOpen}
        onOpenChange={(state: boolean) =>
          state ? openSettingsDialog() : closeSettingsDialog()
        }
        players={players.data || []}
        onDeletePlayer={deletePlayer.mutate}
      />

      <EditChapterDrawer
        chapter={editingChapter}
        loading={updateChapterMutation.isPending || deleteChapter.isPending}
        open={isEditChapterDrawerOpen}
        onOpenChange={closeEditChapterDrawer}
        onSave={updateChapterMutation.mutate}
        onDelete={deleteChapter.mutate}
      />
    </>
  );
}

export default GlobalModals;
