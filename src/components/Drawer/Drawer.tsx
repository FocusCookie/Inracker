import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Button } from "../ui/button";
import { TypographyH1 } from "../ui/typographyH1";
import { TypographyMuted } from "../ui/typographyhMuted";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "../ui/scroll-area";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  trigger: React.ReactNode;
};

function Drawer({ title, description, children, actions, trigger }: Props) {
  const { t } = useTranslation("ComponentDrawer");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog.Root modal open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                onClick={undefined}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild onInteractOutside={undefined}>
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
                  <Dialog.Close asChild>
                    <Button variant="ghost">{t("cancel")}</Button>
                  </Dialog.Close>
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
