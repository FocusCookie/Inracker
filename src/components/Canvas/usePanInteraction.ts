import React, { useRef, useCallback } from "react";
import { ViewBox } from "@/hooks/useCanvasReducer";

export function usePanInteraction(
  svgRef: React.RefObject<SVGSVGElement | null>,
  currentViewBoxRef: React.MutableRefObject<ViewBox>,
  setViewBox: (viewBox: ViewBox) => void,
) {
  const panStartPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const viewBoxStartOnPanStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panRafId = useRef<number | null>(null);
  const panNextViewBox = useRef<{ x: number; y: number } | null>(null);
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

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!svgRef.current) return;

    const currentPoint = transformScreenCoordsToSvgCoords(event);
    const dx = currentPoint.x - panStartPosition.current.x;
    const dy = currentPoint.y - panStartPosition.current.y;

    const newX = viewBoxStartOnPanStart.current.x - dx;
    const newY = viewBoxStartOnPanStart.current.y - dy;

    currentViewBoxRef.current = {
      ...currentViewBoxRef.current,
      x: newX,
      y: newY,
    };

    panNextViewBox.current = { x: newX, y: newY };
    if (panRafId.current == null) {
      panRafId.current = requestAnimationFrame(() => {
        panRafId.current = null;
        if (!svgRef.current || !panNextViewBox.current) return;
        const { x, y } = panNextViewBox.current;
        svgRef.current.setAttribute(
          "viewBox",
          `${x} ${y} ${currentViewBoxRef.current.width} ${currentViewBoxRef.current.height}`,
        );
      });
    }
  }, [svgRef, transformScreenCoordsToSvgCoords, currentViewBoxRef]);

  const handleMouseUp = useCallback(() => {
    setViewBox(currentViewBoxRef.current);
    panNextViewBox.current = null;
    initialCTM.current = null;

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove, setViewBox, currentViewBoxRef]);

  const startPan = useCallback((event: React.MouseEvent) => {
    if (!svgRef.current) return;
    const svg = svgRef.current;

    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    initialCTM.current = CTM;

    const coords = transformScreenCoordsToSvgCoords(event);
    panStartPosition.current = coords;

    viewBoxStartOnPanStart.current = {
      x: currentViewBoxRef.current.x,
      y: currentViewBoxRef.current.y,
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }, [svgRef, transformScreenCoordsToSvgCoords, handleMouseMove, handleMouseUp, currentViewBoxRef]);

  return { startPan };
}
