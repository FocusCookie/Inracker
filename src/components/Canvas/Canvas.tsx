import { useEffect, useMemo, useRef, useState } from "react";
import { Tldraw, createShapeId, type Editor } from "tldraw";
import "tldraw/tldraw.css";

import type { InrackerCanvasElement } from "@/types/canvas";
import type { Player } from "@/types/player";
import type { Token } from "@/types/tokens";
import type { EncounterOpponent } from "@/types/opponents";
import { useQueryWithToast } from "@/hooks/useQueryWithErrorToast";
import { BackgroundShapeUtil } from "./tldraw/BackgroundShapeUtil";
import { EncounterShapeUtil } from "./tldraw/EncounterShapeUtil";
import { EncounterTool } from "./tldraw/EncounterTool";
import { MarkupShapeUtil } from "./tldraw/MarkupShapeUtil";
import { MarkupTool } from "./tldraw/MarkupTool";
import { TokenShapeUtil } from "./tldraw/TokenShapeUtil";
import { useTldrawSync } from "./tldraw/useTldrawSync";
import { CanvasTldrawProvider } from "./tldraw/CanvasTldrawContext";
import type { CanvasElementWithId } from "./types";
import TokenPanels from "./TokenPanels";
import CanvasToolbar, { DrawingMode } from "./CanvasToolbar";
import SelectionToolbar from "./SelectionToolbar";
import { BACKGROUND_TYPE, ENCOUNTER_TYPE, TOKEN_TYPE, MARKUP_TYPE } from "./tldraw/shapes";
import { MarkupElement } from "@/types/markup";

const shapeUtils = [
  BackgroundShapeUtil,
  EncounterShapeUtil,
  TokenShapeUtil,
  MarkupShapeUtil,
];
const tools = [EncounterTool, MarkupTool];

type Props = {
  database: typeof import("@/lib/database").default;
  background?: string;
  elements: CanvasElementWithId[];
  temporaryElement?: InrackerCanvasElement;
  players: Player[];
  selectedToken: Token | null;
  tokens: Token[];
  markup: MarkupElement[];
  onTokenSelect: (token: Token | null) => void;
  onDrawed: (element: Omit<InrackerCanvasElement, "id">) => void;
  onMarkupDrawed: (markup: Omit<MarkupElement, "id">) => void;
  onTokenMove: (token: Token) => void;
  onElementMove: (element: CanvasElementWithId) => void;
  onMarkupMove: (markup: MarkupElement) => void;
  onMarkupDelete: (markupId: number) => void;
  onMarkupDuplicate: (markupId: number) => void;
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

export default function Canvas({
  database,
  background,
  elements,
  temporaryElement,
  players,
  selectedToken,
  tokens,
  markup,
  onTokenSelect,
  onDrawed,
  onMarkupDrawed,
  onTokenMove,
  onElementMove,
  onMarkupMove,
  onMarkupDelete,
  onMarkupDuplicate,
  onRemoveFromInitiative,
  onAddToInitiative,
  onOpenEffectsCatalog,
  initiativeEntityIds,
  onHealPlayer,
  onDamagePlayer,
  onHealOpponent,
  onDamageOpponent,
  onToggleAside: _onToggleAside,
  onOpenSessionLog: _onOpenSessionLog,
  onStartFight: _onStartFight,
}: Props) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [tokenVisibility, setTokenVisibilityState] = useState<
    Record<string, boolean>
  >({});
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("none");
  const [selectedShapeIds, setSelectedShapeIds] = useState<string[]>([]);
  const [isPlayersPanelOpen, setIsPlayersPanelOpen] = useState(true);
  const [isOpponentsPanelOpen, setIsOpponentsPanelOpen] = useState(true);
  const isSelectionSyncingRef = useRef(false);
  const backgroundShapeId = useMemo(() => createShapeId("background"), []);

  const hasMatchingPersistedElement = useMemo(() => {
    const draft = temporaryElement;
    if (!draft) return false;

    return elements.some((element) => {
      const tolerance = 60;
      const draftCenterX = draft.x + draft.width / 2;
      const draftCenterY = draft.y + draft.height / 2;
      const elementCenterX = element.x + element.width / 2;
      const elementCenterY = element.y + element.height / 2;
      return (
        Math.abs(elementCenterX - draftCenterX) <= tolerance &&
        Math.abs(elementCenterY - draftCenterY) <= tolerance &&
        Math.abs(element.width - draft.width) <= tolerance &&
        Math.abs(element.height - draft.height) <= tolerance
      );
    });
  }, [elements, temporaryElement]);

  const effectiveTemporaryElement = hasMatchingPersistedElement
    ? null
    : (temporaryElement ?? null);

  const encounterOpponents = useQueryWithToast({
    queryKey: ["encounter-opponents"],
    queryFn: () => database.encounterOpponents.getAllDetailed(),
  });

  const playersById = useMemo(
    () => new Map(players.map((player) => [player.id, player])),
    [players],
  );

  const elementsByShapeId = useMemo(
    () =>
      new Map(
        elements.map((element) => [
          createShapeId(`encounter-${element.id}`),
          element,
        ]),
      ),
    [elements],
  );

  const opponentsById = useMemo(
    () => new Map((encounterOpponents.data ?? []).map((o) => [o.id, o])),
    [encounterOpponents.data],
  );

  const tokensById = useMemo(
    () => new Map(tokens.map((token) => [token.id, token])),
    [tokens],
  );

  const markupByShapeId = useMemo(
    () =>
      new Map(
        markup.map((m) => [createShapeId(`markup-${m.id}`), m]),
      ),
    [markup],
  );

  const setTokenVisibility = (tokenId: number, isVisible: boolean) => {
    setTokenVisibilityState((prev) => ({
      ...prev,
      [tokenId.toString()]: isVisible,
    }));
  };

  useEffect(() => {
    const tokensToHide: number[] = [];
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
      setTokenVisibilityState((prev) => {
        const next = { ...prev };
        tokensToHide.forEach((id) => {
          next[id.toString()] = false;
        });
        return next;
      });
    }
  }, [elements, tokens, tokenVisibility]);

  useTldrawSync({
    editor,
    elements,
    temporaryElement: effectiveTemporaryElement,
    tokens,
    markup,
    onElementMove,
    onTokenMove,
    onMarkupMove,
    backgroundShapeId,
  });

  // When temporary element is cleared (cancel/complete), force tldraw back to clean select state
  const prevTemporaryElementRef = useRef(temporaryElement);
  useEffect(() => {
    if (prevTemporaryElementRef.current && !temporaryElement && editor) {
      setDrawingMode("none");
      editor.cancel();
    }
    prevTemporaryElementRef.current = temporaryElement;
  }, [temporaryElement, editor]);

  useEffect(() => {
    if (!editor) return;

    const container = editor.getContainer();
    if (!container) return;

    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const isToken = target.closest("[data-token-group-id]");
      const isElement = target.closest("[data-element-id]");

      if (isToken || isElement) {
        event.preventDefault();
      }
    };

    container.addEventListener("contextmenu", handleContextMenu, {
      capture: true,
    });

    return () => {
      container.removeEventListener("contextmenu", handleContextMenu, {
        capture: true,
      });
    };
  }, [editor]);

  useEffect(() => {
    (window as any)._onDrawedEncounter = (draftElement: any) => {
      onDrawed(draftElement);
      setDrawingMode("none");
    };

    return () => {
      delete (window as any)._onDrawedEncounter;
    };
  }, [onDrawed]);

  useEffect(() => {
    (window as any)._onDrawedMarkup = (draftMarkup: any) => {
      onMarkupDrawed(draftMarkup);
      setDrawingMode("none");
    };

    return () => {
      delete (window as any)._onDrawedMarkup;
    };
  }, [onMarkupDrawed]);

  useEffect(() => {
    if (!editor) return;
    if (drawingMode === "encounter") {
      editor.setCurrentTool("encounter");
    } else if (drawingMode === "markup") {
      editor.setCurrentTool("markup");
    } else {
      editor.setCurrentTool("select");
    }
  }, [editor, drawingMode]);

  useEffect(() => {
    if (!editor) return;

    isSelectionSyncingRef.current = true;
    if (selectedToken) {
      const shapeId = createShapeId(`token-${selectedToken.id}`);
      editor.select(shapeId);
    } else {
      editor.selectNone();
    }

    setTimeout(() => {
      isSelectionSyncingRef.current = false;
    }, 0);
  }, [editor, selectedToken]);

  useEffect(() => {
    if (!editor) return;

    const unsubscribe = editor.store.listen(() => {
      if (isSelectionSyncingRef.current) return;

      const selectedIds = editor.getSelectedShapeIds();
      setSelectedShapeIds(selectedIds.map((id) => String(id)));

      if (selectedIds.length !== 1) {
        if (selectedToken) {
          onTokenSelect(null);
        }
        return;
      }

      const shape = editor.getShape(selectedIds[0]);
      if (!shape || shape.type !== "token") {
        if (selectedToken) {
          onTokenSelect(null);
        }
        return;
      }

      const tokenId = (shape as any).props?.tokenId as number | undefined;
      if (!tokenId) {
        return;
      }

      const token = tokensById.get(tokenId);
      if (token && token.id !== selectedToken?.id) {
        onTokenSelect(token);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [editor, onTokenSelect, selectedToken, tokensById]);

  useEffect(() => {
    if (!editor) return;

    const isInputTarget = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isInputTarget(event.target)) return;

      if (event.key === " ") {
        event.preventDefault();
        editor.setCurrentTool("hand");
      }

      if (event.key === "Escape") {
        event.preventDefault();
        editor.setCurrentTool("select");
        onTokenSelect(null);
        setDrawingMode("none");
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        setDrawingMode((prev) => (prev === "encounter" ? "none" : "encounter"));
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "m") {
        event.preventDefault();
        setDrawingMode((prev) => (prev === "markup" ? "none" : "markup"));
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "o") {
        event.preventDefault();
        const selectedIds = editor.getSelectedShapeIds();
        if (selectedIds.length === 1) {
          const shape = editor.getShape(selectedIds[0]);
          if (shape && shape.type === "encounter") {
            const element = elementsByShapeId.get(shape.id);
            if (element?.onClick) {
              element.onClick(element);
            }
          }
        }
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "p") {
        event.preventDefault();
        onOpenSessionLog?.();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isInputTarget(event.target)) return;

      if (event.key === " ") {
        event.preventDefault();
        if (drawingMode === "encounter") {
          editor.setCurrentTool("encounter");
        } else if (drawingMode === "markup") {
          editor.setCurrentTool("markup");
        } else {
          editor.setCurrentTool("select");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [editor, drawingMode, onTokenSelect, elementsByShapeId]);

  useEffect(() => {
    if (!editor || !background) return;

    const img = new Image();
    img.onload = () => {
      const shape = editor.getShape(backgroundShapeId);
      const next = {
        id: backgroundShapeId,
        type: BACKGROUND_TYPE,
        x: -img.naturalWidth / 2,
        y: -img.naturalHeight / 2,
        props: {
          w: img.naturalWidth,
          h: img.naturalHeight,
          url: background,
        },
        isLocked: true,
      } as any;

      if (shape) {
        editor.updateShapes([next]);
      } else {
        editor.createShapes([next]);
      }

      editor.sendToBack([backgroundShapeId]);
    };
    img.src = background;
  }, [editor, background, backgroundShapeId]);

  useEffect(() => {
    if (!editor) return;

    const unsubscribe = editor.store.listen(() => {
      const shape = editor.getShape(backgroundShapeId);
      if (shape) {
        editor.sendToBack([backgroundShapeId]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [editor, backgroundShapeId]);

  return (
    <CanvasTldrawProvider
      value={{
        database,
        playersById,
        opponentsById: opponentsById as Map<number, EncounterOpponent>,
        elementsByShapeId,
        tokensById,
        selectedToken,
        tokenVisibility,
        setTokenVisibility,
        onTokenSelect,
        onOpenEffectsCatalog,
        onHealPlayer,
        onDamagePlayer,
        onHealOpponent,
        onDamageOpponent,
        onRemoveFromInitiative,
        onAddToInitiative,
        initiativeEntityIds,
      }}
    >
      <div className="relative h-full w-full">
        <Tldraw
          shapeUtils={shapeUtils}
          tools={tools}
          hideUi
          components={{ ContextMenu: null }}
          onMount={(nextEditor) => {
            setEditor(nextEditor);
          }}
        />
        <TokenPanels
          players={players}
          opponents={encounterOpponents.data ?? []}
          tokens={tokens}
          tokenVisibility={tokenVisibility}
          isPlayersPanelOpen={isPlayersPanelOpen}
          isOpponentsPanelOpen={isOpponentsPanelOpen}
          onTogglePlayersPanel={() => setIsPlayersPanelOpen((prev) => !prev)}
          onToggleOpponentsPanel={() =>
            setIsOpponentsPanelOpen((prev) => !prev)
          }
          onToggleToken={(token) => {
            setTokenVisibility(
              token.id,
              !(tokenVisibility[token.id.toString()] ?? true),
            );
          }}
        />
        <CanvasToolbar
          drawingMode={drawingMode}
          onZoomIn={() => editor?.zoomIn()}
          onZoomOut={() => editor?.zoomOut()}
          onResetZoom={() => editor?.resetZoom()}
          onToggleDrawing={(mode) => setDrawingMode(mode)}
        />
        <SelectionToolbar
          editor={editor}
          selectedIds={selectedShapeIds}
          markupByShapeId={markupByShapeId}
          onMarkupDelete={onMarkupDelete}
          onMarkupDuplicate={onMarkupDuplicate}
          onMarkupColorChange={(markupId, color) => {
            const m = markup.find((item) => item.id === markupId);
            if (m) onMarkupMove({ ...m, color });
          }}
        />
      </div>
    </CanvasTldrawProvider>
  );
}
