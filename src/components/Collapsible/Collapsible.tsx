import * as RadixCollapsible from "@radix-ui/react-collapsible";
import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { useMeasure } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { Button } from "../ui/button";

type Props = {
  children: React.ReactNode;
  titleChildren: React.ReactNode;
};

function Collapsible({ children, titleChildren }: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const [ref, { height }] = useMeasure();

  return (
    <RadixCollapsible.Root open={open} onOpenChange={setOpen}>
      <div className="flex w-full items-center justify-between gap-2 rounded-md">
        <div>{titleChildren}</div>
        <div>
          <RadixCollapsible.Trigger asChild>
            <Button size="icon" variant="ghost">
              {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </Button>
          </RadixCollapsible.Trigger>
        </div>
      </div>

      <AnimatePresence>
        {open && (
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
