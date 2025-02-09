import Catalog from "@/components/Catalog/Catalog";
import ChapterCard from "@/components/Chapter/ChapterCard";
import ChapterLayout from "@/components/ChapterLayout/ChapterLayout";
import CreateImmunityDrawer from "@/components/CreateImmunityDrawer/CreateImmunityDrawer";
import CreatePlayerDrawer from "@/components/CreatePlayerDrawer/CreatePlayerDrawer";
import CreateResistanceDrawer from "@/components/CreateResistanceDrawer/CreateResistanceDrawer";
import Drawer from "@/components/Drawer/Drawer";
import ImmunityCard from "@/components/ImmunityCard/ImmunityCard";
import Loader from "@/components/Loader/Loader";
import PlayerCard from "@/components/PlayerCard/PlayerCard";
import PlayerCatalog from "@/components/PlayerCatalog/PlayerCatalog";
import ResistanceCard from "@/components/ResistanceCard/ResistanceCard";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TypographyH1 } from "@/components/ui/typographyH1";
import { TypographyP } from "@/components/ui/typographyP";
import { storeImage } from "@/lib/utils";
import { useChapterStore } from "@/stores/useChapterStore";
import { usePartyStore } from "@/stores/usePartyStore";
import { Chapter } from "@/types/chapters";
import { DBImmunity } from "@/types/immunitiy";
import { Party } from "@/types/party";
import { Player } from "@/types/player";
import { DBResistance } from "@/types/resistances";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircledIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  RiArrowLeftBoxLine,
  RiFilterLine,
  RiUserAddFill,
} from "react-icons/ri";
import { useShallow } from "zustand/shallow";

type Props = { party: Party; chapters: Chapter[]; loading: boolean };

function ChapterSelection({ party, chapters, loading }: Props) {
  const { t } = useTranslation("PageChapterSelection");
  const navigate = useNavigate();
  const keysPressed = useRef<Record<string, boolean>>({});
  const { isAsideOpen, openAside, closeAside } = useChapterStore(
    useShallow((state) => ({
      isAsideOpen: state.isAsideOpen,
      openAside: state.openAside,
      closeAside: state.closeAside,
    })),
  );

  useEffect(() => {
    // To open the side menuu when the user presses Meta +  "s" key
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current[event.key] = true;

      if (keysPressed.current["Meta"] && event.key.toLowerCase() === "s") {
        if (isAsideOpen) {
          closeAside();
        } else {
          console.log("OPEN");
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

  //TODO: Translations

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <ChapterLayout isAsideOpen={false}>
          <Loader size="large" title="Loading Chapters" key="loader-chapters" />
        </ChapterLayout>
      )}

      {!loading && (
        <ChapterLayout isAsideOpen={isAsideOpen}>
          <ChapterLayout.Players>
            {party.players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                expanded={isAsideOpen}
                onRemove={() => console.log("remove")}
                onEdit={() => console.log("edit")}
              />
            ))}
          </ChapterLayout.Players>

          <ChapterLayout.Settings>
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
                        <DropdownMenuItem>Add from catalog</DropdownMenuItem>
                        <DropdownMenuItem>Create new Player</DropdownMenuItem>
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
                      //TODO: Shortcut for other OS
                      <p>{t("closeDetails")} (⌘S)</p>
                    ) : (
                      <p>{t("openDetails")} (⌘S)</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          </ChapterLayout.Settings>

          <div>Main content goes here</div>
        </ChapterLayout>
      )}
    </AnimatePresence>
  );
}

export default ChapterSelection;
