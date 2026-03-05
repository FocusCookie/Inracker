import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Cross2Icon,
  PaddingIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@radix-ui/react-icons";
import { MinimizeIcon } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { getModifierKey } from "@/lib/utils";

type CanvasToolbarProps = {
  isDrawing: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleDrawing: () => void;
};

const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  isDrawing,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleDrawing,
}) => {
  const { t } = useTranslation("ComponentCanvas");

  return (
    <div className="absolute bottom-4 left-4 flex gap-2 rounded-full border border-white/80 bg-white/20 p-1 shadow-md backdrop-blur-sm">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onZoomOut}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
            >
              <ZoomOutIcon className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            <p>{t("zoomOut")}</p>
            <div className="flex gap-0.5">
              <Kbd>{getModifierKey()}</Kbd>
              <Kbd>-</Kbd>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onZoomIn}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
            >
              <ZoomInIcon className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            <p>{t("zoomIn")}</p>
            <div className="flex gap-0.5">
              <Kbd>{getModifierKey()}</Kbd>
              <Kbd>+</Kbd>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onResetZoom}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
            >
              <MinimizeIcon className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            <p>{t("resetZoom")}</p>
            <div className="flex gap-0.5">
              <Kbd>{getModifierKey()}</Kbd>
              <Kbd>0</Kbd>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggleDrawing}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
            >
              {isDrawing ? (
                <Cross2Icon className="h-4 w-4" />
              ) : (
                <PaddingIcon className="h-4 w-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent className="flex items-center gap-2">
            <p>{t("drawEncounter")}</p>
            <div className="flex gap-0.5">
              <Kbd>{getModifierKey()}</Kbd>
              <Kbd>D</Kbd>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default memo(CanvasToolbar);
