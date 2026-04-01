import React, { memo } from "react";
import { type Editor, type TLShapeId, GeoShapeGeoStyle } from "tldraw";
import {
  Copy,
  Trash2,
  AlignStartVertical,
  AlignEndVertical,
  AlignLeft,
  AlignRight,
  AlignCenterVertical,
  AlignCenterHorizontal,
  AlignHorizontalDistributeCenter,
  AlignVerticalDistributeCenter,
  Pencil,
  Eraser,
  ArrowUpRight,
  Type,
  StickyNote,
  Square,
  MousePointer2,
  Circle,
  Triangle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { COMMON_COLORS } from "@/lib/colors";
import { MarkupElement } from "@/types/markup";
import { DrawingMode } from "./CanvasToolbar";

type SelectionToolbarProps = {
  editor: Editor | null;
  drawingMode: DrawingMode;
  selectedIds: string[];
  markupByShapeId: Map<string, MarkupElement>;
  onMarkupDelete: (markupId: number) => void;
  onMarkupDuplicate: (markupId: number) => void;
  onMarkupColorChange: (markupId: number, color: string) => void;
};

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  editor,
  drawingMode,
  selectedIds,
  markupByShapeId,
  onMarkupDelete,
  onMarkupDuplicate,
  onMarkupColorChange,
}) => {
  if (!editor) return null;

  const showToolPalette = drawingMode === "markup";
  const hasSelection = selectedIds.length > 0;

  if (!showToolPalette && !hasSelection) return null;

  const ids = selectedIds as TLShapeId[];

  const selectedMarkups = ids
    .map((id) => markupByShapeId.get(id))
    .filter((m): m is MarkupElement => !!m);

  const isSingleMarkup = selectedMarkups.length === 1;
  const markup = isSingleMarkup ? selectedMarkups[0] : null;

  const handleAlign = (type: "top" | "bottom" | "left" | "right" | "center-v" | "center-h") => {
    if (ids.length < 2) return;
    switch (type) {
      case "top": editor.alignShapes(ids, "top"); break;
      case "bottom": editor.alignShapes(ids, "bottom"); break;
      case "left": editor.alignShapes(ids, "left"); break;
      case "right": editor.alignShapes(ids, "right"); break;
      case "center-v": editor.alignShapes(ids, "center-vertical"); break;
      case "center-h": editor.alignShapes(ids, "center-horizontal"); break;
    }
  };

  const handleDistribute = (type: "horizontal" | "vertical") => {
    if (ids.length < 3) return;
    if (type === "horizontal") editor.distributeShapes(ids, "horizontal");
    else editor.distributeShapes(ids, "vertical");
  };

  const handleToolChange = (toolId: string, props?: any) => {
    editor.setCurrentTool(toolId);
    if (props) {
      editor.updateInstanceState({ stylesForNextShape: { ...editor.getInstanceState().stylesForNextShape, ...props } });
    }
  };

  const currentTool = editor.getCurrentToolId();
  const currentGeo = editor.getSharedStyles().get(GeoShapeGeoStyle);

  const tools = [
    { id: "select", icon: <MousePointer2 className="w-4 h-4" />, label: "Select" },
    { id: "draw", icon: <Pencil className="w-4 h-4" />, label: "Pencil" },
    { id: "eraser", icon: <Eraser className="w-4 h-4" />, label: "Eraser" },
    { id: "arrow", icon: <ArrowUpRight className="w-4 h-4" />, label: "Arrow" },
    { id: "text", icon: <Type className="w-4 h-4" />, label: "Text" },
    { id: "note", icon: <StickyNote className="w-4 h-4" />, label: "Note" },
    { id: "geo-rect", icon: <Square className="w-4 h-4" />, label: "Rectangle", tool: "geo", geo: "rectangle", props: { "tldraw:geo": "rectangle" } },
    { id: "geo-ellipse", icon: <Circle className="w-4 h-4" />, label: "Ellipse", tool: "geo", geo: "ellipse", props: { "tldraw:geo": "ellipse" } },
    { id: "geo-triangle", icon: <Triangle className="w-4 h-4" />, label: "Triangle", tool: "geo", geo: "triangle", props: { "tldraw:geo": "triangle" } },
  ];

  const showMarkupActions = selectedMarkups.length > 0;
  const showAlignActions = selectedIds.length >= 2;
  const showDistributeActions = selectedIds.length >= 3;

  const isToolActive = (tool: any) => {
    if (tool.tool === "geo") {
      return currentTool === "geo" && (currentGeo as any) === tool.geo;
    }
    return currentTool === tool.id;
  };

  return (
    <TooltipProvider>
      {/* Tool Palette Bubble - Bottom 4 */}
      {showToolPalette && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1 rounded-full border border-white/80 bg-white/40 p-1 shadow-md backdrop-blur-sm z-50">
          {tools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleToolChange(tool.tool || tool.id, tool.props)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                    isToolActive(tool)
                      ? "bg-slate-800 text-white"
                      : "bg-white text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {tool.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tool.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}

      {/* Selection Bubble - Bottom 80 */}
      {(showMarkupActions || showAlignActions || showDistributeActions) && (
        <div className="absolute bottom-[80px] left-1/2 flex -translate-x-1/2 gap-2 rounded-full border border-white/80 bg-white/40 p-1 shadow-md backdrop-blur-sm z-50">
          {showMarkupActions && (
            <>
              {isSingleMarkup && markup && (
                <div className="flex items-center gap-1 px-2 border-r border-white/40">
                  {COMMON_COLORS.map((c) => (
                    <Tooltip key={c.value}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onMarkupColorChange(markup.id, c.value)}
                          className={cn(
                            "h-4 w-4 rounded-full border border-black/10 hover:scale-110 transition-transform",
                            c.className,
                            markup.color === c.value && "ring-2 ring-black ring-offset-1"
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{c.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              )}

              {isSingleMarkup && markup && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onMarkupDuplicate(markup.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent><p>Duplicate</p></TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      selectedMarkups.forEach((m) => onMarkupDelete(m.id));
                      editor.selectNone();
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-red-700 bg-white text-red-700 hover:cursor-pointer hover:bg-red-50 hover:shadow-xs"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent><p>Delete {selectedMarkups.length > 1 ? "Selected" : ""}</p></TooltipContent>
              </Tooltip>
            </>
          )}

          {showAlignActions && (
            <div className={cn("flex items-center gap-1 px-1", showMarkupActions && "border-l border-white/40")}>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => handleAlign("left")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100"><AlignLeft className="w-4 h-4" /></button>
                  </TooltipTrigger>
                  <TooltipContent>Align Left</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => handleAlign("center-h")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100"><AlignCenterHorizontal className="w-4 h-4" /></button>
                  </TooltipTrigger>
                  <TooltipContent>Align Horizontal Center</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => handleAlign("right")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100"><AlignRight className="w-4 h-4" /></button>
                  </TooltipTrigger>
                  <TooltipContent>Align Right</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-1 px-1 border-l border-white/40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => handleAlign("top")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100"><AlignStartVertical className="w-4 h-4" /></button>
                  </TooltipTrigger>
                  <TooltipContent>Align Top</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => handleAlign("center-v")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100"><AlignCenterVertical className="w-4 h-4" /></button>
                  </TooltipTrigger>
                  <TooltipContent>Align Vertical Center</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={() => handleAlign("bottom")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100"><AlignEndVertical className="w-4 h-4" /></button>
                  </TooltipTrigger>
                  <TooltipContent>Align Bottom</TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}

          {showDistributeActions && (
            <div className="flex items-center gap-1 px-1 border-l border-white/40">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => handleDistribute("horizontal")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100"><AlignHorizontalDistributeCenter className="w-4 h-4" /></button>
                </TooltipTrigger>
                <TooltipContent>Distribute Horizontal</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => handleDistribute("vertical")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100"><AlignVerticalDistributeCenter className="w-4 h-4" /></button>
                </TooltipTrigger>
                <TooltipContent>Distribute Vertical</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      )}
    </TooltipProvider>
  );
};

export default memo(SelectionToolbar);
