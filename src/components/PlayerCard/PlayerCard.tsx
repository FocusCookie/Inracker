import { Player } from "@/types/player";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import { useMeasure } from "@uidotdev/usehooks";
import { AnimatePresence, motion } from "framer-motion";
import { FaThumbsDown, FaThumbsUp } from "react-icons/fa";
import {
  GiBrickWall,
  GiInspiration,
  GiMagnifyingGlass,
  GiShield,
  GiWalk,
} from "react-icons/gi";
import { Badge } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { TypographySmall } from "../ui/typographyhSmall";

type Props = {
  player: Player;
  expanded: boolean;
};

function PlayerCard({ player, expanded }: Props) {
  const [ref, { height }] = useMeasure();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {expanded ? (
            <div className="min-h-[98px] w-[576px]">
              <div className="flex w-full gap-2">
                <button className="grid h-16 w-16 place-content-center rounded-md hover:cursor-pointer hover:bg-neutral-50">
                  <motion.span
                    layoutId={`player-${player.id}-icon`}
                    className="text-4xl"
                  >
                    {player.icon}
                  </motion.span>
                </button>

                <div className="grow overflow-hidden">
                  <div className="flex flex-col py-1">
                    <div className="flex items-center gap-2">
                      <span className="grow text-xl font-bold">
                        {player.name}
                      </span>
                      <Badge className="bg-emerald-500">
                        <div className="flex items-center gap-1">
                          <FaThumbsUp />
                          <span>
                            {
                              player.effects.filter(
                                (effect) => effect.type === "positive",
                              ).length
                            }
                          </span>
                        </div>
                      </Badge>
                      <Badge className="bg-red-500">
                        <div className="flex items-center gap-1">
                          <FaThumbsDown />
                          <span>
                            {
                              player.effects.filter(
                                (effect) => effect.type === "negative",
                              ).length
                            }
                          </span>
                        </div>
                      </Badge>
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
                    <div className="pt-4">
                      <div ref={ref} className="flex w-full flex-col gap-4">
                        <div className="flex gap-4">
                          <div className="flex w-full flex-col items-center gap-4 rounded-md border px-2 py-4">
                            <GiShield className="h-8 w-8" />
                            <div className="flex flex-col items-center">
                              <span className="font-bold">23</span>
                              <TypographySmall>Armor</TypographySmall>
                            </div>
                          </div>
                          <div className="flex w-full flex-col items-center gap-4 rounded-md border px-2 py-4">
                            <GiMagnifyingGlass className="h-8 w-8" />
                            <div className="flex flex-col items-center">
                              <span className="font-bold">20</span>
                              <TypographySmall>Perception</TypographySmall>
                            </div>
                          </div>
                          <div className="flex w-full flex-col items-center gap-4 rounded-md border px-2 py-4">
                            <GiBrickWall className="h-8 w-8" />
                            <div className="flex flex-col items-center">
                              <span className="font-bold">22</span>
                              <TypographySmall>Difficulty</TypographySmall>
                            </div>
                          </div>
                          <div className="flex w-full flex-col items-center gap-4 rounded-md border px-2 py-4">
                            <GiWalk className="h-8 w-8" />
                            {/* <GiFeatheredWing /> */}
                            {/* <GiWaves /> */}
                            <div className="flex flex-col items-center">
                              <span className="font-bold">7.5</span>
                              <TypographySmall>Walk</TypographySmall>
                            </div>
                          </div>
                          <div className="flex w-full flex-col items-center gap-4 rounded-md border px-2 py-4">
                            <GiInspiration className="h-8 w-8" />
                            <div className="flex flex-col items-center">
                              <span className="font-bold">2</span>
                              <TypographySmall>Inspiration</TypographySmall>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button className="focus-visible:ring-ring relative flex h-[98px] w-16 flex-col gap-0.5 overflow-hidden rounded-md ring-offset-1 hover:cursor-pointer hover:bg-neutral-50 focus-visible:ring-1 focus-visible:outline-hidden">
              <div className="absolute top-1 left-1 grid h-4 w-2 rounded-full bg-emerald-500"></div>
              <div className="absolute top-1 right-1 grid h-4 w-2 rounded-full bg-red-500"></div>
              <div className="grid h-16 w-16 place-content-center rounded-md">
                <motion.span
                  layoutId={`player-${player.id}-icon`}
                  className="text-4xl"
                >
                  {player.icon}
                </motion.span>
              </div>
              <div className="flex w-full items-center justify-center gap-1 py-1">
                <HeartFilledIcon />
                <span>{player.health}</span>
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
