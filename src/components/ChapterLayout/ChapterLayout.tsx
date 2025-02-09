import React from "react";
import { useWindowSize } from "@uidotdev/usehooks";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";

type ChapterLayoutCompoundProps = {
  isAsideOpen: boolean;
  children: React.ReactNode;
};

type ChapterLayoutCompound = React.FC<ChapterLayoutCompoundProps> & {
  Players: React.FC<{ children: React.ReactNode }>;
  Settings: React.FC<{ children: React.ReactNode }>;
};

const ChapterLayout: ChapterLayoutCompound = ({ isAsideOpen, children }) => {
  const size = useWindowSize();
  const isAsideFloating = size.width ? size.width < 1264 : true;

  // Convert children into an array so we can extract the compound parts.
  const childrenArray = React.Children.toArray(children);

  // Find the Players and Settings components
  const playersChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) && child.type === ChapterLayout.Players,
  );
  const settingsChild = childrenArray.find(
    (child) =>
      React.isValidElement(child) && child.type === ChapterLayout.Settings,
  );

  // Everything else is assumed to be the main content.
  const mainContent = childrenArray.filter(
    (child) =>
      React.isValidElement(child) &&
      child.type !== ChapterLayout.Players &&
      child.type !== ChapterLayout.Settings,
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
        <main className="flex w-[608px] flex-col gap-2 pt-4">
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

ChapterLayout.Players = ({ children }) => {
  return <>{children}</>;
};
ChapterLayout.Players.displayName = "ChapterLayout.Players";

ChapterLayout.Settings = ({ children }) => {
  return <>{children}</>;
};
ChapterLayout.Settings.displayName = "ChapterLayout.Settings";

export default ChapterLayout;
