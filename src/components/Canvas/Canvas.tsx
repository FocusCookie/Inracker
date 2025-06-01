import { cn } from "@/lib/utils";
import { useEncounterStore } from "@/stores/useEncounterStore";
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

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_DELTA = 0.2;
const TEMP_DEFAULT_COLOR = "#FFFFFF";
const TEMP_DEFAULT_ICON = "📝";

type Props = {
  background?: string;
  elements: ClickableCanvasElement[];
  temporaryElement?: CanvasElement;
  players: Player[];
  selectedPlayer: Player | null;
  tokens: Token[];
  onPlayerSelect: (player: Player | null) => void;
  onDrawed: (element: Omit<CanvasElement, "id">) => void;
  onPlayerMove: (token: Token) => void;
};

export type CanvasElement = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  icon: string;
};

export type ClickableCanvasElement = CanvasElement & {
  onClick: () => void;
};

function Canvas({
  background,
  elements,
  temporaryElement,
  players,
  selectedPlayer,
  tokens,
  onPlayerMove,
  onPlayerSelect,
  onDrawed,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const backgroundImage = useRef<HTMLImageElement | null>(null);

  const {
    currentColor,
    setCurrentColor,
    currentIcon,
    setCurrentIcon,
    resetCount,
  } = useEncounterStore(
    useShallow((state) => ({
      currentIcon: state.currentIcon,
      currentColor: state.currentColor,
      setCurrentColor: state.setCurrentColor,
      setCurrentIcon: state.setCurrentIcon,
      resetCount: state.resetCount,
    })),
  );

  // Use a ref to track the actual current viewBox
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

  // State for React rendering
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
  const tempRectRef = useRef<SVGRectElement | null>(null);
  const drawStartPos = useRef<{ x: number; y: number } | null>(null);
  const draggedPlayer = useRef<Player | null>(null);
  const selectedPlayerRef = useRef<Player | null>(selectedPlayer);
  const isDraggingToken = useRef<boolean>(false);
  const dragTokenStartPos = useRef<{ x: number; y: number } | null>(null);
  const dragElementStartPos = useRef<{ x: number; y: number } | null>(null);
  const temporaryPlayerPosition = useRef<{
    playerId: number;
    coordinates: { x: number; y: number };
  } | null>(null);
  const temporaryTempElementPosition = useRef<{ x: number; y: number } | null>(
    null,
  );
  const [, forceUpdate] = useState({});
  const viewBoxStartOnPanStart = useRef<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [playersTokenState, setPlayersTokenState] = useState<
    Array<{
      id: Player["id"];
      visible: boolean;
    }>
  >(
    players.map((player) => {
      return { id: player.id, visible: true };
    }),
  );

  useEffect(() => {
    setCurrentColor(TEMP_DEFAULT_COLOR);
    setCurrentIcon(TEMP_DEFAULT_ICON);
  }, []);

  useEffect(() => {
    if (background && background !== "") {
      const tmp = new Image();
      tmp.src = background;

      backgroundImage.current = tmp;
    }
  }, [background]);

  useEffect(() => {
    selectedPlayerRef.current = selectedPlayer;
  }, [selectedPlayer]);

  useEffect(() => {
    window.addEventListener("keydown", showPaneCursor);
    window.addEventListener("keyup", hidePaneCursor);
    window.addEventListener("keydown", unselectSelectedPlayer);

    return () => {
      window.removeEventListener("keydown", showPaneCursor);
      window.removeEventListener("keyup", hidePaneCursor);
      window.removeEventListener("keydown", unselectSelectedPlayer);
    };
  }, []);

  const transformScreenCoordsToSvgCoords = (
    event: MouseEvent | React.MouseEvent<SVGSVGElement>,
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

      // create temporary rect
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

    currentViewBoxRef.current = {
      x: newX,
      y: newY,
      width: currentViewBoxRef.current.width,
      height: currentViewBoxRef.current.height,
    };

    requestAnimationFrame(() => {
      if (svgRef.current) {
        svgRef.current.setAttribute(
          "viewBox",
          `${newX} ${newY} ${currentViewBoxRef.current.width} ${currentViewBoxRef.current.height}`,
        );
      }
    });
  };

  const handleMouseUp = () => {
    setViewBox(currentViewBoxRef.current);

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleZoom = (direction: "in" | "out") => {
    const delta = direction === "in" ? ZOOM_DELTA : -ZOOM_DELTA;
    const newZoom = Math.max(MIN_ZOOM, Math.min(zoom + delta, MAX_ZOOM));

    // Get current center of the view from the ref
    const { x, y, width, height } = currentViewBoxRef.current;
    const currentCenterX = x + width / 2;
    const currentCenterY = y + height / 2;

    // Calculate new dimensions
    const newWidth = (width * zoom) / newZoom;
    const newHeight = (height * zoom) / newZoom;

    // Calculate new top-left corner while maintaining the center point
    const newX = currentCenterX - newWidth / 2;
    const newY = currentCenterY - newHeight / 2;

    // Update both ref and state
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
    if (event.repeat) return; // if key is hold return immidiatly

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

      // delete temporary rect
      tempRectRef.current.remove();
      tempRectRef.current = null;
      drawStartPos.current = null;
      setIsDrawing(false);
    }

    window.removeEventListener("mousemove", handleDrawMove);
    window.removeEventListener("mouseup", handleDrawEnd);
  };

  const handlePlayerDragStart = (
    event: React.MouseEvent<SVGImageElement>,
    player: Player,
  ) => {
    const playerToken = tokens.find((token) => token.entity === player.id);
    if (isDrawing || isPanning || !playerToken) return;

    const svg = svgRef.current;
    if (!svg) return;

    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    initialCTM.current = CTM;

    // @ts-ignore
    const coords = transformScreenCoordsToSvgCoords(event);

    dragTokenStartPos.current = {
      x: coords.x - playerToken.coordinates.x,
      y: coords.y - playerToken.coordinates.y,
    };
    draggedPlayer.current = player;

    window.addEventListener("mousemove", handlePlayerDragMove);
    window.addEventListener("mouseup", handlePlayerDragEnd);
  };

  const handeTempElementDragStart = (
    event: React.MouseEvent<SVGRectElement>,
  ) => {
    if (isDrawing || isPanning || !temporaryElement) return;

    const svg = svgRef.current;
    if (!svg) return;

    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    initialCTM.current = CTM;

    // @ts-ignore
    const coords = transformScreenCoordsToSvgCoords(event);

    dragElementStartPos.current = {
      x: coords.x - temporaryElement.x,
      y: coords.y - temporaryElement.y,
    };

    window.removeEventListener("mousemove", handleTempElementDragMove);
    window.removeEventListener("mouseup", handleTempElementDragEnd);

    window.addEventListener("mousemove", handleTempElementDragMove);
    window.addEventListener("mouseup", handleTempElementDragEnd);
  };

  const handleTempElementDragMove = (event: MouseEvent) => {
    if (
      !temporaryElement ||
      !dragElementStartPos.current ||
      !initialCTM.current ||
      !svgRef.current
    )
      return;

    isDraggingToken.current = true;
    const currentPos = transformScreenCoordsToSvgCoords(event);

    const newPosition = {
      x: currentPos.x - dragElementStartPos.current.x,
      y: currentPos.y - dragElementStartPos.current.y,
    };

    // Store the position for when we need to update React state
    temporaryTempElementPosition.current = Object.assign({}, newPosition);

    const element = svgRef.current.querySelector("#temp-element");
    const icon = svgRef.current.querySelector("#temp-element-icon");

    if (element && icon) {
      element.setAttribute("x", newPosition.x.toString());
      element.setAttribute("y", newPosition.y.toString());

      icon.setAttribute(
        "transform",
        `translate(${newPosition.x + 16}, ${newPosition.y + 40})`,
      );
    }

    // Don't call forceUpdate here - we'll only update React state when the drag ends
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

    dragElementStartPos.current = null;
    isDraggingToken.current = false;

    forceUpdate({});

    window.removeEventListener("mousemove", handlePlayerDragMove);
    window.removeEventListener("mouseup", handlePlayerDragEnd);
  };

  const handlePlayerDragMove = (event: MouseEvent) => {
    if (
      !draggedPlayer.current ||
      !dragTokenStartPos.current ||
      !initialCTM.current ||
      !svgRef.current
    )
      return;

    isDraggingToken.current = true;
    const currentPos = transformScreenCoordsToSvgCoords(event);

    const newPosition = {
      x: currentPos.x - dragTokenStartPos.current.x,
      y: currentPos.y - dragTokenStartPos.current.y,
    };

    // Store the position for when we need to update React state
    temporaryPlayerPosition.current = {
      playerId: draggedPlayer.current.id,
      coordinates: newPosition,
    };

    // Find the actual SVG image element for this player and update it directly
    const playerImage = svgRef.current.querySelector(
      `[data-player-id="${draggedPlayer.current.id}"]`,
    );
    if (playerImage) {
      playerImage.setAttribute("x", newPosition.x.toString());
      playerImage.setAttribute("y", newPosition.y.toString());
    }

    // Don't call forceUpdate here - we'll only update React state when the drag ends
  };

  const handlePlayerDragEnd = () => {
    if (draggedPlayer.current && temporaryPlayerPosition.current) {
      const updatedPlayer = {
        ...draggedPlayer.current,
      };

      const updatedToken = tokens.find(
        (token) => token.entity === updatedPlayer.id,
      );

      if (updatedToken) {
        updatedToken.coordinates = temporaryPlayerPosition.current.coordinates;
        onPlayerMove(updatedToken);
      }
    }

    draggedPlayer.current = null;
    dragTokenStartPos.current = null;
    temporaryPlayerPosition.current = null;

    forceUpdate({});

    window.removeEventListener("mousemove", handlePlayerDragMove);
    window.removeEventListener("mouseup", handlePlayerDragEnd);
  };

  function handleMouseUpOnPlayerToken(player: Player) {
    if (isDraggingToken.current) {
      isDraggingToken.current = false;
    } else if (selectedPlayer && selectedPlayer.id === player.id) {
      onPlayerSelect(null);
    } else {
      onPlayerSelect(player);
    }
  }

  function unselectSelectedPlayer(event: KeyboardEvent) {
    if (event.key === "Escape") {
      onPlayerSelect(null);
    }
  }

  useEffect(() => {
    window.addEventListener("keydown", showPaneCursor);
    window.addEventListener("keyup", hidePaneCursor);
    window.addEventListener("keydown", unselectSelectedPlayer);

    return () => {
      window.removeEventListener("keydown", showPaneCursor);
      window.removeEventListener("keyup", hidePaneCursor);
      window.removeEventListener("keydown", unselectSelectedPlayer);
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

  function togglePlayerToken(player: Player) {
    const update = [...playersTokenState];
    const playerStateIndex = update.findIndex(
      (playerState) => playerState.id === player.id,
    );

    update[playerStateIndex].visible = !update[playerStateIndex].visible;

    if (
      !update[playerStateIndex].visible &&
      selectedPlayer &&
      selectedPlayer.id === player.id
    ) {
      onPlayerSelect(null);
    }

    setPlayersTokenState(update);
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
            <mask id="roundedImageMask">
              <rect
                x={-backgroundImage.current.naturalWidth / 2}
                y={-backgroundImage.current.naturalHeight / 2}
                width={backgroundImage.current.naturalWidth}
                height={backgroundImage.current.naturalHeight}
                rx={8}
                ry={8}
                fill="white"
              />
            </mask>
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
            mask="url(#roundedImageMask)"
          />
        )}

        {elements.map((element, index) => (
          <g
            className="hover:cursor-pointer"
            key={"element-" + index}
            onClick={element.onClick}
          >
            <rect
              x={element.x}
              y={element.y}
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

            <g transform={`translate(${element.x + 6}, ${element.y + 45})`}>
              <text
                className="font-sans text-6xl font-bold shadow-sm select-none"
                dominantBaseline="middle"
              >
                {element.icon}
              </text>
            </g>
          </g>
        ))}

        {temporaryElement && (
          <g className="hover:cursor-move">
            <rect
              onMouseDown={handeTempElementDragStart}
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

            <g
              id="temp-element-icon"
              transform={`translate(${temporaryElement.x + 16}, ${temporaryElement.y + 40})`}
            >
              <text
                className="font-sans text-4xl font-bold shadow-sm select-none"
                dominantBaseline="middle"
              >
                {currentIcon}
              </text>
            </g>
          </g>
        )}

        {selectedPlayer && (
          <circle
            id="selection-ring"
            cx={
              // @ts-expect-error
              tokens.find((token) => token.entity === selectedPlayer.id)
                .coordinates.x + 50
            }
            cy={
              // @ts-expect-error
              tokens.find((token) => token.entity === selectedPlayer.id)
                .coordinates.y + 50
            }
            r={65}
            stroke="white"
            //            stroke="#FA00FF" pink
            stroke-width="10"
            className="animate-pulse"
          />
        )}

        {tokens.map((token) => {
          const player = players.find((player) => player.id === token.entity);

          return (
            player && (
              <image
                className={cn(
                  "hover:cursor-pointer",
                  Boolean(
                    playersTokenState.find(
                      (playerToken) => playerToken.id === token.entity,
                    )?.visible,
                  )
                    ? "visible"
                    : "hidden",
                  selectedPlayer &&
                    token.entity === selectedPlayer.id &&
                    "border-2 border-red-500",
                )}
                key={"player-" + token.entity}
                data-player-id={player.id} // Add this attribute for direct DOM manipulation
                // @ts-ignore
                href={player.image}
                width={100}
                height={100}
                x={token.coordinates.x}
                y={token.coordinates.y}
                preserveAspectRatio="xMidYMid"
                style={{
                  cursor: isDrawing || isPanning ? "default" : "move",
                }}
                onMouseDown={(e) => handlePlayerDragStart(e, player)}
                onClick={() => handleMouseUpOnPlayerToken(player)}
              />
            )
          );
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

        {players.map((player) => (
          <button
            key={`player-${player.id}-token-state`}
            onClick={() => togglePlayerToken(player)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-white hover:bg-slate-100 hover:shadow-xs"
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

              {!playersTokenState.find((state) => state.id === player.id)
                ?.visible && (
                <div className="col-start-1 col-end-1 row-start-1 row-end-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <EyeNoneIcon className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </button>
        ))}
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
