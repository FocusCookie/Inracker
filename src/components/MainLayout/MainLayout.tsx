import { cn } from "@/lib/utils";
import { useWindowSize } from "@uidotdev/usehooks";
import { motion } from "framer-motion";
import React from "react";
import { ScrollArea } from "../ui/scroll-area";

type MainLayoutCompoundProps = {
  isAsideOpen: boolean;
  children: React.ReactNode;
};

type MainLayoutCompound = React.FC<MainLayoutCompoundProps> & {
  Players: React.FC<{ children: React.ReactNode }>;
  Settings: React.FC<{ children: React.ReactNode }>;
};

const MainLayout: MainLayoutCompound = ({ isAsideOpen, children }) => {
  const size = useWindowSize();
  const isAsideFloating = size.width ? size.width < 1264 : true;

  const childrenArray = React.Children.toArray(children);

  const playersChild = childrenArray.find(
    (child) => React.isValidElement(child) && child.type === MainLayout.Players,
  );
  const settingsChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) && child.type === MainLayout.Settings,
  );

  const mainContent = childrenArray.filter(
    (child) =>
      React.isValidElement(child) &&
      child.type !== MainLayout.Players &&
      child.type !== MainLayout.Settings,
  );

  return (
    <div
      className={cn(
        "relative flex h-full w-full gap-4",
        !isAsideFloating && "flex-row-reverse",
      )}
    >
      <div
        className={cn(
          "flex justify-center rounded-md bg-white",
          isAsideFloating ? "absolute inset-0 left-28" : "grow",
        )}
      >
        <main className={"flex w-full flex-col items-center gap-2 pt-4"}>
          {mainContent}
        </main>
      </div>

      <motion.aside
        initial={{ width: 96 }}
        animate={{ width: isAsideOpen ? 608 : 96 }}
        transition={{ type: "tween", ease: "linear" }}
        className={cn(
          isAsideFloating ? "absolute" : "",
          "flex h-full flex-col justify-between gap-4 overflow-hidden rounded-md bg-white p-4 pr-0",
          isAsideFloating && "absolute shadow-2xl",
        )}
      >
        <div className="flex h-full flex-col gap-4 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex h-full flex-col gap-4 pt-0.5 pl-0.5">
              {playersChild}
            </div>
          </ScrollArea>
        </div>

        <div
          className={cn(
            "flex w-full flex-col gap-2 pr-4",
            isAsideOpen ? "items-end" : "items-center",
          )}
        >
          {settingsChild}
        </div>
      </motion.aside>
    </div>
  );
};

MainLayout.Players = ({ children }) => {
  return <>{children}</>;
};
MainLayout.Players.displayName = "MainLayout.Players";

MainLayout.Settings = ({ children }) => {
  return <>{children}</>;
};
MainLayout.Settings.displayName = "MainLayout.Settings";

export default MainLayout;
