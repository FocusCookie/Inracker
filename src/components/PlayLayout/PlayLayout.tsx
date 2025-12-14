import { cn } from "@/lib/utils";
import { useWindowSize } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "framer-motion";
import React, { useRef } from "react";
import { ScrollArea } from "../ui/scroll-area";

type PlayLayoutCompoundProps = {
  isAsideOpen: boolean;
  isEncounterOpen: boolean;
  children: React.ReactNode;
};

type PlayLayoutCompound = React.FC<PlayLayoutCompoundProps> & {
  Players: React.FC<{ children: React.ReactNode }>;
  Settings: React.FC<{ children: React.ReactNode }>;
  Encounter: React.FC<{ children: React.ReactNode }>;
};

const PlayLayout: PlayLayoutCompound = ({
  isAsideOpen,
  isEncounterOpen,
  children,
}) => {
  const size = useWindowSize();
  const mainRef = useRef<HTMLDivElement>(null);
  const isAsideFloating = size.width ? size.width < 1264 : true;

  const childrenArray = React.Children.toArray(children);

  const playersChild = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === PlayLayout.Players,
  );
  const settingsChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) && child.type === PlayLayout.Settings,
  );

  const mainContent = childrenArray.filter(
    (child) =>
      React.isValidElement(child) &&
      child.type !== PlayLayout.Players &&
      child.type !== PlayLayout.Settings,
  );

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence>
        <motion.main
          key="main"
          ref={mainRef}
          className={cn(
            "absolute flex items-start justify-center gap-4 rounded-md bg-white",
          )}
          initial={{ right: 0, left: 112, top: 0, bottom: 0 }}
          animate={{
            left: isEncounterOpen
              ? 0
              : isAsideOpen
                ? isAsideFloating
                  ? 112
                  : 656
                : 112,
            right: isEncounterOpen ? 640 : 0,
          }}
        >
          {mainContent}
        </motion.main>

        <motion.aside
          key="aside"
          className={cn(
            "absolute top-0 bottom-0 left-0 w-24 rounded-md bg-white p-4",
            isAsideFloating && "shadow-2xl",
          )}
          animate={{
            left: isEncounterOpen ? -96 : 0,
            width: isAsideOpen && !isEncounterOpen ? 640 : 96,
            display: isEncounterOpen ? "none" : "block",
          }}
        >
          <div className="flex h-full flex-col">
            <div className="grow gap-4 overflow-hidden">
              <ScrollArea className="h-full pr-3">
                <div className="flex h-full w-full flex-col gap-4 pt-0.5">
                  {playersChild}
                </div>
              </ScrollArea>
            </div>

            <div
              className={cn(
                "flex w-full flex-col items-center gap-2",
                isAsideOpen ? "items-end" : "items-center",
              )}
            >
              {settingsChild}
            </div>
          </div>
        </motion.aside>

        <motion.div
          key="encounter-blankspace"
          initial={{ right: -656 }}
          className={cn("absolute top-0 bottom-0")}
          animate={{
            right: isEncounterOpen ? 0 : -640,
            width: 640,
          }}
        ></motion.div>
      </AnimatePresence>
    </div>
  );
};

PlayLayout.Players = ({ children }) => {
  return <>{children}</>;
};
PlayLayout.Players.displayName = "MainLayout.Players";

PlayLayout.Settings = ({ children }) => {
  return <>{children}</>;
};
PlayLayout.Settings.displayName = "MainLayout.Settings";

PlayLayout.Encounter = ({ children }) => {
  return <>{children}</>;
};
PlayLayout.Encounter.displayName = "MainLayout.Encounter";

export default PlayLayout;
