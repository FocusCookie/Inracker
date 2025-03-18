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
            className="relative grid h-12 w-12 place-content-center rounded-full outline-2 outline-transparent focus-within:outline-black hover:outline-black"
          >
            <Avatar>
              <AvatarImage src={player.image || undefined} alt={player.name} />
              <AvatarFallback>{player.icon}</AvatarFallback>
            </Avatar>

            <span className="absolute top-0 right-0 rounded-full bg-white p-0.5 text-sm shadow">
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
