import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ScrollArea } from "../ui/scroll-area";
import { TypographyH1 } from "../ui/typographyH1";
import { TypographyMuted } from "../ui/typographyhMuted";

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
};

function Drawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
  createTrigger,
  cancelTrigger,
}: Props) {
  return (
    <Dialog.Root modal open={open} onOpenChange={onOpenChange}>
      {createTrigger && (
        <Dialog.Trigger asChild>{createTrigger}</Dialog.Trigger>
      )}

      <AnimatePresence>
        {open && (
          <Dialog.Portal
            container={document.getElementById("drawer-portal")}
            forceMount
          >
            <Dialog.Overlay asChild>
              <motion.div
                onClick={undefined}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, x: "100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "100%" }}
                transition={{ type: "tween", duration: 0.2 }}
                className="fixed bottom-0 right-0 top-0 flex w-full max-w-[640px] flex-col items-start gap-2 rounded-l-md bg-white p-4 pr-0.5 shadow-xl"
              >
                <Dialog.Title asChild>
                  <TypographyH1>{title}</TypographyH1>
                </Dialog.Title>

                <ScrollArea className="w-full flex-grow pr-2">
                  <div className="flex flex-col gap-4">
                    {!!description && (
                      <Dialog.Description asChild>
                        <TypographyMuted>{description}</TypographyMuted>
                      </Dialog.Description>
                    )}

                    {children}
                  </div>
                </ScrollArea>

                <div className="flex gap-4">
                  {actions}
                  <Dialog.Close asChild>{cancelTrigger}</Dialog.Close>
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
