import { CheckIcon, ExternalLinkIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";
import { BaseBoxShapeUtil, HTMLContainer } from "tldraw";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Kbd } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, getModifierKey } from "@/lib/utils";

import { useCanvasTldrawContext } from "./CanvasTldrawContext";
import { EncounterShape } from "./shapes";

function EncounterShapeView({ shape }: { shape: EncounterShape }) {
  const { t } = useTranslation("ComponentCanvas");
  const { elementsByShapeId } = useCanvasTldrawContext();
  
  // Try to get element by exact shape ID, or by the encounterId prop if it exists
  let element = elementsByShapeId.get(shape.id as any);
  
  // Fallback: if not found by shape.id, try to find an element in the map whose ID matches shape.props.encounterId
  if (!element && shape.props.encounterId) {
    const encId = shape.props.encounterId;
    for (const val of elementsByShapeId.values()) {
      if (val.id === encId) {
        element = val;
        break;
      }
    }
  }
  
  // Final fallback: if still not found, try to match by searching the map for an element whose string-converted shape.id matches
  if (!element) {
    const shapeIdStr = String(shape.id);
    for (const [key, val] of elementsByShapeId.entries()) {
      if (String(key) === shapeIdStr) {
        element = val;
        break;
      }
    }
  }

  const { w, h, color, icon, name, completed, isCombatActive } = shape.props;
  const title = name || "Encounter";

  const handleOpen = () => {
    element?.onClick?.(element);
  };

  const handleEdit = () => {
    element?.onEdit?.(element);
  };

  return (
    <div
      className="relative h-full w-full"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <ContextMenu modal={false}>
        <ContextMenuTrigger asChild>
          <div
            role="button"
            tabIndex={0}
            data-element-id={element?.id ?? "temporary"}
            className="relative h-full w-full border-0 bg-transparent p-0 text-left cursor-default outline-none"
          >
            <svg
              width={w}
              height={h}
              viewBox={`0 0 ${w} ${h}`}
              style={{ overflow: "visible" }}
            >
              <title>{title}</title>
              {isCombatActive && (
                <motion.rect
                  x={-16}
                  y={-16}
                  width={w + 32}
                  height={h + 32}
                  rx={16}
                  ry={16}
                  fill="none"
                  stroke={color}
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
              <g style={{ opacity: completed ? 0.5 : 1 }}>
                <rect
                  x={0}
                  y={0}
                  width={w}
                  height={h}
                  fill={color}
                  fillOpacity={0.25}
                  stroke={color}
                  strokeWidth={4}
                  rx={4}
                  ry={4}
                />
                <rect
                  x={0}
                  y={0}
                  width={w}
                  height={60}
                  fill={color}
                  fillOpacity={0.8}
                  stroke={color}
                  strokeWidth={4}
                  rx={4}
                  ry={4}
                />
                <text x={10} y={40} className="text-4xl select-none">
                  {icon}
                </text>
                <text
                  x={60}
                  y={40}
                  className="text-lg text-white font-bold select-none"
                  dominantBaseline="middle"
                >
                  {name}
                </text>
              </g>
              {completed && (
                <foreignObject
                  x={w / 2 - 32}
                  y={h / 2 - 32}
                  width={64}
                  height={64}
                  className="pointer-events-none"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-emerald-950">
                    <CheckIcon className="h-8 w-8 text-white" />
                  </div>
                </foreignObject>
              )}
            </svg>

            {element && (
              <div className="absolute top-2 right-2 z-50">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-10 w-10 bg-black/50 text-white hover:bg-black/80 hover:text-white backdrop-blur-sm border border-white/20 pointer-events-auto"
                        onPointerDown={(event) => {
                          event.stopPropagation();
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOpen();
                        }}
                      >
                        <ExternalLinkIcon className="h-6 w-6" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      className="flex items-center gap-2"
                      side="right"
                    >
                      <p>{t("select")}</p>
                      <div className="flex gap-0.5">
                        <Kbd>{getModifierKey()}</Kbd>
                        <Kbd>O</Kbd>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </ContextMenuTrigger>
        {element && (
          <ContextMenuContent className="w-52">
            <ContextMenuItem onClick={handleEdit}>{t("edit")}</ContextMenuItem>
            <ContextMenuItem onClick={handleOpen}>
              {t("select")}
            </ContextMenuItem>
          </ContextMenuContent>
        )}
      </ContextMenu>
    </div>
  );
}

export class EncounterShapeUtil extends BaseBoxShapeUtil<EncounterShape> {
  static override type = "encounter" as const;

  override getDefaultProps(): EncounterShape["props"] {
    return {
      w: 200,
      h: 100,
      color: "#FFFFFF",
      icon: "📝",
      name: "New Encounter",
      encounterId: "",
      completed: false,
      isCombatActive: false,
    };
  }

  override component(shape: EncounterShape) {
    return (
      <HTMLContainer
        style={{ width: shape.props.w, height: shape.props.h, zIndex: 1 }}
        className="pointer-events-auto"
      >
        <EncounterShapeView shape={shape} />
      </HTMLContainer>
    );
  }

  override indicator(shape: EncounterShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
