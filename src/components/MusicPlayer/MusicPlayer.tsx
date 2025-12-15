import { useMusicStore } from "@/stores/useMusicStore";
import { getSoundCloudEmbedUrl } from "@/lib/utils";
import { Button } from "../ui/button";
import { XIcon, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function MusicPlayer({ className }: { className?: string }) {
  const { currentTrackUrl, stop, isMinimized, minimize } = useMusicStore();

  if (!currentTrackUrl) return null;

  const isEmbed =
    currentTrackUrl.includes("soundcloud.com") ||
    currentTrackUrl.includes("<iframe");
  const embedUrl = isEmbed ? getSoundCloudEmbedUrl(currentTrackUrl) : null;

  return (
    <motion.div
      layout
      initial={false}
      animate={{
        width: isMinimized ? 122 : 384,
        height: isMinimized ? 42 : 220,
        borderRadius: isMinimized ? 26 : 16, // rounded-full vs rounded-2xl
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn(
        "absolute bottom-20 left-4 flex flex-col overflow-hidden border border-white/80 bg-white/20 shadow-md backdrop-blur-sm",
        className,
      )}
    >
      <motion.div
        layout
        className={cn(
          "flex items-center p-1 px-2",
          isMinimized ? "gap-2" : "justify-between",
        )}
      >
        <motion.span layout className="ml-2 font-bold text-slate-800">
          🎶
        </motion.span>
        <motion.div layout className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full border border-slate-700 bg-white shadow-sm hover:bg-slate-100"
            onClick={() => minimize(!isMinimized)}
          >
            {isMinimized ? (
              <ChevronUp className="h-4 w-4 text-slate-700" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-700" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full border border-slate-700 bg-white shadow-sm hover:bg-slate-100"
            onClick={stop}
          >
            <XIcon className="h-4 w-4 text-slate-700" />
          </Button>
        </motion.div>
      </motion.div>

      <div
        className={cn(
          "mx-1 mb-1 grow overflow-hidden rounded-xl bg-black/90 transition-opacity duration-300",
          isMinimized ? "pointer-events-none opacity-0" : "opacity-100",
        )}
      >
        {isEmbed && embedUrl ? (
          <iframe
            width="100%"
            height="100%"
            scrolling="no"
            frameBorder="0"
            allow="autoplay"
            src={embedUrl}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <audio controls autoPlay src={currentTrackUrl} className="w-full" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
