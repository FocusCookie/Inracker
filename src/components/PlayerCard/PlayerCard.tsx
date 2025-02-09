import { Player } from "@/types/player";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { motion } from "framer-motion";
import MarkdownReader from "../MarkdownReader/MarkdownReader";
import Collapsible from "../Collapsible/Collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type Props = {
  player: Player;
  expanded: boolean;
  onRemove: (playerId: Player["id"]) => void;
  onEdit: (player: Player["id"]) => void;
};

function PlayerCard({ player, expanded, onEdit, onRemove }: Props) {
  const handleRemovePlayer = () => {
    onRemove(player.id);
  };

  const handleEditPlayer = () => {
    onEdit(player.id);
  };

  //TODO: Translations
  const quickActions = () => (
    <DropdownMenuContent className="w-56">
      <DropdownMenuLabel>{player.name}</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>
          Set Initiative
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Decrease Health
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Increase Health
          <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Add Effect
          <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuGroup>

      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleRemovePlayer}>
        Remove from Group
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleEditPlayer}>
        Edit Player
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  return expanded ? (
    <div className="flex h-full w-[576px] gap-2">
      <div className="w-16">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus-visible:ring-ring hover:bg-accent relative grid h-16 w-16 flex-col place-content-center gap-1 rounded-md ring-offset-1 hover:cursor-pointer focus-visible:ring-1 focus-visible:outline-hidden">
              <div className="hover:bg-accent relative grid h-16 w-16 place-content-center rounded-md">
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
            </button>
          </DropdownMenuTrigger>
          {quickActions()}
        </DropdownMenu>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{
          opacity: 1,
          x: 0,
          transition: { duration: 0.3, delay: 0.15 },
        }}
        className="flex w-full flex-col gap-2 pt-0.5"
      >
        <div className="grow">
          <div className="flex flex-col py-1">
            <div className="flex items-center gap-2">
              <span className="grow text-xl font-bold">{player.name}</span>

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
        </div>

        <div className="overflow-hidden p-0.5">
          <Collapsible title="Overview">
            <MarkdownReader markdown={player.overview} />
          </Collapsible>
        </div>
      </motion.div>
    </div>
  ) : (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus-visible:ring-ring hover:bg-accent relative flex w-16 flex-col gap-1 rounded-md ring-offset-1 hover:cursor-pointer focus-visible:ring-1 focus-visible:outline-hidden">
          <div className="hover:bg-accent relative grid h-16 w-16 place-content-center rounded-md">
            <Avatar>
              <AvatarImage src={player.image || undefined} alt={player.name} />
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
                  player.effects.filter((effect) => effect.type === "positive")
                    .length
                }
              </div>
            )}
            {player.effects.filter((effect) => effect.type === "negative")
              .length > 0 && (
              <div className="w-full rounded-md bg-red-500 px-1 py-0.5 text-sm font-bold text-white">
                {
                  player.effects.filter((effect) => effect.type === "negative")
                    .length
                }
              </div>
            )}
          </div>
        </button>
      </DropdownMenuTrigger>

      {quickActions()}
    </DropdownMenu>
  );
}

export default PlayerCard;
