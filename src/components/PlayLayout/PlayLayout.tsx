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
  Initiative: React.FC<{ children: React.ReactNode }>;
  InitiativeMenue: React.FC<{ children: React.ReactNode }>;
  ActiveEffects: React.FC<{ children: React.ReactNode }>;
  CombatControls: React.FC<{ children: React.ReactNode }>;
  Rest: React.FC<{ children: React.ReactNode }>;
  SessionLog: React.FC<{ children: React.ReactNode }>;
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

  const initiativeMenueChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) && child.type === PlayLayout.InitiativeMenue,
  );

  const activeEffectsChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) && child.type === PlayLayout.ActiveEffects,
  );

  const restChild = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === PlayLayout.Rest,
  );

  const sessionLogChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) && child.type === PlayLayout.SessionLog,
  );

  const initiativeChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) && child.type === PlayLayout.Initiative,
  );

  const combatControlsChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) && child.type === PlayLayout.CombatControls,
  );

  const settingsChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) && child.type === PlayLayout.Settings,
  );

  const mainContent = childrenArray.filter(
    (child) =>
      React.isValidElement(child) &&
      child.type !== PlayLayout.Players &&
      child.type !== PlayLayout.Settings &&
      child.type !== PlayLayout.Initiative &&
      child.type !== PlayLayout.InitiativeMenue &&
      child.type !== PlayLayout.ActiveEffects &&
      child.type !== PlayLayout.CombatControls &&
      child.type !== PlayLayout.Rest &&
      child.type !== PlayLayout.SessionLog,
  );

  return (
    <div className="relative h-full w-full overflow-hidden">
      <AnimatePresence>
        <motion.main
          key="main"
          ref={mainRef}
          className={cn(
            "absolute flex items-start justify-center gap-4 overflow-hidden rounded-md bg-white",
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

          <div className="absolute top-4 right-18">{restChild}</div>

          <div className="absolute bottom-4 left-48">{sessionLogChild}</div>

          <div className="absolute top-4 left-1/2 -translate-x-1/2 transform">
            {initiativeChild}
          </div>

          <div className="absolute top-1/2 left-0 -translate-y-1/2 transform">
            {initiativeMenueChild}
          </div>

          <div className="absolute top-1/2 right-0 -translate-y-1/2 transform">
            {activeEffectsChild}
          </div>

          <div className="absolute top-4 left-4">{combatControlsChild}</div>
        </motion.main>

        <motion.aside
          key="aside"
          className={cn(
            "absolute top-0 bottom-0 left-0 w-24 rounded-md bg-white p-4 pr-0",
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
              <ScrollArea className="h-full">
                <div className="flex h-full w-full flex-col gap-4 pt-0.5 pr-4 pl-0.5">
                  {playersChild}
                </div>
              </ScrollArea>
            </div>

            <div
              className={cn(
                "flex w-full flex-col items-center gap-2 pr-4",
                isAsideOpen ? "items-end" : "items-center",
              )}
            >
              {settingsChild}
            </div>
          </div>
        </motion.aside>
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

PlayLayout.Initiative = ({ children }) => {
  return <>{children}</>;
};
PlayLayout.Initiative.displayName = "MainLayout.Initiative";

PlayLayout.InitiativeMenue = ({ children }) => {
  return <>{children}</>;
};
PlayLayout.InitiativeMenue.displayName = "MainLayout.InitiativeMenue";

PlayLayout.ActiveEffects = ({ children }) => {
  return <>{children}</>;
};
PlayLayout.ActiveEffects.displayName = "MainLayout.ActiveEffects";

PlayLayout.CombatControls = ({ children }) => {
  return <>{children}</>;
};
PlayLayout.CombatControls.displayName = "MainLayout.CombatControls";

PlayLayout.Rest = ({ children }) => {
  return <>{children}</>;
};
PlayLayout.Rest.displayName = "MainLayout.Rest";

PlayLayout.SessionLog = ({ children }) => {
  return <>{children}</>;
};
PlayLayout.SessionLog.displayName = "PlayLayout.SessionLog";

export default PlayLayout;