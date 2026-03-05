import db from "@/lib/database";
import { cn } from "@/lib/utils";
import { useEncounterStore } from "@/stores/useEncounterStore";
import { Player } from "@/types/player";
import { Token } from "@/types/tokens";
import { useEffect, useRef, useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useTranslation } from "react-i18next";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import CanvasElementNode from "./CanvasElementNode";
import { MusicPlayer } from "@/components/MusicPlayer/MusicPlayer";
import { InrackerCanvasElement } from "@/types/canvas";

import TokenPanels from "./TokenPanels";
import CanvasToolbar from "./CanvasToolbar";
import { TemporaryElement } from "./TemporaryElement";
import { PlayerToken } from "./PlayerToken";
import { OpponentToken } from "./OpponentToken";
import { useCanvasReducer, ViewBox } from "@/hooks/useCanvasReducer";
import { usePanInteraction } from "./usePanInteraction";
import { useZoomInteraction } from "./useZoomInteraction";
import { useDrawInteraction } from "./useDrawInteraction";
import { useTokenDrag } from "./useTokenDrag";
import { useElementDrag } from "./useElementDrag";
import { useElementResize } from "./useElementResize";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

import SvgDefs from "./SvgDefs";

import { CanvasElementWithId } from "./types";

type Props = {
  database: typeof db;
  background?: string;
  elements: CanvasElementWithId[];
  temporaryElement?: InrackerCanvasElement;
  players: Player[];
  selectedToken: Token | null;
  tokens: Token[];
  onTokenSelect: (token: Token | null) => void;
  onDrawed: (element: Omit<InrackerCanvasElement, "id">) => void;
  onTokenMove: (token: Token) => void;
  onElementMove: (element: CanvasElementWithId) => void;
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
  onOpenSessionLog?: () => void;
  onStartFight?: (encounterId: number) => void;
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
  onOpenSessionLog,
  onStartFight,
}: Props) {
  useTranslation("ComponentCanvas");
  const svgRef = useRef<SVGSVGElement>(null);
  const backgroundImage = useRef<HTMLImageElement | null>(null);

  const {
    state,
    dispatch,
    setInteractionMode,
    setViewBox,
    initializeViewBox,
    applyZoom,
    resetZoom,
    selectElement,
    togglePlayersPanel,
    toggleOpponentsPanel,
    setTokenVisibility,
    setTempResizedElement,
    clearTempResizedIfSynced,
  } = useCanvasReducer();

  const {
    viewBox,
    zoom,
    interactionMode,
    selectedElementId: resizingElementId,
    isPlayersPanelOpen,
    isOpponentsPanelOpen,
    tokenVisibility,
    tempResizedElement,
  } = state;

  const isPanning = interactionMode === "panning";
  const isDrawing = interactionMode === "drawing";

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

  const currentViewBoxRef = useRef<ViewBox>(viewBox);
  const zoomRef = useRef<number>(zoom);

  // Sync refs with state
  useEffect(() => {
    currentViewBoxRef.current = viewBox;
  }, [viewBox]);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  // Interaction hooks
  const { startPan } = usePanInteraction(
    svgRef,
    currentViewBoxRef,
    setViewBox,
  );

  useZoomInteraction(
    svgRef,
    currentViewBoxRef,
    zoomRef,
    applyZoom,
    setViewBox,
  );

  const { startDraw } = useDrawInteraction(
    svgRef,
    currentColor,
    setInteractionMode,
    onDrawed,
  );

  const { handleTokenDragStart, isDragging } = useTokenDrag(
    svgRef,
    onTokenMove,
    selectedToken,
  );

  const {
    handleElementDragStart,
    handleTempElementDragStart,
    isDragging: isElementDragging,
  } = useElementDrag(svgRef, onElementMove, temporaryElement);

  const { handleResizeStart } = useElementResize(
    svgRef,
    onElementMove,
    setTempResizedElement,
  );

  useKeyboardShortcuts({
    interactionMode,
    resizingElementId,
    elements,
    applyZoom,
    resetZoom,
    setInteractionMode,
    onToggleAside,
    onOpenSessionLog,
    onStartFight,
    onTokenSelect,
    currentViewBoxRef,
    zoomRef,
    setViewBox,
    svgRef,
  });

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
        initializeViewBox(newViewBox);
      };
      tmp.src = background;
    }
  }, [background, initializeViewBox]);

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;

    const target = event.target as Element;
    const isElement = target.closest("[data-element-id]");

    if (!isElement && resizingElementId !== null) {
      selectElement(null);
    }

    if (isPanning) {
      startPan(event);
    } else if (isDrawing) {
      startDraw(event);
    }
  };

  const playerMap = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players],
  );

  const opponentMap = useMemo(
    () =>
      new Map(
        (encounterOpponents.data ?? []).map((o) => [o.id, o]),
      ),
    [encounterOpponents.data],
  );

  useEffect(() => {
    clearTempResizedIfSynced(elements);
  }, [elements, tempResizedElement, clearTempResizedIfSynced]);

  function handleElementClick(
    elementOnClick: () => void | undefined,
    elementId: any,
  ) {
    if (isDragging.current || isElementDragging.current) {
      isDragging.current = false;
      isElementDragging.current = false;
      return;
    }

    selectElement(elementId);

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

  useEffect(() => {
    const tokensToHide: (string | number)[] = [];
    elements.forEach((element) => {
      if (element.completed && element.opponents) {
        const opponentIds = new Set(element.opponents);
        tokens.forEach((token) => {
          if (token.type === "opponent" && opponentIds.has(token.entity)) {
            if (tokenVisibility[token.id.toString()] !== false) {
              tokensToHide.push(token.id);
            }
          }
        });
      }
    });

    if (tokensToHide.length > 0) {
      dispatch({
        type: "HIDE_COMPLETED_ENCOUNTER_OPPONENT_TOKENS",
        tokenIds: tokensToHide,
      });
    }
  }, [elements, tokens, tokenVisibility, dispatch]);

  function toggleToken(token: Token) {
    const newVisibility = !(tokenVisibility[token.id.toString()] ?? true);
    setTokenVisibility(token.id, newVisibility);

    if (!newVisibility && selectedToken && token.id === selectedToken.id) {
      onTokenSelect(null);
    }
  }

  function zoomIn() {
    setInteractionMode("idle");
    applyZoom(1.2);
  }

  function zoomOut() {
    setInteractionMode("idle");
    applyZoom(0.8);
  }

  return (
    <div className="relative h-full w-full" key={resetCount}>
      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        className={cn(
          "h-full w-full overflow-hidden transition-all duration-300 ease-in-out",
          isPanning && "cursor-grab active:cursor-grabbing",
          isDrawing && "cursor-crosshair",
        )}
        onMouseDown={handleMouseDown}
      >
        <SvgDefs
          backgroundWidth={backgroundImage.current?.naturalWidth}
          backgroundHeight={backgroundImage.current?.naturalHeight}
        />

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
                selectElement(resizingElementId === element.id ? null : element.id)
              }
              onDragStart={(e: React.MouseEvent<SVGGElement>) => handleElementDragStart(e, element)}
              onResizeStart={(e: React.MouseEvent<SVGRectElement>, handle: "nw" | "ne" | "sw" | "se") =>
                handleResizeStart(e, element, handle)
              }
            />
          );
        })}

        {temporaryElement && (
          <TemporaryElement
            element={temporaryElement}
            currentColor={currentColor}
            currentIcon={currentIcon}
            currentTitle={currentTitle}
            onDragStart={handleTempElementDragStart}
          />
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
          if (token.type === "player") {
            const player = playerMap.get(token.entity);
            if (!player) return null;
            return (
              <PlayerToken
                key={"player-" + token.id}
                token={token}
                player={player}
                isVisible={tokenVisibility[token.id.toString()] ?? true}
                isSelected={selectedToken?.id === token.id}
                isInteractive={!isDrawing && !isPanning}
                onDragStart={handleTokenDragStart}
                onClick={handleTokenClick}
                onTokenSelect={onTokenSelect}
                onToggleVisibility={toggleToken}
                onOpenEffectsCatalog={onOpenEffectsCatalog}
                onHealPlayer={onHealPlayer}
                onDamagePlayer={onDamagePlayer}
                onRemoveFromInitiative={onRemoveFromInitiative}
                onAddToInitiative={onAddToInitiative}
                initiativeEntityIds={initiativeEntityIds}
                database={database}
              />
            );
          }

          if (token.type === "opponent") {
            const opponent = opponentMap.get(token.entity);
            if (!opponent) return null;
            return (
              <OpponentToken
                key={"opponent-" + token.id}
                token={token}
                opponent={opponent}
                isVisible={tokenVisibility[token.id.toString()] ?? true}
                isSelected={selectedToken?.id === token.id}
                isInteractive={!isDrawing && !isPanning}
                onDragStart={handleTokenDragStart}
                onClick={handleTokenClick}
                onTokenSelect={onTokenSelect}
                onToggleVisibility={toggleToken}
                onOpenEffectsCatalog={onOpenEffectsCatalog}
                onHealOpponent={onHealOpponent}
                onDamageOpponent={onDamageOpponent}
                onRemoveFromInitiative={onRemoveFromInitiative}
                onAddToInitiative={onAddToInitiative}
                initiativeEntityIds={initiativeEntityIds}
                database={database}
              />
            );
          }

          return null;
        })}
      </svg>

      <TokenPanels
        players={players}
        opponents={encounterOpponents.data ?? []}
        tokens={tokens}
        tokenVisibility={tokenVisibility}
        isPlayersPanelOpen={isPlayersPanelOpen}
        isOpponentsPanelOpen={isOpponentsPanelOpen}
        onTogglePlayersPanel={togglePlayersPanel}
        onToggleOpponentsPanel={toggleOpponentsPanel}
        onToggleToken={toggleToken}
      />

      <CanvasToolbar
        isDrawing={isDrawing}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetZoom={resetZoom}
        onToggleDrawing={() => {
          setInteractionMode(interactionMode === "drawing" ? "idle" : "drawing");
        }}
      />
      <MusicPlayer />
    </div>
  );
}

export default Canvas;
