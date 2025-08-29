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
import CreatePlayerDrawer from "../CreatePlayerDrawer/CreatePlayerDrawer";
import CreateResistanceDrawer from "../CreateResistanceDrawer/CreateResistanceDrawer";
import EditPlayerDrawer from "../EditPlayerDrawer/EditPlayerDrawer";
import ImmunitiesCatalog from "../ImmunitiesCatalog/ImmunitiesCatalog";
import PlayerCatalog from "../PlayerCatalog/PlayerCatalog";
import ResistancesCatalog from "../ResistancesCatalog/ResistancesCatalog";
import SettingsDialog from "../SettingsDialog/SettingsDialog";
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
import EffectsCatalog from "../EffectsCatalog/EffectsCatalog";
import EditEffectDrawer from "../EditEffectDrawer/EditEffectDrawer";
import EditImmunityDrawer from "../EditImmunityDrawer/EditImmunityDrawer";
import EditResistanceDrawer from "../EditResistanceDrawer/EditResistanceDrawer";
import SettingsDrawer from "../SettingsDrawer/SettingsDrawer";

type Props = {};

//TODO: Refacot this component, it is too big and has too many responsibilities

function GlobalModals({}: Props) {
  const queryClient = useQueryClient();
  const createPlayerForm = useCreatePlayer();
  const createOpponentForm = useCreateOpponent();
  const createEncounterForm = useCreateEncounter();
  const [selectedEncounterOpponents, setSelectedEncounterOpponents] = useState<
    EncounterOpponent[]
  >([]);

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
    isImmunitiesCatalogOpen,
    isCreateImmunityDrawerOpen,
    isEditImmunityDrawerOpen,
    setIsCreatingImmunity,
    selectedImmunity,
    setSelectedImmunity,
    closeCreateImmunityDrawer,
    openCreateImmunityDrawer,
    openImmunititesCatalog,
    closeImmunitiesCatalog,
    openEditImmunityDrawer,
    closeEditImmunityDrawer,
  } = useImmunityStore(
    useShallow((state) => ({
      isImmunitiesCatalogOpen: state.isImmunitiesCatalogOpen,
      isCreateImmunityDrawerOpen: state.isCreateImmunityDrawerOpen,
      isEditImmunityDrawerOpen: state.isEditImmunityDrawerOpen,
      setIsCreatingImmunity: state.setIsCreatingImmunity,
      selectedImmunity: state.selectedImmunity,
      setSelectedImmunity: state.setSelectedImmunity,
      openCreateImmunityDrawer: state.openCreateImmunityDrawer,
      closeCreateImmunityDrawer: state.closeCreateImmunityDrawer,
      openImmunititesCatalog: state.openImmunititesCatalog,
      closeImmunitiesCatalog: state.closeImmunitiesCatalog,
      openEditImmunityDrawer: state.openEditImmunityDrawer,
      closeEditImmunityDrawer: state.closeEditImmunityDrawer,
    })),
  );

  const {
    isResistanceCatalogOpen,
    isCreateResistanceDrawerOpen,
    isEditResistanceDrawerOpen,
    setIsCreatingResistance,
    selectedResistance,
    setSelectedResistance,
    closeCreateResistanceDrawer,
    openCreateResistanceDrawer,
    closeResistancesCatalog,
    openResistancesCatalog,
    openEditResistanceDrawer,
    closeEditResistanceDrawer,
  } = useResistancesStore(
    useShallow((state) => ({
      isResistanceCatalogOpen: state.isResistanceCatalogOpen,
      isCreateResistanceDrawerOpen: state.isCreateResistanceDrawerOpen,
      isEditResistanceDrawerOpen: state.isEditResistanceDrawerOpen,
      setIsCreatingResistance: state.setIsCreatingResistance,
      selectedResistance: state.selectedResistance,
      setSelectedResistance: state.setSelectedResistance,
      openCreateResistanceDrawer: state.openCreateResistanceDrawer,
      closeCreateResistanceDrawer: state.closeCreateResistanceDrawer,
      closeResistancesCatalog: state.closeResistancesCatalog,
      openResistancesCatalog: state.openResistancesCatalog,
      openEditResistanceDrawer: state.openEditResistanceDrawer,
      closeEditResistanceDrawer: state.closeEditResistanceDrawer,
    })),
  );

  const {
    isCreateEffectDrawerOpen,
    isEffectsCatalogOpen,
    openCreateEffectDrawer,
    closeCreateEffectDrawer,
    openEffectsCatalog,
    closeEffectsCatalog,
    selectedEffect,
    openEditEffectDrawer,
    closeEditEffectDrawer,
    isEditingEffectDrawerOpen,
    setSelectedEffect,
  } = useEffectStore(
    useShallow((state) => ({
      isCreateEffectDrawerOpen: state.isCreateEffectDrawerOpen,
      isEffectsCatalogOpen: state.isEffectsCatalogOpen,
      openCreateEffectDrawer: state.openCreateEffectDrawer,
      closeCreateEffectDrawer: state.closeCreateEffectDrawer,
      openEffectsCatalog: state.openEffectsCatalog,
      closeEffectsCatalog: state.closeEffectsCatalog,
      selectedEffect: state.selectedEffect,
      openEditEffectDrawer: state.openEditEffectDrawer,
      closeEditEffectDrawer: state.closeEditEffectDrawer,
      isEditingEffectDrawerOpen: state.isEditingEffectDrawerOpen,
      setSelectedEffect: state.setSelectedEffect,
    })),
  );

  const players = useQueryWithToast({
    queryKey: ["players"],
    queryFn: () => db.players.getAllDetailed(),
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

  const effects = useQueryWithToast({
    queryKey: ["effects"],
    queryFn: () => db.effects.getAll(),
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

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["party"],
      });
      queryClient.invalidateQueries({
        queryKey: ["players"],
      });
    },
  });

  const addEffectToPlayer = useMutationWithErrorToast({
    mutationFn: async ({
      playerId,
      effectId: effectId,
    }: {
      playerId: Player["id"];
      effectId: DBEffect["id"];
    }) => {
      return db.players.addEffectToPlayer(playerId, effectId);
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
      return db.effects.create(effect);
    },
    onSuccess: (effect: Effect) => {
      queryClient.invalidateQueries({ queryKey: ["effects"] });
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

  const updateEffect = useMutationWithErrorToast({
    mutationFn: (effect: Effect) => {
      return db.effects.update(effect);
    },
    onSuccess: (effect: Effect) => {
      queryClient.invalidateQueries({ queryKey: ["effects"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });

      toast({
        variant: "default",
        title: `Updated ${effect.icon} ${effect.name}`,
      });
    },
    onSettled: () => {
      closeEditEffectDrawer();
      setSelectedEffect(null);
    },
  });

  const updateImmunity = useMutationWithErrorToast({
    mutationFn: (immunity: DBImmunity) => {
      return db.immunitites.update(immunity);
    },
    onSuccess: (effect: DBImmunity) => {
      queryClient.invalidateQueries({ queryKey: ["immunities"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });

      toast({
        variant: "default",
        title: `Updated ${effect.icon} ${effect.name}`,
      });
    },
    onSettled: () => {
      closeEditImmunityDrawer();
      setSelectedImmunity(null);
    },
  });

  const updateResistance = useMutationWithErrorToast({
    mutationFn: (resistance: DBResistance) => {
      return db.resistances.update(resistance);
    },
    onSuccess: (resistance: DBResistance) => {
      queryClient.invalidateQueries({ queryKey: ["resistances"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });

      toast({
        variant: "default",
        title: `Updated ${resistance.icon} ${resistance.name}`,
      });
    },
    onSettled: () => {
      closeEditResistanceDrawer();
      setSelectedResistance(null);
    },
  });

  const deleteEffect = useMutationWithErrorToast({
    mutationFn: (id: Effect["id"]) => {
      return db.effects.delete(id);
    },
    onSuccess: (deletedEffect: DBEffect) => {
      queryClient.invalidateQueries({ queryKey: ["effects"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });

      toast({
        variant: "default",
        title: `Deleted ${deletedEffect.icon} ${deletedEffect.name}`,
      });
    },
  });

  const deleteImmunity = useMutationWithErrorToast({
    mutationFn: (id: DBImmunity["id"]) => {
      return db.immunitites.delete(id);
    },
    onSuccess: (deletedImmunity: DBImmunity) => {
      queryClient.invalidateQueries({ queryKey: ["immunites"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["opponents"] });

      toast({
        variant: "default",
        title: `Deleted ${deletedImmunity.icon} ${deletedImmunity.name}`,
      });
    },
  });

  const deleteResistance = useMutationWithErrorToast({
    mutationFn: (id: DBResistance["id"]) => {
      return db.resistances.delete(id);
    },
    onSuccess: (deletedResistance: DBImmunity) => {
      queryClient.invalidateQueries({ queryKey: ["resistances"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["opponents"] });

      toast({
        variant: "default",
        title: `Deleted ${deletedResistance.icon} ${deletedResistance.name}`,
      });
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

  function handleEncounterDrawerOpenChange(state: boolean) {
    if (state) {
      openCreateEncounterDrawer();
    } else {
      closeEncounterDrawer();
      setCurrentElement(null);
    }
  }

  function handleRemoveEncounterOpponent(opponentId: EncounterOpponent["id"]) {
    deleteEncounterOpponentMutation.mutate(opponentId);

    setSelectedEncounterOpponents((prev) =>
      prev.filter((opponent) => opponent.id !== opponentId),
    );
  }

  return (
    <>
      
    </>
  );
}

export default GlobalModals;
