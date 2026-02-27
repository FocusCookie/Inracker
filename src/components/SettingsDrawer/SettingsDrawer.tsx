import database from "@/lib/database";
import { SidebarProvider, SidebarTrigger, useSidebar } from "../ui/sidebar";
import SettingsSidebar, {
  SettingsCategory,
} from "../SettingsSidebar/SettingsSidebar";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { CancelReason, OverlayMap } from "@/types/overlay";
import { useEffect, useState } from "react";
import SettingsCategoryGeneral from "../SettingsCategoryGeneral/SettingsCategoryGeneral";
import SettingsCategoryImages from "../SettingsCategoryImages/SettingsCategoryImages";
import SettingsCategoryPlayers from "../SettingsCategoryPlayers/SettingsCategoryPlayers";
import SettingsCategoryEffects from "../SettingsCategoryEffects/SettingsCategoryEffects";
import SettingsCategoryImmunities from "../SettingsCategoryImmunities/SettingsCategoryImmunities";
import SettingsCategoryResistances from "../SettingsCategoryResistances/SettingsCategoryResistances";
import SettingsCategoryWeaknesses from "../SettingsCategoryWeaknesses/SettingsCategoryWeaknesses";
import SettingsCategoryOpponents from "../SettingsCategoryOpponents/SettingsCategoryOpponents";
import SettingsCategoryAudio from "../SettingsCategoryAudio/SettingsCategoryAudio";
import SettingsCategoryBackup from "../SettingsCategoryBackup/SettingsCategoryBackup";
import { SquareX } from "lucide-react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Kbd } from "../ui/kbd";
import { getModifierKey } from "@/lib/utils";

type OverlayProps = OverlayMap["settings"];

type RuntimeProps = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  onExitComplete: () => void;
  database: typeof database;
};

type Props = OverlayProps & RuntimeProps;

const SettingsCloseTrigger = ({ onClick }: { onClick: () => void }) => {
  const { state } = useSidebar();

  if (state === "expanded") return null;

  return (
    <div className="absolute bottom-4 left-[18px]">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={onClick}
            >
              <SquareX className="size-4" />
              <span className="sr-only">Close Settings</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <Kbd>{getModifierKey()}</Kbd>
              <Kbd>Esc</Kbd>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

function SettingsDrawer({
  database,
  open,
  onOpenChange,
  onExitComplete,
}: Props) {
  const [activeCategory, setActiveCategory] =
    useState<SettingsCategory>("general");
  const [closingReason, setClosingReason] = useState<
    null | "success" | CancelReason
  >(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && (event.metaKey || event.ctrlKey)) {
        handleCloseDrawer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  function handleCloseDrawer() {
    setClosingReason("closed");
    onOpenChange(false);
  }

  function handleOpenChange(state: boolean) {
    if (!state && closingReason === null) {
      setClosingReason("dismissed");
    }

    onOpenChange(state);
  }

  function showSettingsCategory(category: SettingsCategory) {
    switch (category) {
      case "general":
        return <SettingsCategoryGeneral />;

      case "images":
        return <SettingsCategoryImages database={database} />;

      case "audio":
        return <SettingsCategoryAudio database={database} />;

      case "players":
        return <SettingsCategoryPlayers database={database} />;

      case "effects":
        return <SettingsCategoryEffects database={database} />;

      case "immunities":
        return <SettingsCategoryImmunities database={database} />;

      case "resistances":
        return <SettingsCategoryResistances database={database} />;

      case "weaknesses":
        return <SettingsCategoryWeaknesses database={database} />;

      case "opponents":
        return <SettingsCategoryOpponents database={database} />;
        
      case "backup":
        return <SettingsCategoryBackup />;

      default:
        return <SettingsCategoryGeneral />;
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <AnimatePresence mode="wait" onExitComplete={onExitComplete}>
        {open && (
          <Dialog.Portal
            container={document.getElementById("drawer-portal")}
            forceMount
          >
            <Dialog.Title className="sr-only">Settings</Dialog.Title>
            <Dialog.DialogDescription className="sr-only">App settings</Dialog.DialogDescription>

            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              />
            </Dialog.Overlay>

            <Dialog.Content
              onInteractOutside={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed top-0 right-0 bottom-0 flex h-full w-full flex-col items-start gap-4 bg-white px-0.5 shadow-xl"
              >
                <div className="flex h-full w-full grow flex-col">
                  <SidebarProvider>
                    <div className="relative h-full flex flex-col">
                      <SidebarTrigger className="mt-5 ml-[18px] md:invisible shrink-0" />

                      <SettingsSidebar
                        activeItem={activeCategory}
                        onSelect={setActiveCategory}
                        onClose={handleCloseDrawer}
                      />

                      <SettingsCloseTrigger onClick={handleCloseDrawer} />
                    </div>

                    <main className="flex h-full w-full justify-center">
                      <div className="scrollable-y flex h-full w-full max-w-[1024px] flex-col gap-4 overflow-y-scroll p-4">
                        {showSettingsCategory(activeCategory)}
                      </div>
                    </main>
                  </SidebarProvider>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export default SettingsDrawer;
