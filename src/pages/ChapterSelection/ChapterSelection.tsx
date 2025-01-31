import ChapterCard from "@/components/Chapter/ChapterCard";
import ChapterLayout from "@/components/ChapterLayout/ChapterLayout";
import CreatePlayerDrawer from "@/components/CreatePlayerDrawer/CreatePlayerDrawer";
import Drawer from "@/components/Drawer/Drawer";
import Loader from "@/components/Loader/Loader";
import PlayerCard from "@/components/PlayerCard/PlayerCard";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TypographyH1 } from "@/components/ui/typographyH1";
import { TypographyP } from "@/components/ui/typographyP";
import { Chapter } from "@/types/chapters";
import { DBParty } from "@/types/party";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RiArrowLeftBoxLine,
  RiFilterLine,
  RiUserAddFill,
} from "react-icons/ri";
import { usePlayerStore } from "@/stores/PlayersState";
import { useChapterStore } from "@/stores/ChaptersState";
import PlayerCatalog from "@/components/PlayerCatalog/PlayerCatalog";
import { usePartiesStore } from "@/stores/PartiesStores";
import { Player } from "@/types/player";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Props = { partyId: DBParty["id"] };

function ChapterSelection({ partyId }: Props) {
  const { t } = useTranslation("PageChapterSelection");
  const navigate = useNavigate();
  const { chapters, getAllChapters, isLoading } = useChapterStore();
  const currentParty = usePartiesStore((state) => state.currentParty);
  console.log({ currentParty });
  const { addPlayerToParty } = usePartiesStore();
  const isCreateDrawerOpen = usePlayerStore(
    (state) => state.isCreateDrawerOpen,
  );
  const players = usePlayerStore((state) => state.players);
  const { setIsCreateDrawerOpen, getAllPlayers } = usePlayerStore();
  const [isAsideOpen, setIsAsideOpen] = useState<boolean>(false);
  const [isAddChapterDrawerOpen, setIsAddChapterDrawerOpen] =
    useState<boolean>(false);
  const [openPlayersCatalog, setOpenPlayersCatalog] = useState<boolean>(false);

  useEffect(() => {
    getAllChapters(partyId);
    getAllPlayers();
  }, []);

  function handleAsideToggle() {
    if (isAsideOpen) {
      setIsAsideOpen(false);
    } else {
      setIsAsideOpen(true);
    }
  }

  function handleEditChapter(chapterId: Chapter["id"]) {
    console.log("edit chapter " + chapterId);
  }

  function handleToggleAddChapterDrawer() {
    setIsAddChapterDrawerOpen((c) => !c);
  }

  function handleFilterDrawerToggle() {
    console.log("filter drawer toggle");
  }

  function handleExitParty() {
    navigate({
      to: `/parties`,
    });
  }

  function handleAddPlayerToParty(playerId: Player["id"]) {
    addPlayerToParty(partyId, playerId);
  }

  //TODO: Translations

  return (
    <AnimatePresence mode="wait">
      <div className="flex h-full w-full flex-col gap-4">
        <ChapterLayout
          isAsideOpen={isAsideOpen}
          players={
            isLoading ? (
              <Loader size="large" key="loader-chapters-player" />
            ) : (
              <>
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
                >
                  {currentParty?.players.map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      expanded={isAsideOpen}
                    />
                  ))}
                </motion.div>

                {isAsideOpen && (
                  <div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={handleAsideToggle}
                            variant="ghost"
                            size="iconLarge"
                          >
                            {isAsideOpen ? (
                              <ChevronLeftIcon />
                            ) : (
                              <ChevronRightIcon />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isAsideOpen ? (
                            <p>{t("closeDetails")}</p>
                          ) : (
                            <p>{t("openDetails")}</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </>
            )
          }
          settings={
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="iconLarge" variant="ghost">
                    <RiUserAddFill />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      onClick={() => setOpenPlayersCatalog(true)}
                    >
                      Add from catalog
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsCreateDrawerOpen(true)}
                    >
                      Create new Player
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <PlayerCatalog
                open={openPlayersCatalog}
                onOpenChange={setOpenPlayersCatalog}
                onAdd={handleAddPlayerToParty}
                excludedPlayers={currentParty?.players || []}
                players={players}
              />

              <CreatePlayerDrawer
                open={isCreateDrawerOpen}
                onOpenChange={setIsCreateDrawerOpen}
              />

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleExitParty}
                      variant="ghost"
                      size="iconLarge"
                    >
                      <RiArrowLeftBoxLine />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("closeParty")}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleAsideToggle}
                      variant="ghost"
                      size="iconLarge"
                    >
                      {isAsideOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isAsideOpen ? (
                      <p>{t("closeDetails")}</p>
                    ) : (
                      <p>{t("openDetails")}</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          }
          drawers={
            <Drawer
              key="add-chapter-drawer"
              open={isAddChapterDrawerOpen}
              onOpenChange={handleToggleAddChapterDrawer}
              title={t("addChapter")}
              cancelTrigger={<Button>Cancel</Button>}
            >
              neue chapter dinge
            </Drawer>
          }
        >
          {!isLoading && (
            <div className="flex items-center justify-between gap-2">
              <TypographyH1>{t("chapters")}</TypographyH1>

              <Button
                onClick={handleFilterDrawerToggle}
                size="icon"
                variant="ghost"
              >
                <RiFilterLine />
              </Button>
            </div>
          )}

          {isLoading ? (
            <Loader
              size="large"
              title={t("loadingChapters")}
              key="loader-chapters"
            />
          ) : (
            <div className="flex w-full flex-col items-center gap-4">
              <TypographyP>{t("description")}</TypographyP>

              <div className="mt-4 flex w-full flex-col gap-4">
                {chapters.map((chapter) => (
                  <ChapterCard
                    key={`chapter-${chapter.id}`}
                    chapter={chapter}
                    onEdit={handleEditChapter}
                  />
                ))}
              </div>

              <Button onClick={handleToggleAddChapterDrawer} className="mt-4">
                {t("addChapter")}
                <PlusCircledIcon />
              </Button>
            </div>
          )}
        </ChapterLayout>
      </div>
    </AnimatePresence>
  );
}

export default ChapterSelection;
