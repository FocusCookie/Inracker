import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import {
  Cross2Icon,
  EyeNoneIcon,
  PaddingIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@radix-ui/react-icons";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;
const ZOOM_DELTA = 0.2;
const DRAW_RECT_FILL_COLOR = "rgba(255, 255, 255, 0.3)";
const DRAW_RECT_STROKE_COLOR = "rgba(0, 0, 0, 0.6)";

type Props = {
  background?: HTMLImageElement;
  elements: CanvasElement[];
  players: Player[];
  selectedPlayer: Player | null;
  onPlayerSelect: (player: Player) => void;
  onDrawed: (element: CanvasElement) => void;
  onElementClick: (id: string) => void;
  onPlayerMove: (player: Player) => void;
};

export type Player = {
  id: number;
  img: string;
  coordinates: { x: number; y: number };
  health: number;
  name: string;
  buffs: Buff[];
  debuffs: Buff[];
};

type Buff = {
  title: string;
  icon: string;
  value: number;
};

type CanvasElement = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  title: string;
  icon?: string;
  onClick: (id: string) => void;
};

function Canvas({
  background,
  elements,
  players,
  selectedPlayer,
  onPlayerMove,
  onPlayerSelect,
  onDrawed,
  onElementClick,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

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
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const temporaryPlayerPosition = useRef<{
    playerId: number;
    coordinates: { x: number; y: number };
  } | null>(null);
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
      const currentViewBox = svg
        ?.getAttribute("viewBox")
        ?.split(" ")
        .map(Number);

      if (currentViewBox) {
        viewBoxStartOnPanStart.current = {
          x: currentViewBox[0],
          y: currentViewBox[1],
        };
      }

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
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
      rect.setAttribute("fill", DRAW_RECT_FILL_COLOR);
      rect.setAttribute("stroke", DRAW_RECT_STROKE_COLOR);
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

    svgRef.current.setAttribute(
      "viewBox",
      `${viewBoxStartOnPanStart.current.x - dx} ${
        viewBoxStartOnPanStart.current.y - dy
      } ${viewBox.width} ${viewBox.height}`,
    );
  };

  const handleMouseUp = () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleZoom = (direction: "in" | "out") => {
    const delta = direction === "in" ? ZOOM_DELTA : -ZOOM_DELTA;
    const newZoom = Math.max(MIN_ZOOM, Math.min(zoom + delta, MAX_ZOOM));

    const scalingFactor = zoom / newZoom;
    setZoom(newZoom);

    setViewBox((prevViewBox) => {
      const newWidth = prevViewBox.width * scalingFactor;
      const newHeight = prevViewBox.height * scalingFactor;

      const newX = prevViewBox.x + (prevViewBox.width - newWidth) / 2;
      const newY = prevViewBox.y + (prevViewBox.height - newHeight) / 2;

      return {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      };
    });
  };

  function zoomIn() {
    handleZoom("in");
  }

  function zoomOut() {
    handleZoom("out");
  }

  function showPaneCursor(event: KeyboardEvent) {
    if (!isPanning && event.code === "Space") {
      setIsPanning(true);
      setIsDrawing(false);
    }
  }

  function hidePaneCursor(event: KeyboardEvent) {
    if (event.code === "Space") {
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
          id: crypto.randomUUID(),
          x: parseInt(x.toFixed(0)),
          y: parseInt(y.toFixed(0)),
          width: parseInt(width.toFixed(0)),
          height: parseInt(height.toFixed(0)),
          color: DRAW_RECT_FILL_COLOR,
          title: "New Rectangle",
          onClick: onElementClick,
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
    if (isDrawing || isPanning) return;

    const svg = svgRef.current;
    if (!svg) return;

    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    initialCTM.current = CTM;

    // @ts-ignore
    const coords = transformScreenCoordsToSvgCoords(event);

    dragStartPos.current = {
      x: coords.x - player.coordinates.x,
      y: coords.y - player.coordinates.y,
    };
    draggedPlayer.current = player;

    window.addEventListener("mousemove", handlePlayerDragMove);
    window.addEventListener("mouseup", handlePlayerDragEnd);
  };

  const handlePlayerDragMove = (event: MouseEvent) => {
    if (!draggedPlayer.current || !dragStartPos.current || !initialCTM.current)
      return;

    const currentPos = transformScreenCoordsToSvgCoords(event);

    const newPosition = {
      x: currentPos.x - dragStartPos.current.x,
      y: currentPos.y - dragStartPos.current.y,
    };

    temporaryPlayerPosition.current = {
      playerId: draggedPlayer.current.id,
      coordinates: newPosition,
    };

    forceUpdate({});
  };

  const handlePlayerDragEnd = () => {
    console.log("Drag End", {
      draggedPlayer: draggedPlayer.current,
      tempPosition: temporaryPlayerPosition.current,
    });

    if (draggedPlayer.current && temporaryPlayerPosition.current) {
      const updatedPlayer = {
        ...draggedPlayer.current,
        coordinates: temporaryPlayerPosition.current.coordinates,
      };
      onPlayerMove(updatedPlayer);
    }

    // Cleanup
    draggedPlayer.current = null;
    dragStartPos.current = null;
    temporaryPlayerPosition.current = null;

    // Force final update
    forceUpdate({});

    window.removeEventListener("mousemove", handlePlayerDragMove);
    window.removeEventListener("mouseup", handlePlayerDragEnd);
  };

  useEffect(() => {
    console.log("Temporary position updated:", temporaryPlayerPosition);
  }, [temporaryPlayerPosition]);

  useEffect(() => {
    window.addEventListener("keydown", showPaneCursor);
    window.addEventListener("keyup", hidePaneCursor);

    return () => {
      window.removeEventListener("keydown", showPaneCursor);
      window.removeEventListener("keyup", hidePaneCursor);
    };
  }, []);

  function togglePlayerToken(player: Player) {
    const update = [...playersTokenState];
    const playerStateIndex = update.findIndex(
      (playerState) => playerState.id === player.id,
    );

    update[playerStateIndex].visible = !update[playerStateIndex].visible;

    setPlayersTokenState(update);
  }

  return (
    <div className="relative h-full w-full">
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className={cn(
          "h-full w-full rounded-md border-2 border-neutral-50 bg-neutral-50 bg-contain bg-center bg-no-repeat shadow-md",
          isPanning && "cursor-grab",
        )}
        onMouseDown={handleMouseDown}
      >
        <filter id="subtleDropShadow">
          <feDropShadow
            dx="1"
            dy="1"
            stdDeviation="2"
            floodColor="rgba(0,0,0,0.4)"
          />
        </filter>

        {background && (
          <defs>
            <mask id="roundedImageMask">
              <rect
                x={-background.naturalWidth / 2}
                y={-background.naturalHeight / 2}
                width={background.naturalWidth}
                height={background.naturalHeight}
                rx={8}
                ry={8}
                fill="white"
              />
            </mask>
          </defs>
        )}

        {background && (
          <image
            href={background.src}
            width={background.naturalWidth}
            height={background.naturalHeight}
            x={-background.naturalWidth / 2}
            y={-background.naturalHeight / 2}
            preserveAspectRatio="xMidYMid"
            mask="url(#roundedImageMask)"
          />
        )}

        {elements.map((element) => (
          <g
            className="hover:cursor-pointer"
            key={element.id}
            onClick={() => onElementClick(element.id)}
          >
            <rect
              x={element.x}
              y={element.y}
              width={element.width}
              height={element.height}
              fill={`rgba(${element.color}, 0.3)`}
              stroke={`rgba(${element.color}, 0.8)`}
              strokeWidth={4}
              rx={4}
              ry={4}
              filter="url(#subtleDropShadow)"
            />

            <g transform={`translate(${element.x + 16}, ${element.y + 32})`}>
              <text
                className="select-none fill-white font-sans text-4xl font-bold shadow"
                dominantBaseline="middle"
              >
                {element.icon}
              </text>
            </g>
          </g>
        ))}

        {players.map((player) => (
          <image
            className={cn(
              Boolean(
                playersTokenState.find(
                  (playerToken) => playerToken.id === player.id,
                )?.visible,
              )
                ? "visible"
                : "hidden",
              selectedPlayer &&
                player.id === selectedPlayer.id &&
                "border-2 border-red-500",
            )}
            key={"player-" + player.id}
            href={player.img}
            width={100}
            height={100}
            x={
              temporaryPlayerPosition.current?.playerId === player.id
                ? temporaryPlayerPosition.current.coordinates.x
                : player.coordinates.x
            }
            y={
              temporaryPlayerPosition.current?.playerId === player.id
                ? temporaryPlayerPosition.current.coordinates.y
                : player.coordinates.y
            }
            preserveAspectRatio="xMidYMid"
            style={{ cursor: isDrawing || isPanning ? "default" : "move" }}
            onMouseDown={(e) => handlePlayerDragStart(e, player)}
            onClick={() => onPlayerSelect(player)}
          />
        ))}

        {selectedPlayer && (
          <g transform={`translate(${selectedPlayer.coordinates.x + 30}, 116)`}>
            <text
              className="fill-white font-sans text-6xl font-bold shadow"
              dominantBaseline="middle"
            >
              👆
            </text>
          </g>
        )}
      </svg>

      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 flex-col gap-4 rounded-full border border-white/80 bg-white/20 p-2 shadow-md backdrop-blur">
        <button
          onClick={() => setIsDrawing((c) => !c)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-white hover:bg-slate-100 hover:shadow-sm"
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-white hover:bg-slate-100 hover:shadow-sm"
          >
            <div className="grid grid-cols-1 grid-rows-1 items-center justify-items-center">
              <img
                className="col-start-1 col-end-1 row-start-1 row-end-2"
                src={player.img}
                alt={`Picture of Player ${player.name}`}
              />
              {!playersTokenState.find((state) => state.id === player.id)
                ?.visible && (
                <div className="col-start-1 col-end-1 row-start-1 row-end-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <EyeNoneIcon className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2 rounded-full border border-white/80 bg-white/20 p-1 shadow-md backdrop-blur">
        <button
          onClick={zoomIn}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:bg-slate-100 hover:shadow-sm"
        >
          <ZoomInIcon className="h-4 w-4" />
        </button>
        <button
          onClick={zoomOut}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:bg-slate-100 hover:shadow-sm"
        >
          <ZoomOutIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default Canvas;
