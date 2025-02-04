import { Player } from "@/types/player";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { motion } from "framer-motion";
import MarkdownReader from "../MarkdownReader/MarkdownReader";
import Collapsible from "../Collapsible/Collapsible";

type Props = {
  player: Player;
  expanded: boolean;
};

function PlayerCard({ player, expanded }: Props) {
  // const [ref, { height }] = useMeasure();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {expanded ? (
            <div className="flex h-full w-[576px]">
              <div className="w-16">
                <button className="grid h-16 w-16 place-content-center rounded-md hover:cursor-pointer hover:bg-neutral-50">
                  <Avatar>
                    <AvatarImage
                      src={player.image || undefined}
                      alt={player.name}
                    />
                    <AvatarFallback>{player.icon}</AvatarFallback>
                  </Avatar>
                </button>
              </div>

              <div className="flex w-full flex-col gap-2 pt-0.5">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.3, delay: 0.15 },
                  }}
                  className="grow"
                >
                  <div className="flex flex-col py-1">
                    <div className="flex items-center gap-2">
                      <span className="grow text-xl font-bold">
                        {player.name}
                      </span>

                      <Badge>LVL {player.level}</Badge>
                      <Badge>
                        <div className="flex items-center gap-1">
                          <HeartFilledIcon />
                          <span>
                            {player.health}/{player.max_health}
                          </span>
                        </div>
                      </Badge>
                    </div>
                    <span className="">{player.role}</span>
                  </div>
                </motion.div>

                <div className="overflow-hidden p-0.5">
                  <Collapsible title="Overview">
                    <MarkdownReader markdown={player.overview} />
                  </Collapsible>
                </div>
              </div>
            </div>
          ) : (
            <button className="focus-visible:ring-ring relative flex w-16 flex-col gap-1 rounded-md ring-offset-1 hover:cursor-pointer hover:bg-neutral-50 focus-visible:ring-1 focus-visible:outline-hidden">
              <div className="relative grid h-16 w-16 place-content-center rounded-md">
                <Avatar>
                  <AvatarImage
                    src={player.image || undefined}
                    alt={player.name}
                  />
                  <AvatarFallback>{player.icon}</AvatarFallback>
                </Avatar>

                <span className="absolute top-0 right-0 rounded-full bg-white p-0.5 shadow">
                  {player.icon}
                </span>
              </div>

              <div className="flex items-center gap-[1px] rounded-md bg-gray-200 px-1 py-0.5 text-sm font-bold text-black">
                <span>{player.health}1</span>
                <span>/</span>
                <span>{player.max_health}4</span>
              </div>

              <div className="flex w-full justify-between gap-2">
                {player.effects.filter((effect) => effect.type === "positive")
                  .length > 0 && (
                  <div className="w-full rounded-md bg-emerald-500 px-1 py-0.5 text-sm font-bold text-white">
                    {
                      player.effects.filter(
                        (effect) => effect.type === "positive",
                      ).length
                    }
                  </div>
                )}
                {player.effects.filter((effect) => effect.type === "negative")
                  .length > 0 && (
                  <div className="w-full rounded-md bg-red-500 px-1 py-0.5 text-sm font-bold text-white">
                    {
                      player.effects.filter(
                        (effect) => effect.type === "negative",
                      ).length
                    }
                  </div>
                )}
              </div>
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>{player.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default PlayerCard;
