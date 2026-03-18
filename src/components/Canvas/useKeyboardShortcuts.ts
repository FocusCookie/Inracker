import { useEffect } from "react";
import { InteractionMode, ViewBox } from "@/hooks/useCanvasReducer";
import { CanvasElementWithId } from "./types";

type KeyboardShortcutsProps = {
  interactionMode: InteractionMode;
  resizingElementId: string | number | null;
  elements: CanvasElementWithId[];
  applyZoom: (scaleFactor: number, anchor?: { x: number; y: number }) => void;
  resetZoom: () => void;
  setInteractionMode: (mode: InteractionMode) => void;
  onToggleAside?: () => void;
  onOpenSessionLog?: () => void;
  onStartFight?: (encounterId: number) => void;
  onTokenSelect: (token: any | null) => void;
  currentViewBoxRef: React.MutableRefObject<ViewBox>;
  zoomRef: React.MutableRefObject<number>;
  setViewBox: (viewBox: ViewBox) => void;
  svgRef: React.RefObject<SVGSVGElement | null>;
};

export function useKeyboardShortcuts({
  interactionMode,
  resizingElementId,
  elements,
  applyZoom,
  resetZoom,
  setInteractionMode,
  onToggleAside,
  onOpenSessionLog,
  onStartFight,
  onTokenSelect,
  currentViewBoxRef,
  zoomRef,
  setViewBox,
  svgRef,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        if (event.key === "+" || event.key === "=") {
          event.preventDefault();
          applyZoom(1.2);
        } else if (event.key === "-" || event.key === "_") {
          event.preventDefault();
          applyZoom(0.8);
        } else if (event.key === "0") {
          event.preventDefault();
          resetZoom();
        } else if (event.key === "s") {
          event.preventDefault();
          onToggleAside?.();
        } else if (event.key.toLowerCase() === "d") {
          event.preventDefault();
          setInteractionMode(interactionMode === "drawing" ? "idle" : "drawing");
        } else if (event.key.toLowerCase() === "p") {
          event.preventDefault();
          onOpenSessionLog?.();
        } else if (event.key.toLowerCase() === "f") {
          event.preventDefault();
          if (resizingElementId !== null) {
            const element = elements.find((e) => e.id === resizingElementId);
            if (element?.type === "fight") {
              onStartFight?.(Number(resizingElementId));
            }
          }
        } else if (event.key.toLowerCase() === "o") {
          event.preventDefault();
          if (resizingElementId !== null) {
            const element = elements.find((e) => e.id === resizingElementId);
            if (element?.onClick) {
              element.onClick(element);
            }
          }
        }
      }

      if (interactionMode === "panning") {
        if (event.key.startsWith("Arrow")) {
          event.preventDefault();
          const step = 20 / zoomRef.current;
          let dx = 0;
          let dy = 0;

          if (event.key === "ArrowUp") dy = -step;
          if (event.key === "ArrowDown") dy = step;
          if (event.key === "ArrowLeft") dx = -step;
          if (event.key === "ArrowRight") dx = step;

          const newViewBox = {
            ...currentViewBoxRef.current,
            x: currentViewBoxRef.current.x + dx,
            y: currentViewBoxRef.current.y + dy,
          };

          currentViewBoxRef.current = newViewBox;

          if (!svgRef.current) return;
          svgRef.current.setAttribute(
            "viewBox",
            `${newViewBox.x} ${newViewBox.y} ${newViewBox.width} ${newViewBox.height}`,
          );
          setViewBox(newViewBox);
        }
      }

      if (event.key === "Escape") {
        onTokenSelect(null);
        setInteractionMode("idle");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    applyZoom,
    onToggleAside,
    interactionMode,
    elements,
    resizingElementId,
    onOpenSessionLog,
    onStartFight,
    resetZoom,
    setInteractionMode,
    setViewBox,
    onTokenSelect,
    currentViewBoxRef,
    zoomRef,
    svgRef,
  ]);

  useEffect(() => {
    const showPaneCursor = (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (interactionMode !== "panning" && event.code === "Space") {
        setInteractionMode("panning");
      }
    };

    const hidePaneCursor = (event: KeyboardEvent) => {
      if (interactionMode === "panning" && event.code === "Space") {
        setInteractionMode("idle");
      }
    };

    window.addEventListener("keydown", showPaneCursor);
    window.addEventListener("keyup", hidePaneCursor);

    return () => {
      window.removeEventListener("keydown", showPaneCursor);
      window.removeEventListener("keyup", hidePaneCursor);
    };
  }, [interactionMode, setInteractionMode]);
}
