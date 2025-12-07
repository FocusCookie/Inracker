import * as Dialog from "@radix-ui/react-dialog";
import db from "@/lib/database";
import { AnimatePresence, motion } from "framer-motion";
import { OverlayMap } from "@/types/overlay";
import { Button } from "../ui/button";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { Encounter, EncounterDifficulty } from "@/types/encounter";
import { useMutationWithErrorToast } from "@/hooks/useMutationWithErrorToast";
import { useQueryClient } from "@tanstack/react-query";
import { ShrinkIcon, XIcon } from "lucide-react";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { Badge } from "../ui/badge";
import { TypographyH4 } from "../ui/typographyH4";
import MarkdownReader from "../MarkdownReader/MarkdownReader";
import OpponentCard from "../OpponentCard/OpponentCard";
import { DBOpponent } from "@/types/opponents";
import { toast } from "@/hooks/use-toast";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "../ui/scroll-area";

type OverlayProps = OverlayMap["encounter.selection"];

type RuntimeProps = {
  database: typeof db;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};

type Props = OverlayProps & RuntimeProps;

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
  open,
  chapterId,
  encounter,
  onExitComplete,
  onOpenChange,
  onCancel,
}: Props) {
  const { t } = useTranslation("ComponentEncounterSelection");
  const openOverlay = useOverlayStore((s) => s.open);
  const queryClient = useQueryClient();

  const encounterOpponents = useQueryWithToast({
    queryKey: ["encounter-opponents"],
    queryFn: () => db.encounterOpponents.getAllDetailed(),
  });

  //TODO: Das Problem ist, dass absolutes chaos ist was mittels useMutations ausgelöst wird oder direkt in der database.
  // es sollte bei einer löschung des encounteropponents dieser und sein token gelöscht werden und anschliessen der encounter
  // aktuallisiert werden (dessen .opponents liste)
  // könnte die mutationFn auch erweitern dass in diseer die db calls immer liegen die gemacht werden müssen, um so alles
  // zusammen zustellen an db calls - dann liefe aber alles über mutations und nichts direkt in db nebenher
  throw new Error("LEFT OF at encounterSelection");
  const removeOpponent = useMutationWithErrorToast({
    mutationFn: db.encounterOpponents.delete,
    onSuccess: (opponent: DBOpponent) => {
      const previousOpponents = encounter.opponents
        ? [...encounter.opponents]
        : [];
      db.encounters.update({
        ...encounter,
        opponents: previousOpponents.filter(
          (opp: number) => opp !== opponent.id,
        ),
      });

      queryClient.invalidateQueries({ queryKey: ["party"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
      queryClient.invalidateQueries({ queryKey: ["chapter"] });
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });

      toast({
        variant: "default",
        title: `Deleted ${opponent.icon} ${opponent.name}`,
      });
    },
  });

  function handleClose() {
    if (onCancel) onCancel("closed");
    onOpenChange(false);
  }

  const updateEncounterMutation = useMutationWithErrorToast({
    mutationFn: (encounter: Encounter) => {
      return db.encounters.update(encounter);
    },
    onSuccess: (_encounter: Encounter) => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      queryClient.invalidateQueries({ queryKey: ["chapter"] });
      queryClient.invalidateQueries({ queryKey: ["encounter-opponents"] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
    },
  });

  const deleteEncounterMutation = useMutationWithErrorToast({
    mutationFn: async (encounterId: number) => {
      await db.chapters.removeEncounter(chapterId, encounterId);
      return db.encounters.delete(encounterId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapter"] });
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });

  const groupEncounterTokensToElementMutation = useMutationWithErrorToast({
    mutationFn: async (encounter: Encounter) => {
      const tokens =
        encounter.opponents && encounterOpponents.data
          ? encounter.opponents.filter((id) =>
              encounterOpponents.data.some((opp) => opp.id === id),
            )
          : [];

      return db.tokens.groupTokensIntoElemementByEnitityId(
        tokens,
        encounter.element,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      queryClient.invalidateQueries({ queryKey: ["chapter"] });
      queryClient.invalidateQueries({ queryKey: ["tokens"] });
    },
  });

  function handleElementEdit() {
    openOverlay("encounter.edit", {
      encounter,
      onEdit: async (updatedEncounter) => {
        await updateEncounterMutation.mutateAsync(updatedEncounter);
        return updatedEncounter;
      },
      onDelete: async (encounterId) => {
        deleteEncounterMutation.mutate(encounterId);
      },
      onCancel: (reason) => {
        console.log("Encounter edit cancelled:", reason);
      },
      onComplete: async (encounter) => {
        if (chapterId) {
          await db.tokens.createOpponentsTokensByEncounter(
            chapterId,
            encounter,
          );
        }

        queryClient.invalidateQueries({ queryKey: ["tokens"] });
      },
    });

    if (onCancel) onCancel("dismissed");
    onOpenChange(false);
  }

  function handleGroupOpponentTokensIntoEncounter() {
    groupEncounterTokensToElementMutation.mutate(encounter);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence mode="wait" onExitComplete={onExitComplete}>
        {open && (
          <Dialog.Portal
            container={document.getElementById("drawer-portal")}
            forceMount
          >
            <Dialog.Content>
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "tween", duration: 0.2 }}
                className={`shadow-4xl border-opacity-50 fixed bottom-4 left-[calc(50%+64px)] flex w-md -translate-x-1/2 flex-col rounded-t-lg border-t-4 border-r-4 border-l-4 bg-white`}
                onClick={(e) => e.stopPropagation()}
                style={{ borderColor: encounter.element.color }}
              >
                <div
                  className="flex flex-col border-b-4 p-4"
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleGroupOpponentTokensIntoEncounter}
                              >
                                <ShrinkIcon />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("groupAllOpponentsIntoElement")}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TooltipProvider>
                    </div>
                  </div>

                  <Dialog.DialogDescription className="hidden">
                    Encounter {encounter.type} - {encounter.name}
                  </Dialog.DialogDescription>

                  <div className="flex gap-2">
                    <Badge>{t(encounter.type)}</Badge>

                    {Boolean(encounter.experience) && (
                      <Badge variant="secondary">
                        {encounter.experience} EP
                      </Badge>
                    )}

                    {encounter.type === "roll" && (
                      <>
                        <Badge variant="secondary">{encounter.skill}</Badge>
                        <Badge variant="secondary">{encounter.dice} 🎲</Badge>
                      </>
                    )}
                  </div>
                </div>

                <ScrollArea className="h-96 overflow-hidden">
                  <div className="flex h-full w-full flex-col gap-4 overflow-hidden p-4">
                    {!!encounter.description && (
                      <MarkdownReader markdown={encounter.description} />
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
                            opponent: encounterOpponents.data.find(
                              (opp) => opp.id === id,
                            ),
                          };
                        })
                        .map((encOpp) => (
                          <OpponentCard
                            key={`opp-${encOpp.entity}`}
                            opponent={encOpp.opponent}
                            onRemove={removeOpponent.mutate}
                          />
                        ))}
                  </div>
                </ScrollArea>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export default EncounterSelection;
