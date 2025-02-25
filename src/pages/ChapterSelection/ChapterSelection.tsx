import MainLayout from "@/components/MainLayout/MainLayout";
import Loader from "@/components/Loader/Loader";
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
import { useChapterStore } from "@/stores/useChapterStore";
import { useImmunityStore } from "@/stores/useImmunityStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useResistancesStore } from "@/stores/useResistanceStore";
import { Chapter } from "@/types/chapters";
import { DBImmunity } from "@/types/immunitiy";
import { Party } from "@/types/party";
import { Player } from "@/types/player";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { RiArrowLeftBoxLine, RiUserAddFill } from "react-icons/ri";
import { useShallow } from "zustand/shallow";
import { DBResistance } from "@/types/resistances";

type Props = {
  party: Party;
  chapters: Chapter[];
  players: Player[];
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
};

function ChapterSelection({
  party,
  chapters,
  isLoading,
  players,
  onRemovePlayerFromParty,
  onRemoveImmunityFromPlayer,
  onRemoveResistanceFromPlayer,
}: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation("PageChapterSelection");
  const keysPressed = useRef<Record<string, boolean>>({});
  const { isAsideOpen, openAside, closeAside } = useChapterStore(
    useShallow((state) => ({
      isAsideOpen: state.isAsideOpen,
      openAside: state.openAside,
      closeAside: state.closeAside,
    })),
  );
  const {
    openEditPlayerDrawer,
    setSelectedPlayer,
    openCreateDrawer,
    openPlayersCatalog,
    closePlayersCatalog,
  } = usePlayerStore(
    useShallow((state) => ({
      openEditPlayerDrawer: state.openEditPlayerDrawer,
      setSelectedPlayer: state.setSelectedPlayer,
      openCreateDrawer: state.openCreatePlayerDrawer,
      openPlayersCatalog: state.openPlayersCatalog,
      closePlayersCatalog: state.closePlayersCatalog,
    })),
  );
  const { openImmunititesCatalog } = useImmunityStore(
    useShallow((state) => ({
      openImmunititesCatalog: state.openImmunititesCatalog,
    })),
  );
  const { openResistancesCatalog } = useResistancesStore(
    useShallow((state) => ({
      openCreateResistanceDrawer: state.openCreateResistanceDrawer,
      closeCreateResistanceDrawer: state.closeCreateResistanceDrawer,
      openResistancesCatalog: state.openResistancesCatalog,
    })),
  );

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

  function handlePlayersCatalogOpen(state: boolean) {
    state ? openPlayersCatalog() : closePlayersCatalog();
  }

  function handleAddImmunityToPlayer(player: Player) {
    setSelectedPlayer(player);
    openImmunititesCatalog();
  }

  function handleAddResistanceToPlayer(player: Player) {
    setSelectedPlayer(player);
    openResistancesCatalog();
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
                onAddImmunity={handleAddImmunityToPlayer}
                onAddResistance={handleAddResistanceToPlayer}
                onRemoveImmunity={onRemoveImmunityFromPlayer}
                onRemoveResistance={onRemoveResistanceFromPlayer}
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
                        <RiUserAddFill />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent className="w-56">
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onClick={() => handlePlayersCatalogOpen(true)}
                        >
                          {t("addFromCatalog")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={openCreateDrawer}>
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

          <div className="flex flex-col gap-4">
            players:
            {players.map((player) => (
              <span key={"player" + player.id}>{player.name}</span>
            ))}
          </div>
        </MainLayout>
      )}
    </AnimatePresence>
  );
}

export default ChapterSelection;
