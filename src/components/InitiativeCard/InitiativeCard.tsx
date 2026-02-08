import { cn } from "@/lib/utils";
import { EncounterOpponent } from "@/types/opponents";
import { Player } from "@/types/player";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export type PlayerEntity = {
  type: "player";
  position: number;
} & Player;

export type EncounterOpponentEntity = {
  type: "encounterOpponent";
  position: number;
} & EncounterOpponent;

type Entity = PlayerEntity | EncounterOpponentEntity;

type Props = {
  entity: Entity;
  isActive: boolean;
  onClick?: (entity: Entity) => void;
  onRemove?: (entity: Entity) => void;
};

function InitiativeCard({ entity, isActive, onClick, onRemove }: Props) {
  const { t } = useTranslation("ComponentInitiativeCard");

  return (
    <ContextMenu>
      <Tooltip>
        <ContextMenuTrigger asChild>
          <TooltipTrigger asChild>
            <button
              onClick={() => onClick?.(entity)}
              className={cn(
                "relative flex h-28 w-24 cursor-pointer flex-col overflow-hidden rounded-lg bg-white outline-1 outline-white transition-all",
                "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive outline-none focus-visible:ring-[3px]",
                isActive && "shadow-2xl",
              )}
            >
              <span
                className={cn(
                  "absolute top-2 left-2 rounded px-2 py-1 text-sm font-semibold",
                  isActive
                    ? "bg-white/60 text-black"
                    : "bg-black/60 text-white",
                )}
              >
                {entity.position}
              </span>

              {entity.image && entity.image !== "" ? (
                <>
                  {!!entity.icon && (
                    <span className="absolute top-2 right-2">
                      {entity.icon}
                    </span>
                  )}
                  <img
                    className="h-20 w-full object-cover"
                    src={entity.image}
                    alt={entity.name}
                  />
                </>
              ) : (
                <div className="flex h-20 w-full items-center justify-center">
                  <span className="text-6xl select-none">{entity.icon}</span>
                </div>
              )}

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
            </button>
          </TooltipTrigger>
        </ContextMenuTrigger>
        <TooltipContent>{entity.name}</TooltipContent>
      </Tooltip>
      <ContextMenuContent>
        {onRemove && (
          <ContextMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => onRemove(entity)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("removeFromInitiative")}
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default InitiativeCard;
