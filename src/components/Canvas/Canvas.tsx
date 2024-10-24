import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import {
  Cross2Icon,
  PaddingIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "@radix-ui/react-icons";

const MIN_ZOOM = 0.1;
const ZOOM_DELTA = 0.1;
const OFFSET = { x: 0, y: 0 };

type Props = {
  background?: HTMLImageElement;
  elements: CanvasElement[];
  onElementClick: (element: CanvasElement | undefined) => void;
  onDrawed: (element: CanvasElement) => void;
};

type CanvasElement = {
  id: string;
  type: "background" | "rect";
  x: number;
  y: number;
  width: number;
  height: number;
  url?: string;
  color?: string;
};

//TODO: Think about the CanvasElement id when drawing a new element is date and time as s enough and save?

function Canvas({ background, elements, onElementClick, onDrawed }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [showPaneCursor, setShowPaneCursor] = useState<boolean>(false);
  const panOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isPanningRef = useRef<boolean>(false);
  const startPanningRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startDrawingRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const newDrawnElement = useRef<CanvasElement | undefined>(undefined);

  function setDrawingSizeToCanvasSize() {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      drawElements(elements);
    }
  }

  function zoomIn() {
    setZoom((prevZoom) => Math.max(MIN_ZOOM, prevZoom + ZOOM_DELTA));
  }

  function zoomOut() {
    setZoom((prevZoom) => Math.max(MIN_ZOOM, prevZoom - ZOOM_DELTA));
  }

  function handleMouseDownOnCanvas(event: React.MouseEvent<HTMLCanvasElement>) {
    if (showPaneCursor) {
      isPanningRef.current = true;
      startPanningRef.current = { x: event.clientX, y: event.clientY };
      window.addEventListener("mousemove", handlePanningOnMouseMove);
      window.addEventListener("mouseup", handleStopPanningOnMouseUp);
    }

    if (!showPaneCursor && !isDrawing) {
      const canvas = ref.current;

      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();

      const mouseX = (event.clientX - rect.left) / zoom - panOffset.current.x;
      const mouseY = (event.clientY - rect.top) / zoom - panOffset.current.y;

      const canvasMiddle = { x: rect.width / 2, y: rect.height / 2 };
      const clickedCanvasCoordinates = {
        x: mouseX - canvasMiddle.x,
        y: mouseY - canvasMiddle.y,
      };

      const clickedElement = elements
        .map((el) => el)
        .reverse() // to get the element which is on the top
        .find(
          (element) =>
            clickedCanvasCoordinates.x >= element.x &&
            clickedCanvasCoordinates.x <= element.x + element.width &&
            clickedCanvasCoordinates.y >= element.y &&
            clickedCanvasCoordinates.y <= element.y + element.height
        );

      if (clickedElement) onElementClick(clickedElement);
    }

    if (isDrawing && !showPaneCursor) {
      const canvas = ref.current;

      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = (event.clientX - rect.left) / zoom - panOffset.current.x;
        const mouseY = (event.clientY - rect.top) / zoom - panOffset.current.y;
        const canvasMiddle = {
          x: rect.width / (2 * zoom),
          y: rect.height / (2 * zoom),
        };

        startDrawingRef.current = {
          x: mouseX - canvasMiddle.x,
          y: mouseY - canvasMiddle.y,
        };

        window.addEventListener("mousemove", handleStartDrawing);
        window.addEventListener("mouseup", handleStopDrawing);
      }
    }
  }

  function handlePanningOnMouseMove(e: MouseEvent) {
    if (!isPanningRef.current) return;

    const deltaX = (e.clientX - startPanningRef.current.x) / zoom;
    const deltaY = (e.clientY - startPanningRef.current.y) / zoom;
    panOffset.current.x += deltaX;
    panOffset.current.y += deltaY;
    startPanningRef.current = { x: e.clientX, y: e.clientY };

    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");

    if (ctx) drawElements(elements);
  }

  function handleStopPanningOnMouseUp() {
    isPanningRef.current = false;
    window.removeEventListener("mousemove", handlePanningOnMouseMove);
    window.removeEventListener("mouseup", handleStopPanningOnMouseUp);
  }

  function drawElements(elements: CanvasElement[]) {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.save();
      ctx.scale(zoom, zoom);

      ctx.translate(
        panOffset.current.x + canvas.width / (2 * zoom),
        panOffset.current.y + canvas.height / (2 * zoom)
      );

      if (background) {
        const { height, width } = background;
        ctx.drawImage(background, -width / 2, -height / 2, width, height);
      }

      elements.forEach((element) => {
        const { x, y, width, height, type } = element;

        if (type === "rect" && element.color) {
          ctx.fillStyle = element.color;
          ctx.fillRect(x + OFFSET.x, y + OFFSET.y, width || 100, height || 100);
        }
      });

      ctx.restore();
    }
  }

  function showGrabCursor(event: KeyboardEvent) {
    if (!showPaneCursor && event.code === "Space") {
      setShowPaneCursor(true);
    }
  }

  function hideGrabCursor(event: KeyboardEvent) {
    if (showPaneCursor && event.code === "Space") {
      setShowPaneCursor(false);
    }
  }

  function isCursorOnCanvas(
    canvas: HTMLCanvasElement,
    mousePosition: { x: number; y: number }
  ) {
    const canvasBoundingRect = canvas.getBoundingClientRect();
    const x = {
      start: canvasBoundingRect.left,
      end: canvasBoundingRect.left + canvasBoundingRect.width,
    };
    const y = {
      start: canvasBoundingRect.top,
      end: canvasBoundingRect.top + canvasBoundingRect.height,
    };

    return (
      mousePosition.x >= x.start &&
      mousePosition.x <= x.end &&
      mousePosition.y >= y.start &&
      mousePosition.y <= y.end
    );
  }

  function handleStopDrawing() {
    setIsDrawing(false);
    window.removeEventListener("mousemove", handleStartDrawing);
    window.removeEventListener("mouseup", handleStopDrawing);

    if (newDrawnElement.current) {
      onDrawed(newDrawnElement.current);
      newDrawnElement.current = undefined;
    }
  }

  function handleStartDrawing(event: MouseEvent) {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");

    if (
      canvas &&
      ctx &&
      isDrawing &&
      isCursorOnCanvas(canvas, { x: event.clientX, y: event.clientY }) &&
      event.button === 0 &&
      startDrawingRef.current
    ) {
      const rect = canvas.getBoundingClientRect();
      const start = startDrawingRef.current;
      const updatedElements = [...elements];

      const mouseX = (event.clientX - rect.left) / zoom - panOffset.current.x;
      const mouseY = (event.clientY - rect.top) / zoom - panOffset.current.y;

      const canvasMiddle = {
        x: rect.width / (2 * zoom),
        y: rect.height / (2 * zoom),
      };

      const end = {
        x: mouseX - canvasMiddle.x,
        y: mouseY - canvasMiddle.y,
      };

      if (start.x !== end.x && start.y !== end.y) {
        const newElement: CanvasElement = {
          id: new Date().getTime().toString(),
          type: "rect",
          height: end.y - start.y,
          width: end.x - start.x,
          x: start.x,
          y: start.y,
          color: "yellow",
        };

        updatedElements.push(newElement);
        drawElements(updatedElements);
        newDrawnElement.current = newElement;
      }
    }
  }

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
      setDrawingSizeToCanvasSize();
      drawElements(elements);
    }

    window.addEventListener("resize", setDrawingSizeToCanvasSize);

    window.addEventListener("keypress", showGrabCursor);
    window.addEventListener("keyup", hideGrabCursor);

    return () => {
      window.removeEventListener("resize", setDrawingSizeToCanvasSize);
      window.removeEventListener("keypress", showGrabCursor);
      window.removeEventListener("keyup", hideGrabCursor);
    };
  }, [showGrabCursor, hideGrabCursor]);

  useEffect(() => {
    setDrawingSizeToCanvasSize();
    window.addEventListener("resize", setDrawingSizeToCanvasSize);

    return () => {
      window.removeEventListener("resize", setDrawingSizeToCanvasSize);
    };
  }, [zoom, panOffset.current]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={ref}
        className={cn(
          "bg-center bg-contain bg-no-repeat w-full h-full border-2 bg-neutral-50 border-neutral-50 rounded-md shadow-md",
          showPaneCursor && isPanningRef.current && "cursor-grabbing",
          showPaneCursor && !isPanningRef.current && "cursor-grab "
        )}
        onMouseDown={handleMouseDownOnCanvas}
      />

      <div className="flex flex-col gap-4 absolute right-4 top-1/2 p-2 border rounded-full shadow-md bg-white/20 border-white/80 backdrop-blur">
        <button
          onClick={() => setIsDrawing((c) => !c)}
          className="hover:bg-slate-100 hover:shadow-sm rounded-full bg-white border border-slate-700 h-10 w-10 flex justify-center items-center">
          {isDrawing ? (
            <Cross2Icon className="h-4 w-4" />
          ) : (
            <PaddingIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="flex gap-2 absolute right-4 bottom-4 p-1 border rounded-full shadow-md bg-white/20 border-white/80 backdrop-blur">
        <button
          onClick={zoomIn}
          className="hover:bg-slate-100 hover:shadow-sm border border-slate-700 rounded-full bg-white h-8 w-8 flex justify-center items-center">
          <ZoomInIcon className="h-4 w-4" />
        </button>

        <button
          onClick={zoomOut}
          className="hover:bg-slate-100 hover:shadow-sm rounded-full bg-white border border-slate-700 h-8 w-8 flex justify-center items-center">
          <ZoomOutIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default Canvas;
