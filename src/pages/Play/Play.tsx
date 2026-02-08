import db from "@/lib/database";
import PlayLayout from "@/components/PlayLayout/PlayLayout";
import { AnimatePresence, motion } from "framer-motion";
import Canvas, {
  CanvasElement,
  ClickableCanvasElement,
} from "@/components/Canvas/Canvas";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CardStackPlusIcon,
} from "@radix-ui/react-icons";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { useEffect, useRef, useState, useMemo } from "react";
import { Token } from "@/types/tokens";
import { Player } from "@/types/player";
import { DBImmunity, Immunity } from "@/types/immunitiy";
import { DBResistance, Resistance } from "@/types/resistances";
import { Effect } from "@/types/effect";
import { toast } from "@/hooks/use-toast";
import { Chapter } from "@/types/chapters";
import { Encounter } from "@/types/encounter";
import { CancelReason } from "@/types/overlay";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { RiArrowLeftBoxLine, RiUserAddFill } from "react-icons/ri";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Party } from "@/types/party";
import PlayerCard from "@/components/PlayerCard/PlayerCard";
import CombatControls from "@/components/CombatControls/CombatControls";
import InitiativeMenue from "@/components/InitiativeMenue/InitiativeMenue";
import ActiveEffectsMenue from "@/components/ActiveEffectsMenue/ActiveEffectsMenue";
import Initiative from "@/components/Initiative/Initiative";
import { InitiativeMenuEntity } from "@/types/initiative";
import { BedSingleIcon, CoffeeIcon, NotebookText } from "lucide-react";

// Hooks
import { useCombatState, useCombatActions } from "@/hooks/useCombat";
import {
  useEncounterOpponentsDetailed,
  useAddEffectToEncounterOpponent,
  useUpdateEncounterOpponent,
} from "@/hooks/useEncounterOpponents";
import { useRests } from "@/hooks/useRests";
import { useCreateLog } from "@/hooks/useLogs";
import {
  useUpdatePlayer,
  useAddEffectToPlayer,
  useAddResistanceToPlayer,
  useAddImmunityToPlayer,
  useRemoveImmunityFromPlayer,
  useRemoveResistanceFromPlayer,
  useRemoveEffectFromPlayer,
  useCreatePlayer,
} from "@/hooks/usePlayers";
import { useAddPlayer, useRemovePlayer } from "@/hooks/useParties";
import { useUpdateImmunity, useCreateImmunity } from "@/hooks/useImmunities";
import {
  useUpdateResistance,
  useCreateResistance,
} from "@/hooks/useResistances";
import { useUpdateEffect, useCreateEffect } from "@/hooks/useEffects";
import {
  useUpdateEncounter,
  useCreateEncounterMutation,
  useDeleteEncounter,
} from "@/hooks/useEncounters";
import { useUpdateToken, useCreateTokensForEncounter } from "@/hooks/useTokens";
import {
  useAddEncounterToChapter,
  useUpdateChapterProperty,
} from "@/hooks/useChapters";

type Props = {
  partyId: Party["id"];
  database: typeof db;
  chapter: Chapter;
  encounters: Encounter[];
  players: Player[];
  tokens: Token[];
};

function Play({
  partyId,
  database,
  chapter,
  encounters,
  tokens,
  players,
}: Props) {
  const { t } = useTranslation("PagePlay");
  // @ts-ignore
  const navigate = useNavigate({ from: "/play/" });
  const search = useSearch({ from: "/play/" });
  // @ts-ignore
  const selectedTokenId = search.selectedToken;

  const queryClient = useQueryClient();
  const openOverlay = useOverlayStore((s) => s.open);
  const keysPressed = useRef<Record<string, boolean>>({});

  const [tempElement, setTempElement] = useState<undefined | CanvasElement>(
    undefined,
  );

  const selectedToken =
    tokens.find((t) => t.id === Number(selectedTokenId)) || null;

  const [isAsideOpen, setIsAsideOpen] = useState<boolean>(false);
  const [isInitiativeMenuOpen, setIsInitiativeMenuOpen] =
    useState<boolean>(false);
  const [isActiveEffectsMenuOpen, setIsActiveEffectsMenuOpen] =
    useState<boolean>(false);

  const { data: combatState } = useCombatState(chapter.id);
  const {
    createCombat,
    addParticipant,
    removeParticipant,
    updateInitiative,
    resetInitiative,
    finishCombat,
    nextTurn,
  } = useCombatActions(chapter.id);
  const { shortRest, longRest } = useRests();
  const createLogMutation = useCreateLog(database);
  const addEffectToEncounterOpponentMutation =
    useAddEffectToEncounterOpponent(database);
  const updateEncounterOpponentMutation = useUpdateEncounterOpponent(database);
  const encounterOpponents = useEncounterOpponentsDetailed(database);
  const encounterOpponentsRef = useRef(encounterOpponents);
  encounterOpponentsRef.current = encounterOpponents;

  const playersRef = useRef(players);
  playersRef.current = players;

  const selectedInitiativeEntities = useMemo(() => {
    if (!combatState) return [];
    const entities = combatState.participants.map((p) => {
      const participantEffects = combatState.effects.filter(
        (e) => e.participantId === p.id,
      );

      if (p.entityType === "player") {
        const player = players.find((pl) => pl.id === p.entityId);
        if (player) {
          const entity: InitiativeMenuEntity = {
            type: "player",
            properties: player,
            initiative: p.initiative,
            effects: participantEffects,
          };
          return entity;
        }
      } else if (p.entityType === "opponent") {
        const opponent = encounterOpponents.data?.find(
          (op: any) => op.id === p.entityId,
        );
        if (opponent) {
          const entity: InitiativeMenuEntity = {
            type: "encounterOpponent",
            properties: opponent,
            initiative: p.initiative,
            effects: participantEffects,
          };
          return entity;
        }
      }
      return null;
    });

    return entities
      .filter((e): e is InitiativeMenuEntity => e !== null)
      .sort((a, b) => b.initiative - a.initiative);
  }, [combatState, players, encounterOpponents.data]);

  const { data: secondsPerRound } = useQuery({
    queryKey: ["settings", "secondsPerRound"],
    queryFn: async () => {
      const value = await database.settings.get("seconds_per_round");
      return value ? parseInt(value, 10) : 6;
    },
  });

  const initiativeEntities = useMemo(() => {
    return selectedInitiativeEntities.map((entity, index) => ({
      ...entity.properties,
      type: entity.type === "player" ? "player" : "encounterOpponent",
      position: index + 1,
    }));
  }, [selectedInitiativeEntities]);

  const activePosition = useMemo(() => {
    if (!combatState) return 0;
    const activeParticipant = combatState.participants.find(
      (p) => p.id === combatState.combat.activeParticipantId,
    );
    if (!activeParticipant) return 0;

    const index = selectedInitiativeEntities.findIndex((p) => {
      if (p.properties.id !== activeParticipant.entityId) return false;

      if (activeParticipant.entityType === "player") {
        return p.type === "player";
      }
      if (activeParticipant.entityType === "opponent") {
        return p.type === "encounterOpponent";
      }
      return false;
    });
    return index + 1;
  }, [combatState, selectedInitiativeEntities]);

  const time = useMemo(() => {
    if (!combatState || !secondsPerRound) return 0;
    return (combatState.combat.round - 1) * secondsPerRound;
  }, [combatState, secondsPerRound]);

  const availableOpponents = useMemo(() => {
    if (!combatState || !encounterOpponents.data) return [];
    return encounterOpponents.data;
  }, [combatState, encounterOpponents.data]);

  const editImmunity = useUpdateImmunity(database);
  const editResistance = useUpdateResistance(database);
  const editEffect = useUpdateEffect(database);
  const editPlayer = useUpdatePlayer(database);
  const addEffectToPlayerMutation = useAddEffectToPlayer(database);
  const addResistanceToPlayerMutation = useAddResistanceToPlayer(database);
  const addImmunityToPlayerMutation = useAddImmunityToPlayer(database);
  const addPlayerToPartyMutation = useAddPlayer(database);
  const removePlayerFromPartyMutation = useRemovePlayer(database);
  const removeImmunityFromPlayerMutation =
    useRemoveImmunityFromPlayer(database);
  const removeResistanceFromPlayerMutation =
    useRemoveResistanceFromPlayer(database);
  const removeEffectFromPlayerMutation = useRemoveEffectFromPlayer(database);

  const updateEncounterMutation = useUpdateEncounter(database);
  const updateTokenMutation = useUpdateToken(database);

  const createEncounterMutation = useCreateEncounterMutation(database);
  const addEncounterToChapterMutation = useAddEncounterToChapter(database);
  const createTokensForEncounterMutation =
    useCreateTokensForEncounter(database);

  const updateChapterPropertyMutation = useUpdateChapterProperty(database);
  const deleteEncounterSimpleMutation = useDeleteEncounter(database);

  async function handleDeleteEncounter(encounterId: number) {
    await updateChapterPropertyMutation.mutateAsync({
      chapterId: chapter.id,
      property: "encounters",
      value: chapter.encounters.filter((enc) => enc !== encounterId),
    });
    await deleteEncounterSimpleMutation.mutateAsync(encounterId);
  }

  function handleShortRest() {
    shortRest.mutate(undefined, {
      onSuccess: async () => {
        toast({ title: t("shortRestTriggered") });
        if (chapter.id) {
          await createLogMutation.mutateAsync({
            chapterId: chapter.id,
            title: t("shortRest"),
            description: t("shortRestLogDescription"),
            icon: "☕",
            type: "rest",
          });
        }
      },
    });
  }

  function handleLongRest() {
    longRest.mutate(undefined, {
      onSuccess: async () => {
        toast({ title: t("longRestTriggered") });
        if (chapter.id) {
          await createLogMutation.mutateAsync({
            chapterId: chapter.id,
            title: t("longRest"),
            description: t("longRestLogDescription"),
            icon: "🛏️",
            type: "rest",
          });
        }
      },
    });
  }

  function handleEffectsCatalog(player: Player) {
    openOverlay("effect.catalog", {
      database,
      onSelect: async (effect) => {
        await addEffectToPlayerMutation.mutateAsync({
          playerId: player.id,
          effectId: effect.id,
        });

        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["parties"] });

        toast({
          title: `Added ${effect.icon} ${effect.name} to ${player.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Immunity Catalog cancelled:", reason);
      },
    });
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current[event.key] = true;

      if (keysPressed.current["Meta"] && event.key.toLowerCase() === "s") {
        console.log("handleKeyDown Meta+S called");
        setIsAsideOpen((prev) => !prev);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      delete keysPressed.current[event.key];
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  function handleResistancesCatalog(player: Player) {
    openOverlay("resistance.catalog", {
      database,
      onSelect: async (resistance) => {
        await addResistanceToPlayerMutation.mutateAsync({
          playerId: player.id,
          resistanceId: resistance.id,
        });

        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["parties"] });

        toast({
          title: `Added ${resistance.icon} ${resistance.name} to ${player.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Resistance Catalog cancelled:", reason);
      },
    });
  }

  function handleOpenEditImmunity(immunity: DBImmunity) {
    openOverlay("immunity.edit", {
      immunity,
      onEdit: (immunity: DBImmunity) => editImmunity.mutateAsync(immunity),
      onComplete: (_immunity) => {
        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["immunites"] });
      },
    });
  }

  function handleOpenEditResistance(resistance: DBResistance) {
    openOverlay("resistance.edit", {
      resistance,
      onEdit: (resistance: DBResistance) =>
        editResistance.mutateAsync(resistance),
      onComplete: (_resistance) => {
        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["resistances"] });
      },
    });
  }

  function handleOpenEditEffect(effect: Effect) {
    openOverlay("effect.edit", {
      effect,
      onEdit: (effect: Effect) => editEffect.mutateAsync(effect),
      onComplete: (_effect) => {
        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["effect"] });
      },
    });
  }

  const createEffectMutation = useCreateEffect(database);
  const createImmunityMutation = useCreateImmunity(database);
  const createResistanceMutation = useCreateResistance(database);
  const createPlayerMutation = useCreatePlayer(database);

  function handleOpenEditPlayer(player: Player) {
    openOverlay("player.edit", {
      player,
      onEdit: (player) => editPlayer.mutateAsync(player),
      onComplete: async (_player) => {
        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["parties"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
      },
      onCancel: (reason) => {
        console.log("Player creation cancelled:", reason);
      },
    });
  }

  function handleImmunitiesCatalog(player: Player) {
    openOverlay("immunity.catalog", {
      database,
      onSelect: async (immunity) => {
        await addImmunityToPlayerMutation.mutateAsync({
          playerId: player.id,
          immunityId: immunity.id,
        });

        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["parties"] });

        toast({
          title: `Added ${immunity.icon} ${immunity.name} to ${player.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Immunity Catalog cancelled:", reason);
      },
    });
  }

  function handleInitiativeAdd(entity: InitiativeMenuEntity) {
    if (!combatState) return;
    addParticipant.mutate({
      combatId: combatState.combat.id,
      name: entity.properties.name,
      initiative: 0,
      entityId: entity.properties.id,
      entityType: entity.type === "player" ? "player" : "opponent",
    });
  }

  function handleInitiativeRemove(entity: InitiativeMenuEntity) {
    if (!combatState) return;
    const participant = combatState.participants.find(
      (p) =>
        p.entityId === entity.properties.id &&
        p.entityType === (entity.type === "player" ? "player" : "opponent"),
    );
    if (participant) {
      removeParticipant.mutate(participant.id);
    }
  }

  function handleInitiativeChange(entity: InitiativeMenuEntity, value: number) {
    if (!combatState) return;
    const participant = combatState.participants.find(
      (p) =>
        p.entityId === entity.properties.id &&
        p.entityType === (entity.type === "player" ? "player" : "opponent"),
    );
    if (participant) {
      updateInitiative.mutate({
        participantId: participant.id,
        newInitiative: value,
      });
    }
  }

  function handleInitiativeReset() {
    if (!combatState) return;
    resetInitiative.mutate(combatState.combat.id);
  }

  function handleSelectTokenFromInitiative(entity: InitiativeMenuEntity) {
    const tokenType = entity.type === "player" ? "player" : "opponent";
    const token = tokens.find(
      (t) => t.type === tokenType && t.entity === entity.properties.id,
    );
    handleTokenSelect(token || null);
  }

  function handleOpenEffectsCatalog(
    entityId: number,
    type: "player" | "opponent",
  ) {
    if (type === "player") {
      const player = players.find((p) => p.id === entityId);
      if (player) handleEffectsCatalog(player);
    } else {
      const opponent = encounterOpponents.data?.find((o) => o.id === entityId);
      if (!opponent) return;

      openOverlay("effect.catalog", {
        database,
        onSelect: async (effect) => {
          await addEffectToEncounterOpponentMutation.mutateAsync({
            opponentId: entityId,
            effectId: effect.id,
          });

          queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });
          queryClient.invalidateQueries({ queryKey: ["party"] });

          toast({
            title: `Added ${effect.icon} ${effect.name} to ${opponent.name}`,
          });
        },
        onCancel: (reason) => {
          console.log("Effect Catalog cancelled:", reason);
        },
      });
    }
  }

  function handleCreateEncounter(element: CanvasElement) {
    openOverlay("encounter.create", {
      onCreate: async (encounter) => {
        const encounterWithElement: Omit<Encounter, "id"> = {
          ...encounter,
          // @ts-ignore
          element: { ...element, color: encounter.color, icon: encounter.icon },
        };
        const created =
          await createEncounterMutation.mutateAsync(encounterWithElement);

        await addEncounterToChapterMutation.mutateAsync({
          chapterId: chapter.id,
          encounterId: created.id,
        });

        return created;
      },
      onComplete: async (encounter) => {
        setTempElement(undefined);

        if (chapter.id) {
          await createTokensForEncounterMutation.mutateAsync({
            chapterId: Number(chapter.id), // Ensure number
            encounter,
          });
        }

        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["tokens"] });
        queryClient.invalidateQueries({ queryKey: ["chapter"] });
        queryClient.invalidateQueries({ queryKey: ["encounters"] });
        queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });
      },
      onCancel: (reason: CancelReason) => {
        setTempElement(undefined);
        console.log("Opponent creation cancelled:", reason);
      },
    });
  }

  function handleElementEdit(encounter: Encounter) {
    openOverlay("encounter.edit", {
      encounter,
      onEdit: async (updatedEncounter) => {
        await updateEncounterMutation.mutateAsync(updatedEncounter);
        return updatedEncounter;
      },
      onDelete: async (encounterId) => {
        await handleDeleteEncounter(encounterId);
      },
      onCancel: (reason) => {
        console.log("Element edit cancelled:", reason);
      },
      onComplete: async (updatedEncounter) => {
        if (chapter.id) {
          await createTokensForEncounterMutation.mutateAsync({
            chapterId: Number(chapter.id),
            encounter: updatedEncounter,
          });
        }
      },
    });
  }

  function handleTokenSelect(token: Token | null) {
    navigate({
      // @ts-ignore
      search: (prev: any) => ({
        ...prev,
        selectedToken: token?.id || null,
        partyId: prev.partyId || partyId || null,
        chapterId: prev.chapterId || chapter.id || null,
      }),
    });
  }

  function handleStartFight(encounter: Encounter) {
    if (!encounterOpponentsRef.current.data) return;

    const opponents = encounterOpponentsRef.current.data.filter((opp) =>
      encounter.opponents?.includes(opp.id),
    );

    const participants = [
      ...playersRef.current.map((p) => ({
        name: p.name,
        initiative: 0,
        entityId: p.id,
        type: "player" as const,
      })),
      ...opponents.map((o) => ({
        name: o.name,
        initiative: 0,
        entityId: o.id,
        type: "opponent" as const,
      })),
    ];

    createCombat.mutate({
      chapterId: chapter.id,
      encounterId: encounter.id,
      participants,
    });
  }

  function handleElementClick(encounter: Encounter) {
    openOverlay("encounter.selection", {
      encounterId: encounter.id,
      chapterId: chapter.id,
      onCancel: (reason) => {
        console.log("Encounter selection:", reason);
      },
      onStartFight: () => handleStartFight(encounter),
      isCombatActive: !!combatState,
      onOpponentSelect: (opponentId) => {
        const token = tokens.find(
          (t) => t.type === "opponent" && t.entity === opponentId,
        );
        if (token) {
          handleTokenSelect(token);
        }
      },
    });
  }

  function handleAsideToggle() {
    console.log("handleAsideToggle called");
    setIsAsideOpen(!isAsideOpen);
  }

  function handeOpenCreateElementDrawer(element: CanvasElement) {
    console.trace("handeOpenCreateElementDrawer called", element);
    setTempElement(element);
    handleCreateEncounter(element);
  }

  function handleRemoveFromInitiative(
    entityId: number,
    type: "player" | "opponent",
  ) {
    if (!combatState) return;
    const participant = combatState.participants.find(
      (p) => p.entityId === entityId && p.entityType === type,
    );
    if (participant) {
      removeParticipant.mutate(participant.id);
    }
  }

  function handleAddToInitiative(
    entityId: number,
    type: "player" | "opponent",
    name: string,
  ) {
    if (!combatState) return;
    addParticipant.mutate({
      combatId: combatState.combat.id,
      name,
      initiative: 0,
      entityId,
      entityType: type,
    });
  }

  const initiativeEntityIds = useMemo(() => {
    if (!combatState) return [];
    return combatState.participants
      .filter((p) => p.entityId !== null && p.entityType !== null)
      .map((p) => ({
        id: p.entityId as number,
        type: (p.entityType === "player" ? "player" : "opponent") as
          | "player"
          | "opponent",
      }));
  }, [combatState]);

  async function handleElementMove(
    element: ClickableCanvasElement & { id: any },
  ) {
    const encounter = encounters.find((e) => e.id === element.id);

    if (encounter) {
      const { id, name, onClick, ...elementData } = element;
      const updatedEncounter = {
        ...encounter,
        element: { ...encounter.element, ...elementData },
      };
      await updateEncounterMutation.mutateAsync(updatedEncounter);
    }
  }

  function handleExitPlay() {
    navigate({
      to: "/chapters",
      search: { partyId },
    });
  }

  function handleOpenSessionLog() {
    if (!chapter.id) return;
    openOverlay("session.log", { chapterId: chapter.id });
  }

  function handleCreateEffect() {
    openOverlay("effect.create", {
      onCreate: (effect: Omit<Effect, "id">) =>
        createEffectMutation.mutateAsync(effect),
      onComplete: (effect) => {
        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["effects"] });

        toast({
          title: `Created ${effect.icon} ${effect.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Effect creation cancelled:", reason);
      },
    });
  }

  function handleCreateImmunity() {
    openOverlay("immunity.create", {
      onCreate: (immunity: Immunity) =>
        createImmunityMutation.mutateAsync(immunity),
      onComplete: (immunity) => {
        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["immunities"] });

        toast({
          title: `Created ${immunity.icon} ${immunity.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Immunity creation cancelled:", reason);
      },
    });
  }

  function handleCreateResistance() {
    openOverlay("resistance.create", {
      onCreate: (resistance: Omit<Resistance, "id">) =>
        createResistanceMutation.mutateAsync(resistance),
      onComplete: (resistance) => {
        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["resistances"] });

        toast({
          title: `Created ${resistance.icon} ${resistance.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Resitance creation cancelled:", reason);
      },
    });
  }

  function handlePlayersCatalog() {
    openOverlay("player.catalog", {
      database,
      excludedPlayers: players,
      partyId,
      onSelect: async (pId, playerId) => {
        await addPlayerToPartyMutation.mutateAsync({
          partyId: pId || partyId,
          playerId,
        });
      },
    });
  }

  function handleHealPlayer(playerId: number) {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    openOverlay("health.dialog", {
      currentHealth: player.health,
      maxHealth: player.max_health,
      entityName: player.name,
      type: "heal",
      onConfirm: async (amount, note) => {
        const newHealth = Math.min(player.health + amount, player.max_health);
        await editPlayer.mutateAsync({ ...player, health: newHealth });

        await createLogMutation.mutateAsync({
          chapterId: chapter.id,
          title: t("healedEntity", { name: player.name, amount }),
          description: note,
          icon: "💚",
          type: "heal",
        });
      },
    });
  }

  function handleDamagePlayer(playerId: number) {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;

    openOverlay("health.dialog", {
      currentHealth: player.health,
      maxHealth: player.max_health,
      entityName: player.name,
      type: "damage",
      onConfirm: async (amount, note) => {
        const newHealth = player.health - amount;
        await editPlayer.mutateAsync({ ...player, health: newHealth });

        await createLogMutation.mutateAsync({
          chapterId: chapter.id,
          title: t("damagedEntity", { name: player.name, amount }),
          description: note,
          icon: "💔",
          type: "damage",
        });
      },
    });
  }

  function handleHealOpponent(opponentId: number) {
    const opponent = encounterOpponents.data?.find((o) => o.id === opponentId);
    if (!opponent) return;

    openOverlay("health.dialog", {
      currentHealth: opponent.health,
      maxHealth: opponent.max_health,
      entityName: opponent.name,
      type: "heal",
      onConfirm: async (amount, note) => {
        const newHealth = Math.min(
          opponent.health + amount,
          opponent.max_health,
        );
        await updateEncounterOpponentMutation.mutateAsync({
          ...opponent,
          health: newHealth,
        });

        await createLogMutation.mutateAsync({
          chapterId: chapter.id,
          title: t("healedEntity", { name: opponent.name, amount }),
          description: note,
          icon: "💚",
          type: "heal",
        });
      },
    });
  }

  function handleDamageOpponent(opponentId: number) {
    const opponent = encounterOpponents.data?.find((o) => o.id === opponentId);
    if (!opponent) return;

    openOverlay("health.dialog", {
      currentHealth: opponent.health,
      maxHealth: opponent.max_health,
      entityName: opponent.name,
      type: "damage",
      onConfirm: async (amount, note) => {
        const newHealth = opponent.health - amount;
        await updateEncounterOpponentMutation.mutateAsync({
          ...opponent,
          health: newHealth,
        });

        await createLogMutation.mutateAsync({
          chapterId: chapter.id,
          title: t("damagedEntity", { name: opponent.name, amount }),
          description: note,
          icon: "💔",
          type: "damage",
        });
      },
    });
  }

  function handleOpenCreatePlayer() {
    openOverlay("player.create", {
      database,
      onCreate: (player) => createPlayerMutation.mutateAsync(player),
      onComplete: async (player) => {
        await addPlayerToPartyMutation.mutateAsync({
          partyId,
          playerId: player.id,
        });
        toast({
          variant: "default",
          title: `Created ${player.icon} ${player.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Player creation cancelled:", reason);
      },
    });
  }

  return (
    <PlayLayout isAsideOpen={isAsideOpen} isEncounterOpen={false}>
      {combatState && (
        <PlayLayout.CombatControls>
          <CombatControls
            round={combatState.combat.round}
            time={time}
            onFinish={() => finishCombat.mutate(combatState.combat.id)}
            onNext={() => nextTurn.mutate(combatState.combat.id)}
            onInitiative={() => setIsInitiativeMenuOpen((prev) => !prev)}
            onActiveEffects={() => setIsActiveEffectsMenuOpen((prev) => !prev)}
          />
        </PlayLayout.CombatControls>
      )}

      {combatState && (
        <PlayLayout.Initiative>
          <Initiative
            entities={initiativeEntities}
            activePosition={activePosition}
            onCardClick={(entity) => {
              const tokenType =
                entity.type === "player" ? "player" : "opponent";
              const token = tokens.find(
                (t) => t.type === tokenType && t.entity === entity.id,
              );
              handleTokenSelect(token || null);
            }}
          />
        </PlayLayout.Initiative>
      )}

      {combatState && (
        <PlayLayout.InitiativeMenue>
          <InitiativeMenue
            selected={selectedInitiativeEntities}
            players={players}
            encounterOpponents={availableOpponents || []}
            isOpen={isInitiativeMenuOpen}
            setIsOpen={setIsInitiativeMenuOpen}
            onAdd={handleInitiativeAdd}
            onRemove={handleInitiativeRemove}
            onReset={handleInitiativeReset}
            onInitiativeChange={handleInitiativeChange}
            onSelectToken={handleSelectTokenFromInitiative}
          />
        </PlayLayout.InitiativeMenue>
      )}

      {combatState && (
        <PlayLayout.ActiveEffects>
          <ActiveEffectsMenue
            players={players}
            encounterOpponents={availableOpponents || []}
            isOpen={isActiveEffectsMenuOpen}
            setIsOpen={setIsActiveEffectsMenuOpen}
          />
        </PlayLayout.ActiveEffects>
      )}

      <PlayLayout.Rest>
        <div className="flex gap-2 rounded-full border border-white/80 bg-white/20 p-1 shadow-md backdrop-blur-sm">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleShortRest}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
                >
                  <CoffeeIcon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("shortRest")}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleLongRest}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
                >
                  <BedSingleIcon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("longRest")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </PlayLayout.Rest>

      <PlayLayout.Players>
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            expanded={isAsideOpen}
            onEditImmunity={handleOpenEditImmunity}
            onEditResistance={handleOpenEditResistance}
            onEditEffect={handleOpenEditEffect}
            onRemove={(playerId) => {
              removePlayerFromPartyMutation.mutate({
                partyId,
                playerId,
              });
            }}
            onEdit={handleOpenEditPlayer}
            onRemoveImmunity={(playerId, immunityId) => {
              removeImmunityFromPlayerMutation.mutate({
                playerId,
                immunityId,
              });
            }}
            onRemoveResistance={(playerId, resistanceId) => {
              removeResistanceFromPlayerMutation.mutate({
                playerId,
                resistanceId,
              });
            }}
            onRemoveEffect={(playerId, effectId) => {
              removeEffectFromPlayerMutation.mutate({
                playerId,
                effectId,
              });
            }}
            onOpenEffectsCatalog={() => handleEffectsCatalog(player)}
            onOpenResistancesCatalog={() => handleResistancesCatalog(player)}
            onOpenImmunitiesCatalog={() => handleImmunitiesCatalog(player)}
            onHeal={handleHealPlayer}
            onDamage={handleDamagePlayer}
          />
        ))}
      </PlayLayout.Players>

      <PlayLayout.Settings>
        <motion.div
          className="pointer-events-auto flex flex-col gap-2"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {!isAsideOpen && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <CardStackPlusIcon />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={handleCreateEffect}>
                      {t("createEffect")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCreateImmunity}>
                      {t("createImmunity")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCreateResistance}>
                      {t("createResistance")}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <RiUserAddFill />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={handlePlayersCatalog}>
                      {t("addFromCatalog")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleOpenCreatePlayer}>
                      {t("createNewPlayer")}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleExitPlay}
                      variant="ghost"
                      size="icon"
                    >
                      <RiArrowLeftBoxLine />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("backToChapters")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleAsideToggle} variant="ghost" size="icon">
                  {isAsideOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isAsideOpen ? (
                  <p>{t("closeDetails")} (⌘S)</p>
                ) : (
                  <p>{t("openDetails")} (⌘S)</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </motion.div>
      </PlayLayout.Settings>

      <PlayLayout.SessionLog>
        <div className="flex gap-2 rounded-full border border-white/80 bg-white/20 p-1 shadow-md backdrop-blur-sm">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleOpenSessionLog}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
                >
                  <NotebookText className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("sessionLog")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </PlayLayout.SessionLog>

      <AnimatePresence mode="wait">
        <Canvas
          database={database}
          background={chapter.battlemap || undefined}
          elements={
            encounters.map((enc) => ({
              id: enc.id,
              ...enc.element,
              name: enc.name,
              completed: enc.completed,
              onEdit: () => handleElementEdit(enc),
              onClick: () => handleElementClick(enc),
            })) || []
          }
          temporaryElement={tempElement}
          tokens={tokens}
          players={players}
          selectedToken={selectedToken}
          onTokenSelect={handleTokenSelect}
          onDrawed={handeOpenCreateElementDrawer}
          onTokenMove={updateTokenMutation.mutate}
          onElementMove={handleElementMove}
          onRemoveFromInitiative={handleRemoveFromInitiative}
          onAddToInitiative={handleAddToInitiative}
          onOpenEffectsCatalog={handleOpenEffectsCatalog}
          initiativeEntityIds={initiativeEntityIds}
          onHealPlayer={handleHealPlayer}
          onDamagePlayer={handleDamagePlayer}
          onHealOpponent={handleHealOpponent}
          onDamageOpponent={handleDamageOpponent}
        />
      </AnimatePresence>
    </PlayLayout>
  );
}

export default Play;
