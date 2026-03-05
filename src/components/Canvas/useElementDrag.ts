import React, { useRef, useCallback } from "react";
import { CanvasElementWithId, InrackerCanvasElement } from "./types";

export function useElementDrag(
  svgRef: React.RefObject<SVGSVGElement | null>,
  onElementMove: (element: CanvasElementWithId) => void,
  temporaryElement?: InrackerCanvasElement,
) {
  const isDragging = useRef<boolean>(false);
  const dragElementStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragTempElementStartPos = useRef<{ x: number; y: number } | null>(null);
  const draggedElement = useRef<CanvasElementWithId | null>(null);
  const temporaryElementPosition = useRef<{ x: number; y: number } | null>(null);
  const temporaryTempElementPosition = useRef<{ x: number; y: number } | null>(null);
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

  const handleElementDragMove = useCallback((event: MouseEvent) => {
    if (
      !draggedElement.current ||
      !dragElementStartPos.current ||
      !initialCTM.current ||
      !svgRef.current
    )
      return;

    isDragging.current = true;
    const currentPos = transformScreenCoordsToSvgCoords(event);

    const newPosition = {
      x: currentPos.x - dragElementStartPos.current.x,
      y: currentPos.y - dragElementStartPos.current.y,
    };

    temporaryElementPosition.current = newPosition;

    const group = svgRef.current.querySelector(
      `g[data-element-id="${draggedElement.current.id}"]`,
    );
    if (group) {
      group.setAttribute(
        "transform",
        `translate(${newPosition.x}, ${newPosition.y})`,
      );
    }
  }, [svgRef, transformScreenCoordsToSvgCoords]);

  const handleElementDragEnd = useCallback(() => {
    if (draggedElement.current && temporaryElementPosition.current) {
      const updatedElement = {
        ...draggedElement.current,
        x: temporaryElementPosition.current.x,
        y: temporaryElementPosition.current.y,
      };
      onElementMove(updatedElement);
    }

    draggedElement.current = null;
    dragElementStartPos.current = null;
    temporaryElementPosition.current = null;
    initialCTM.current = null;

    window.removeEventListener("mousemove", handleElementDragMove);
    window.removeEventListener("mouseup", handleElementDragEnd);
  }, [onElementMove, handleElementDragMove]);

  const handleElementDragStart = useCallback((
    event: React.MouseEvent<SVGGElement>,
    element: CanvasElementWithId,
  ) => {
    if (event.button !== 0) return;

    const svg = svgRef.current;
    if (!svg) return;

    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    initialCTM.current = CTM;

    isDragging.current = false;

    const coords = transformScreenCoordsToSvgCoords(event);

    dragElementStartPos.current = {
      x: coords.x - element.x,
      y: coords.y - element.y,
    };
    draggedElement.current = element;

    window.addEventListener("mousemove", handleElementDragMove);
    window.addEventListener("mouseup", handleElementDragEnd);
  }, [svgRef, handleElementDragMove, handleElementDragEnd, transformScreenCoordsToSvgCoords]);

  const handleTempElementDragMove = useCallback((event: MouseEvent) => {
    if (
      !temporaryElement ||
      !dragTempElementStartPos.current ||
      !initialCTM.current ||
      !svgRef.current
    )
      return;

    isDragging.current = true;
    const currentPos = transformScreenCoordsToSvgCoords(event);

    const newPosition = {
      x: currentPos.x - dragTempElementStartPos.current.x,
      y: currentPos.y - dragTempElementStartPos.current.y,
    };

    temporaryTempElementPosition.current = Object.assign({}, newPosition);

    const element = svgRef.current.querySelector("#temp-element");
    const icon = svgRef.current.querySelector("#temp-element-icon");
    const header = svgRef.current.querySelector("#temp-element-header");
    const name = svgRef.current.querySelector("#temp-element-name");

    if (element) {
      element.setAttribute("x", newPosition.x.toString());
      element.setAttribute("y", newPosition.y.toString());
    }
    if (header) {
      header.setAttribute("x", newPosition.x.toString());
      header.setAttribute("y", newPosition.y.toString());
    }
    if (icon) {
      icon.setAttribute(
        "transform",
        `translate(${newPosition.x + 6}, ${newPosition.y + 34})`,
      );
    }
    if (name) {
      name.setAttribute(
        "transform",
        `translate(${newPosition.x + 60}, ${newPosition.y + 30})`,
      );
    }
  }, [svgRef, transformScreenCoordsToSvgCoords, temporaryElement]);

  const handleTempElementDragEnd = useCallback(() => {
    if (temporaryElement && temporaryTempElementPosition.current) {
      onElementMove({
        ...temporaryElement,
        id: "temporary",
        x: temporaryTempElementPosition.current.x,
        y: temporaryTempElementPosition.current.y,
      } as CanvasElementWithId);
    }

    dragTempElementStartPos.current = null;
    temporaryTempElementPosition.current = null;
    initialCTM.current = null;

    window.removeEventListener("mousemove", handleTempElementDragMove);
    window.removeEventListener("mouseup", handleTempElementDragEnd);
  }, [onElementMove, temporaryElement, handleTempElementDragMove]);

  const handleTempElementDragStart = useCallback((
    event: React.MouseEvent<SVGRectElement>,
  ) => {
    if (event.button !== 0) return;
    if (!temporaryElement) return;

    const svg = svgRef.current;
    if (!svg) return;

    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    initialCTM.current = CTM;

    isDragging.current = false;

    const coords = transformScreenCoordsToSvgCoords(event);

    dragTempElementStartPos.current = {
      x: coords.x - temporaryElement.x,
      y: coords.y - temporaryElement.y,
    };

    window.addEventListener("mousemove", handleTempElementDragMove);
    window.addEventListener("mouseup", handleTempElementDragEnd);
  }, [svgRef, temporaryElement, handleTempElementDragMove, handleTempElementDragEnd, transformScreenCoordsToSvgCoords]);

  return { handleElementDragStart, handleTempElementDragStart, isDragging };
}
