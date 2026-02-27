import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { TypographyH1 } from "../ui/typographyH1";
import { TypographyMuted } from "../ui/typographyhMuted";

import { useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Kbd } from "../ui/kbd";
import { getModifierKey } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (state: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  /**
   * Actions shown in the drawer bottom
   */
  actions?: React.ReactNode;
  /**
   * Element that is shown which triggers to open the drawer
   */
  createTrigger?: React.ReactNode;
  cancelTrigger: React.ReactNode;
  noBackgdrop?: boolean;
  onExitComplete: () => void;
};

function Drawer({
  open,
  title,
  description,
  children,
  actions,
  createTrigger,
  cancelTrigger,
  noBackgdrop,
  onExitComplete,
  onOpenChange,
}: Props) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && (event.metaKey || event.ctrlKey)) {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {createTrigger && (
        <Dialog.Trigger asChild>{createTrigger}</Dialog.Trigger>
      )}

      <AnimatePresence mode="wait" onExitComplete={onExitComplete}>
        {open && (
          <Dialog.Portal
            container={document.getElementById("drawer-portal")}
            forceMount
          >
            {!noBackgdrop && (
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/50 backdrop-blur-xs"
                />
              </Dialog.Overlay>
            )}

            <Dialog.Content
              onInteractOutside={(e) => e.preventDefault()}
              onEscapeKeyDown={(e) => e.preventDefault()}
            >
              <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "tween", duration: 0.2 }}
                className="fixed top-2 right-0 bottom-2 flex w-full max-w-[640px] flex-col items-start gap-4 rounded-l-md bg-white p-4 pr-0 shadow-xl"
              >
                <Dialog.Title asChild>
                  <TypographyH1>{title}</TypographyH1>
                </Dialog.Title>

                {!!description && (
                  <Dialog.Description asChild>
                    <TypographyMuted>{description}</TypographyMuted>
                  </Dialog.Description>
                )}

                <div className="scrollable-y flex w-full grow flex-col gap-4 overflow-y-scroll">
                  {children}
                </div>

                <div className="flex w-full gap-4 pr-4">
                  {actions}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Dialog.Close asChild>{cancelTrigger}</Dialog.Close>
                      </TooltipTrigger>
                      <TooltipContent className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          <Kbd>{getModifierKey()}</Kbd>
                          <Kbd>Esc</Kbd>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

export default Drawer;
