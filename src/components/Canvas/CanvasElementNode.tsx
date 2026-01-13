import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { CheckIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { useTranslation } from "react-i18next";
import { ClickableCanvasElement } from "./Canvas";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

type Props = {
  element: ClickableCanvasElement & { id: any };
  isSelected: boolean;
  onEdit: () => void;
  onClick: () => void;
  onDragStart: (e: React.MouseEvent<SVGGElement>) => void;
  onResizeStart: (
    e: React.MouseEvent<SVGRectElement>,
    handle: "nw" | "ne" | "sw" | "se",
  ) => void;
  onSelect: () => void;
};

export function CanvasElementNode({
  element,
  isSelected,
  onEdit,
  onClick,
  onDragStart,
  onResizeStart,
  onSelect,
}: Props) {
  const { t } = useTranslation("ComponentCanvas");

  const handleSize = 16; // Size of resize handles

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>
        <g
          className="group hover:cursor-move focus:outline-none"
          data-element-id={element.id}
          transform={`translate(${element.x}, ${element.y})`}
          onMouseDown={onDragStart}
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          tabIndex={0}
          role="button"
          aria-label={
            element.name ? `Open ${element.name}` : "Open canvas element"
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect();
            }
          }}
        >
          {element.isCombatActive && (
            <motion.rect
              x={-16}
              y={-16}
              width={element.width + 32}
              height={element.height + 32}
              rx={16}
              ry={16}
              fill="none"
              stroke={element.color}
              initial={{ strokeWidth: 4, opacity: 0.3 }}
              animate={{ strokeWidth: 32, opacity: 0.8 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          )}

          <g className="hover:cursor-pointer">
            <g style={{ opacity: element.completed ? 0.4 : 1 }}>
              <rect
                x={0}
                y={0}
                width={element.width}
                height={element.height}
                fill={element.color}
                fillOpacity={0.25}
                stroke={element.color}
                strokeWidth={4}
                rx={4}
                ry={4}
                filter="url(#subtleDropShadow)"
              />

              {/* Header rectangle */}
              <rect
                x={0}
                y={0}
                width={element.width}
                height={60}
                fill={element.color}
                fillOpacity={0.8}
                stroke={element.color}
                strokeWidth={4}
                rx={4}
                ry={4}
              />

              {/* Icon */}
              <g transform={`translate(6, 34)`}>
                <text
                  className="font-sans text-4xl font-bold shadow-sm select-none"
                  dominantBaseline="middle"
                >
                  {element.icon}
                </text>
              </g>

              {/* Text */}
              {element.name && (
                <g transform={`translate(60, 30)`}>
                  <defs>
                    <clipPath id={`text-clip-${element.id}`}>
                      <rect
                        x="0"
                        y="-12"
                        width={element.width - 66}
                        height="24"
                      />
                    </clipPath>
                  </defs>
                  <text
                    className="font-sans text-lg font-medium text-white select-none"
                    dominantBaseline="middle"
                    clipPath={`url(#text-clip-${element.id})`}
                  >
                    {element.name}
                  </text>
                </g>
              )}
            </g>

            {/* Open Button (Visible on select OR hover) */}
            <g
              transform={`translate(${element.width - 44}, 10)`}
              className={cn(
                "transition-opacity duration-200",
                isSelected
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100",
              )}
            >
              <foreignObject
                width="40"
                height="40"
                className={cn(
                  "pointer-events-none", // Default to none so it doesn't block when hidden
                  (isSelected || true) && "group-hover:pointer-events-auto", // Enable on hover
                  isSelected && "pointer-events-auto", // Enable when selected
                )}
              >
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 bg-black text-white hover:bg-black/80 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }}
                >
                  <ExternalLinkIcon className="h-6 w-6" />
                </Button>
              </foreignObject>
            </g>

            {/* Completed Icon (Large, centered) */}
            {element.completed && (
              <g
                transform={`translate(${element.width / 2 - 64}, ${element.height / 2 - 64})`}
              >
                <foreignObject
                  width="128"
                  height="128"
                  className="pointer-events-none"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white/80">
                    <CheckIcon className="h-32 w-32 text-emerald-500" />
                  </div>
                </foreignObject>
              </g>
            )}
          </g>

          <rect
            x={-4}
            y={-4}
            width={element.width + 8}
            height={element.height + 8}
            rx={4}
            ry={4}
            fill="none"
            stroke="white"
            strokeWidth={8}
            className={`pointer-events-none opacity-0 group-focus:opacity-100 group-focus-visible:opacity-100 ${
              isSelected ? "opacity-100" : ""
            }`}
          />

          {isSelected && (
            <g>
              {/* Resize Handles */}
              <rect
                x={-handleSize / 2}
                y={-handleSize / 2}
                width={handleSize}
                height={handleSize}
                fill="white"
                stroke="black"
                strokeWidth={1}
                className="cursor-nw-resize"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onResizeStart(e, "nw");
                }}
              />
              <rect
                x={element.width - handleSize / 2}
                y={-handleSize / 2}
                width={handleSize}
                height={handleSize}
                fill="white"
                stroke="black"
                strokeWidth={1}
                className="cursor-ne-resize"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onResizeStart(e, "ne");
                }}
              />
              <rect
                x={-handleSize / 2}
                y={element.height - handleSize / 2}
                width={handleSize}
                height={handleSize}
                fill="white"
                stroke="black"
                strokeWidth={1}
                className="cursor-sw-resize"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onResizeStart(e, "sw");
                }}
              />
              <rect
                x={element.width - handleSize / 2}
                y={element.height - handleSize / 2}
                width={handleSize}
                height={handleSize}
                fill="white"
                stroke="black"
                strokeWidth={1}
                className="cursor-se-resize"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  onResizeStart(e, "se");
                }}
              />
            </g>
          )}
        </g>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          {t("edit")}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isSelected ? t("deselect") : t("resize")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
