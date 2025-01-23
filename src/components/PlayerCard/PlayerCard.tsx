import { Player } from "@/types/player";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "../ui/badge";
import { useMeasure } from "@uidotdev/usehooks";
import { FaThumbsDown, FaThumbsUp } from "react-icons/fa";
import {
  GiBrickWall,
  GiInspiration,
  GiMagnifyingGlass,
  GiShield,
  GiWalk,
} from "react-icons/gi";
import { TypographySmall } from "../ui/typographyhSmall";

type Props = {
  player: Player;
  expanded: boolean;
  selected: boolean;
  onSelect: (id: Player["id"] | null) => void;
};

function PlayerCard({ player, expanded, selected, onSelect }: Props) {
  const [ref, { height }] = useMeasure();

  function handleSelectPlayer() {
    if (selected) {
      onSelect(null);
    } else {
      onSelect(player.id);
    }
  }

  return (
    <AnimatePresence mode="popLayout">
      {expanded ? (
        <motion.div
          key={`player-${player.id}-${player.name}-expanded`}
          className="min-h-[98px] w-[576px]"
        >
          <div className="flex w-full gap-2">
            <motion.button
              onClick={handleSelectPlayer}
              layoutId={`${player.id}-icon`}
              className="grid h-16 w-16 place-content-center rounded-md hover:cursor-pointer hover:bg-neutral-50"
            >
              <span className="text-4xl">{player.icon}</span>
            </motion.button>

            <motion.div className="grow overflow-hidden">
              <motion.div
                initial={{ x: "-10%", opacity: 0 }}
                animate={{
                  x: 0,
                  opacity: 1,
                  transition: { duration: 0.4, delay: expanded ? 0.2 : 0 },
                }}
                exit={{ x: "-10%", opacity: 0, transition: { duration: 0.1 } }}
                className="flex flex-col py-1"
              >
                <div className="flex items-center gap-2">
                  <span className="grow text-xl font-bold">
                    {player.name}
                  </span>

                  <Badge className="bg-emerald-500">
                    <div className="flex items-center gap-1">
                      <FaThumbsUp />
                      <span>3</span>
                    </div>
                  </Badge>

                  <Badge className="bg-red-500">
                    <div className="flex items-center gap-1">
                      <FaThumbsDown />
                      <span>1</span>
                    </div>
                  </Badge>

                  <Badge>LVL {player.level}</Badge>

                  <Badge>
                    <div className="flex items-center gap-1">
                      <HeartFilledIcon />
                      <span>
                        {player.health}/{player.maxHealth}
                      </span>
                    </div>
                  </Badge>
                </div>

                <span className="">{player.role}</span>

                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{
                    opacity: selected ? 1 : 0,
                    height: selected ? (height ? height + 16 : "auto") : 0,
                    transition: { duration: 0.4 },
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    transition: { duration: 0.2 },
                  }}
                  className="pt-4"
                >
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
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.button
          onClick={handleSelectPlayer}
          key={`player-${player.id}-${player.name}`}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="relative flex h-[98px] w-16 flex-col gap-0.5 overflow-hidden rounded-md hover:cursor-pointer hover:bg-neutral-50"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="absolute left-1 top-1 grid h-4 w-2 rounded-full bg-emerald-500"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="absolute right-1 top-1 grid h-4 w-2 rounded-full bg-red-500"
          ></motion.div>

          <motion.div
            layoutId={`${player.id}-icon`}
            className="grid h-16 w-16 place-content-center rounded-md"
          >
            <span className="text-4xl">{player.icon}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="flex w-full items-center justify-center gap-1 py-1"
          >
            <HeartFilledIcon />
            <span>{player.health}</span>
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default PlayerCard;
