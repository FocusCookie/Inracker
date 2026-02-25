import db from "@/lib/database";
import { cn } from "@/lib/utils";
import { useEncounterStore } from "@/stores/useEncounterStore";
import { Player } from "@/types/player";
import { Token } from "@/types/tokens";
import {
  Cross2Icon,
  EyeNoneIcon,
  PaddingIcon,
  ResetIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@radix-ui/react-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/shallow";
import { useOverlayStore } from "@/stores/useOverlayStore";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuGroup,
} from "@/components/ui/context-menu";
import {
  CircleX,
  Sword,
  UsersRound,
  Sparkles,
  CoffeeIcon,
  BedSingleIcon,
  ClockIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/time";
import { CanvasElementNode } from "./CanvasElementNode";
import { MusicPlayer } from "@/components/MusicPlayer/MusicPlayer";

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

type Props = {
  database: typeof db;
  background?: string;
  elements: (ClickableCanvasElement & { id: any })[];
  temporaryElement?: CanvasElement;
  players: Player[];
  selectedToken: Token | null;
  tokens: Token[];
  onTokenSelect: (token: Token | null) => void;
  onDrawed: (element: Omit<CanvasElement, "id">) => void;
  onTokenMove: (token: Token) => void;
  onElementMove: (element: ClickableCanvasElement & { id: any }) => void;
  onRemoveFromInitiative?: (
    entityId: number,
    type: "player" | "opponent",
  ) => void;
  onAddToInitiative?: (
    entityId: number,
    type: "player" | "opponent",
    name: string,
  ) => void;
  onOpenEffectsCatalog?: (
    entityId: number,
    type: "player" | "opponent",
  ) => void;
  initiativeEntityIds?: { id: number; type: "player" | "opponent" }[];
  onHealPlayer?: (playerId: number) => void;
  onDamagePlayer?: (playerId: number) => void;
  onHealOpponent?: (opponentId: number) => void;
  onDamageOpponent?: (opponentId: number) => void;
  onToggleAside?: () => void;
};

export type CanvasElement = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  icon: string;
  name?: string;
  completed?: boolean;
  opponents?: number[];
  isCombatActive?: boolean;
};

export type ClickableCanvasElement = CanvasElement & {
  onClick?: (element: CanvasElement) => void;
  onEdit?: (element: CanvasElement) => void;
};

function Canvas({
  database,
  background,
  elements,
  temporaryElement,
  players,
  selectedToken,
  tokens,
  onTokenMove,
  onTokenSelect,
  onDrawed,
  onElementMove,
  onRemoveFromInitiative,
  onAddToInitiative,
  onOpenEffectsCatalog,
  initiativeEntityIds,
  onHealPlayer,
  onDamagePlayer,
  onHealOpponent,
  onDamageOpponent,
  onToggleAside,
}: Props) {
  const { t } = useTranslation("ComponentCanvas");
  const queryClient = useQueryClient();
  const svgRef = useRef<SVGSVGElement>(null);
  const backgroundImage = useRef<HTMLImageElement | null>(null);
  const [isPlayersPanelOpen, setIsPlayersPanelOpen] = useState<boolean>(false);
  const [isOpponentsPanelOpen, setIsOpponentsPanelOpen] =
    useState<boolean>(false);
  const [resizingElementId, setResizingElementId] = useState<number | null>(
    null,
  );

  const [tokenVisibility, setTokenVisibility] = useState<
    Record<string, boolean>
  >({});

  const { currentColor, currentIcon, currentTitle, resetCount } =
    useEncounterStore(
      useShallow((state) => ({
        currentIcon: state.currentIcon,
        currentColor: state.currentColor,
        currentTitle: state.currentTitle,
        resetCount: state.resetCount,
      })),
    );

  const encounterOpponents = useQueryWithToast({
    queryKey: ["encounter-opponents"],
    queryFn: () => database.encounterOpponents.getAllDetailed(),
  });

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

  const initialViewBoxRef = useRef<{
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
  const zoomRef = useRef<number>(1);
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

  const draggedElement = useRef<(ClickableCanvasElement & { id: any }) | null>(
    null,
  );
  const dragElementsInitialCoords = useRef<
    {
      element: Element;
      attrX: string;
      attrY: string;
      initialX: number;
      initialY: number;
    }[]
  >([]);
  const dragElementStartPos = useRef<{ x: number; y: number } | null>(null);
  const temporaryElementPosition = useRef<{ x: number; y: number } | null>(
    null,
  );

  const resizeStartPos = useRef<{ x: number; y: number } | null>(null);
  const resizingElementStartDim = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const resizingHandle = useRef<"nw" | "ne" | "sw" | "se" | null>(null);
  const resizingElementRef = useRef<
    (ClickableCanvasElement & { id: any }) | null
  >(null);
  const tempResizedElementRef = useRef<
    (ClickableCanvasElement & { id: any }) | null
  >(null);
  const [tempResizedElement, setTempResizedElement] = useState<
    (ClickableCanvasElement & { id: any }) | null
  >(null);

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
        initialViewBoxRef.current = newViewBox;
      };
      tmp.src = background;
    }
  }, [background]);

  useEffect(() => {
    const handleBlur = () => setIsPanning(false);

    window.addEventListener("keydown", showPaneCursor);
    window.addEventListener("keyup", hidePaneCursor);
    window.addEventListener("keydown", unselectSelectedToken);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", showPaneCursor);
      window.removeEventListener("keyup", hidePaneCursor);
      window.removeEventListener("keydown", unselectSelectedToken);
      window.removeEventListener("blur", handleBlur);
    };
  }, [isPanning]); // Re-bind if showPaneCursor/hidePaneCursor change or depend on isPanning

  const transformScreenCoordsToSvgCoords = (
    event:
      | MouseEvent
      | WheelEvent
      | React.MouseEvent<SVGSVGElement>
      | React.MouseEvent<SVGImageElement>
      | React.MouseEvent<SVGGElement>
      | React.MouseEvent<SVGRectElement>,
  ) => {
    if (!svgRef.current) return { x: 0, y: 0 };

    const svg = svgRef.current;
    const CTM = initialCTM.current || svg.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const transformedPoint = point.matrixTransform(CTM.inverse());

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

    const target = event.target as Element;
    const isElement = target.closest("[data-element-id]");

    if (!isElement && resizingElementId !== null) {
      setResizingElementId(null);
    }

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
      return;
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

  const applyZoom = useCallback(
    (scaleFactor: number, anchor?: { x: number; y: number }) => {
      const currentZoom = zoomRef.current;
      let newZoom = currentZoom * scaleFactor;

      // Clamp zoom
      newZoom = Math.max(MIN_ZOOM, Math.min(newZoom, MAX_ZOOM));

      // Actual scale factor used (after clamping)
      const actualFactor = newZoom / currentZoom;
      if (Math.abs(actualFactor - 1) < 0.0001) return; // No change

      const { x, y, width, height } = currentViewBoxRef.current;

      // Default to center if no anchor provided
      const px = anchor ? anchor.x : x + width / 2;
      const py = anchor ? anchor.y : y + height / 2;

      const newWidth = width / actualFactor;
      const newHeight = height / actualFactor;
      const newX = px - (px - x) / actualFactor;
      const newY = py - (py - y) / actualFactor;

      const newViewBox = {
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      };

      currentViewBoxRef.current = newViewBox;
      setViewBox(newViewBox);
      setZoom(newZoom);
      zoomRef.current = newZoom;
    },
    [],
  );

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      // Pinch-to-zoom is ctrlKey: true on trackpads.
      // Meta (Cmd/Win) + scroll is also used for zoom.
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault();

        // Calculate a granular scale factor.
        // deltaY is negative when zooming in, positive when zooming out.
        // Sensitivity factor 0.01 is common for smooth zooming.
        const delta = -event.deltaY;
        const scaleFactor = Math.pow(1.005, delta);

        const anchor = transformScreenCoordsToSvgCoords(event);
        applyZoom(scaleFactor, anchor);
      }
    };

    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (svg) {
        svg.removeEventListener("wheel", handleWheel);
      }
    };
  }, [applyZoom, transformScreenCoordsToSvgCoords]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey) {
        if (event.key === "+" || event.key === "=") {
          event.preventDefault();
          applyZoom(1.2);
        } else if (event.key === "-" || event.key === "_") {
          event.preventDefault();
          applyZoom(0.8);
        } else if (event.key === "s") {
          event.preventDefault();
          onToggleAside?.();
        } else if (event.key.toLowerCase() === "d") {
          event.preventDefault();
          setIsPanning(false);
          setIsDrawing((prev) => !prev);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [applyZoom, onToggleAside]);

  function zoomIn() {
    setIsPanning(false);
    applyZoom(1.2);
  }

  function zoomOut() {
    setIsPanning(false);
    applyZoom(0.8);
  }

  function resetZoom() {
    setIsPanning(false);
    const defaultViewBox = initialViewBoxRef.current;
    currentViewBoxRef.current = defaultViewBox;
    setViewBox(defaultViewBox);
    setZoom(1);
    zoomRef.current = 1;
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

    const deltaX = newPosition.x - draggedToken.current.coordinates.x;
    const deltaY = newPosition.y - draggedToken.current.coordinates.y;

    dragElementsInitialCoords.current.forEach(
      ({ element, attrX, attrY, initialX, initialY }) => {
        element.setAttribute(attrX, (initialX + deltaX).toString());
        element.setAttribute(attrY, (initialY + deltaY).toString());
      },
    );
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
    dragElementsInitialCoords.current = [];

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

    isDragging.current = false;

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

    isDragging.current = false;

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

  const handleResizeStart = (
    event: React.MouseEvent<SVGRectElement>,
    element: ClickableCanvasElement & { id: any },
    handle: "nw" | "ne" | "sw" | "se",
  ) => {
    if (event.button !== 0) return;
    event.stopPropagation();

    const svg = svgRef.current;
    if (!svg) return;

    const CTM = svg.getScreenCTM();
    if (!CTM) return;
    initialCTM.current = CTM;

    const coords = transformScreenCoordsToSvgCoords(event);
    resizeStartPos.current = coords;
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
  };

  const handleResizeMove = (event: MouseEvent) => {
    if (
      !resizingElementRef.current ||
      !resizeStartPos.current ||
      !resizingElementStartDim.current ||
      !resizingHandle.current ||
      !svgRef.current
    )
      return;

    const currentPos = transformScreenCoordsToSvgCoords(event);
    const dx = currentPos.x - resizeStartPos.current.x;
    const dy = currentPos.y - resizeStartPos.current.y;

    const start = resizingElementStartDim.current;
    let newX = start.x;
    let newY = start.y;
    let newWidth = start.width;
    let newHeight = start.height;

    switch (resizingHandle.current) {
      case "se":
        newWidth = Math.max(50, start.width + dx);
        newHeight = Math.max(50, start.height + dy);
        break;
      case "sw":
        newWidth = Math.max(50, start.width - dx);
        newHeight = Math.max(50, start.height + dy);
        newX = start.x + (start.width - newWidth);
        break;
      case "ne":
        newWidth = Math.max(50, start.width + dx);
        newHeight = Math.max(50, start.height - dy);
        newY = start.y + (start.height - newHeight);
        break;
      case "nw":
        newWidth = Math.max(50, start.width - dx);
        newHeight = Math.max(50, start.height - dy);
        newX = start.x + (start.width - newWidth);
        newY = start.y + (start.height - newHeight);
        break;
    }

    const updatedElement = {
      ...resizingElementRef.current,
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    };

    tempResizedElementRef.current = updatedElement;
    setTempResizedElement(updatedElement);
  };

  const handleResizeEnd = () => {
    if (tempResizedElementRef.current) {
      onElementMove(tempResizedElementRef.current);
      console.log("Resized Element:", tempResizedElementRef.current);
    }
    // setTempResizedElement(null); // Keep the temp element until prop updates to avoid flicker
    tempResizedElementRef.current = null;
    resizingElementRef.current = null;
    resizeStartPos.current = null;
    resizingElementStartDim.current = null;
    resizingHandle.current = null;

    window.removeEventListener("mousemove", handleResizeMove);
    window.removeEventListener("mouseup", handleResizeEnd);
  };

  useEffect(() => {
    if (tempResizedElement) {
      const match = elements.find((e) => e.id === tempResizedElement.id);
      if (
        match &&
        match.x === tempResizedElement.x &&
        match.y === tempResizedElement.y &&
        match.width === tempResizedElement.width &&
        match.height === tempResizedElement.height
      ) {
        setTempResizedElement(null);
      }
    }
  }, [elements, tempResizedElement]);

  function handleElementClick(
    elementOnClick: () => void | undefined,
    elementId: any,
  ) {
    if (isDragging.current) {
      isDragging.current = false;
      return;
    }

    setResizingElementId(elementId);

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

  useEffect(() => {
    const tokensToHide = new Set<number>();
    elements.forEach((element) => {
      if (element.completed && element.opponents) {
        const opponentIds = new Set(element.opponents);
        tokens.forEach((token) => {
          if (token.type === "opponent" && opponentIds.has(token.entity)) {
            tokensToHide.add(token.id);
          }
        });
      }
    });

    if (tokensToHide.size > 0) {
      setTokenVisibility((prev) => {
        let hasChanges = false;
        const next = { ...prev };
        tokensToHide.forEach((id) => {
          if (next[id] !== false) {
            next[id] = false;
            hasChanges = true;
          }
        });
        return hasChanges ? next : prev;
      });
    }
  }, [elements, tokens]);

  function toggleToken(token: Token) {
    const newVisibility = !(tokenVisibility[token.id] ?? true);
    setTokenVisibility((prev) => ({ ...prev, [token.id]: newVisibility }));

    if (!newVisibility && selectedToken && token.id === selectedToken.id) {
      onTokenSelect(null);
    }
  }

  function handlePlayersPanel() {
    setIsPlayersPanelOpen((c) => !c);
  }

  function handleOpponentsPanel() {
    setIsOpponentsPanelOpen((c) => !c);
  }

  const renderEffectsList = (effects: any[]) => (
    <ul className="flex flex-col gap-1.5">
      {effects.map((effect) => (
        <li key={effect.id}>
          <div className="flex items-center justify-between gap-2 rounded p-1 transition-colors hover:bg-slate-50">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-sm">{effect.icon}</span>
              <span className="truncate text-xs font-medium">
                {effect.name}
              </span>
            </div>
            <Badge
              variant={effect.type === "positive" ? "secondary" : "destructive"}
              className="h-5 gap-1 px-1.5 text-[10px]"
            >
              {effect.durationType === "short" ? (
                <CoffeeIcon className="h-2.5 w-2.5" />
              ) : effect.durationType === "long" ? (
                <BedSingleIcon className="h-2.5 w-2.5" />
              ) : (
                <ClockIcon className="h-2.5 w-2.5" />
              )}
              {effect.durationType === "time"
                ? formatDuration(effect.duration)
                : effect.durationType === "short" ||
                    effect.durationType === "long"
                  ? ""
                  : effect.duration}
            </Badge>
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="relative h-full w-full" key={resetCount}>
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className={cn(
          "h-full w-full rounded-md border-2 border-neutral-50 bg-neutral-50 bg-contain bg-center bg-no-repeat shadow-md",
          isPanning && "cursor-grab",
          isDrawing && "cursor-copy",
        )}
        onMouseDownCapture={handleMouseDown}
      >
        <filter id="subtleDropShadow">
          <feDropShadow
            dx="2"
            dy="2"
            stdDeviation="4"
            floodColor="rgba(0,0,0,0.6)"
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

        {elements.map((elementData) => {
          const element =
            tempResizedElement && tempResizedElement.id === elementData.id
              ? tempResizedElement
              : elementData;
          return (
            <CanvasElementNode
              key={"element-" + element.id}
              element={element}
              isSelected={resizingElementId === element.id}
              onEdit={() => element.onEdit?.(element)}
              onClick={() =>
                handleElementClick(() => element.onClick?.(element), element.id)
              }
              onSelect={() =>
                setResizingElementId((prev) =>
                  prev === element.id ? null : element.id,
                )
              }
              onDragStart={(e) => handleElementDragStart(e, element)}
              onResizeStart={(e, handle) =>
                handleResizeStart(e, element, handle)
              }
            />
          );
        })}

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
              transform={`translate(${temporaryElement.x + 6}, ${temporaryElement.y + 34})`}
            >
              <text
                className="font-sans text-4xl font-bold shadow-sm select-none"
                dominantBaseline="middle"
              >
                {currentIcon}
              </text>
            </g>

            {/* Title */}
            <g
              id="temp-element-name"
              transform={`translate(${temporaryElement.x + 60}, ${temporaryElement.y + 30})`}
            >
              <text
                className="font-sans text-lg font-medium text-white select-none"
                dominantBaseline="middle"
              >
                {currentTitle}
              </text>
            </g>
          </g>
        )}

        {selectedToken && (
          <circle
            id="selection-ring"
            cx={selectedToken.coordinates.x + 50}
            cy={selectedToken.coordinates.y + 50}
            r={64}
            stroke="white"
            strokeWidth={10}
            className="animate-pulse"
          />
        )}

        {tokens.map((token) => {
          const player = players.find(
            (player) => token.type === "player" && player.id === token.entity,
          );
          const opponent = encounterOpponents.data
            ? encounterOpponents.data.find(
                (opponent) =>
                  token.type === "opponent" && opponent.id === token.entity,
              )
            : [];

          if (player) {
            return (
              <ContextMenu key={"player-" + token.id}>
                <ContextMenuTrigger asChild>
                  <g
                    data-token-group-id={token.id}
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
                    <circle
                      cx={token.coordinates.x + 50}
                      cy={token.coordinates.y + 50}
                      r={40}
                      fill="white"
                      stroke="black"
                      strokeWidth={2}
                      className="pointer-events-none"
                    />

                    <g>
                      <text
                        className="pointer-events-none text-4xl select-none"
                        x={token.coordinates.x}
                        y={token.coordinates.y + 32}
                      >
                        {player.icon}
                      </text>
                    </g>
                    <image
                      className="hover:cursor-pointer"
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
                    <g>
                      <text
                        className="pointer-events-none text-4xl select-none"
                        x={token.coordinates.x}
                        y={token.coordinates.y + 32}
                      >
                        {player.icon}
                      </text>
                    </g>
                    {player.effects && player.effects.length > 0 && (
                      <foreignObject
                        x={token.coordinates.x + 60}
                        y={token.coordinates.y + 10}
                        width={24}
                        height={24}
                        className="pointer-events-auto"
                      >
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm hover:cursor-pointer hover:bg-black hover:text-white">
                              <Sparkles className="h-4 w-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-2">
                            <div className="flex flex-col gap-2">
                              <h4 className="text-sm leading-none font-semibold">
                                {t("activeEffects")}
                              </h4>
                              {renderEffectsList(player.effects)}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </foreignObject>
                    )}
                  </g>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-56">
                  <ContextMenuLabel>{player.name}</ContextMenuLabel>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => onTokenSelect(token)}>
                    {t("select")}
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuGroup>
                    {onOpenEffectsCatalog && (
                      <ContextMenuItem
                        onClick={() =>
                          onOpenEffectsCatalog(player.id, "player")
                        }
                      >
                        {t("addEffect")}
                      </ContextMenuItem>
                    )}
                  </ContextMenuGroup>

                  {(onHealPlayer || onDamagePlayer) && (
                    <>
                      <ContextMenuSeparator />
                      <ContextMenuGroup>
                        {onHealPlayer && (
                          <ContextMenuItem
                            onClick={() => onHealPlayer(player.id)}
                          >
                            {t("addHealth")}
                          </ContextMenuItem>
                        )}
                        {onDamagePlayer && (
                          <ContextMenuItem
                            onClick={() => onDamagePlayer(player.id)}
                          >
                            {t("removeHealth")}
                          </ContextMenuItem>
                        )}
                      </ContextMenuGroup>
                    </>
                  )}

                  <ContextMenuSeparator />

                  <ContextMenuGroup>
                    <ContextMenuItem
                      onClick={() =>
                        useOverlayStore.getState().open("player.edit", {
                          player: player,
                          onEdit: async (updatedPlayer) => {
                            const result =
                              await database.players.update(updatedPlayer);
                            return result;
                          },
                          onComplete: () => {
                            queryClient.invalidateQueries({
                              queryKey: ["players"],
                            });
                            queryClient.invalidateQueries({
                              queryKey: ["party"],
                            });
                            queryClient.invalidateQueries({
                              queryKey: ["parties"],
                            });
                          },
                        })
                      }
                    >
                      {t("edit")}
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => toggleToken(token)}>
                      {(tokenVisibility[token.id] ?? true)
                        ? t("hide")
                        : t("show")}
                    </ContextMenuItem>
                  </ContextMenuGroup>

                  {onRemoveFromInitiative &&
                    onAddToInitiative &&
                    initiativeEntityIds &&
                    initiativeEntityIds.length > 0 && (
                      <>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          onClick={() => {
                            const isInInitiative = initiativeEntityIds.some(
                              (e) => e.id === player.id && e.type === "player",
                            );
                            if (isInInitiative) {
                              onRemoveFromInitiative(player.id, "player");
                            } else {
                              onAddToInitiative(
                                player.id,
                                "player",
                                player.name,
                              );
                            }
                          }}
                        >
                          {initiativeEntityIds.some(
                            (e) => e.id === player.id && e.type === "player",
                          )
                            ? t("removeFromInitiative")
                            : t("addToInitiative")}
                        </ContextMenuItem>
                      </>
                    )}
                </ContextMenuContent>
              </ContextMenu>
            );
          }

          if (opponent) {
            return (
              <ContextMenu key={"opponent-" + token.id}>
                <ContextMenuTrigger asChild>
                  <g
                    data-token-group-id={token.id}
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
                    <circle
                      cx={token.coordinates.x + 50}
                      cy={token.coordinates.y + 50}
                      r={40}
                      fill="white"
                      stroke="black"
                      strokeWidth={2}
                      className="pointer-events-none"
                    />

                    {!opponent.image && (
                      <g>
                        <text
                          className="pointer-events-none text-4xl select-none"
                          x={token.coordinates.x + 32}
                          y={token.coordinates.y + 64}
                        >
                          {opponent.icon}
                        </text>
                      </g>
                    )}

                    <image
                      className="hover:cursor-pointer"
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
                    {opponent.image && (
                      <g>
                        <text
                          className="pointer-events-none text-4xl select-none"
                          x={token.coordinates.x}
                          y={token.coordinates.y + 32}
                        >
                          {opponent.icon}
                        </text>
                      </g>
                    )}
                    {opponent.effects && opponent.effects.length > 0 && (
                      <foreignObject
                        x={token.coordinates.x + 60}
                        y={token.coordinates.y + 10}
                        width={24}
                        height={24}
                        className="pointer-events-auto"
                      >
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm hover:cursor-pointer hover:bg-black hover:text-white">
                              <Sparkles className="h-4 w-4" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-2">
                            <div className="flex flex-col gap-2">
                              <h4 className="text-sm leading-none font-semibold">
                                {t("activeEffects")}
                              </h4>
                              {renderEffectsList(opponent.effects)}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </foreignObject>
                    )}
                  </g>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-56">
                  <ContextMenuLabel>{opponent.name}</ContextMenuLabel>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => onTokenSelect(token)}>
                    {t("select")}
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuGroup>
                    {onOpenEffectsCatalog && (
                      <ContextMenuItem
                        onClick={() =>
                          onOpenEffectsCatalog(opponent.id, "opponent")
                        }
                      >
                        {t("addEffect")}
                      </ContextMenuItem>
                    )}
                  </ContextMenuGroup>

                  {(onHealOpponent || onDamageOpponent) && (
                    <>
                      <ContextMenuSeparator />
                      <ContextMenuGroup>
                        {onHealOpponent && (
                          <ContextMenuItem
                            onClick={() => onHealOpponent(opponent.id)}
                          >
                            {t("addHealth")}
                          </ContextMenuItem>
                        )}
                        {onDamageOpponent && (
                          <ContextMenuItem
                            onClick={() => onDamageOpponent(opponent.id)}
                          >
                            {t("removeHealth")}
                          </ContextMenuItem>
                        )}
                      </ContextMenuGroup>
                    </>
                  )}

                  <ContextMenuSeparator />

                  <ContextMenuGroup>
                    <ContextMenuItem
                      onClick={() =>
                        useOverlayStore
                          .getState()
                          .open("encounter-opponent.edit", {
                            opponent: opponent,
                            onEdit: async (opp) => {
                              const result =
                                await database.encounterOpponents.update(opp);
                              return result;
                            },
                            onDelete: async (id) => {
                              await database.encounterOpponents.delete(id);
                            },
                            onComplete: () => {
                              queryClient.invalidateQueries({
                                queryKey: ["encounter-opponents"],
                              });
                            },
                          })
                      }
                    >
                      {t("edit")}
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => toggleToken(token)}>
                      {(tokenVisibility[token.id] ?? true)
                        ? t("hide")
                        : t("show")}
                    </ContextMenuItem>
                  </ContextMenuGroup>

                  {onRemoveFromInitiative &&
                    onAddToInitiative &&
                    initiativeEntityIds &&
                    initiativeEntityIds.length > 0 && (
                      <>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          onClick={() => {
                            const isInInitiative = initiativeEntityIds.some(
                              (e) =>
                                e.id === opponent.id && e.type === "opponent",
                            );
                            if (isInInitiative) {
                              onRemoveFromInitiative(opponent.id, "opponent");
                            } else {
                              onAddToInitiative(
                                opponent.id,
                                "opponent",
                                opponent.name,
                              );
                            }
                          }}
                        >
                          {initiativeEntityIds.some(
                            (e) =>
                              e.id === opponent.id && e.type === "opponent",
                          )
                            ? t("removeFromInitiative")
                            : t("addToInitiative")}
                        </ContextMenuItem>
                      </>
                    )}
                </ContextMenuContent>
              </ContextMenu>
            );
          }

          return null;
        })}
      </svg>

      {players.length > 0 && (
        <div className="absolute top-4 right-4 flex flex-col gap-4">
          <div className="flex flex-col gap-2 rounded-full border border-white/80 bg-white/20 p-1 shadow-md backdrop-blur-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handlePlayersPanel}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:bg-slate-100 hover:shadow-xs"
                  >
                    {isPlayersPanelOpen ? (
                      <CircleX className="h-4 w-4" />
                    ) : (
                      <UsersRound className="h-4 w-4" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{t("playerTokens")}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isPlayersPanelOpen && (
              <div className="flex flex-col gap-2">
                {players.map((player) => {
                  const token = tokens.find(
                    (t) => t.type === "player" && t.entity === player.id,
                  );
                  if (!token) return null;
                  return (
                    <Tooltip key={`player-${player.id}-token-state`}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => toggleToken(token)}
                          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
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
                      </TooltipTrigger>
                      <TooltipContent>{player.name}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}
          </div>

          {encounterOpponents.data && encounterOpponents.data.length > 0 && (
            <div className="flex flex-col gap-2 rounded-full border border-white/80 bg-white/20 p-1 shadow-md backdrop-blur-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleOpponentsPanel}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
                    >
                      {isOpponentsPanelOpen ? (
                        <CircleX className="h-4 w-4" />
                      ) : (
                        <Sword className="h-4 w-4" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{t("opponentTokens")}</TooltipContent>
                </Tooltip>

                {isOpponentsPanelOpen && (
                  <div className="flex flex-col gap-2">
                    {encounterOpponents.data &&
                      encounterOpponents.data.map((opponent) => {
                        const token = tokens.find(
                          (t) =>
                            t.type === "opponent" && t.entity === opponent.id,
                        );
                        if (!token) return null;
                        return (
                          <Tooltip key={`opponent-${opponent.id}-token-state`}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => toggleToken(token)}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
                              >
                                <div className="grid grid-cols-1 grid-rows-1 items-center justify-items-center">
                                  {opponent.image && opponent.image !== "" ? (
                                    <img
                                      className="col-start-1 col-end-1 row-start-1 row-end-2 rounded-full"
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
                            </TooltipTrigger>
                            <TooltipContent>{opponent.name}</TooltipContent>
                          </Tooltip>
                        );
                      })}
                  </div>
                )}
              </TooltipProvider>
            </div>
          )}
        </div>
      )}

      <MusicPlayer />

      <div className="absolute bottom-4 left-4 flex gap-2 rounded-full border border-white/80 bg-white/20 p-1 shadow-md backdrop-blur-sm">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={zoomOut}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
              >
                <ZoomOutIcon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("zoomOut")}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={zoomIn}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
              >
                <ZoomInIcon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("zoomIn")}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={resetZoom}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
              >
                <ResetIcon className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("resetZoom")}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  setIsPanning(false);
                  setIsDrawing((c) => !c);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-white hover:cursor-pointer hover:bg-slate-100 hover:shadow-xs"
              >
                {isDrawing ? (
                  <Cross2Icon className="h-4 w-4" />
                ) : (
                  <PaddingIcon className="h-4 w-4" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("drawEncounter")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

export default Canvas;
