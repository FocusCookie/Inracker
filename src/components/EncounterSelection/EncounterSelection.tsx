import * as Dialog from "@radix-ui/react-dialog";
import db from "@/lib/database";
import { AnimatePresence, motion } from "framer-motion";
import { TypographyH3 } from "../ui/typographyH3";
import { OverlayMap } from "@/types/overlay";
import { Button } from "../ui/button";
import { useOverlayStore } from "@/stores/useOverlayStore";
import { Encounter } from "@/types/encounter";
import { useMutationWithErrorToast } from "@/hooks/useMutationWithErrorToast";
import { useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { Badge } from "../ui/badge";
import { TypographyH4 } from "../ui/typographyH4";
import { TypographySmall } from "../ui/typographyhSmall";

type OverlayProps = OverlayMap["encounter.selection"];

type RuntimeProps = {
  database: typeof db;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
};

type Props = OverlayProps & RuntimeProps;

function EncounterSelection({
  open,
  chapterId,
  encounter,
  onExitComplete,
  onOpenChange,
  onCancel,
}: Props) {
  const openOverlay = useOverlayStore((s) => s.open);
  const queryClient = useQueryClient();

  function handleClose() {
    if (onCancel) onCancel("closed");
    onOpenChange(false);
  }

  const updateEncounterMutation = useMutationWithErrorToast({
    mutationFn: (encounter: Encounter) => {
      return db.encounters.update(encounter);
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
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
      queryClient.invalidateQueries({ queryKey: ["chapter"] });
    },
  });

  function handleElementEdit() {
    openOverlay("encounter.edit", {
      encounter,
      onEdit: async (updatedEncounter) => {
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

    if (onCancel) onCancel("dismissed");
    onOpenChange(false);
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
                className="shadow-4xl fixed bottom-4 left-1/2 flex w-md -translate-x-1/2 flex-col gap-4 rounded-t-lg border-t-4 border-r-4 border-l-4 bg-white p-4"
                onClick={(e) => e.stopPropagation()}
                style={{ borderColor: encounter.element.color }}
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <Dialog.Title asChild>
                      <TypographyH4 truncate>
                        {encounter.element.icon} {encounter.name}
                      </TypographyH4>
                    </Dialog.Title>

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleElementEdit}
                      >
                        <Pencil1Icon />
                      </Button>
                      <Button size="icon" onClick={handleClose}>
                        <XIcon />
                      </Button>
                    </div>
                  </div>

                  <Dialog.DialogDescription className="hidden">
                    Encounter {encounter.type} - {encounter.name}
                  </Dialog.DialogDescription>

                  {Boolean(encounter.experience) && (
                    <TypographySmall>
                      Experience: {encounter.experience}
                    </TypographySmall>
                  )}
                </div>

                <div className="flex w-full grow flex-col gap-4 overflow-hidden">
                  content here
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export default EncounterSelection;
