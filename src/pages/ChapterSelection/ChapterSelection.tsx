import ChapterCard from "@/components/Chapter/ChapterCard";
import ChapterLayout from "@/components/ChapterLayout/ChapterLayout";
import CreatePlayerDrawer from "@/components/CreatePlayerDrawer/CreatePlayerDrawer";
import Drawer from "@/components/Drawer/Drawer";
import Loader from "@/components/Loader/Loader";
import PlayerCard from "@/components/PlayerCard/PlayerCard";
import { Button } from "@/components/ui/button";
import { TypographyH1 } from "@/components/ui/typographyH1";
import { TypographyP } from "@/components/ui/typographyP";
import { ImageFolder } from "@/lib/utils";
import { Chapter } from "@/types/chapters";
import { DBImmunity, Immunity } from "@/types/immunitiy";
import { Player } from "@/types/player";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GearIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { RiFilterLine, RiUserAddFill } from "react-icons/ri";

type Props = {
  chapters: Chapter[];
  loading: boolean;
  /**
   * players from the given party that are playing the chapter
   */
  players: Player[];
  onCreateImmunity: (immunity: Immunity) => void;
  isCreatingImmunity: boolean;
  immunities: DBImmunity[];
  /**
   * all available players in the players database
   */
  playersCatalog: Player[];
  /**
   * A function to store a player image, which takes a picture and a folder and returns the saved file path.
   */
  onStorePlayerImage: (
    picture: File | string,
    folder: ImageFolder,
  ) => Promise<string | undefined>;
};

function ChapterSelection({
  chapters,
  loading,
  players,
  immunities,
  isCreatingImmunity,
  onCreateImmunity,
  playersCatalog,
  onStorePlayerImage,
}: Props) {
  const { t } = useTranslation("PageChapterSelection");
  const [isAsideOpen, setIsAsideOpen] = useState<boolean>(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player["id"] | null>(
    null,
  );
  const [isAddChapterDrawerOpen, setIsAddChapterDrawerOpen] =
    useState<boolean>(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState<boolean>(false);
  const [selectedChapterId, setSelectedChapterId] = useState<
    null | Chapter["id"]
  >(null);
  const [isAddPlayerDrawerOpen, setIsAddPlayerDrawerOpen] =
    useState<boolean>(false);

  function handleAsideToggle() {
    if (isAsideOpen) {
      setSelectedPlayer(null);
      setIsAsideOpen(false);
    } else {
      setIsAsideOpen(true);
    }
  }

  function handlePlayerSelect(id: Player["id"] | null) {
    if (!isAsideOpen) setIsAsideOpen(true);

    setSelectedPlayer(id);
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

  function handleAddPlayerDrawerToggle() {
    setIsAddPlayerDrawerOpen((c) => !c);
  }

  return (
    <AnimatePresence mode="wait">
      <div className="flex h-full w-full flex-col gap-4">
        <ChapterLayout
          isAsideOpen={isAsideOpen}
          asideChildren={
            loading ? (
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
                  {players.map((player) => (
                    <PlayerCard
                      player={player}
                      key={`player-card-${player.id}-${player.name}`}
                      expanded={isAsideOpen}
                      selected={player.id === selectedPlayer}
                      onSelect={handlePlayerSelect}
                    />
                  ))}
                </motion.div>

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
                  className="flex flex-col gap-2 pl-2"
                >
                  <CreatePlayerDrawer
                    isCreatingImmunity={isCreatingImmunity}
                    onCreateImmunity={onCreateImmunity}
                    open={isAddPlayerDrawerOpen}
                    immunities={immunities}
                    isCreating={false}
                    onStorePlayerImage={onStorePlayerImage}
                    onOpenChange={setIsAddPlayerDrawerOpen}
                    onCreate={() => console.log("create player")}
                  />

                  {/* //TODO: Settings Modal für player add */}
                  <Button variant="ghost" size="iconLarge">
                    <GearIcon />
                  </Button>
                  <Button
                    onClick={handleAsideToggle}
                    variant="ghost"
                    size="iconLarge"
                  >
                    {isAsideOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                  </Button>
                </motion.div>
              </>
            )
          }
          drawers={
            <Drawer
              key="add-chapter-drawer"
              open={isAddChapterDrawerOpen}
              onOpenChange={handleToggleAddChapterDrawer}
              title={"Add a new Chapter"}
              cancelTrigger={<Button>Cancel</Button>}
            >
              neue chapter dinge
            </Drawer>
          }
        >
          {!loading && (
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

          {loading ? (
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
