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
import { TokenShapeUtil } from "./tldraw/TokenShapeUtil";
import { useTldrawSync } from "./tldraw/useTldrawSync";
import { CanvasTldrawProvider } from "./tldraw/CanvasTldrawContext";
import type { CanvasElementWithId } from "./types";
import TokenPanels from "./TokenPanels";
import CanvasToolbar from "./CanvasToolbar";
import { BACKGROUND_TYPE } from "./tldraw/shapes";

const shapeUtils = [BackgroundShapeUtil, EncounterShapeUtil, TokenShapeUtil];
const tools = [EncounterTool];

type Props = {
  database: typeof import("@/lib/database").default;
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

export default function Canvas({
  database,
  background,
  elements,
  temporaryElement,
  players,
  selectedToken,
  tokens,
  onTokenSelect,
  onDrawed,
  onTokenMove,
  onElementMove,
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
  const [isDrawing, setIsDrawing] = useState(false);
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
    onElementMove,
    onTokenMove,
    backgroundShapeId,
  });

  // When temporary element is cleared (cancel/complete), force tldraw back to clean select state
  const prevTemporaryElementRef = useRef(temporaryElement);
  useEffect(() => {
    if (prevTemporaryElementRef.current && !temporaryElement && editor) {
      setIsDrawing(false);
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
        event.stopPropagation();
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
      setIsDrawing(false);
    };

    return () => {
      delete (window as any)._onDrawedEncounter;
    };
  }, [onDrawed]);

  useEffect(() => {
    if (!editor) return;
    if (isDrawing) {
      editor.setCurrentTool("encounter");
    } else {
      editor.setCurrentTool("select");
    }
  }, [editor, isDrawing]);

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
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "d") {
        event.preventDefault();
        setIsDrawing((prev) => !prev);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isInputTarget(event.target)) return;

      if (event.key === " ") {
        event.preventDefault();
        editor.setCurrentTool(isDrawing ? "encounter" : "select");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [editor, isDrawing, onTokenSelect]);

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
          isDrawing={isDrawing}
          onZoomIn={() => editor?.zoomIn()}
          onZoomOut={() => editor?.zoomOut()}
          onResetZoom={() => editor?.resetZoom()}
          onToggleDrawing={() => setIsDrawing((prev) => !prev)}
        />
      </div>
    </CanvasTldrawProvider>
  );
}
