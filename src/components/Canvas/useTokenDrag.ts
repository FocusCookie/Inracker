import React, { useRef, useCallback } from "react";
import { Token } from "@/types/tokens";

export function useTokenDrag(
  svgRef: React.RefObject<SVGSVGElement | null>,
  onTokenMove: (token: Token) => void,
  selectedToken: Token | null,
) {
  const isDragging = useRef<boolean>(false);
  const dragTokenStartPos = useRef<{ x: number; y: number } | null>(null);
  const draggedToken = useRef<Token | null>(null);
  const temporaryTokenPosition = useRef<{ x: number; y: number } | null>(null);
  const initialCTM = useRef<DOMMatrix | null>(null);
  const dragElementsInitialCoords = useRef<
    {
      element: Element;
      attrX: string;
      attrY: string;
      initialX: number;
      initialY: number;
    }[]
  >([]);

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

  const handleTokenDragMove = useCallback((event: MouseEvent) => {
    if (
      !draggedToken.current ||
      !dragTokenStartPos.current ||
      !initialCTM.current ||
      !svgRef.current
    )
      return;

    isDragging.current = true;
    const currentPos = transformScreenCoordsToSvgCoords(event);

    const newPosition = {
      x: currentPos.x - dragTokenStartPos.current.x,
      y: currentPos.y - dragTokenStartPos.current.y,
    };

    temporaryTokenPosition.current = newPosition;

    const deltaX = newPosition.x - draggedToken.current.coordinates.x;
    const deltaY = newPosition.y - draggedToken.current.coordinates.y;

    dragElementsInitialCoords.current.forEach(
      ({ element, attrX, attrY, initialX, initialY }) => {
        element.setAttribute(attrX, (initialX + deltaX).toString());
        element.setAttribute(attrY, (initialY + deltaY).toString());
      },
    );
  }, [svgRef, transformScreenCoordsToSvgCoords]);

  const handleTokenDragEnd = useCallback(() => {
    if (draggedToken.current && temporaryTokenPosition.current) {
      const updatedToken = {
        ...draggedToken.current,
        coordinates: temporaryTokenPosition.current,
      };
      onTokenMove(updatedToken);
    }

    draggedToken.current = null;
    dragTokenStartPos.current = null;
    temporaryTokenPosition.current = null;
    dragElementsInitialCoords.current = [];
    initialCTM.current = null;

    window.removeEventListener("mousemove", handleTokenDragMove);
    window.removeEventListener("mouseup", handleTokenDragEnd);
  }, [onTokenMove, handleTokenDragMove]);

  const handleTokenDragStart = useCallback((
    event: React.MouseEvent<SVGImageElement>,
    token: Token,
  ) => {
    // Only start drag on left button
    if (event.button !== 0) return;

    const svg = svgRef.current;
    if (!svg) return;

    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    initialCTM.current = CTM;

    isDragging.current = false;

    const coords = transformScreenCoordsToSvgCoords(event);

    dragTokenStartPos.current = {
      x: coords.x - token.coordinates.x,
      y: coords.y - token.coordinates.y,
    };
    draggedToken.current = token;

    dragElementsInitialCoords.current = [];
    const group = svg.querySelector(`g[data-token-group-id="${token.id}"]`);
    if (group) {
      const children = group.querySelectorAll(
        "circle, image, text, foreignObject",
      );
      children.forEach((child) => {
        const xAttr = child.tagName === "circle" ? "cx" : "x";
        const yAttr = child.tagName === "circle" ? "cy" : "y";
        const initialX = parseFloat(child.getAttribute(xAttr) || "0");
        const initialY = parseFloat(child.getAttribute(yAttr) || "0");
        dragElementsInitialCoords.current.push({
          element: child,
          attrX: xAttr,
          attrY: yAttr,
          initialX,
          initialY,
        });
      });
    }

    if (selectedToken && selectedToken.id === token.id) {
      const ring = svg.querySelector("#selection-ring");
      if (ring) {
        const initialX = parseFloat(ring.getAttribute("cx") || "0");
        const initialY = parseFloat(ring.getAttribute("cy") || "0");
        dragElementsInitialCoords.current.push({
          element: ring,
          attrX: "cx",
          attrY: "cy",
          initialX,
          initialY,
        });
      }
    }

    window.addEventListener("mousemove", handleTokenDragMove);
    window.addEventListener("mouseup", handleTokenDragEnd);
  }, [svgRef, selectedToken, handleTokenDragMove, handleTokenDragEnd, transformScreenCoordsToSvgCoords]);

  return { handleTokenDragStart, isDragging };
}
