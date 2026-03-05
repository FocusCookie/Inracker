import React, { memo } from "react";
import { cn } from "@/lib/utils";
import { Token } from "@/types/tokens";
import { TokenEntity } from "./types";
import { CoffeeIcon, BedSingleIcon, ClockIcon, Sparkles } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTranslation } from "react-i18next";
import { formatDuration } from "@/lib/time";
import {
  ContextMenu,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Badge } from "@/components/ui/badge";

type TokenNodeProps = {
  token: Token;
  entity: TokenEntity;
  borderColor: string;
  isVisible: boolean;
  isSelected: boolean;
  isInteractive: boolean;
  onDragStart: (e: React.MouseEvent<SVGImageElement>, token: Token) => void;
  onClick: (token: Token) => void;
  contextMenuContent: React.ReactNode;
};

const TokenNode: React.FC<TokenNodeProps> = ({
  token,
  entity,
  borderColor,
  isVisible,
  isSelected,
  isInteractive,
  onDragStart,
  onClick,
  contextMenuContent,
}) => {
  const { t } = useTranslation("ComponentCanvas");

  const renderEffectsList = (effects: any[]) => (
    <ul className="flex flex-col gap-1.5">
      {effects.map((effect) => (
        <li key={effect.id}>
          <div className="flex items-center justify-between gap-2 rounded p-1 transition-colors hover:bg-slate-50">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-sm">{effect.icon}</span>
              <span className="truncate text-xs font-medium">
                {effect.name}
              </span>
            </div>
            <Badge
              variant={effect.type === "positive" ? "secondary" : "destructive"}
              className="h-5 gap-1 px-1.5 text-[10px]"
            >
              {effect.duration_type === "short" ? (
                <CoffeeIcon className="h-2.5 w-2.5" />
              ) : effect.duration_type === "long" ? (
                <BedSingleIcon className="h-2.5 w-2.5" />
              ) : (
                <ClockIcon className="h-2.5 w-2.5" />
              )}
              {effect.duration_type === "time"
                ? formatDuration(effect.duration)
                : effect.duration_type === "short" ||
                    effect.duration_type === "long"
                  ? ""
                  : effect.duration}
            </Badge>
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <g
          data-token-group-id={token.id}
          className={cn(
            "group outline-4 focus:outline-none focus-visible:outline-none",
            isVisible ? "visible" : "hidden",
            isSelected && "ring-4 ring-blue-500 ring-offset-2",
          )}
          tabIndex={0}
          role="button"
          aria-label={`Token of ${entity.name}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick(token);
            }
          }}
        >
          <circle
            cx={token.coordinates.x + 50}
            cy={token.coordinates.y + 50}
            r={40}
            fill="white"
            stroke={borderColor}
            strokeWidth={4}
            className="pointer-events-none"
          />

          <image
            className="hover:cursor-pointer"
            data-token-id={token.id}
            href={entity.image || undefined}
            width={100}
            height={100}
            x={token.coordinates.x}
            y={token.coordinates.y}
            preserveAspectRatio="xMidYMid"
            style={{
              cursor: isInteractive ? "move" : "default",
              clipPath: "circle(40%)",
            }}
            onMouseDown={(e) => onDragStart(e, token)}
            onClick={() => onClick(token)}
          />
          <g>
            <text
              className="pointer-events-none text-4xl select-none"
              x={token.coordinates.x}
              y={token.coordinates.y + 32}
            >
              {entity.icon}
            </text>
          </g>
          {!entity.image && (
            <text
              x={token.coordinates.x + 50}
              y={token.coordinates.y + 50}
              textAnchor="middle"
              dominantBaseline="central"
              className="pointer-events-none fill-black text-2xl font-bold select-none"
            >
              {entity.name.slice(0, 2).toUpperCase()}
            </text>
          )}
          {entity.effects && entity.effects.length > 0 && (
            <foreignObject
              x={token.coordinates.x + 60}
              y={token.coordinates.y + 10}
              width={24}
              height={24}
              className="pointer-events-auto"
            >
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm hover:cursor-pointer hover:bg-black hover:text-white">
                    <Sparkles className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-sm leading-none font-semibold">
                      {t("activeEffects")}
                    </h4>
                    {renderEffectsList(entity.effects)}
                  </div>
                </PopoverContent>
              </Popover>
            </foreignObject>
          )}
        </g>
      </ContextMenuTrigger>
      {contextMenuContent}
    </ContextMenu>
  );
};

export default memo(TokenNode);
