import React, { memo } from "react";
import {
  CoffeeIcon,
  BedSingleIcon,
  ClockIcon,
  Sparkles,
  SquareMenu,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDuration } from "@/lib/time";
import { cn } from "@/lib/utils";
import { Token } from "@/types/tokens";

import { TokenEntity } from "./types";

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
  onDragStart: _onDragStart,
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
    <div
      data-token-group-id={token.id}
      className={cn(
        "group relative h-full w-full outline-4 focus:outline-none focus-visible:outline-none",
        isVisible ? "visible" : "hidden",
        isSelected && "ring-4 ring-blue-500 ring-offset-2",
      )}
      aria-label={`Token of ${entity.name}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(token);
        }
      }}
      onClick={() => onClick(token)}
    >
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle
          cx={50}
          cy={50}
          r={40}
          fill="white"
          stroke={borderColor}
          strokeWidth={4}
          className="pointer-events-none"
        />
        {entity.image && (
          <image
            className="hover:cursor-pointer"
            data-token-id={token.id}
            href={entity.image}
            width={100}
            height={100}
            x={0}
            y={0}
            preserveAspectRatio="xMidYMid"
            style={{
              cursor: isInteractive ? "move" : "default",
              clipPath: "circle(40%)",
            }}
          />
        )}
        <g>
          <text
            className="pointer-events-none text-4xl select-none"
            x={0}
            y={32}
          >
            {entity.icon}
          </text>
        </g>
        {!entity.image && (
          <text
            x={50}
            y={50}
            textAnchor="middle"
            dominantBaseline="central"
            className="pointer-events-none fill-black text-2xl font-bold select-none"
          >
            {entity.name.slice(0, 2).toUpperCase()}
          </text>
        )}
      </svg>

      {entity.effects && entity.effects.length > 0 && (
        <div className="pointer-events-auto absolute top-2 right-4">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm hover:cursor-pointer hover:bg-black hover:text-white"
              >
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
        </div>
      )}

      {/* Action Menu Button */}
      <div
        className={cn(
          "pointer-events-auto absolute -bottom-12 left-1/2 z-50 -translate-x-1/2 transition-opacity duration-200",
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu modal={true}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white/80 text-black shadow-lg backdrop-blur-sm transition-colors hover:cursor-pointer hover:bg-black/80 hover:text-white"
            >
              <SquareMenu className="h-8 w-8" />
            </button>
          </DropdownMenuTrigger>
          {contextMenuContent}
        </DropdownMenu>
      </div>
    </div>
  );
};

export default memo(TokenNode);
