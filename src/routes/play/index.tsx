import PlayLayout from "@/components/PlayLayout/PlayLayout";
import { createFileRoute, useSearch } from "@tanstack/react-router";
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
import { CancelReason } from "@/types/overlay";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { Encounter } from "@/types/encounter";

type PlaySearch = {
  partyId: number | null;
  chapterId: number | null;
};

export const Route = createFileRoute("/play/")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>): PlaySearch => {
    return {
      partyId: Number(search?.partyId || null),
      chapterId: Number(search?.chapterId || null),
    };
  },
});

function RouteComponent() {
  const queryClient = useQueryClient();
  const openOverlay = useOverlayStore((s) => s.open);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isAsideOpen, setIsAsideOpen] = useState<boolean>(false);
  const { partyId, chapterId } = useSearch({ from: "/play/" });

  if (!partyId || !chapterId) throw new Error("No Chapter or Party id");

  const { isCreateEncounterDrawerOpen } = useEncounterStore(
    useShallow((state) => ({
      isCreateEncounterDrawerOpen: state.isCreateEncounterDrawerOpen,
    })),
  );

  const { currentEncounterElement } = useEncounterStore(
    useShallow((state) => ({
      currentEncounterElement: state.currentElement,
    })),
  );

  const partyQuery = useQueryWithToast({
    queryKey: ["party"],
    queryFn: () => db.parties.getDetailedById(partyId!),
    enabled: !!partyId,
  });

  const chapterQuery = useQueryWithToast({
    queryKey: ["chapter"],
    queryFn: () => db.chapters.getByIdDetailed(chapterId!),
    enabled: !!chapterId,
  });

  const encountersQuery = useQueryWithToast({
    queryKey: ["encounters"],
    queryFn: () => db.encounters.getDetailedEncountersByChapterId(chapterId),
  });

  const tokensQuery = useQueryWithToast({
    queryKey: ["tokens"],
    queryFn: () => db.tokens.getChapterTokens(partyId, chapterId),
  });

  const updateTokenMutation = useMutationWithErrorToast({
    mutationFn: (token: Token) => {
      return db.tokens.update(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });

  function handleCreateEncounter(element: CanvasElement) {
    openOverlay("encounter.create", {
      onCreate: async (encounter) => {
        const encounterWithElement: Omit<Encounter, "id"> = {
          ...encounter,
          element: { ...element, color: encounter.color, icon: encounter.icon },
        };
        const created = await db.encounters.create(encounterWithElement);
        // @ts-expect-error
        await db.chapters.addEncounter(chapterId, created.id);
        return created;
      },
      onComplete: (encounter) => {
        console.log("created encounter ", encounter);
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["chapter"] });
        queryClient.invalidateQueries({ queryKey: ["encounters"] });
      },
      onCancel: (reason: CancelReason) => {
        console.log("Opponent creation cancelled:", reason);
      },
    });
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
                  name: enc.name,
                  onClick: () => console.log("click"),
                })) || []
              }
              //TODO: add the encounters to the canvas
              temporaryElement={currentEncounterElement || undefined}
              tokens={tokensQuery.data || []}
              players={partyQuery.data.players}
              selectedPlayer={selectedPlayer}
              onPlayerSelect={setSelectedPlayer}
              onDrawed={handleCreateEncounter}
              onPlayerMove={updateTokenMutation.mutate}
            />
          )}
      </AnimatePresence>
    </PlayLayout>
  );
}
