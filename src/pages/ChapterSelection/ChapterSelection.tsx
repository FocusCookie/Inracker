import Catalog from "@/components/Catalog/Catalog";
import ChapterCard from "@/components/Chapter/ChapterCard";
import ChapterLayout from "@/components/ChapterLayout/ChapterLayout";
import CreateImmunityDrawer from "@/components/CreateImmunityDrawer/CreateImmunityDrawer";
import CreatePlayerDrawer from "@/components/CreatePlayerDrawer/CreatePlayerDrawer";
import CreateResistanceDrawer from "@/components/CreateResistanceDrawer/CreateResistanceDrawer";
import Drawer from "@/components/Drawer/Drawer";
import EditPlayerDrawer from "@/components/EditPlayerDrawer/EditPlayerDrawer";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TypographyH1 } from "@/components/ui/typographyH1";
import { TypographyP } from "@/components/ui/typographyP";
import { storeImage } from "@/lib/utils";
import { useChapterStore } from "@/stores/ChaptersState";
import { useImmunityStore } from "@/stores/ImmunitiesState";
import { usePartiesStore } from "@/stores/PartiesStores";
import { usePlayerStore } from "@/stores/PlayersState";
import { useResistancesStore } from "@/stores/ResistancesState";
import { Chapter } from "@/types/chapters";
import { DBImmunity } from "@/types/immunitiy";
import { DBParty } from "@/types/party";
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
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  RiArrowLeftBoxLine,
  RiFilterLine,
  RiUserAddFill,
} from "react-icons/ri";

type Props = { partyId: DBParty["id"] };

function ChapterSelection({ partyId }: Props) {
  const { t } = useTranslation("PageChapterSelection");
  const navigate = useNavigate();
  const [immunitySearch, setImmunitySearch] = useState<string>("");
  const [resistanceSearch, setResistanceSearch] = useState<string>("");
  const [isAsideOpen, setIsAsideOpen] = useState<boolean>(false);
  const [isAddChapterDrawerOpen, setIsAddChapterDrawerOpen] =
    useState<boolean>(false);
  const [openPlayersCatalog, setOpenPlayersCatalog] = useState<boolean>(false);
  const keysPressed = useRef<Record<string, boolean>>({});
  const [isEditPlayerOpen, setIsEditPlayerOpen] = useState<boolean>(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);

  const { chapters, getAllChapters, isLoading } = useChapterStore();

  const currentParty = usePartiesStore((state) => state.currentParty);
  const { addPlayerToParty, setCurrentParty, removePlayerFromParty } =
    usePartiesStore();

  const isCreateDrawerOpen = usePlayerStore(
    (state) => state.isCreateDrawerOpen,
  );
  const players = usePlayerStore((state) => state.players);
  const isCreatingPlayer = usePlayerStore((state) => state.isCreating);
  const isStoringImage = usePlayerStore((state) => state.isStoringImage);
  const { setIsCreateDrawerOpen, getAllPlayers, createPlayer } =
    usePlayerStore();
  console.log({ players });

  const {
    setIsCreateDrawerOpen: setIsCreateImmunityDrawerOpen,
    createImmunity,
    getAllImmunities,
  } = useImmunityStore();
  const immunities = useImmunityStore((state) => state.immunities);
  const isCreatingImmunity = useImmunityStore((state) => state.isCreating);
  const isCreateImmunityDrawerOpen = useImmunityStore(
    (state) => state.isCreateDrawerOpen,
  );

  const {
    getAllResistances,
    createResistance,
    setIsCreateDrawerOpen: setIsCreateResistanceDrawerOpen,
  } = useResistancesStore();
  const resistances = useResistancesStore((state) => state.resistances);
  const isCreateResistanceDrawerOpen = useResistancesStore(
    (state) => state.isCreateDrawerOpen,
  );
  const isCreatingResistance = useResistancesStore((state) => state.isCreating);

  useEffect(() => {
    getAllChapters(partyId);
    getAllPlayers();
    getAllImmunities();
    getAllResistances();

    if (!currentParty) {
      setCurrentParty(partyId);
    }
  }, []);

  useEffect(() => {
    // To open the side menuu when the user presses Meta +  "s" key
    const handleKeyDown = (event: KeyboardEvent) => {
      keysPressed.current[event.key] = true;

      if (keysPressed.current["Meta"] && event.key.toLowerCase() === "s") {
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

  function handleEditPlayer(playerId: Player["id"]) {
    setEditPlayer(players.find((player) => player.id === playerId) || null);
    console.log({ playerId });
    setIsEditPlayerOpen(true);
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
              currentParty?.players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  expanded={isAsideOpen}
                  onRemove={() => removePlayerFromParty(partyId, player.id)}
                  onEdit={() => {
                    handleEditPlayer(player.id);
                  }}
                />
              ))
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
              {!isAsideOpen && (
                <>
                  {/* //TODO: Tooltip does not work in combination with the DropdownMenu */}
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
                    isCreating={isCreatingPlayer}
                    isStoringImage={isStoringImage}
                    renderImmunitiesCatalog={function (props: {
                      selectedImmunities: DBImmunity[];
                      isCreating: boolean;
                      onAddImmunity: (immunity: DBImmunity) => void;
                      onRemoveImmunity: (id: number) => void;
                    }): React.ReactNode {
                      return (
                        <div className="flex gap-4">
                          <CreateImmunityDrawer
                            isLoading={isCreatingImmunity}
                            open={isCreateImmunityDrawerOpen}
                            onOpenChange={setIsCreateImmunityDrawerOpen}
                            onCreate={createImmunity}
                          />

                          <Catalog
                            placeholder={"placeholder"}
                            trigger={<Button>Select</Button>}
                            title={"select an immunity"}
                            description={"description"}
                            onSearchChange={setImmunitySearch}
                          >
                            {immunities
                              .filter((immunity) =>
                                immunity.name
                                  .toLowerCase()
                                  .includes(immunitySearch.toLowerCase()),
                              )
                              .filter(
                                (immunity) =>
                                  !props.selectedImmunities.some(
                                    (selected) => selected.id === immunity.id,
                                  ),
                              )
                              .map((immunity) => (
                                <ImmunityCard
                                  key={immunity.id}
                                  immunity={immunity}
                                  actions={
                                    <Button
                                      size="icon"
                                      onClick={() =>
                                        props.onAddImmunity(immunity)
                                      }
                                    >
                                      <PlusIcon />
                                    </Button>
                                  }
                                />
                              ))}
                          </Catalog>
                        </div>
                      );
                    }}
                    renderResistancesCatalog={function (props: {
                      selectedResistances: DBResistance[];
                      isCreating: boolean;
                      onAddResistance: (resistance: DBResistance) => void;
                      onRemoveResistance: (id: number) => void;
                    }): React.ReactNode {
                      return (
                        <div className="flex gap-4">
                          <CreateResistanceDrawer
                            isLoading={isCreatingResistance}
                            open={isCreateResistanceDrawerOpen}
                            onOpenChange={setIsCreateResistanceDrawerOpen}
                            onCreate={createResistance}
                          />

                          <Catalog
                            placeholder={"placeholder"}
                            trigger={<Button>Select</Button>}
                            title={"select an resistance"}
                            description={"description"}
                            onSearchChange={setResistanceSearch}
                          >
                            {resistances
                              .filter((resistance) =>
                                resistance.name
                                  .toLowerCase()
                                  .includes(resistanceSearch.toLowerCase()),
                              )
                              .filter(
                                (resistance) =>
                                  !props.selectedResistances.some(
                                    (selected) => selected.id === resistance.id,
                                  ),
                              )
                              .map((resistance) => (
                                <ResistanceCard
                                  key={resistance.id}
                                  resistance={resistance}
                                  actions={
                                    <Button
                                      size="icon"
                                      onClick={() =>
                                        props.onAddResistance(resistance)
                                      }
                                    >
                                      <PlusIcon />
                                    </Button>
                                  }
                                />
                              ))}
                          </Catalog>
                        </div>
                      );
                    }}
                    onCreate={createPlayer}
                    onStoringImage={storeImage}
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
                </>
              )}

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
                      //TODO: Shortcut for other OS
                      <p>{t("closeDetails")} (⌘S)</p>
                    ) : (
                      <p>{t("openDetails")} (⌘S)</p>
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
