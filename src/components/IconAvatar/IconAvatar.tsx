import { Player } from "@/types/player";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type Props = { player: Player };

function IconAvatar({ player, ...props }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            {...props}
            className="hover:bg-accent relative grid h-16 w-16 place-content-center rounded-md"
          >
            <Avatar>
              <AvatarImage src={player.image || undefined} alt={player.name} />
              <AvatarFallback>{player.icon}</AvatarFallback>
            </Avatar>

            <span className="absolute top-0 right-0 rounded-full bg-white p-0.5 shadow">
              {player.icon}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{player.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default IconAvatar;
