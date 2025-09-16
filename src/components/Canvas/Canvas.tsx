import { cn } from "@/lib/utils";
import { useEncounterStore } from "@/stores/useEncounterStore";
import { Opponent } from "@/types/opponents";
import { Player } from "@/types/player";
import { Token } from "@/types/tokens";
import {
  Cross2Icon,
  EyeNoneIcon,
  PaddingIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_DELTA = 0.5;
const TEMP_DEFAULT_COLOR = "#FFFFFF";
const TEMP_DEFAULT_ICON = "📝";

type Props = {
  background?: string;
  elements: (ClickableCanvasElement & { id: any })[];
  temporaryElement?: CanvasElement;
  players: Player[];
  opponents: Opponent[];
  selectedToken: Token | null;
  tokens: Token[];
  onTokenSelect: (token: Token | null) => void;
  onDrawed: (element: Omit<CanvasElement, "id">) => void;
  onTokenMove: (token: Token) => void;
  onElementMove: (element: ClickableCanvasElement & { id: any }) => void;
};

export type CanvasElement = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  icon: string;
  name?: string;
};

export type ClickableCanvasElement = CanvasElement & {
  onClick?: () => void;
  onEdit?: () => void;
};

function Canvas({
  background,
  elements,
  temporaryElement,
  players,
  opponents,
  selectedToken,
  tokens,
  onTokenMove,
  onTokenSelect,
  onDrawed,
  onElementMove,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const backgroundImage = useRef<HTMLImageElement | null>(null);

  const {
    currentColor,
    setCurrentColor,
    currentIcon,
    currentTitle,
    setCurrentTitle,
    setCurrentIcon,
    resetCount,
  } = useEncounterStore(
    useShallow((state) => ({
      currentIcon: state.currentIcon,
      currentColor: state.currentColor,
      setCurrentColor: state.setCurrentColor,
      setCurrentIcon: state.setCurrentIcon,
      setCurrentTitle: state.setCurrentTitle,
      currentTitle: state.currentTitle,
      resetCount: state.resetCount,
    })),
  );

  const currentViewBoxRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({
    x: 0,
    y: 0,
    width: 1000,
    height: 1000,
  });

  const [viewBox, setViewBox] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>({
    x: 0,
    y: 0,
    width: 1000,
    height: 1000,
  });

  const [zoom, setZoom] = useState<number>(1);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const panStartPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const initialCTM = useRef<DOMMatrix | null>(null);
  // Coalesce pan updates to one rAF callback
  const panRafId = useRef<number | null>(null);
  const panNextViewBox = useRef<{ x: number; y: number } | null>(null);
  const tempRectRef = useRef<SVGRectElement | null>(null);
  const drawStartPos = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef<boolean>(false);
  const dragTokenStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragTempElementStartPos = useRef<{ x: number; y: number } | null>(null);
  const draggedToken = useRef<Token | null>(null);
  const temporaryTokenPosition = useRef<{ x: number; y: number } | null>(null);
  const temporaryTempElementPosition = useRef<{ x: number; y: number } | null>(
    null,
  );
  const viewBoxStartOnPanStart = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [tokenVisibility, setTokenVisibility] = useState<
    Record<string, boolean>
  >({});

  const draggedElement = useRef<(ClickableCanvasElement & { id: any }) | null>(
    null,
  );
  const dragElementStartPos = useRef<{ x: number; y: number } | null>(null);
  const temporaryElementPosition = useRef<{ x: number; y: number } | null>(
    null,
  );

  useEffect(() => {
    setCurrentColor(TEMP_DEFAULT_COLOR);
    setCurrentIcon(TEMP_DEFAULT_ICON);
    setCurrentTitle("");
  }, []);

  useEffect(() => {
    if (background && background !== "") {
      const tmp = new Image();
      tmp.onload = () => {
        backgroundImage.current = tmp;

        const newViewBox = {
          x: -tmp.naturalWidth / 2,
          y: -tmp.naturalHeight / 2,
          width: tmp.naturalWidth,
          height: tmp.naturalHeight,
        };

        currentViewBoxRef.current = newViewBox;
        setViewBox(newViewBox);
      };
      tmp.src = background;
    }
  }, [background]);

  useEffect(() => {
    window.addEventListener("keydown", showPaneCursor);
    window.addEventListener("keyup", hidePaneCursor);
    window.addEventListener("keydown", unselectSelectedToken);

    return () => {
      window.removeEventListener("keydown", showPaneCursor);
      window.removeEventListener("keyup", hidePaneCursor);
      window.removeEventListener("keydown", unselectSelectedToken);
    };
  }, []);

  const transformScreenCoordsToSvgCoords = (
    event:
      | MouseEvent
      | React.MouseEvent<SVGSVGElement>
      | React.MouseEvent<SVGImageElement>
      | React.MouseEvent<SVGGElement>,
  ) => {
    if (!svgRef.current || !initialCTM.current) return { x: 0, y: 0 };

    const svg = svgRef.current;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const transformedPoint = point.matrixTransform(
      initialCTM.current.inverse(),
    );

    return {
      x: transformedPoint.x,
      y: transformedPoint.y,
    };
  };

  const handleMouseDown = (
    event: React.MouseEvent<SVGSVGElement, MouseEvent>,
  ) => {
    // Only react to left mouse button (0)
    if (event.button !== 0) return;
    if (isPanning && svgRef.current) {
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
      window.addEventListener("keyup", hidePaneCursor);
    }

    if (isDrawing && svgRef.current) {
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
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!svgRef.current) return;

    const currentPoint = transformScreenCoordsToSvgCoords(event);
    const dx = currentPoint.x - panStartPosition.current.x;
    const dy = currentPoint.y - panStartPosition.current.y;

    const newX = viewBoxStartOnPanStart.current.x - dx;
    const newY = viewBoxStartOnPanStart.current.y - dy;

    // Track latest viewBox target and coalesce updates into a single rAF
    currentViewBoxRef.current = {
      x: newX,
      y: newY,
      width: currentViewBoxRef.current.width,
      height: currentViewBoxRef.current.height,
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
  };

  const handleMouseUp = () => {
    setViewBox(currentViewBoxRef.current);
    panNextViewBox.current = null;

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleZoom = (direction: "in" | "out") => {
    const delta = direction === "in" ? ZOOM_DELTA : -ZOOM_DELTA;
    const newZoom = Math.max(MIN_ZOOM, Math.min(zoom + delta, MAX_ZOOM));

    const { x, y, width, height } = currentViewBoxRef.current;
    const currentCenterX = x + width / 2;
    const currentCenterY = y + height / 2;

    const newWidth = (width * zoom) / newZoom;
    const newHeight = (height * zoom) / newZoom;

    const newX = currentCenterX - newWidth / 2;
    const newY = currentCenterY - newHeight / 2;

    const newViewBox = {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    };

    currentViewBoxRef.current = newViewBox;
    setViewBox(newViewBox);
    setZoom(newZoom);
  };

  function zoomIn() {
    handleZoom("in");
  }

  function zoomOut() {
    handleZoom("out");
  }

  function showPaneCursor(event: KeyboardEvent) {
    if (event.repeat) return;

    if (!isPanning && event.code === "Space") {
      setIsPanning(true);
      setIsDrawing(false);
    }
  }

  function hidePaneCursor(event: KeyboardEvent) {
    if (isPanning && event.code === "Space") {
      setIsPanning(false);
    }
  }

  const handleDrawMove = (event: MouseEvent) => {
    if (!tempRectRef.current || !drawStartPos.current || !isDrawing) return;

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
  };

  const handleDrawEnd = (event: MouseEvent) => {
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
      setIsDrawing(false);
    }

    window.removeEventListener("mousemove", handleDrawMove);
    window.removeEventListener("mouseup", handleDrawEnd);
  };

  const handleTokenDragStart = (
    event: React.MouseEvent<SVGImageElement>,
    token: Token,
  ) => {
    // Only start drag on left button
    if (event.button !== 0) return;
    if (isDrawing || isPanning) return;

    const svg = svgRef.current;
    if (!svg) return;

    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    initialCTM.current = CTM;

    const coords = transformScreenCoordsToSvgCoords(event);

    dragTokenStartPos.current = {
      x: coords.x - token.coordinates.x,
      y: coords.y - token.coordinates.y,
    };
    draggedToken.current = token;

    window.addEventListener("mousemove", handleTokenDragMove);
    window.addEventListener("mouseup", handleTokenDragEnd);
  };

  const handleTokenDragMove = (event: MouseEvent) => {
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

    const tokenImage = svgRef.current.querySelector(
      `[data-token-id="${draggedToken.current.id}"]`,
    );

    if (tokenImage) {
      tokenImage.setAttribute("x", newPosition.x.toString());
      tokenImage.setAttribute("y", newPosition.y.toString());
    }
  };

  const handleTokenDragEnd = () => {
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

    window.removeEventListener("mousemove", handleTokenDragMove);
    window.removeEventListener("mouseup", handleTokenDragEnd);
  };

  const handleTempElementDragStart = (
    event: React.MouseEvent<SVGRectElement>,
  ) => {
    // Only start drag on left button
    if (event.button !== 0) return;
    if (isDrawing || isPanning || !temporaryElement) return;

    const svg = svgRef.current;
    if (!svg) return;

    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    initialCTM.current = CTM;

    const coords = transformScreenCoordsToSvgCoords(event);

    dragTempElementStartPos.current = {
      x: coords.x - temporaryElement.x,
      y: coords.y - temporaryElement.y,
    };

    window.addEventListener("mousemove", handleTempElementDragMove);
    window.addEventListener("mouseup", handleTempElementDragEnd);
  };

  const handleTempElementDragMove = (event: MouseEvent) => {
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

    if (element && icon) {
      element.setAttribute("x", newPosition.x.toString());
      element.setAttribute("y", newPosition.y.toString());

      icon.setAttribute(
        "transform",
        `translate(${newPosition.x + 6}, ${newPosition.y + 30})`,
      );

      if (header) {
        header.setAttribute("x", newPosition.x.toString());
        header.setAttribute("y", newPosition.y.toString());
      }

      if (name) {
        name.setAttribute(
          "transform",
          `translate(${newPosition.x + 60}, ${newPosition.y + 30})`,
        );
      }
    }
  };

  const handleTempElementDragEnd = () => {
    if (temporaryElement && temporaryTempElementPosition.current) {
      const update: CanvasElement = {
        ...temporaryElement,
        x: temporaryTempElementPosition.current.x,
        y: temporaryTempElementPosition.current.y,
      };

      onDrawed(update);
    }

    dragTempElementStartPos.current = null;

    window.removeEventListener("mousemove", handleTempElementDragMove);
    window.removeEventListener("mouseup", handleTempElementDragEnd);
  };

  const handleElementDragStart = (
    event: React.MouseEvent<SVGGElement>,
    element: ClickableCanvasElement & { id: any },
  ) => {
    // Only start drag on left button
    if (event.button !== 0) return;
    if (isDrawing || isPanning) return;

    const svg = svgRef.current;
    if (!svg) return;

    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    initialCTM.current = CTM;

    const coords = transformScreenCoordsToSvgCoords(event);

    dragElementStartPos.current = {
      x: coords.x - element.x,
      y: coords.y - element.y,
    };
    draggedElement.current = element;

    window.addEventListener("mousemove", handleElementDragMove);
    window.addEventListener("mouseup", handleElementDragEnd);
  };

  const handleElementDragMove = (event: MouseEvent) => {
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

    const elementG = svgRef.current.querySelector(
      `[data-element-id="${draggedElement.current.id}"]`,
    );

    if (elementG) {
      elementG.setAttribute(
        "transform",
        `translate(${newPosition.x}, ${newPosition.y})`,
      );
    }
  };

  const handleElementDragEnd = () => {
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

    window.removeEventListener("mousemove", handleElementDragMove);
    window.removeEventListener("mouseup", handleElementDragEnd);
  };

  function handleElementClick(elementOnClick: () => void | undefined) {
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }
    if (elementOnClick) elementOnClick();
  }

  function handleTokenClick(token: Token) {
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }

    if (selectedToken && selectedToken.id === token.id) {
      onTokenSelect(null);
    } else {
      onTokenSelect(token);
    }
  }

  function unselectSelectedToken(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onTokenSelect(null);
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", showPaneCursor);
    window.addEventListener("keyup", hidePaneCursor);
    window.addEventListener("keydown", unselectSelectedToken);

    return () => {
      window.removeEventListener("keydown", showPaneCursor);
      window.removeEventListener("keyup", hidePaneCursor);
      window.removeEventListener("keydown", unselectSelectedToken);
    };
  }, []);

  useEffect(() => {
    if (temporaryElement && tempRectRef.current) {
      tempRectRef.current.setAttribute("x", temporaryElement.x.toString());
      tempRectRef.current.setAttribute("y", temporaryElement.y.toString());
      tempRectRef.current.setAttribute(
        "width",
        temporaryElement.width.toString(),
      );
      tempRectRef.current.setAttribute(
        "height",
        temporaryElement.height.toString(),
      );
      tempRectRef.current.setAttribute("fill", temporaryElement.color);
      tempRectRef.current.setAttribute("stroke", temporaryElement.color);
    }
  }, [temporaryElement]);

  function toggleToken(token: Token) {
    const newVisibility = !(tokenVisibility[token.id] ?? true);
    setTokenVisibility((prev) => ({ ...prev, [token.id]: newVisibility }));

    if (!newVisibility && selectedToken && token.id === selectedToken.id) {
      onTokenSelect(null);
    }
  }

  return (
    <div className="relative h-full w-full" key={resetCount}>
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className={cn(
          "h-full w-full rounded-md border-2 border-neutral-50 bg-neutral-50 bg-contain bg-center bg-no-repeat shadow-md",
          isPanning && "cursor-grab",
        )}
        onMouseDownCapture={handleMouseDown}
      >
        <filter id="subtleDropShadow">
          <feDropShadow
            dx="1"
            dy="1"
            stdDeviation="2"
            floodColor="rgba(0,0,0,0.4)"
          />
        </filter>

        {backgroundImage.current && (
          <defs>
            <clipPath id="roundedImageClip">
              <rect
                x={-backgroundImage.current.naturalWidth / 2}
                y={-backgroundImage.current.naturalHeight / 2}
                width={backgroundImage.current.naturalWidth}
                height={backgroundImage.current.naturalHeight}
                rx={8}
                ry={8}
              />
            </clipPath>
          </defs>
        )}

        {backgroundImage.current && (
          <image
            href={backgroundImage.current.src}
            width={backgroundImage.current.naturalWidth}
            height={backgroundImage.current.naturalHeight}
            x={-backgroundImage.current.naturalWidth / 2}
            y={-backgroundImage.current.naturalHeight / 2}
            preserveAspectRatio="xMidYMid"
            clipPath="url(#roundedImageClip)"
            pointerEvents="none"
            style={{ imageRendering: zoom >= 2 ? "pixelated" : "auto" }}
          />
        )}

        {elements.map((element, index) => (
          <ContextMenu key={"element-" + index} modal={false}>
            <ContextMenuTrigger asChild>
              <g
                className="group hover:animate-pulse hover:cursor-move focus:outline-none"
                data-element-id={element.id}
                transform={`translate(${element.x}, ${element.y})`}
                onMouseDown={(e) => handleElementDragStart(e, element)}
                tabIndex={0}
                role="button"
                aria-label={
                  element.name ? `Open ${element.name}` : "Open canvas element"
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    // @ts-ignore TODO: fix this ts issue
                    handleElementClick(element.onClick);
                  }
                }}
              >
                <g className="hover:cursor-pointer">
                  <rect
                    x={0}
                    y={0}
                    width={element.width}
                    height={element.height}
                    fill={element.color}
                    fillOpacity={0.25}
                    stroke={element.color}
                    strokeWidth={4}
                    rx={4}
                    ry={4}
                    filter="url(#subtleDropShadow)"
                  />

                  {/* Header rectangle */}
                  <rect
                    x={0}
                    y={0}
                    width={element.width}
                    height={60}
                    fill={element.color}
                    fillOpacity={0.8}
                    stroke={element.color}
                    strokeWidth={4}
                    rx={4}
                    ry={4}
                  />

                  {/* Icon */}
                  <g transform={`translate(6, 30)`}>
                    <text
                      className="font-sans text-4xl font-bold shadow-sm select-none"
                      dominantBaseline="middle"
                    >
                      {element.icon}
                    </text>
                  </g>

                  {/* Text */}
                  {element.name && (
                    <g transform={`translate(60, 30)`}>
                      <defs>
                        <clipPath id={`text-clip-${index}`}>
                          <rect
                            x="0"
                            y="-12"
                            width={element.width - 66}
                            height="24"
                          />
                        </clipPath>
                      </defs>
                      <text
                        className="font-sans text-lg font-medium text-white select-none"
                        dominantBaseline="middle"
                        clipPath={`url(#text-clip-${index})`}
                      >
                        {element.name}
                      </text>
                    </g>
                  )}
                </g>

                <rect
                  x={0}
                  y={0}
                  width={element.width}
                  height={element.height}
                  rx={4}
                  ry={4}
                  fill="none"
                  stroke="white"
                  strokeWidth={8}
                  className="pointer-events-none opacity-0 group-focus:opacity-100 group-focus-visible:opacity-100"
                />
              </g>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-52">
              <ContextMenuItem onClick={element.onEdit}>Edit</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        ))}

        {temporaryElement && (
          <g className="hover:cursor-move">
            {/* Main rectangle */}
            <rect
              onMouseDown={handleTempElementDragStart}
              id="temp-element"
              x={temporaryElement.x}
              y={temporaryElement.y}
              width={temporaryElement.width}
              height={temporaryElement.height}
              fill={currentColor}
              fillOpacity={0.25}
              stroke={currentColor}
              strokeWidth={4}
              rx={4}
              ry={4}
              filter="url(#subtleDropShadow)"
            />

            {/* Header rectangle */}
            <rect
              id="temp-element-header"
              x={temporaryElement.x}
              y={temporaryElement.y}
              width={temporaryElement.width}
              height={60}
              fill={currentColor}
              fillOpacity={0.8}
              stroke={currentColor}
              strokeWidth={4}
              rx={4}
              ry={4}
              onMouseDown={handleTempElementDragStart}
            />

            {/* Icon */}
            <g
              id="temp-element-icon"
              transform={`translate(${temporaryElement.x + 6}, ${temporaryElement.y + 30})`}
            >
              <text
                className="font-sans text-4xl font-bold shadow-sm select-none"
                dominantBaseline="middle"
              >
                {currentIcon} {currentTitle}
              </text>
            </g>
          </g>
        )}

        {selectedToken && (
          <circle
            id="selection-ring"
            cx={selectedToken.coordinates.x + 50}
            cy={selectedToken.coordinates.y + 50}
            r={65}
            stroke="white"
            strokeWidth={10}
            className="animate-pulse"
          />
        )}

        {tokens.map((token) => {
          const player = players.find(
            (player) => token.type === "player" && player.id === token.entity,
          );
          const opponent = opponents.find(
            (opponent) =>
              token.type === "opponent" && opponent.id === token.entity,
          );

          if (player) {
            return (
              <ContextMenu key={"player-" + token.id}>
                <ContextMenuTrigger asChild>
                  <g
                    className={cn(
                      "group focus:outline-none focus-visible:outline-none",
                      (tokenVisibility[token.id] ?? true)
                        ? "visible"
                        : "hidden",
                    )}
                    tabIndex={0}
                    role="button"
                    aria-label={`Token of player ${player.name}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleTokenClick(token);
                      }
                    }}
                  >
                    <image
                      className={cn(
                        "hover:cursor-pointer",
                        selectedToken &&
                          token.id === selectedToken.id &&
                          "border-2 border-red-500",
                      )}
                      data-token-id={token.id}
                      href={!player.image ? undefined : player.image}
                      width={100}
                      height={100}
                      x={token.coordinates.x}
                      y={token.coordinates.y}
                      preserveAspectRatio="xMidYMid"
                      style={{
                        cursor: isDrawing || isPanning ? "default" : "move",
                        clipPath: "circle(40%)",
                      }}
                      onMouseDown={(e) => handleTokenDragStart(e, token)}
                      onClick={() => handleTokenClick(token)}
                    />

                    <circle
                      cx={token.coordinates.x + 50}
                      cy={token.coordinates.y + 50}
                      r={52}
                      fill="none"
                      stroke="white"
                      strokeWidth={4}
                      className="pointer-events-none opacity-0 group-focus:opacity-100 group-focus-visible:opacity-100"
                    />
                  </g>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-40">
                  <ContextMenuItem onClick={() => onTokenSelect(token)}>
                    Select
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => toggleToken(token)}>
                    {(tokenVisibility[token.id] ?? true) ? "Hide" : "Show"}
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          }

          if (opponent) {
            return (
              <ContextMenu key={"opponent-" + token.id}>
                <ContextMenuTrigger asChild>
                  <g
                    className={cn(
                      "group outline-4 focus:outline-none focus-visible:outline-none",
                      (tokenVisibility[token.id] ?? true)
                        ? "visible"
                        : "hidden",
                    )}
                    tabIndex={0}
                    role="button"
                    aria-label={`Token of opponent ${opponent.name}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleTokenClick(token);
                      }
                    }}
                  >
                    <image
                      className={cn(
                        "hover:cursor-pointer",
                        selectedToken &&
                          token.id === selectedToken.id &&
                          "border-2 border-red-500",
                      )}
                      data-token-id={token.id}
                      href={opponent.image === "" ? undefined : opponent.image}
                      width={100}
                      height={100}
                      x={token.coordinates.x}
                      y={token.coordinates.y}
                      preserveAspectRatio="xMidYMid"
                      style={{
                        cursor: isDrawing || isPanning ? "default" : "move",
                        clipPath: "circle(40%)",
                      }}
                      onMouseDown={(e) => handleTokenDragStart(e, token)}
                      onClick={() => handleTokenClick(token)}
                    />

                    <circle
                      cx={token.coordinates.x + 50}
                      cy={token.coordinates.y + 50}
                      r={52}
                      fill="none"
                      stroke="white"
                      strokeWidth={4}
                      className="pointer-events-none opacity-0 group-focus:opacity-100 group-focus-visible:opacity-100"
                    />
                  </g>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-40">
                  <ContextMenuItem onClick={() => onTokenSelect(token)}>
                    Select
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => toggleToken(token)}>
                    {(tokenVisibility[token.id] ?? true) ? "Hide" : "Show"}
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          }

          return null;
        })}
      </svg>

      <div className="absolute top-1/2 right-4 flex -translate-y-1/2 flex-col gap-4 rounded-full border border-white/80 bg-white/20 p-2 shadow-md backdrop-blur-sm">
        <button
          onClick={() => setIsDrawing((c) => !c)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-white hover:bg-slate-100 hover:shadow-xs"
        >
          {isDrawing ? (
            <Cross2Icon className="h-4 w-4" />
          ) : (
            <PaddingIcon className="h-4 w-4" />
          )}
        </button>

        <div className="flex flex-col gap-2">
          {players.map((player) => {
            const token = tokens.find(
              (t) => t.type === "player" && t.entity === player.id,
            );
            if (!token) return null;
            return (
              <button
                key={`player-${player.id}-token-state`}
                onClick={() => toggleToken(token)}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-white hover:bg-slate-100 hover:shadow-xs"
              >
                <div className="grid grid-cols-1 grid-rows-1 items-center justify-items-center">
                  {player.image && player.image !== "" ? (
                    <img
                      className="col-start-1 col-end-1 row-start-1 row-end-2"
                      src={player.image}
                      alt={`Picture of Player ${player.name}`}
                    />
                  ) : (
                    <span className="col-start-1 col-end-1 row-start-1 row-end-2">
                      {player.icon}
                    </span>
                  )}

                  {!(tokenVisibility[token.id] ?? true) && (
                    <div className="col-start-1 col-end-1 row-start-1 row-end-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <EyeNoneIcon className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          {opponents.map((opponent) => {
            const token = tokens.find(
              (t) => t.type === "opponent" && t.entity === opponent.id,
            );
            if (!token) return null;
            return (
              <button
                key={`opponent-${opponent.id}-token-state`}
                onClick={() => toggleToken(token)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-white hover:bg-slate-100 hover:shadow-xs"
              >
                <div className="grid grid-cols-1 grid-rows-1 items-center justify-items-center">
                  {opponent.image && opponent.image !== "" ? (
                    <img
                      className="col-start-1 col-end-1 row-start-1 row-end-2"
                      src={opponent.image}
                      alt={`Picture of Opponent ${opponent.name}`}
                    />
                  ) : (
                    <span className="col-start-1 col-end-1 row-start-1 row-end-2">
                      {opponent.icon}
                    </span>
                  )}

                  {!(tokenVisibility[token.id] ?? true) && (
                    <div className="col-start-1 col-end-1 row-start-1 row-end-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                      <EyeNoneIcon className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 flex gap-2 rounded-full border border-white/80 bg-white/20 p-1 shadow-md backdrop-blur-sm">
        <button
          onClick={zoomOut}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:bg-slate-100 hover:shadow-xs"
        >
          <ZoomOutIcon className="h-4 w-4" />
        </button>

        <button
          onClick={zoomIn}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:bg-slate-100 hover:shadow-xs"
        >
          <ZoomInIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default Canvas;
