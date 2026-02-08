import { Player } from "@/types/player";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type Props = { player: Player };

function IconAvatar({ player, ...props }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            aria-describedby={player.name}
            {...props}
            className="relative grid h-12 w-12 place-content-center rounded-md outline-2 outline-transparent focus-within:outline-black hover:outline-black"
          >
            <Avatar>
              <AvatarImage src={player.image || undefined} alt={player.name} />
              <AvatarFallback>{player.icon}</AvatarFallback>
            </Avatar>

            <span className="absolute -top-2 -right-2 rounded-full bg-white p-1 text-xs shadow">
              {player.icon}
            </span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{player.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default IconAvatar;
