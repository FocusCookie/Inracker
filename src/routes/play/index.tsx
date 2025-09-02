import PlayLayout from "@/components/PlayLayout/PlayLayout";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import db from "@/lib/database";
import { AnimatePresence } from "framer-motion";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import Loader from "@/components/Loader/Loader";
import Canvas, {
  CanvasElement,
  ClickableCanvasElement,
} from "@/components/Canvas/Canvas";
import { useMutationWithErrorToast } from "@/hooks/useMutationWithErrorToast";
import { useQueryClient } from "@tanstack/react-query";
import { Token } from "@/types/tokens";
import { useState } from "react";
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
  const [tempElement, setTempElement] = useState<undefined | CanvasElement>(
    undefined,
  );
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isAsideOpen, setIsAsideOpen] = useState<boolean>(false);
  const { partyId, chapterId } = useSearch({ from: "/play/" });
  const [isCreateEncounterDrawerOpen, setIsCreateEncounterDrawerOpen] =
    useState<boolean>(false);

  if (!partyId || !chapterId) throw new Error("No Chapter or Party id");

  const partyQuery = useQueryWithToast({
    queryKey: ["party"],
    queryFn: () => db.parties.getDetailedById(partyId!),
    enabled: !!partyId,
  });

  const chapterQuery = useQueryWithToast({
    queryKey: ["chapter"],
    queryFn: () => db.chapters.getByIdDetailed(chapterId),
    enabled: !!chapterId,
  });

  const encountersQuery = useQueryWithToast({
    queryKey: ["encounters"],
    queryFn: () => db.encounters.getDetailedEncountersByChapterId(chapterId),
    enabled: !!chapterId,
  });

  const tokensQuery = useQueryWithToast({
    queryKey: ["tokens"],
    queryFn: () => db.tokens.getChapterTokens(partyId, chapterId),
    enabled: !!chapterId && !!partyId,
  });

  const opponentsQuery = useQueryWithToast({
    queryKey: ["opponents"],
    queryFn: () => db.opponents.getAllDetailed(),
    enabled: !!chapterId && !!partyId,
  });

  const updateTokenMutation = useMutationWithErrorToast({
    mutationFn: (token: Token) => {
      return db.tokens.update(token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });

  const updateEncounterMutation = useMutationWithErrorToast({
    mutationFn: (encounter: Encounter) => {
      return db.encounters.update(encounter);
    },
    onMutate: async (updatedEncounter: Encounter) => {
      await queryClient.cancelQueries({ queryKey: ["encounters"] });
      const previousEncounters = queryClient.getQueryData<Encounter[]>([
        "encounters",
      ]);
      queryClient.setQueryData<Encounter[]>(["encounters"], (old) => {
        if (!old) return [];
        return old.map((enc) =>
          enc.id === updatedEncounter.id ? updatedEncounter : enc,
        );
      });
      return { previousEncounters };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
    },
  });

  const deleteEncounterMutation = useMutationWithErrorToast({
    mutationFn: async (encounterId: number) => {
      if (!chapterId) return;
      await db.chapters.removeEncounter(chapterId, encounterId);
      return db.encounters.delete(encounterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      queryClient.invalidateQueries({ queryKey: ["chapter"] });
    },
  });

  function handleElementClick(encounter: Encounter) {
    openOverlay("encounter.edit", {
      encounter,
      onEdit: async (updatedEncounter) => {
        console.log({ updatedEncounter });
        await updateEncounterMutation.mutateAsync(updatedEncounter);
        return updatedEncounter;
      },
      onComplete: (encounter) => {
        console.log("deleted encounter ", encounter);
      },
      onDelete: async (encounterId) => {
        deleteEncounterMutation.mutate(encounterId);
      },
      onCancel: (reason) => {
        console.log("Encounter edit cancelled:", reason);
      },
    });
  }

  async function handleElementMove(
    element: ClickableCanvasElement & { id: any },
  ) {
    const encounter = encountersQuery.data?.find((e) => e.id === element.id);

    if (encounter) {
      const { id, name, onClick, ...elementData } = element;
      const updatedEncounter = {
        ...encounter,
        element: { ...encounter.element, ...elementData },
      };
      await updateEncounterMutation.mutateAsync(updatedEncounter);
    }
  }

  function handleCreateEncounter(element: CanvasElement) {
    openOverlay("encounter.create", {
      onCreate: async (encounter) => {
        const encounterWithElement: Omit<Encounter, "id"> = {
          ...encounter,
          // TODO: fix the ts issure here because i use temporary the encounter. icon & color to pass it to here
          // @ts-ignore
          element: { ...element, color: encounter.color, icon: encounter.icon },
        };
        const created = await db.encounters.create(encounterWithElement);
        // @ts-expect-error
        await db.chapters.addEncounter(chapterId, created.id);
        return created;
      },
      onComplete: (encounter) => {
        setIsCreateEncounterDrawerOpen(false);
        setTempElement(undefined);
        console.log("created encounter ", encounter);
        queryClient.invalidateQueries({ queryKey: ["party"] });
        queryClient.invalidateQueries({ queryKey: ["chapter"] });
        queryClient.invalidateQueries({ queryKey: ["encounters"] });
      },
      onCancel: (reason: CancelReason) => {
        setIsCreateEncounterDrawerOpen(false);
        setTempElement(undefined);
        console.log("Opponent creation cancelled:", reason);
      },
    });
  }

  function handeOpenCreateElementDrawer(element: CanvasElement) {
    setIsCreateEncounterDrawerOpen(true);
    setTempElement(element);
    handleCreateEncounter(element);
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
                  id: enc.id,
                  ...enc.element,
                  name: enc.name,
                  onEdit: () => handleElementClick(enc),
                })) || []
              }
              temporaryElement={tempElement}
              tokens={tokensQuery.data || []}
              players={partyQuery.data.players}
              opponents={opponentsQuery.data || []}
              selectedToken={selectedToken}
              onTokenSelect={setSelectedToken}
              onDrawed={handeOpenCreateElementDrawer}
              onTokenMove={updateTokenMutation.mutate}
              onElementMove={handleElementMove}
            />
          )}
      </AnimatePresence>
    </PlayLayout>
  );
}
