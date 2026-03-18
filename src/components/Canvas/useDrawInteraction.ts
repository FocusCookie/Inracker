import React, { useRef, useCallback } from "react";
import { InteractionMode } from "@/hooks/useCanvasReducer";
import { InrackerCanvasElement } from "./types";

export function useDrawInteraction(
  svgRef: React.RefObject<SVGSVGElement | null>,
  currentColor: string,
  setInteractionMode: (mode: InteractionMode) => void,
  onDrawed: (element: Omit<InrackerCanvasElement, "id">) => void,
) {
  const tempRectRef = useRef<SVGRectElement | null>(null);
  const drawStartPos = useRef<{ x: number; y: number } | null>(null);
  const initialCTM = useRef<DOMMatrix | null>(null);

  const transformScreenCoordsToSvgCoords = useCallback((
    event: MouseEvent | React.MouseEvent,
  ) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const CTM = initialCTM.current || svg.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const transformedPoint = point.matrixTransform(CTM.inverse());
    return { x: transformedPoint.x, y: transformedPoint.y };
  }, [svgRef]);

  const handleDrawMove = useCallback((event: MouseEvent) => {
    if (!tempRectRef.current || !drawStartPos.current) return;

    const currentPos = transformScreenCoordsToSvgCoords(event);

    const width = currentPos.x - drawStartPos.current.x;
    const height = currentPos.y - drawStartPos.current.y;

    if (width < 0) {
      tempRectRef.current.setAttribute("x", currentPos.x.toString());
      tempRectRef.current.setAttribute("width", (-width).toString());
    } else {
      tempRectRef.current.setAttribute("width", width.toString());
    }

    if (height < 0) {
      tempRectRef.current.setAttribute("y", currentPos.y.toString());
      tempRectRef.current.setAttribute("height", (-height).toString());
    } else {
      tempRectRef.current.setAttribute("height", height.toString());
    }
  }, [transformScreenCoordsToSvgCoords]);

  const handleDrawEnd = useCallback((event: MouseEvent) => {
    if (tempRectRef.current && drawStartPos.current) {
      const currentPos = transformScreenCoordsToSvgCoords(event);

      const width = Math.abs(currentPos.x - drawStartPos.current.x);
      const height = Math.abs(currentPos.y - drawStartPos.current.y);

      const x = Math.min(currentPos.x, drawStartPos.current.x);
      const y = Math.min(currentPos.y, drawStartPos.current.y);

      if (width > 5 && height > 5) {
        onDrawed({
          x: parseInt(x.toFixed(0)),
          y: parseInt(y.toFixed(0)),
          width: parseInt(width.toFixed(0)),
          height: parseInt(height.toFixed(0)),
          color: currentColor,
          icon: "📝",
        });
      }

      tempRectRef.current.remove();
      tempRectRef.current = null;
      drawStartPos.current = null;
      initialCTM.current = null;
      setInteractionMode("idle");
    }

    window.removeEventListener("mousemove", handleDrawMove);
    window.removeEventListener("mouseup", handleDrawEnd);
  }, [onDrawed, currentColor, handleDrawMove, transformScreenCoordsToSvgCoords, setInteractionMode]);

  const startDraw = useCallback((event: React.MouseEvent) => {
    if (!svgRef.current) return;
    const svg = svgRef.current;
    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    initialCTM.current = CTM;

    const coords = transformScreenCoordsToSvgCoords(event);
    drawStartPos.current = coords;

    const rect = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    rect.setAttribute("x", coords.x.toString());
    rect.setAttribute("y", coords.y.toString());
    rect.setAttribute("width", "0");
    rect.setAttribute("height", "0");
    rect.setAttribute("rx", "4");
    rect.setAttribute("ry", "4");
    rect.setAttribute("fill", currentColor);
    rect.setAttribute("opacity", "0.5");
    rect.setAttribute("stroke", currentColor);
    rect.setAttribute("stroke-width", "2");
    rect.setAttribute("filter", "url(#subtleDropShadow)");

    svg.appendChild(rect);
    tempRectRef.current = rect;

    window.addEventListener("mousemove", handleDrawMove);
    window.addEventListener("mouseup", handleDrawEnd);
  }, [svgRef, currentColor, handleDrawMove, handleDrawEnd, transformScreenCoordsToSvgCoords]);

  return { startDraw };
}
