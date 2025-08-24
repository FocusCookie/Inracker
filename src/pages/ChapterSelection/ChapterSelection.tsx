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
import { useChapterStore } from "@/stores/useChapterStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Chapter } from "@/types/chapters";
import { DBEffect, Effect } from "@/types/effect";
import { DBImmunity, Immunity } from "@/types/immunitiy";
import { Party } from "@/types/party";
import { Player, TCreatePlayer } from "@/types/player";
import { DBResistance, Resistance } from "@/types/resistances";
import {
  CardStackPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { RiArrowLeftBoxLine, RiUserAddFill } from "react-icons/ri";
import { useShallow } from "zustand/shallow";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { useMutationWithErrorToast } from "@/hooks/useMutationWithErrorToast";
import db from "@/lib/database";
import { toast } from "@/hooks/use-toast";

type Props = {
  party: Party;
  chapters: Chapter[];
  isLoading: boolean;
  onRemovePlayerFromParty: (id: Player["id"]) => void;
  onRemoveImmunityFromPlayer: (
    playerId: Player["id"],
    immunityId: DBImmunity["id"],
  ) => void;
  onRemoveResistanceFromPlayer: (
    playerId: Player["id"],
    resistanceId: DBResistance["id"],
  ) => void;
  onRemoveEffectFromPlayer: (
    playerId: Player["id"],
    effectId: DBEffect["id"],
  ) => void;
};

function ChapterSelection({
  party,
  chapters,
  isLoading,
  onRemovePlayerFromParty,
  onRemoveImmunityFromPlayer,
  onRemoveResistanceFromPlayer,
  onRemoveEffectFromPlayer,
}: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation("PageChapterSelection");
  const keysPressed = useRef<Record<string, boolean>>({});
  const openOverlay = useOverlayStore((s) => s.open);

  const {
    isAsideOpen,
    openAside,
    closeAside,
    openCreateChapterDrawer,
    openEditChapterDrawer,
    setCurrentChapter,
  } = useChapterStore(
    useShallow((state) => ({
      isAsideOpen: state.isAsideOpen,
      openAside: state.openAside,
      closeAside: state.closeAside,
      openCreateChapterDrawer: state.openCreateChapterDrawer,
      openEditChapterDrawer: state.openEditChapterDrawer,
      setCurrentChapter: state.setCurrentChapter,
    })),
  );
  const { openEditPlayerDrawer, setSelectedPlayer } = usePlayerStore(
    useShallow((state) => ({
      openEditPlayerDrawer: state.openEditPlayerDrawer,
      setSelectedPlayer: state.setSelectedPlayer,
      openPlayersCatalog: state.openPlayersCatalog,
      closePlayersCatalog: state.closePlayersCatalog,
    })),
  );

  const createPlayer = useMutationWithErrorToast({
    mutationFn: (player: TCreatePlayer) => {
      return db.players.create(player);
    },
    onSuccess: (player: Player) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast({
        variant: "default",
        title: `Created ${player.icon} ${player.name}`,
      });
    },
  });

  useEffect(() => {
    //TODO: Shortcut for other OS
    // To open the side menuu when the user presses Meta +  "s" key
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current[event.key] = true;

      if (keysPressed.current["Meta"] && event.key.toLowerCase() === "s") {
        if (isAsideOpen) {
          closeAside();
        } else {
          openAside();
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
    if (isAsideOpen) {
      closeAside();
    } else {
      openAside();
    }
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
        await db.parties.addPlayerToParty(partyId, playerId);

        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["parties"] });
      },
      onCancel: (reason) => {
        console.log("Player creation cancelled:", reason);
      },
    });
  }

  function handleCreateEffect() {
    openOverlay("effect.create", {
      onCreate: async (effect: Omit<Effect, "id">) => {
        const createdEffect = await db.effects.create(effect);

        return createdEffect;
      },
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
      onCreate: async (immunity: Omit<Immunity, "id">) => {
        const created = await db.immunitites.create(immunity);

        return created;
      },
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

  function handleEffectsCatalog(player: Player) {
    openOverlay("effect.catalog", {
      onSelect: async (effect) => {
        await db.players.addEffectToPlayer(player.id, effect.id);

        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["parties"] });
      },
      onCancel: (reason) => {
        console.log("Immunity Catalog cancelled:", reason);
      },
    });
  }

  function handleImmunitiesCatalog(player: Player) {
    openOverlay("immunity.catalog", {
      onSelect: async (immunity) => {
        await db.players.addImmunityToPlayer(player.id, immunity.id);

        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["parties"] });
      },
      onCancel: (reason) => {
        console.log("Immunity Catalog cancelled:", reason);
      },
    });
  }

  function handleResistancesCatalog(player: Player) {
    openOverlay("resistance.catalog", {
      onSelect: async (resistance) => {
        await db.players.addResistanceToPlayer(player.id, resistance.id);

        queryClient.invalidateQueries({ queryKey: ["players"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["parties"] });
      },
      onCancel: (reason) => {
        console.log("Resistance Catalog cancelled:", reason);
      },
    });
  }

  function handleCreateResistance() {
    openOverlay("resistance.create", {
      onCreate: async (resistance: Omit<Resistance, "id">) => {
        const created = await db.resistances.create(resistance);

        return created;
      },
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

  function handleEditChapter(chapter: Chapter) {
    openEditChapterDrawer(chapter);
  }

  function handlePlayChapter(chapter: Chapter["id"]) {
    setCurrentChapter(chapter);
    queryClient.invalidateQueries({ queryKey: ["chapter"] });
    queryClient.invalidateQueries({ queryKey: ["encounters"] });

    navigate({
      to: `/play`,
    });
  }

  function handleOpenCreatePlayer() {
    openOverlay("player.create", {
      onCreate: (player) => createPlayer.mutateAsync(player),
      onComplete: async (player) => {
        await db.parties.addPlayerToParty(party.id, player.id);
        queryClient.invalidateQueries({ queryKey: ["parties"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
      },
      onCancel: (reason) => {
        console.log("Player creation cancelled:", reason);
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
                onRemove={onRemovePlayerFromParty}
                onEdit={(player: Player) => {
                  setSelectedPlayer(player);
                  openEditPlayerDrawer();
                }}
                onRemoveImmunity={onRemoveImmunityFromPlayer}
                onRemoveResistance={onRemoveResistanceFromPlayer}
                onRemoveEffect={onRemoveEffectFromPlayer}
                onOpenEffectsCatalog={() => handleEffectsCatalog(player)}
                onOpenResistancesCatalog={() =>
                  handleResistancesCatalog(player)
                }
                onOpenImmunitiesCatalog={() => handleImmunitiesCatalog(player)}
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

          <div className="flex w-full flex-col items-center gap-4 overflow-hidden">
            <div className="w-content flex flex-col gap-2">
              <TypographyH1>{t("chapters")}</TypographyH1>

              <TypographyP>{t("description")}</TypographyP>
            </div>

            <Button
              onClick={() => openCreateChapterDrawer()}
              variant={chapters.length === 0 ? "default" : "outline"}
            >
              {t("createChapter")}
            </Button>

            <AnimatePresence mode="wait">
              {isLoading && (
                <Loader size="large" title="loading chapters..." key="loader" />
              )}
              {!isLoading && (
                <div className="scrollable-y w-content flex flex-col gap-4 overflow-y-scroll rounded pt-1 pr-2 pb-4">
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
