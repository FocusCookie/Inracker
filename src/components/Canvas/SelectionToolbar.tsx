import React, { memo } from "react";
import { type Editor } from "tldraw";
import {
  CopyIcon,
  TrashIcon,
  AlignTopIcon,
  AlignBottomIcon,
  AlignLeftIcon,
  AlignRightIcon,
  AlignCenterVerticallyIcon,
  AlignCenterHorizontallyIcon,
  SpaceBetweenHorizontallyIcon,
  SpaceBetweenVerticallyIcon,
} from "@radix-ui/react-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { COMMON_COLORS } from "@/lib/colors";
import { MarkupElement } from "@/types/markup";

type SelectionToolbarProps = {
  editor: Editor | null;
  selectedIds: string[];
  markupByShapeId: Map<string, MarkupElement>;
  onMarkupDelete: (markupId: number) => void;
  onMarkupDuplicate: (markupId: number) => void;
  onMarkupColorChange: (markupId: number, color: string) => void;
};

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  editor,
  selectedIds,
  markupByShapeId,
  onMarkupDelete,
  onMarkupDuplicate,
  onMarkupColorChange,
}) => {
  if (!editor || selectedIds.length === 0) return null;

  const isSingleMarkup =
    selectedIds.length === 1 && markupByShapeId.has(selectedIds[0]);
  const markup = isSingleMarkup ? markupByShapeId.get(selectedIds[0]) : null;

  const handleAlign = (type: "top" | "bottom" | "left" | "right" | "center-v" | "center-h") => {
    if (selectedIds.length < 2) return;
    switch (type) {
      case "top": editor.alignShapes(selectedIds, "top"); break;
      case "bottom": editor.alignShapes(selectedIds, "bottom"); break;
      case "left": editor.alignShapes(selectedIds, "left"); break;
      case "right": editor.alignShapes(selectedIds, "right"); break;
      case "center-v": editor.alignShapes(selectedIds, "center-v"); break;
      case "center-h": editor.alignShapes(selectedIds, "center-h"); break;
    }
  };

  const handleDistribute = (type: "horizontal" | "vertical") => {
    if (selectedIds.length < 3) return;
    if (type === "horizontal") editor.distributeShapes(selectedIds, "horizontal");
    else editor.distributeShapes(selectedIds, "vertical");
  };

  const showMarkupActions = isSingleMarkup && markup;
  const showAlignActions = selectedIds.length >= 2;
  const showDistributeActions = selectedIds.length >= 3;

  if (!showMarkupActions && !showAlignActions) return null;

  return (
    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full border border-white/80 bg-white/20 p-1 shadow-md backdrop-blur-sm z-50">
      <TooltipProvider>
        {showMarkupActions && (
          <>
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

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onMarkupDuplicate(markup.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
                >
                  <CopyIcon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Duplicate</p></TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onMarkupDelete(markup.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-red-700 bg-white text-red-700 hover:cursor-pointer hover:bg-red-50 hover:shadow-xs"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent><p>Delete</p></TooltipContent>
            </Tooltip>
          </>
        )}

        {showAlignActions && (
          <>
            <div className={cn("flex items-center gap-1 px-1", showMarkupActions && "border-l border-white/40")}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => handleAlign("left")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100"><AlignLeftIcon /></button>
                </TooltipTrigger>
                <TooltipContent>Align Left</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => handleAlign("center-h")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100"><AlignCenterHorizontallyIcon /></button>
                </TooltipTrigger>
                <TooltipContent>Align Horizontal Center</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => handleAlign("right")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100"><AlignRightIcon /></button>
                </TooltipTrigger>
                <TooltipContent>Align Right</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-1 px-1 border-l border-white/40">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => handleAlign("top")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100"><AlignTopIcon /></button>
                </TooltipTrigger>
                <TooltipContent>Align Top</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => handleAlign("center-v")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100"><AlignCenterVerticallyIcon /></button>
                </TooltipTrigger>
                <TooltipContent>Align Vertical Center</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button onClick={() => handleAlign("bottom")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100"><AlignBottomIcon /></button>
                </TooltipTrigger>
                <TooltipContent>Align Bottom</TooltipContent>
              </Tooltip>
            </div>
          </>
        )}

        {showDistributeActions && (
          <div className="flex items-center gap-1 px-1 border-l border-white/40">
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => handleDistribute("horizontal")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100"><SpaceBetweenHorizontallyIcon /></button>
              </TooltipTrigger>
              <TooltipContent>Distribute Horizontal</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button onClick={() => handleDistribute("vertical")} className="flex h-8 w-8 items-center justify-center rounded-full bg-white hover:bg-slate-100"><SpaceBetweenVerticallyIcon /></button>
              </TooltipTrigger>
              <TooltipContent>Distribute Vertical</TooltipContent>
            </Tooltip>
          </div>
        )}
      </TooltipProvider>
    </div>
  );
};

export default memo(SelectionToolbar);
