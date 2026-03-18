import React, { useEffect, useCallback, useRef } from "react";
import { ViewBox } from "@/hooks/useCanvasReducer";

export function useZoomInteraction(
  svgRef: React.RefObject<SVGSVGElement | null>,
  currentViewBoxRef: React.MutableRefObject<ViewBox>,
  zoomRef: React.MutableRefObject<number>,
  applyZoom: (scaleFactor: number, anchor?: { x: number; y: number }) => void,
  setViewBox: (viewBox: ViewBox) => void,
) {
  const panRafId = useRef<number | null>(null);

  const transformScreenCoordsToSvgCoords = useCallback((
    event: WheelEvent | React.MouseEvent,
  ) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const svg = svgRef.current;
    const CTM = svg.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const transformedPoint = point.matrixTransform(CTM.inverse());
    return { x: transformedPoint.x, y: transformedPoint.y };
  }, [svgRef]);

  const wheelEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleWheel = useCallback((event: WheelEvent) => {
    // Pinch-to-zoom is ctrlKey: true on trackpads.
    // Meta (Cmd/Win) + scroll is also used for zoom.
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();

      // Calculate a granular scale factor.
      const delta = -event.deltaY;
      const scaleFactor = Math.pow(1.005, delta);

      const anchor = transformScreenCoordsToSvgCoords(event);
      applyZoom(scaleFactor, anchor);
    } else {
      // Panning movement (two fingers or mouse wheel)
      event.preventDefault();

      const currentZoom = zoomRef.current;
      // Adjust delta by zoom level so panning speed feels consistent
      const dx = event.deltaX / currentZoom;
      const dy = event.deltaY / currentZoom;

      const newX = currentViewBoxRef.current.x + dx;
      const newY = currentViewBoxRef.current.y + dy;

      currentViewBoxRef.current = {
        ...currentViewBoxRef.current,
        x: newX,
        y: newY,
      };

      if (panRafId.current == null) {
        panRafId.current = requestAnimationFrame(() => {
          panRafId.current = null;
          if (!svgRef.current) return;
          const { x, y, width, height } = currentViewBoxRef.current;
          svgRef.current.setAttribute(
            "viewBox",
            `${x} ${y} ${width} ${height}`,
          );

          if (wheelEndTimer.current) {
            clearTimeout(wheelEndTimer.current);
          }
          wheelEndTimer.current = setTimeout(() => {
            setViewBox(currentViewBoxRef.current);
          }, 150);
        });
      }
    }
  }, [svgRef, transformScreenCoordsToSvgCoords, applyZoom, setViewBox, zoomRef, currentViewBoxRef]);

  useEffect(() => {
    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (svg) {
        svg.removeEventListener("wheel", handleWheel);
      }
    };
  }, [svgRef, handleWheel]);
}
