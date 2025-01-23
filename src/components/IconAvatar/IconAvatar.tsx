import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type Props = { icon: string; name: string; onClick?: () => void };

function IconAvatar({ icon, name, onClick, ...props }: Props) {
  function handleClick() {
    if (onClick) onClick();
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            {...props}
            onClick={handleClick}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-background hover:shadow-sm"
          >
            <span className="text-4xl">{icon}</span>
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default IconAvatar;
