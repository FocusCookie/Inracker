import PlayLayout from "@/components/PlayLayout/PlayLayout";
import { useChapterStore } from "@/stores/useChapterStore";
import { usePartyStore } from "@/stores/usePartySTore";
import { createFileRoute } from "@tanstack/react-router";
import { useShallow } from "zustand/shallow";
import db from "@/lib/database";
import { AnimatePresence } from "framer-motion";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import Loader from "@/components/Loader/Loader";
import Canvas, { CanvasElement } from "@/components/Canvas/Canvas";
import { Player } from "@/types/player";
import { useMutationWithErrorToast } from "@/hooks/useMutationWithErrorToast";
import { useQueryClient } from "@tanstack/react-query";
import { Token } from "@/types/tokens";
import { useState } from "react";
import { useEncounterStore } from "@/stores/useEncounterStore";
import { TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tooltip, TooltipContent } from "@radix-ui/react-tooltip";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

export const Route = createFileRoute("/play/")({
  component: RouteComponent,
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isAsideOpen, setIsAsideOpen] = useState<boolean>(false);

  const { isCreateEncounterDrawerOpen } = useEncounterStore(
    useShallow((state) => ({
      isCreateEncounterDrawerOpen: state.isCreateEncounterDrawerOpen,
    })),
  );

  const {
    currentEncounterElement,
    setCurrentEncounterElement,
    openCreateEncounterDrawer,
  } = useEncounterStore(
    useShallow((state) => ({
      currentEncounterElement: state.currentElement,
      setCurrentEncounterElement: state.setCurrentElement,
      openCreateEncounterDrawer: state.openCreateEncounterDrawer,
    })),
  );

  const { currentParty } = usePartyStore(
    useShallow((state) => ({
      currentParty: state.currentParty,
    })),
  );

  const { currentChapter } = useChapterStore(
    useShallow((state) => ({
      currentChapter: state.currentChapter,
    })),
  );

  const partyQuery = useQueryWithToast({
    queryKey: ["party", `party-${currentParty}`],
    queryFn: () => db.parties.getDetailedById(currentParty!),
    enabled: !!currentParty,
  });

  const chapterQuery = useQueryWithToast({
    queryKey: ["chapter", `chapter-${currentChapter}`],
    queryFn: () => db.chapters.getByIdDetailed(currentChapter!),
    enabled: !!currentChapter,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });

  const encountersQuery = useQueryWithToast({
    queryKey: ["encounters", `${currentParty}-${currentChapter}`],
    queryFn: () =>
      db.encounters.getDetailedByIds(chapterQuery.data?.encounters || []),
    enabled: !!chapterQuery.data?.encounters,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });

  const tokensQuery = useQueryWithToast({
    queryKey: ["tokens"],
    // @ts-expect-error
    queryFn: () => db.tokens.getChapterTokens(currentParty, currentChapter),
  });

  const updateTokenMutation = useMutationWithErrorToast({
    mutationFn: (token: Token) => {
      return db.tokens.update(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });

  function handleDrawEncounter(element: CanvasElement) {
    setCurrentEncounterElement(element);
    openCreateEncounterDrawer();
  }

  function handleAsideToggle() {
    setIsAsideOpen((c) => !c);
  }

  return (
    <PlayLayout
      isAsideOpen={isAsideOpen}
      isEncounterOpen={isCreateEncounterDrawerOpen}
    >
      <PlayLayout.Players>players</PlayLayout.Players>

      <PlayLayout.Settings>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleAsideToggle} variant="ghost" size="icon">
                {isAsideOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isAsideOpen ? (
                <p>close details (⌘S)</p>
              ) : (
                <p>open details (⌘S)</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </PlayLayout.Settings>

      <AnimatePresence mode="wait">
        {partyQuery.isLoading ||
          (chapterQuery.isLoading && (
            <Loader size="large" title={"loading... "} key="loader" />
          ))}

        {partyQuery.isSuccess &&
          chapterQuery.isSuccess &&
          tokensQuery.isSuccess && (
            <Canvas
              background={chapterQuery.data.battlemap || undefined}
              elements={
                encountersQuery.data?.map((enc) => ({
                  ...enc.element,
                  onClick: () => console.log("click"),
                })) || []
              }
              //TODO: add the encounters to the canvas
              temporaryElement={currentEncounterElement || undefined}
              tokens={tokensQuery.data || []}
              players={partyQuery.data.players}
              selectedPlayer={selectedPlayer}
              onPlayerSelect={setSelectedPlayer}
              onDrawed={handleDrawEncounter}
              onPlayerMove={updateTokenMutation.mutate}
            />
          )}
      </AnimatePresence>
    </PlayLayout>
  );
}
