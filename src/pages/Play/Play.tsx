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
  CardStackPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import PlayerCard from "@/components/PlayerCard/PlayerCard";
import { useQueryClient } from "@tanstack/react-query";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { useEffect, useRef, useState } from "react";
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
import { useAddPlayer } from "@/hooks/useParties";
import {
  useAddEffectToPlayer,
  useAddImmunityToPlayer,
  useAddResistanceToPlayer,
  useCreatePlayer,
  useRemoveEffectFromPlayer,
  useRemoveImmunityFromPlayer,
  useRemoveResistanceFromPlayer,
  useUpdatePlayer,
} from "@/hooks/usePlayers";
import {
  useCreateImmunity,
  useUpdateImmunity,
} from "@/hooks/useImmunities";
import {
  useCreateResistance,
  useUpdateResistance,
} from "@/hooks/useResistances";
import { useCreateEffect, useUpdateEffect } from "@/hooks/useEffects";
import {
  useCreateEncounterMutation,
  useDeleteEncounter,
  useUpdateEncounter,
} from "@/hooks/useEncounters";
import {
  useCreateTokensForEncounter,
  useUpdateToken,
} from "@/hooks/useTokens";
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
  const { chapterId } = useSearch({ from: "/play/" });
  const { t } = useTranslation("PagePlay");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const openOverlay = useOverlayStore((s) => s.open);
  const keysPressed = useRef<Record<string, boolean>>({});
  const [tempElement, setTempElement] = useState<undefined | CanvasElement>(
    undefined,
  );
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isAsideOpen, setIsAsideOpen] = useState<boolean>(false);
  const [isCreateEncounterDrawerOpen, setIsCreateEncounterDrawerOpen] =
    useState<boolean>(false);

  const addPlayerToPartyMutation = useAddPlayer(database);
  const editImmunity = useUpdateImmunity(database);
  const editResistance = useUpdateResistance(database);
  const editEffect = useUpdateEffect(database);
  const editPlayer = useUpdatePlayer(database);
  const addEffectToPlayerMutation = useAddEffectToPlayer(database);

  const updateEncounterMutation = useUpdateEncounter(database);
  const updateTokenMutation = useUpdateToken(database);
  const addResistanceToPlayerMutation = useAddResistanceToPlayer(database);
  
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
    //TODO: Shortcut for other OS
    // To open the side menuu when the user presses Meta +  "s" key
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current[event.key] = true;

      if (keysPressed.current["Meta"] && event.key.toLowerCase() === "s") {
        if (isAsideOpen) {
          setIsAsideOpen(false);
        } else {
          setIsAsideOpen(true);
        }
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
  }, [isAsideOpen]);

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

  const createPlayer = useCreatePlayer(database);
  const createEffectMutation = useCreateEffect(database);
  const createImmunityMutation = useCreateImmunity(database);
  const addImmunityToPlayerMutation = useAddImmunityToPlayer(database);
  const createResistanceMutation = useCreateResistance(database);
  const removeImmunityFromPlayerMutation =
    useRemoveImmunityFromPlayer(database);
  const removeResistanceFromPlayerMutation =
    useRemoveResistanceFromPlayer(database);
  const removeEffectFromPlayerMutation = useRemoveEffectFromPlayer(database);

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
        setIsCreateEncounterDrawerOpen(false);
        setTempElement(undefined);

        if (chapterId) {
          await createTokensForEncounterMutation.mutateAsync({
            chapterId: Number(chapterId), // Ensure number
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
        setIsCreateEncounterDrawerOpen(false);
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
        if (chapterId) {
          await createTokensForEncounterMutation.mutateAsync({
            chapterId: Number(chapterId),
            encounter: updatedEncounter,
          });
        }
      },
    });
  }

  function handleElementClick(encounter: Encounter) {
    openOverlay("encounter.selection", {
      encounterId: encounter.id,
      chapterId: chapter.id,
      onCancel: (reason) => {
        console.log("Encounter selection:", reason);
      },
    });
  }

  function handleAsideToggle() {
    setIsAsideOpen(!isAsideOpen);
  }

  function handeOpenCreateElementDrawer(element: CanvasElement) {
    setIsCreateEncounterDrawerOpen(true);
    setTempElement(element);
    handleCreateEncounter(element);
  }

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
      to: `/chapters?partyId=${partyId}`,
    });
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
        queryClient.invalidateQueries({ queryKey: ["immunitites"] });

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
      excludedPlayers: players,
      partyId: partyId,
      onSelect: async (partyId: Party["id"], playerId: Player["id"]) => {
        await addPlayerToPartyMutation.mutateAsync({ partyId, playerId });
      },
      onCancel: (reason) => {
        console.log("Player creation cancelled:", reason);
      },
    });
  }

  function handleOpenCreatePlayer() {
    openOverlay("player.create", {
      database,
      onCreate: (player) => createPlayer.mutateAsync(player),
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
    <PlayLayout
      isAsideOpen={isAsideOpen}
      isEncounterOpen={isCreateEncounterDrawerOpen}
    >
      <PlayLayout.Players>
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            expanded={isAsideOpen}
            onEditImmunity={handleOpenEditImmunity}
            onEditResistance={handleOpenEditResistance}
            onEditEffect={handleOpenEditEffect}
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
          />
        ))}
      </PlayLayout.Players>
      <PlayLayout.Settings>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="flex flex-col gap-2"
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
      <AnimatePresence mode="wait">
        <Canvas
          database={database}
          background={chapter.battlemap || undefined}
          elements={
            encounters.map((enc) => ({
              id: enc.id,
              ...enc.element,
              name: enc.name,
              completed: enc.completed, // Pass the completed status
              opponents: enc.opponents || [],
              onEdit: () => handleElementEdit(enc),
              onClick: () => handleElementClick(enc),
            })) || []
          }
          temporaryElement={tempElement}
          tokens={tokens}
          players={players}
          selectedToken={selectedToken}
          onTokenSelect={setSelectedToken}
          onDrawed={handeOpenCreateElementDrawer}
          onTokenMove={updateTokenMutation.mutate}
          onElementMove={handleElementMove}
        />
      </AnimatePresence>
    </PlayLayout>
  );
}

export default Play;
