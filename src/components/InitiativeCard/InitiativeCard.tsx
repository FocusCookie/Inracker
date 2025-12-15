import { cn } from "@/lib/utils";
import { EncounterOpponent } from "@/types/opponents";
import { Player } from "@/types/player";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type PlayerEntity = {
  type: "player";
  position: number;
} & Player;

export type EncounterOpponentEntity = {
  type: "encounterOpponent";
  position: number;
} & EncounterOpponent;

type Props = {
  entity: Player | EncounterOpponent;
  isActive: boolean;
};

function InitiativeCard({ entity, isActive }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "relative flex h-28 w-22 flex-col overflow-hidden rounded-lg bg-white outline-1 outline-white",
            isActive && "shadow-2xl",
          )}
        >
          <span
            className={cn(
              "absolute top-2 left-2 rounded px-2 py-1 text-sm font-semibold",
              isActive ? "bg-white/60 text-black" : "bg-black/60 text-white",
            )}
          >
            {entity.position}
          </span>

          {!!entity.icon && (
            <span className="absolute top-2 right-2">{entity.icon}</span>
          )}
          <img
            className="h-20 w-full object-cover"
            src={entity.image}
            alt={entity.name}
          />

          <div
            className={cn(
              "flex h-8 w-full items-center justify-center font-semibold",
              isActive ? "bg-black text-white" : "bg-white text-black",
            )}
          >
            <span>
              {entity.health} / {entity.max_health}
            </span>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>{entity.name}</TooltipContent>
    </Tooltip>
  );
}

export default InitiativeCard;

