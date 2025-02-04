import { useWindowSize } from "@uidotdev/usehooks";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";

type Props = {
  players: React.ReactNode;
  settings: React.ReactNode;
  drawers: React.ReactNode;
  children: React.ReactNode;
  isAsideOpen: boolean;
};

function ChapterLayout({
  players,
  settings,
  drawers,
  children,
  isAsideOpen,
}: Props) {
  const size = useWindowSize();
  const isAsideFloating = size.width ? size.width < 1264 : true;

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
        <main className="flex w-[608px] flex-col gap-2 pt-4">{children}</main>
      </div>

      <div
        className={cn(
          isAsideFloating ? "absolute h-full" : "",
          "flex flex-col gap-2",
        )}
      >
        <motion.aside
          initial={{ width: 96 }}
          animate={{ width: isAsideOpen ? 608 : 96 }}
          transition={{ type: "tween", ease: "linear" }}
          className={cn(
            "overflow-hidden",
            "flex h-full flex-col justify-between gap-4 rounded-md bg-white p-4 pr-0",
            isAsideFloating && "absolute shadow-2xl",
          )}
        >
          <div className="flex grow flex-col gap-4 overflow-hidden pr-0.5">
            <ScrollArea className="h-full pr-2">
              <div className="flex h-full flex-col gap-4 p-1">{players}</div>
            </ScrollArea>
          </div>

          <div>{settings}</div>
        </motion.aside>
      </div>
      {drawers}
    </div>
  );
}

export default ChapterLayout;
