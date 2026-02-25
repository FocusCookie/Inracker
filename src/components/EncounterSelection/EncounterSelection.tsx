import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import db from "@/lib/database";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { OverlayMap } from "@/types/overlay";
import { Button } from "../ui/button";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { EncounterDifficulty } from "@/types/encounter";
import {
  ShrinkIcon,
  XIcon,
  Maximize2,
  Minimize2,
  PlayIcon,
  SwordsIcon,
} from "lucide-react";
import { CheckIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { Badge } from "../ui/badge";
import { TypographyH4 } from "../ui/typographyH4";
import MarkdownReader from "../MarkdownReader/MarkdownReader";
import EncounterOpponentCard from "../EncounterOpponentCard/EncounterOpponentCard";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "../ui/scroll-area";
import {
  useDeleteEncounterOpponent,
  useEncounterOpponentsDetailed,
  useUpdateEncounterOpponent,
} from "@/hooks/useEncounterOpponents";
import {
  useRemoveOpponentFromEncounter,
  useUpdateEncounter,
  useSetEncounterCompletion,
} from "@/hooks/useEncounters";
import { useRemoveEncounterFromChapter } from "@/hooks/useChapters";
import {
  useCreateTokensForEncounter,
  useGroupTokensIntoElement,
} from "@/hooks/useTokens";
import { useCombatState } from "@/hooks/useCombat";
import { useEncounterQuery } from "@/hooks/useEncounters";
import { useMusicStore } from "@/stores/useMusicStore";

type OverlayProps = OverlayMap["encounter.selection"];

type RuntimeProps = {
  database: typeof db;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};

type Props = OverlayProps &
  RuntimeProps & {
    onStartFight?: () => void;
    isCombatActive?: boolean;
  };

function Difficulty({ diff }: { diff: EncounterDifficulty }) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex min-w-14 justify-center rounded-lg border border-r-neutral-300 py-2 font-bold text-neutral-800">
        {diff.value}
      </span>

      <p className="pt-2">{diff.description}</p>
    </div>
  );
}

function EncounterSelection({
  database,
  open,
  chapterId,
  encounterId,
  onExitComplete,
  onOpenChange,
  onCancel,
  onOpponentSelect,
  onStartFight,
  isCombatActive: propIsCombatActive,
}: Props) {
  const { t } = useTranslation("ComponentEncounterSelection");
  const openOverlay = useOverlayStore((s) => s.open);
  const setTrack = useMusicStore((s) => s.setTrack);
  const { data: encounter } = useEncounterQuery(encounterId, database);
  const { data: combatState } = useCombatState(chapterId);
  const isCombatActive = propIsCombatActive ?? !!combatState;
  const [isExpanded, setIsExpanded] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);

  const encounterOpponents = useEncounterOpponentsDetailed(database);
  const deleteEncounterOpponent = useDeleteEncounterOpponent(database);
  const removeOpponentFromEncounter = useRemoveOpponentFromEncounter(database);
  const updateEncounterMutation = useUpdateEncounter(database);
  const setEncounterCompletion = useSetEncounterCompletion(database);
  const deleteEncounterMutation = useRemoveEncounterFromChapter(database);
  const groupTokensIntoElementMutation = useGroupTokensIntoElement(database);
  const createTokensForEncounterMutation =
    useCreateTokensForEncounter(database);
  const updateEncounterOpponentMutation = useUpdateEncounterOpponent(database);

  async function handleRemoveOpponent(opponentId: number) {
    if (!encounter) return;

    await deleteEncounterOpponent.mutateAsync(opponentId);
    await removeOpponentFromEncounter.mutateAsync({
      encounter,
      opponentId,
    });

    const opponent = encounterOpponents.data?.find(
      (opp) => opp.id === opponentId,
    );

    if (opponent) {
      toast({
        variant: "default",
        title: `Deleted ${opponent.icon} ${opponent.name}`,
      });
    }
  }

  function handleEditEncounterOpponent(opponent: any) {
    openOverlay("encounter-opponent.edit", {
      opponent,
      onEdit: async (updatedOpponent) => {
        await updateEncounterOpponentMutation.mutateAsync(updatedOpponent);
        return updatedOpponent;
      },
      onDelete: async (id) => {
        await handleRemoveOpponent(id);
      },
      onCancel: (reason) => {
        console.log("Encounter opponent edit cancelled:", reason);
      },
      onComplete: (result) => {
        console.log("Encounter opponent edit complete:", result);
      },
    });
  }

  function handleClose() {
    if (onCancel) onCancel("closed");
    onOpenChange(false);
  }

  function handleElementEdit() {
    if (!encounter) return;

    openOverlay("encounter.edit", {
      encounter,
      onEdit: async (updatedEncounter) => {
        await updateEncounterMutation.mutateAsync(updatedEncounter);
        return updatedEncounter;
      },
      onDelete: async (encounterId) => {
        deleteEncounterMutation.mutate({ chapterId, encounterId });
      },
      onCancel: (reason) => {
        console.log("Encounter edit cancelled:", reason);
      },
      onComplete: async (encounter) => {
        if (chapterId) {
          await createTokensForEncounterMutation.mutateAsync({
            chapterId,
            encounter,
          });
        }
      },
    });

    if (onCancel) onCancel("dismissed");
    onOpenChange(false);
  }

  function handleGroupOpponentTokensIntoEncounter() {
    if (!encounter) return;

    const tokens =
      encounter.opponents && encounterOpponents.data
        ? encounter.opponents.filter((id) =>
            encounterOpponents.data!.some((opp) => opp.id === id),
          )
        : [];

    groupTokensIntoElementMutation.mutate({
      tokens: tokens.map((id) => Number(id)),
      element: encounter.element,
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence mode="wait" onExitComplete={onExitComplete}>
        {open && (
          <Dialog.Portal
            container={document.getElementById("drawer-portal")}
            forceMount
          >
            <Dialog.Overlay className="fixed inset-0 z-50 bg-transparent" />
            <Dialog.Content
              onInteractOutside={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => e.preventDefault()}
            >
              {/* Ensure a11y title/description exist immediately on mount */}
              <Dialog.Title className="sr-only">
                {encounter ? encounter.name : "Encounter"}
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                {encounter
                  ? `Encounter ${encounter.type} - ${encounter.name}`
                  : ""}
              </Dialog.Description>

              {!encounter ? (
                <h2>encounter not found try agiain</h2>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: "100%" }}
                  transition={{ type: "tween", duration: 0.2 }}
                  className={cn(
                    "shadow-4xl border-opacity-50 fixed bottom-4 left-[calc(50%+64px)] flex -translate-x-1/2 flex-col rounded-t-lg border-t-4 border-r-4 border-l-4 bg-white z-50",
                    isExpanded ? "h-[80vh] w-[80vw]" : "w-full max-w-lg",
                  )}
                  onClick={(e) => e.stopPropagation()}
                  style={{ borderColor: encounter.element.color }}
                >
                  <div
                    className="flex flex-col gap-4 border-b-4 p-4"
                    style={{ borderColor: encounter.element.color }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Dialog.Title asChild>
                        <TypographyH4 truncate>
                          {encounter.element.icon} {encounter.name}
                        </TypographyH4>
                      </Dialog.Title>

                      <div className="flex flex-row-reverse gap-2">
                        <TooltipProvider>
                          <Button size="icon" onClick={handleClose}>
                            <XIcon />
                          </Button>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setIsExpanded(!isExpanded)}
                              >
                                {isExpanded ? <Minimize2 /> : <Maximize2 />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{isExpanded ? "Minimize" : "Maximize"}</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant={
                                  encounter.completed ? "success" : "outline"
                                }
                                onClick={() => {
                                  setEncounterCompletion.mutate({
                                    id: encounter.id,
                                    completed: !encounter.completed,
                                  });
                                }}
                              >
                                <CheckIcon />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {encounter.completed
                                  ? t("markAsIncomplete")
                                  : t("markAsComplete")}
                              </p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={handleElementEdit}
                              >
                                <Pencil1Icon />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("editEncounter")}</p>
                            </TooltipContent>
                          </Tooltip>

                          {encounter.type === "fight" && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={
                                      handleGroupOpponentTokensIntoEncounter
                                    }
                                  >
                                    <ShrinkIcon />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t("groupAllOpponentsIntoElement")}</p>
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      disabled={isCombatActive}
                                      onClick={() => {
                                        onStartFight?.();
                                        handleClose();
                                      }}
                                    >
                                      <SwordsIcon />
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {isCombatActive
                                    ? t("fightOngoing")
                                    : t("startFight")}
                                </TooltipContent>
                              </Tooltip>
                            </>
                          )}
                        </TooltipProvider>
                      </div>
                    </div>

                    <Dialog.Description className="hidden">
                      Encounter {encounter.type} - {encounter.name}
                    </Dialog.Description>

                    <div className="flex gap-2">
                      <Badge>{t(encounter.type)}</Badge>

                      {encounter.type === "roll" && (
                        <>
                          <Badge variant="secondary">{encounter.skill}</Badge>
                          <Badge variant="secondary">{encounter.dice} 🎲</Badge>
                        </>
                      )}

                      {Boolean(encounter.experience) && (
                        <Badge variant="secondary">
                          {encounter.experience} EP
                        </Badge>
                      )}
                    </div>
                  </div>

                  <ScrollArea
                    className={cn(
                      "overflow-hidden",
                      isExpanded ? "flex-1" : "h-96",
                    )}
                  >
                    <div className="flex h-full w-full flex-col gap-4 overflow-hidden p-4">
                      {!!encounter.description && (
                        <MarkdownReader
                          markdown={encounter.description}
                          onChange={(newMarkdown) => {
                            updateEncounterMutation.mutate({
                              ...encounter,
                              description: newMarkdown,
                            });
                          }}
                        />
                      )}

                      <div className="flex flex-wrap gap-2">
                        {encounter.images &&
                          encounter.images.map((img, index) => (
                            <div
                              key={index}
                              className="group relative h-16 w-16 overflow-hidden rounded-md border"
                            >
                              <img
                                src={img}
                                className="h-full w-full cursor-pointer object-cover"
                                alt={`Encounter image ${index}`}
                                onClick={() => setFullScreenImage(img)}
                              />
                            </div>
                          ))}
                      </div>

                      {encounter.soundcloud && (
                        <div className="flex items-center justify-between rounded-lg border bg-neutral-50 p-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-sm font-medium text-neutral-700">
                              Soundtrack
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setTrack(encounter.soundcloud!)}
                          >
                            <PlayIcon className="mr-2 h-4 w-4" /> Play
                          </Button>
                        </div>
                      )}

                      {encounter.musicFile && (
                        <div className="flex items-center justify-between rounded-lg border bg-neutral-50 p-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-sm font-medium text-neutral-700">
                              Music File
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setTrack(encounter.musicFile!)}
                          >
                            <PlayIcon className="mr-2 h-4 w-4" /> Play
                          </Button>
                        </div>
                      )}

                      {encounter.type === "roll" &&
                        encounter?.difficulties &&
                        encounter.difficulties.map((diff, index) => (
                          <Difficulty diff={diff} key={index} />
                        ))}

                      {encounter.type === "fight" &&
                        encounterOpponents.data &&
                        encounter?.opponents &&
                        encounter.opponents
                          .map((id) => {
                            return {
                              entity: id,
                              opponent: encounterOpponents.data!.find(
                                (opp) => opp.id === id,
                              ),
                            };
                          })
                          .filter((encOpp) => encOpp.opponent !== undefined)
                          .map((encOpp) => (
                            <EncounterOpponentCard
                              key={`opp-${encOpp.entity}`}
                              // @ts-ignore
                              opponent={encOpp.opponent}
                              onRemove={handleRemoveOpponent}
                              onSelectToken={onOpponentSelect}
                              onEdit={handleEditEncounterOpponent}
                            />
                          ))}
                    </div>{" "}
                  </ScrollArea>
                </motion.div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>

      <Dialog.Root
        open={!!fullScreenImage}
        onOpenChange={(val) => !val && setFullScreenImage(null)}
      >
        <Dialog.Portal container={document.getElementById("drawer-portal")}>
          <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80" />
          <Dialog.Content
            onInteractOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 translate-x-[-50%] translate-y-[-50%] duration-200 outline-none"
          >
            <Dialog.Title className="sr-only">Full screen image</Dialog.Title>
            <div className="relative">
              <img
                src={fullScreenImage || ""}
                alt="Full screen"
                className="max-h-[90vh] max-w-[90vw] rounded-md object-contain shadow-lg"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 text-white hover:bg-black/20"
                onClick={() => setFullScreenImage(null)}
              >
                <XIcon />
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Dialog.Root>
  );
}

export default EncounterSelection;
