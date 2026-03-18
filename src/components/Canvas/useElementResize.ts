import React, { useRef, useCallback } from "react";
import { CanvasElementWithId } from "./types";

export function useElementResize(
  svgRef: React.RefObject<SVGSVGElement | null>,
  onElementMove: (element: CanvasElementWithId) => void,
  setTempResizedElement: (element: CanvasElementWithId | null) => void,
) {
  const resizeStartPos = useRef<{ x: number; y: number } | null>(null);
  const resizingElementStartDim = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const resizingHandle = useRef<"nw" | "ne" | "sw" | "se" | null>(null);
  const resizingElementRef = useRef<CanvasElementWithId | null>(null);
  const tempResizedElementRef = useRef<CanvasElementWithId | null>(null);
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

  const handleResizeMove = useCallback((event: MouseEvent) => {
    if (
      !resizeStartPos.current ||
      !resizingElementStartDim.current ||
      !resizingHandle.current ||
      !resizingElementRef.current
    )
      return;

    const currentPos = transformScreenCoordsToSvgCoords(event);
    const dx = currentPos.x - resizeStartPos.current.x;
    const dy = currentPos.y - resizeStartPos.current.y;

    let { x, y, width, height } = resizingElementStartDim.current;

    switch (resizingHandle.current) {
      case "nw":
        x += dx;
        y += dy;
        width -= dx;
        height -= dy;
        break;
      case "ne":
        y += dy;
        width += dx;
        height -= dy;
        break;
      case "sw":
        x += dx;
        width -= dx;
        height += dy;
        break;
      case "se":
        width += dx;
        height += dy;
        break;
    }

    // Min dimensions
    if (width < 50) width = 50;
    if (height < 50) height = 50;

    const updatedElement = {
      ...resizingElementRef.current,
      x,
      y,
      width,
      height,
    };

    tempResizedElementRef.current = updatedElement;
    setTempResizedElement(updatedElement);
  }, [setTempResizedElement, transformScreenCoordsToSvgCoords]);

  const handleResizeEnd = useCallback(() => {
    if (tempResizedElementRef.current) {
      onElementMove(tempResizedElementRef.current);
    }
    tempResizedElementRef.current = null;
    resizingElementRef.current = null;
    resizeStartPos.current = null;
    resizingElementStartDim.current = null;
    resizingHandle.current = null;
    initialCTM.current = null;

    window.removeEventListener("mousemove", handleResizeMove);
    window.removeEventListener("mouseup", handleResizeEnd);
  }, [onElementMove, handleResizeMove]);

  const handleResizeStart = useCallback((
    event: React.MouseEvent,
    element: CanvasElementWithId,
    handle: "nw" | "ne" | "sw" | "se",
  ) => {
    event.stopPropagation();
    event.preventDefault();

    const svg = svgRef.current;
    if (!svg) return;

    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    initialCTM.current = CTM;

    resizeStartPos.current = transformScreenCoordsToSvgCoords(event);
    resizingElementStartDim.current = {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
    };
    resizingHandle.current = handle;
    resizingElementRef.current = element;

    window.addEventListener("mousemove", handleResizeMove);
    window.addEventListener("mouseup", handleResizeEnd);
  }, [svgRef, handleResizeMove, handleResizeEnd, transformScreenCoordsToSvgCoords]);

  return { handleResizeStart };
}
