import * as RadixCollapsible from "@radix-ui/react-collapsible";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { useMeasure } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useTranslation } from "react-i18next";

type Props = {
  children: React.ReactNode;
  title: React.ReactNode;
  actions?: React.ReactNode;
  disabled?: boolean;
};

function Collapsible({ actions, children, title, disabled }: Props) {
  const { t } = useTranslation("ComponentCollapsible");
  const [open, setOpen] = useState<boolean>(false);
  const [ref, { height }] = useMeasure();

  return (
    <RadixCollapsible.Root
      open={open}
      onOpenChange={setOpen}
      disabled={disabled}
    >
      <div className="flex w-full items-center justify-between gap-2 rounded-md">
        <div className="grow text-xl font-bold">{title}</div>
        <div className="flex items-center gap-2 p-0.5">
          {disabled ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-not-allowed">
                    <Button size="icon" variant="ghost" disabled>
                      <ChevronDownIcon />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("noContentAvailable")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <RadixCollapsible.Trigger asChild>
              <Button size="icon" variant="ghost">
                {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </Button>
            </RadixCollapsible.Trigger>
          )}

          {actions}
        </div>
      </div>

      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: height ? height + 8 : 0, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden p-[2px]"
          >
            <div ref={ref}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </RadixCollapsible.Root>
  );
}

export default Collapsible;
