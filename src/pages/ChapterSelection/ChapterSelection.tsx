import ChapterCard from "@/components/ChapterCard/ChapterCard";
import Loader from "@/components/Loader/Loader";
import MainLayout from "@/components/MainLayout/MainLayout";
import PlayerCard from "@/components/PlayerCard/PlayerCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TypographyH1 } from "@/components/ui/typographyH1";
import { TypographyP } from "@/components/ui/typographyP";
import { Chapter } from "@/types/chapters";
import { Effect } from "@/types/effect";
import { DBImmunity, Immunity } from "@/types/immunitiy";
import { Party } from "@/types/party";
import { Player } from "@/types/player";
import { DBResistance, Resistance } from "@/types/resistances";
import {
  CardStackPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiArrowLeftBoxLine, RiUserAddFill } from "react-icons/ri";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { toast } from "@/hooks/use-toast";
import {
  useAddPlayer,
  useRemovePlayer,
} from "@/hooks/useParties";
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
  useCreateChapter,
  useDeleteChapter,
  useUpdateChapter,
} from "@/hooks/useChapters";
import {
  useCreateEffect,
  useUpdateEffect,
} from "@/hooks/useEffects";
import {
  useCreateImmunity,
  useUpdateImmunity,
} from "@/hooks/useImmunities";
import {
  useCreateResistance,
  useUpdateResistance,
} from "@/hooks/useResistances";
import database from "@/lib/database";

type Props = {
  database: typeof database;
  party: Party;
  chapters: Chapter[];
  isLoading: boolean;
};

function ChapterSelection({ database, party, chapters, isLoading }: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation("PageChapterSelection");
  const keysPressed = useRef<Record<string, boolean>>({});
  const openOverlay = useOverlayStore((s) => s.open);
  const [isAsideOpen, setIsAsideOpen] = useState(false);

  const removePlayerFromPartyMutation = useRemovePlayer(database);
  const addPlayerToPartyMutation = useAddPlayer(database);

  const createPlayer = useCreatePlayer(database);
  const editPlayer = useUpdatePlayer(database);
  const addEffectToPlayerMutation = useAddEffectToPlayer(database);
  const removeEffectFromPlayerMutation = useRemoveEffectFromPlayer(database);
  const addImmunityToPlayerMutation = useAddImmunityToPlayer(database);
  const removeImmunityFromPlayerMutation = useRemoveImmunityFromPlayer(database);
  const addResistanceToPlayerMutation = useAddResistanceToPlayer(database);
  const removeResistanceFromPlayerMutation = useRemoveResistanceFromPlayer(database);

  const createChapterMutation = useCreateChapter(database);
  const editChapterMutation = useUpdateChapter(database);
  const deleteChapterMutation = useDeleteChapter(database);

  const createEffectMutation = useCreateEffect(database);
  const editEffect = useUpdateEffect(database);

  const createImmunityMutation = useCreateImmunity(database);
  const editImmunity = useUpdateImmunity(database);

  const createResistanceMutation = useCreateResistance(database);
  const editResistance = useUpdateResistance(database);

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

  function handleAsideToggle() {
    setIsAsideOpen(!isAsideOpen);
  }

  function handleExitParty() {
    navigate({
      to: `/parties`,
    });
  }

  function handlePlayersCatalog() {
    openOverlay("player.catalog", {
      excludedPlayers: party.players,
      partyId: party.id,
      onSelect: async (partyId: Party["id"], playerId: Player["id"]) => {
        await addPlayerToPartyMutation.mutateAsync({ partyId, playerId });
      },
      onCancel: (reason) => {
        console.log("Player creation cancelled:", reason);
      },
    });
  }

  function handleCreateEffect() {
    openOverlay("effect.create", {
      onCreate: (effect: Omit<Effect, "id">) =>
        createEffectMutation.mutateAsync(effect),
      onComplete: (effect) => {
        toast({
          title: `Created ${effect.icon} ${effect.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Effect creation cancelled:", reason);
      },
    });
  }

  function handleCreateChapter() {
    openOverlay("chapter.create", {
      partyId: party.id,
      onCreate: async (chapter: Omit<Chapter, "id">) => {
        const newChapter = await createChapterMutation.mutateAsync(chapter);
        return {
          ...newChapter,
          encounters: JSON.parse(newChapter.encounters || "[]"),
        };
      },
      onComplete: (_chapter) => {},
      onCancel: (reason) => {
        console.log("Chapter creation cancelled:", reason);
      },
    });
  }

  function handleCreateImmunity() {
    openOverlay("immunity.create", {
      onCreate: (immunity: Immunity) =>
        createImmunityMutation.mutateAsync(immunity),
      onComplete: (immunity) => {
        toast({
          title: `Created ${immunity.icon} ${immunity.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Immunity creation cancelled:", reason);
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

        toast({
          title: `Added ${effect.icon} ${effect.name} to ${player.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Immunity Catalog cancelled:", reason);
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

        toast({
          title: `Added ${immunity.icon} ${immunity.name} to ${player.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Immunity Catalog cancelled:", reason);
      },
    });
  }

  function handleResistancesCatalog(player: Player) {
    openOverlay("resistance.catalog", {
      database,
      onSelect: async (resistance) => {
        await addResistanceToPlayerMutation.mutateAsync({
          playerId: player.id,
          resistanceId: resistance.id,
        });

        toast({
          title: `Added ${resistance.icon} ${resistance.name} to ${player.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Resistance Catalog cancelled:", reason);
      },
    });
  }

  function handleCreateResistance() {
    openOverlay("resistance.create", {
      onCreate: (resistance: Omit<Resistance, "id">) =>
        createResistanceMutation.mutateAsync(resistance),
      onComplete: (resistance) => {
        toast({
          title: `Created ${resistance.icon} ${resistance.name}`,
        });
      },
      onCancel: (reason) => {
        console.log("Resitance creation cancelled:", reason);
      },
    });
  }

  function handleEditChapter(chapter: Chapter) {
    openOverlay("chapter.edit", {
      chapter,
      onEdit: (chapter) => editChapterMutation.mutateAsync(chapter),
      onDelete: async (chapterId) => {
        const deleted = await deleteChapterMutation.mutateAsync(chapterId);
        toast({
          title: `Deleted ${deleted.icon} ${deleted.name}`,
        });
        return deleted;
      },
      onComplete: (_result) => {},
    });
  }

  function handlePlayChapter(chapterId: Chapter["id"]) {
    queryClient.invalidateQueries({ queryKey: ["chapter"] });
    queryClient.invalidateQueries({ queryKey: ["encounters"] });

    navigate({
      to: `/play`,
      search: {
        partyId: party.id,
        chapterId,
        selectedToken: null,
      },
    });
  }

  function handleOpenCreatePlayer() {
    openOverlay("player.create", {
      database,
      onCreate: (player) => createPlayer.mutateAsync(player),
      onComplete: async (player) => {
        await addPlayerToPartyMutation.mutateAsync({
          partyId: party.id,
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

  function handleOpenEditPlayer(player: Player) {
    openOverlay("player.edit", {
      player,
      onEdit: (player) => editPlayer.mutateAsync(player),
      onComplete: async (player) => {
        console.log("Updated: ", player);
      },
      onCancel: (reason) => {
        console.log("Player creation cancelled:", reason);
      },
    });
  }

  function handleOpenEditImmunity(immunity: DBImmunity) {
    openOverlay("immunity.edit", {
      immunity,
      onEdit: (immunity: DBImmunity) => editImmunity.mutateAsync(immunity),
      onComplete: (immunity) => {
        console.log(`Updated ${immunity.name}`);
      },
    });
  }

  function handleOpenEditResistance(resistance: DBResistance) {
    openOverlay("resistance.edit", {
      resistance,
      onEdit: (resistance: DBResistance) =>
        editResistance.mutateAsync(resistance),
      onComplete: (resistance) => {
        console.log(`Ùpdated ${resistance.name}`);
      },
    });
  }

  function handleOpenEditEffect(effect: Effect) {
    openOverlay("effect.edit", {
      effect,
      onEdit: (effect: Effect) => editEffect.mutateAsync(effect),
      onComplete: (effect) => {
        console.log(`Updated ${effect.name}`);
      },
    });
  }

  function handleHealPlayer(playerId: number) {
    const player = party.players.find((p) => p.id === playerId);
    if (!player) return;

    openOverlay("health.dialog", {
      currentHealth: player.health,
      maxHealth: player.max_health,
      entityName: player.name,
      type: "heal",
      onConfirm: async (amount) => {
        const newHealth = Math.min(player.health + amount, player.max_health);
        await editPlayer.mutateAsync({ ...player, health: newHealth });
        toast({ title: `Healed ${player.name} for ${amount} HP` });
      },
    });
  }

  function handleDamagePlayer(playerId: number) {
    const player = party.players.find((p) => p.id === playerId);
    if (!player) return;

    openOverlay("health.dialog", {
      currentHealth: player.health,
      maxHealth: player.max_health,
      entityName: player.name,
      type: "damage",
      onConfirm: async (amount) => {
        const newHealth = player.health - amount;
        await editPlayer.mutateAsync({ ...player, health: newHealth });
        toast({ title: `Damaged ${player.name} for ${amount} HP` });
      },
    });
  }

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <MainLayout isAsideOpen={false}>
          <Loader size="large" title="Loading Chapters" key="loader-chapters" />
        </MainLayout>
      )}

      {!isLoading && (
        <MainLayout isAsideOpen={isAsideOpen}>
          <MainLayout.Players>
            {party.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                expanded={isAsideOpen}
                onEditImmunity={handleOpenEditImmunity}
                onEditResistance={handleOpenEditResistance}
                onEditEffect={handleOpenEditEffect}
                onRemove={(playerId) => {
                  removePlayerFromPartyMutation.mutate({
                    partyId: party.id,
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
                onOpenResistancesCatalog={() =>
                  handleResistancesCatalog(player)
                }
                onOpenImmunitiesCatalog={() => handleImmunitiesCatalog(player)}
                onHeal={handleHealPlayer}
                onDamage={handleDamagePlayer}
              />
            ))}
          </MainLayout.Players>

          <MainLayout.Settings>
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
                          onClick={handleExitParty}
                          variant="ghost"
                          size="icon"
                        >
                          <RiArrowLeftBoxLine />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("closeParty")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </>
              )}

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleAsideToggle}
                      variant="ghost"
                      size="icon"
                    >
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
          </MainLayout.Settings>

          <div className="md:w-content flex w-full flex-col items-center gap-4 overflow-hidden p-1 md:p-0">
            <div className="flex w-full flex-col gap-2">
              <TypographyH1>{t("chapters")}</TypographyH1>

              <TypographyP>{t("description")}</TypographyP>
            </div>

            <Button
              onClick={handleCreateChapter}
              variant={chapters.length === 0 ? "default" : "outline"}
            >
              {t("createChapter")}
            </Button>

            <AnimatePresence mode="wait">
              {isLoading && (
                <Loader size="large" title="loading chapters..." key="loader" />
              )}
              {!isLoading && (
                <div className="scrollable-y flex w-full flex-col gap-4 overflow-y-scroll rounded pt-1 pr-2 pb-4">
                  {chapters.map((chapter, index) => (
                    <ChapterCard
                      key={`chapter-${chapter.id}`}
                      chapter={chapter}
                      animationDelay={index * 0.05}
                      onEdit={handleEditChapter}
                      onPlay={handlePlayChapter}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </MainLayout>
      )}
    </AnimatePresence>
  );
}

export default ChapterSelection;
