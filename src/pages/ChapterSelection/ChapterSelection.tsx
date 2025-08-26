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
import { Chapter, DBChapter } from "@/types/chapters";
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
import { toast } from "@/hooks/use-toast";

type Props = {
  party: Party;
  chapters: Chapter[];
  isLoading: boolean;
  onRemovePlayerFromParty: (data: {
    partyId: Party["id"];
    playerId: Player["id"];
  }) => Promise<void>;
  onRemoveImmunityFromPlayer: (data: {
    playerId: Player["id"];
    immunityId: DBImmunity["id"];
  }) => Promise<DBImmunity>;
  onRemoveResistanceFromPlayer: (data: {
    playerId: Player["id"];
    resistanceId: DBResistance["id"];
  }) => Promise<DBResistance>;
  onRemoveEffectFromPlayer: (data: {
    playerId: Player["id"];
    effectId: DBEffect["id"];
  }) => Promise<Effect>;
  onCreateChapter: (chapter: Omit<Chapter, "id">) => Promise<DBChapter>;
  onEditChapter: (chapter: Chapter) => Promise<Chapter>;
  onDeleteChapter: (id: Chapter["id"]) => Promise<void>;
  onCreatePlayer: (player: TCreatePlayer) => Promise<Player>;
  onEditPlayer: (player: Player) => Promise<Player>;
  onAddPlayerToParty: (data: {
    partyId: Party["id"];
    playerId: Player["id"];
  }) => Promise<Player>;
  onCreateEffect: (effect: Omit<Effect, "id">) => Promise<Effect>;
  onAddEffectToPlayer: (data: {
    playerId: Player["id"];
    effectId: Effect["id"];
  }) => Promise<Player>;
  onCreateImmunity: (immunity: Immunity) => Promise<DBImmunity>;
  onAddImmunityToPlayer: (data: {
    playerId: Player["id"];
    immunityId: DBImmunity["id"];
  }) => Promise<Player>;
  onCreateResistance: (resistance: Resistance) => Promise<DBResistance>;
  onAddResistanceToPlayer: (data: {
    playerId: Player["id"];
    resistanceId: DBResistance["id"];
  }) => Promise<Player>;
};

function ChapterSelection({
  party,
  chapters,
  isLoading,
  onRemovePlayerFromParty,
  onRemoveImmunityFromPlayer,
  onRemoveResistanceFromPlayer,
  onRemoveEffectFromPlayer,
  onCreateChapter,
  onEditChapter,
  onDeleteChapter,
  onCreatePlayer,
  onEditPlayer,
  onAddPlayerToParty,
  onCreateEffect,
  onAddEffectToPlayer,
  onCreateImmunity,
  onAddImmunityToPlayer,
  onCreateResistance,
  onAddResistanceToPlayer,
}: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation("PageChapterSelection");
  const keysPressed = useRef<Record<string, boolean>>({});
  const openOverlay = useOverlayStore((s) => s.open);

  const { isAsideOpen, openAside, closeAside, setCurrentChapter } =
    useChapterStore(
      useShallow((state) => ({
        isAsideOpen: state.isAsideOpen,
        openAside: state.openAside,
        closeAside: state.closeAside,
        setCurrentChapter: state.setCurrentChapter,
      })),
    );

  const createPlayer = useMutationWithErrorToast({
    mutationFn: onCreatePlayer,
    onSuccess: (player: Player) => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      toast({
        variant: "default",
        title: `Created ${player.icon} ${player.name}`,
      });
    },
  });

  const editPlayer = useMutationWithErrorToast({
    mutationFn: onEditPlayer,
    onSuccess: (_player: Player) => {
      console.log("invalidation");
      queryClient.invalidateQueries({ queryKey: ["players"] });
      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["parties"] });
    },
  });

  const removePlayerFromPartyMutation = useMutationWithErrorToast({
    mutationFn: onRemovePlayerFromParty,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["party"],
      });
    },
  });

  const createChapterMutation = useMutationWithErrorToast({
    mutationFn: onCreateChapter,
  });

  const editChapterMutation = useMutationWithErrorToast({
    mutationFn: onEditChapter,
  });

  const deleteChapterMutation = useMutationWithErrorToast({
    mutationFn: onDeleteChapter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
  });

  const addPlayerToPartyMutation = useMutationWithErrorToast({
    mutationFn: onAddPlayerToParty,
  });

  const createEffectMutation = useMutationWithErrorToast({
    mutationFn: onCreateEffect,
  });

  const createImmunityMutation = useMutationWithErrorToast({
    mutationFn: onCreateImmunity,
  });

  const addEffectToPlayerMutation = useMutationWithErrorToast({
    mutationFn: onAddEffectToPlayer,
  });

  const addImmunityToPlayerMutation = useMutationWithErrorToast({
    mutationFn: onAddImmunityToPlayer,
  });

  const addResistanceToPlayerMutation = useMutationWithErrorToast({
    mutationFn: onAddResistanceToPlayer,
  });

  const createResistanceMutation = useMutationWithErrorToast({
    mutationFn: onCreateResistance,
  });

  const removeImmunityFromPlayerMutation = useMutationWithErrorToast({
    mutationFn: onRemoveImmunityFromPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["party"],
      });
      queryClient.invalidateQueries({
        queryKey: ["players"],
      });
    },
  });

  const removeResistanceFromPlayerMutation = useMutationWithErrorToast({
    mutationFn: onRemoveResistanceFromPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["party"],
      });
      queryClient.invalidateQueries({
        queryKey: ["players"],
      });
    },
  });

  const removeEffectFromPlayerMutation = useMutationWithErrorToast({
    mutationFn: onRemoveEffectFromPlayer,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["party"],
      });
      queryClient.invalidateQueries({
        queryKey: ["players"],
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
        await addPlayerToPartyMutation.mutateAsync({ partyId, playerId });

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
      onComplete: (_chapter) => {
        queryClient.invalidateQueries({ queryKey: ["chapters"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
      },
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

  function handleImmunitiesCatalog(player: Player) {
    openOverlay("immunity.catalog", {
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

  function handleResistancesCatalog(player: Player) {
    openOverlay("resistance.catalog", {
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

  function handleEditChapter(chapter: Chapter) {
    openOverlay("chapter.edit", {
      chapter,
      onEdit: (chapter) => editChapterMutation.mutateAsync(chapter),
      onDelete: (chapterId) => deleteChapterMutation.mutateAsync(chapterId),
      onComplete: (_result) => {
        queryClient.invalidateQueries({ queryKey: ["chapters"] });
      },
    });
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
        await addPlayerToPartyMutation.mutateAsync({
          partyId: party.id,
          playerId: player.id,
        });
        queryClient.invalidateQueries({ queryKey: ["parties"] });
        queryClient.invalidateQueries({ queryKey: ["party"] });
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
        queryClient.invalidateQueries({ queryKey: ["players"] });
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
                onRemove={(playerId) =>
                  removePlayerFromPartyMutation.mutateAsync({
                    partyId: party.id,
                    playerId,
                  })
                }
                onEdit={handleOpenEditPlayer}
                onRemoveImmunity={(playerId, immunityId) =>
                  removeImmunityFromPlayerMutation.mutateAsync({
                    playerId,
                    immunityId,
                  })
                }
                onRemoveResistance={(playerId, resistanceId) =>
                  removeResistanceFromPlayerMutation.mutateAsync({
                    playerId,
                    resistanceId,
                  })
                }
                onRemoveEffect={(playerId, effectId) =>
                  removeEffectFromPlayerMutation.mutateAsync({
                    playerId,
                    effectId,
                  })
                }
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
