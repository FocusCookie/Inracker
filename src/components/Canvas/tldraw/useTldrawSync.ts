import { useEffect, useRef } from "react";
import { createShapeId, type Editor, type TLShapeId } from "tldraw";

import type { InrackerCanvasElement } from "@/types/canvas";
import type { CanvasElementWithId } from "../types";
import type { Token } from "@/types/tokens";
import type { MarkupElement } from "@/types/markup";
import {
  BACKGROUND_TYPE,
  ENCOUNTER_TYPE,
  TOKEN_TYPE,
} from "./shapes";

type ShapeState = {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
  props?: any;
};

type Params = {
  editor: Editor | null;
  elements: CanvasElementWithId[];
  temporaryElement: InrackerCanvasElement | null;
  tokens: Token[];
  markup: MarkupElement[];
  onTokenMove: (token: Token) => void;
  onElementMove: (element: CanvasElementWithId) => void;
  onMarkupMove: (markup: MarkupElement) => void;
  onMarkupDelete: (markupId: number) => void;
  onMarkupDrawed: (markup: Omit<MarkupElement, "id">) => void;
  backgroundShapeId?: TLShapeId;
};

const HEX_TO_TLDRAW_COLOR: Record<string, string> = {
  "#ffffff": "white",
  "#f44336": "red",
  "#ff9800": "orange",
  "#ffc107": "orange",
  "#ffeb3b": "yellow",
  "#cddc39": "light-green",
  "#4caf50": "green",
  "#10b981": "green",
  "#009688": "blue",
  "#00bcd4": "light-blue",
  "#0ea5e9": "light-blue",
  "#2196f3": "blue",
  "#3f51b5": "blue",
  "#8b5cf6": "violet",
  "#9c27b0": "violet",
  "#d946ef": "violet",
  "#e91e63": "red",
  "#f43f5e": "red",
  "#64748b": "grey",
  "#9e9e9e": "grey",
  "#000000": "black",
};

export function useTldrawSync({
  editor,
  elements,
  temporaryElement,
  tokens,
  markup,
  onTokenMove,
  onElementMove,
  onMarkupMove,
  onMarkupDelete,
  onMarkupDrawed,
  backgroundShapeId,
}: Params) {
  const isSyncingRef = useRef(false);
  const elementByShapeIdRef = useRef<Map<TLShapeId, CanvasElementWithId>>(new Map());
  const tokenByShapeIdRef = useRef<Map<TLShapeId, Token>>(new Map());
  const markupByShapeIdRef = useRef<Map<TLShapeId, MarkupElement>>(new Map());
  const shapeStateRef = useRef<Map<TLShapeId, ShapeState>>(new Map());
  const pendingElementMovesRef = useRef<Map<TLShapeId, ShapeState>>(new Map());
  const pendingTokenMovesRef = useRef<Map<TLShapeId, ShapeState>>(new Map());
  const pendingMarkupMovesRef = useRef<Map<TLShapeId, ShapeState>>(new Map());
  const wasDraggingRef = useRef(false);
  const recentLocalMovesRef = useRef<Map<TLShapeId, { state: ShapeState; timestamp: number }>>(new Map());

  // Handle updates FROM React TO Tldraw
  useEffect(() => {
    if (!editor) return;

    isSyncingRef.current = true;

    const nextElementMap = new Map<TLShapeId, CanvasElementWithId>();
    const nextTokenMap = new Map<TLShapeId, Token>();
    const nextMarkupMap = new Map<TLShapeId, MarkupElement>();

    const shapesToCreate: any[] = [];
    const shapesToUpdate: any[] = [];

    const now = Date.now();

    const isActuallyDragging = editor.inputs.getIsDragging();
    const isSelectionDragging = editor.getInstanceState().isChangingStyle;
    const editingShapeId = editor.getEditingShapeId();

    for (const element of elements) {
      const shapeId = createShapeId(`encounter-${element.id}`);
      nextElementMap.set(shapeId, element);

      if ((isActuallyDragging || isSelectionDragging) && editor.getSelectedShapeIds().includes(shapeId)) {
        continue;
      }

      const recentMove = recentLocalMovesRef.current.get(shapeId);
      const recentState = recentMove && now - recentMove.timestamp < 1000 ? recentMove.state : null;

      if (recentMove && recentState && 
          element.x === recentState.x && 
          element.y === recentState.y && 
          element.width === recentState.w && 
          element.height === recentState.h && 
          (element.rotation ?? 0) === recentState.rotation) {
        recentLocalMovesRef.current.delete(shapeId);
      }

      const x = recentState ? recentState.x : element.x;
      const y = recentState ? recentState.y : element.y;
      const w = recentState ? recentState.w : element.width;
      const h = recentState ? recentState.h : element.height;
      const rotation = recentState ? recentState.rotation : (element.rotation ?? 0);

      const existingShape = editor.getShape(shapeId) as any;
      const isDifferent = !existingShape || 
          existingShape.x !== x || 
          existingShape.y !== y || 
          existingShape.rotation !== rotation ||
          existingShape.props.w !== w ||
          existingShape.props.h !== h ||
          existingShape.props.color !== element.color ||
          existingShape.props.name !== (element.name ?? "") ||
          existingShape.props.completed !== (element.completed ?? false) ||
          existingShape.props.isCombatActive !== (element.isCombatActive ?? false);

      if (isDifferent) {
        const shape = {
          id: shapeId,
          type: ENCOUNTER_TYPE,
          x,
          y,
          rotation,
          props: {
            w,
            h,
            color: element.color,
            icon: element.icon,
            name: element.name ?? "",
            encounterId: element.id,
            completed: element.completed ?? false,
            isCombatActive: element.isCombatActive ?? false,
          },
        };
        if (existingShape) shapesToUpdate.push(shape);
        else shapesToCreate.push(shape);
      }
    }

    for (const token of tokens) {
      const shapeId = createShapeId(`token-${token.id}`);
      nextTokenMap.set(shapeId, token);

      if ((isActuallyDragging || isSelectionDragging) && editor.getSelectedShapeIds().includes(shapeId)) {
        continue;
      }

      const recentMove = recentLocalMovesRef.current.get(shapeId);
      const recentState = recentMove && now - recentMove.timestamp < 1000 ? recentMove.state : null;

      if (recentMove && recentState && 
          token.coordinates.x === recentState.x && 
          token.coordinates.y === recentState.y && 
          (token.coordinates.rotation ?? 0) === recentState.rotation) {
        recentLocalMovesRef.current.delete(shapeId);
      }

      const x = recentState ? recentState.x : token.coordinates.x;
      const y = recentState ? recentState.y : token.coordinates.y;
      const rotation = recentState ? recentState.rotation : (token.coordinates.rotation ?? 0);

      const existingShape = editor.getShape(shapeId) as any;
      const isDifferent = !existingShape || 
          existingShape.x !== x || 
          existingShape.y !== y || 
          existingShape.rotation !== rotation ||
          existingShape.props.tokenId !== token.id ||
          existingShape.props.entityId !== token.entity ||
          existingShape.props.tokenType !== token.type;

      if (isDifferent) {
        const shape = {
          id: shapeId,
          type: TOKEN_TYPE,
          x,
          y,
          rotation,
          props: {
            w: 100,
            h: 100,
            tokenId: token.id,
            entityId: token.entity,
            tokenType: token.type,
          },
        };
        if (existingShape) shapesToUpdate.push(shape);
        else shapesToCreate.push(shape);
      }
    }

    for (const m of markup) {
      const shapeId = createShapeId(`markup-${m.id}`);
      nextMarkupMap.set(shapeId, m);

      // CRITICAL: If the shape is being edited, DO NOT overwrite it from props.
      // This prevents the "stops writing" issue.
      if (editingShapeId === shapeId) {
        continue;
      }

      if ((isActuallyDragging || isSelectionDragging) && editor.getSelectedShapeIds().includes(shapeId)) {
        continue;
      }

      const recentMove = recentLocalMovesRef.current.get(shapeId);
      const recentState = recentMove && now - recentMove.timestamp < 1000 ? recentMove.state : null;

      if (recentMove && recentState && 
          m.x === recentState.x && 
          m.y === recentState.y && 
          m.width === recentState.w && 
          m.height === recentState.h && 
          m.rotation === recentState.rotation &&
          JSON.stringify(JSON.parse(m.props || "{}")) === JSON.stringify(recentState.props)) {
        recentLocalMovesRef.current.delete(shapeId);
      }

      const x = recentState ? recentState.x : m.x;
      const y = recentState ? recentState.y : m.y;
      const rotation = recentState ? recentState.rotation : m.rotation;
      const props = recentState && recentState.props ? recentState.props : JSON.parse(m.props || "{}");

      // VALIDATION: tldraw native shapes expect specific color names
      if (m.type !== "markup" && props.color && props.color.startsWith("#")) {
        props.color = HEX_TO_TLDRAW_COLOR[props.color] || "black";
      }

      const existingShape = editor.getShape(shapeId) as any;
      const isDifferent = !existingShape || 
          existingShape.x !== x || 
          existingShape.y !== y || 
          existingShape.rotation !== rotation ||
          JSON.stringify(existingShape.props) !== JSON.stringify(props) ||
          existingShape.type !== (m.type || "geo");

      if (isDifferent) {
        const shape = {
          id: shapeId,
          type: m.type || "geo",
          x,
          y,
          rotation,
          props: props,
        };
        if (existingShape) shapesToUpdate.push(shape);
        else shapesToCreate.push(shape);
      }
    }

    const temporaryShapeId = createShapeId("encounter-temporary");
    if (temporaryElement) {
      const existingShape = editor.getShape(temporaryShapeId) as any;
      const isDifferent = !existingShape || 
          existingShape.x !== temporaryElement.x || 
          existingShape.y !== temporaryElement.y || 
          existingShape.rotation !== (temporaryElement.rotation ?? 0) ||
          existingShape.props.w !== temporaryElement.width ||
          existingShape.props.h !== temporaryElement.height ||
          existingShape.props.color !== temporaryElement.color;

      if (isDifferent) {
        const temporaryShape = {
          id: temporaryShapeId,
          type: ENCOUNTER_TYPE,
          x: temporaryElement.x,
          y: temporaryElement.y,
          rotation: temporaryElement.rotation ?? 0,
          props: {
            w: temporaryElement.width,
            h: temporaryElement.height,
            color: temporaryElement.color,
            icon: temporaryElement.icon,
            name: temporaryElement.name ?? "",
            encounterId: "temporary",
            completed: temporaryElement.completed ?? false,
            isCombatActive: temporaryElement.isCombatActive ?? false,
          },
          isLocked: true,
        };
        if (existingShape) shapesToUpdate.push(temporaryShape);
        else shapesToCreate.push(temporaryShape);
      }
    }

    const idsToKeep = new Set<TLShapeId>();
    nextElementMap.forEach((_, id) => idsToKeep.add(id));
    nextTokenMap.forEach((_, id) => idsToKeep.add(id));
    nextMarkupMap.forEach((_, id) => idsToKeep.add(id));
    if (temporaryElement) idsToKeep.add(temporaryShapeId);
    if (backgroundShapeId) idsToKeep.add(backgroundShapeId);

    const idsToRemove = editor
      .getCurrentPageShapes()
      .filter(
        (shape) =>
          (shape.type === ENCOUNTER_TYPE ||
            shape.type === TOKEN_TYPE ||
            shape.type === BACKGROUND_TYPE ||
            shape.id.includes(":markup-")) &&
          !idsToKeep.has(shape.id)
      )
      .map((shape) => shape.id);

    if (shapesToCreate.length > 0) {
      editor.createShapes(shapesToCreate);
    }
    if (shapesToUpdate.length > 0) {
      editor.updateShapes(shapesToUpdate);
    }
    if (idsToRemove.length > 0) {
      editor.store.mergeRemoteChanges(() => {
        editor.store.remove(idsToRemove);
      });
    }

    elementByShapeIdRef.current = nextElementMap;
    tokenByShapeIdRef.current = nextTokenMap;
    markupByShapeIdRef.current = nextMarkupMap;

    if (backgroundShapeId) {
      editor.sendToBack([backgroundShapeId]);
      const foregroundIds = [
        ...nextElementMap.keys(),
        ...nextTokenMap.keys(),
        ...nextMarkupMap.keys(),
        ...(temporaryElement ? [temporaryShapeId] : []),
      ];
      if (foregroundIds.length > 0) {
        editor.bringToFront(foregroundIds);
      }
    }

    const seededState = new Map<TLShapeId, ShapeState>();
    for (const shape of editor.getCurrentPageShapes()) {
      const castShape = shape as any;
      seededState.set(shape.id, {
        x: castShape.x,
        y: castShape.y,
        w: castShape.props.w || 0,
        h: castShape.props.h || 0,
        rotation: castShape.rotation,
        props: castShape.props,
      });
    }
    shapeStateRef.current = seededState;

    isSyncingRef.current = false;
  }, [editor, elements, temporaryElement, tokens, markup, backgroundShapeId]);

  // Handle updates FROM Tldraw TO React
  useEffect(() => {
    if (!editor) return;

    const unsubscribe = editor.store.listen((event) => {
      if (isSyncingRef.current) return;

      const { updated, added, removed } = event.changes;

      const hasShapeChanges =
        Object.values(added).some((s) => s.typeName === "shape") ||
        Object.values(removed).some((s) => s.typeName === "shape") ||
        Object.values(updated).some(([_from, to]) => to.typeName === "shape");

      if (!hasShapeChanges) return;

      const isActuallyDragging = editor.inputs.getIsDragging();
      const isSelectionDragging = editor.getInstanceState().isChangingStyle;

      const changedShapeIds = new Set<TLShapeId>([
        ...Object.keys(added),
        ...Object.keys(updated),
      ] as TLShapeId[]);

      for (const id of changedShapeIds) {
        const shape = editor.getShape(id);
        if (!shape) continue;

        const castShape = shape as any;
        const current: ShapeState = {
          x: castShape.x,
          y: castShape.y,
          w: castShape.props.w || 0,
          h: castShape.props.h || 0,
          rotation: castShape.rotation,
          props: castShape.props,
        };

        if (shape.type === ENCOUNTER_TYPE) {
          const prev = shapeStateRef.current.get(shape.id);
          if (!prev || prev.x !== current.x || prev.y !== current.y || prev.w !== current.w || prev.h !== current.h || prev.rotation !== current.rotation) {
            shapeStateRef.current.set(shape.id, current);
            if (isActuallyDragging || isSelectionDragging) {
              pendingElementMovesRef.current.set(shape.id, current);
            } else {
              const element = elementByShapeIdRef.current.get(shape.id);
              if (element) {
                onElementMove({ ...element, x: current.x, y: current.y, width: current.w, height: current.h, rotation: current.rotation });
              }
            }
          }
        } else if (shape.type === TOKEN_TYPE) {
          const prev = shapeStateRef.current.get(shape.id);
          if (!prev || prev.x !== current.x || prev.y !== current.y || prev.rotation !== current.rotation) {
            shapeStateRef.current.set(shape.id, current);
            if (isActuallyDragging || isSelectionDragging) {
              pendingTokenMovesRef.current.set(shape.id, current);
            } else {
              const token = tokenByShapeIdRef.current.get(shape.id);
              if (token) {
                onTokenMove({ ...token, coordinates: { x: current.x, y: current.y, rotation: current.rotation } });
              }
            }
          }
        } else if (id.includes(":markup-")) {
          const prev = shapeStateRef.current.get(shape.id);
          if (!prev || prev.x !== current.x || prev.y !== current.y || prev.rotation !== current.rotation || JSON.stringify(prev.props) !== JSON.stringify(current.props)) {
            shapeStateRef.current.set(shape.id, current);
            if (isActuallyDragging || isSelectionDragging) {
              pendingMarkupMovesRef.current.set(shape.id, current);
            } else {
              const m = markupByShapeIdRef.current.get(shape.id);
              if (m) {
                onMarkupMove({ ...m, x: current.x, y: current.y, width: current.w, height: current.h, rotation: current.rotation, props: JSON.stringify(current.props) });
              }
            }
          }
        }
      }

      for (const id of Object.keys(removed) as TLShapeId[]) {
        if (id.includes(":markup-")) {
          const m = markupByShapeIdRef.current.get(id);
          if (m) {
            onMarkupDelete(m.id);
          }
        }
        shapeStateRef.current.delete(id);
      }

      if (wasDraggingRef.current && !isActuallyDragging && !isSelectionDragging) {
        pendingElementMovesRef.current.forEach((state, shapeId) => {
          const element = elementByShapeIdRef.current.get(shapeId);
          if (element) {
            onElementMove({ ...element, x: state.x, y: state.y, width: state.w, height: state.h, rotation: state.rotation });
            recentLocalMovesRef.current.set(shapeId, { state, timestamp: Date.now() });
          }
        });
        pendingElementMovesRef.current.clear();

        pendingTokenMovesRef.current.forEach((state, shapeId) => {
          const token = tokenByShapeIdRef.current.get(shapeId);
          if (token) {
            onTokenMove({ ...token, coordinates: { x: state.x, y: state.y, rotation: state.rotation } });
            recentLocalMovesRef.current.set(shapeId, { state, timestamp: Date.now() });
          }
        });
        pendingTokenMovesRef.current.clear();

        pendingMarkupMovesRef.current.forEach((state, shapeId) => {
          const m = markupByShapeIdRef.current.get(shapeId);
          if (m) {
            onMarkupMove({ ...m, x: state.x, y: state.y, width: state.w, height: state.h, rotation: state.rotation, props: JSON.stringify(state.props) });
            recentLocalMovesRef.current.set(shapeId, { state, timestamp: Date.now() });
          }
        });
        pendingMarkupMovesRef.current.clear();
      }

      // Check for finished NEW shapes (native tldraw shapes)
      if (!isActuallyDragging && !isSelectionDragging) {
        const nativeShapes = editor.getCurrentPageShapes().filter(s =>
          !s.id.includes(":markup-") &&
          !s.id.includes(":token-") &&
          !s.id.includes(":encounter-") &&
          s.type !== BACKGROUND_TYPE
        );

        if (nativeShapes.length > 0) {
          const isPointerDown = editor.inputs.isDragging || editor.inputs.isPointing;
          const editingShapeId = editor.getEditingShapeId();
          
          if (!isPointerDown) {
            nativeShapes.forEach(shape => {
              // CRITICAL: If the shape is being edited (text/note), don't capture it yet.
              if (editingShapeId === shape.id) {
                return;
              }

              const castShape = shape as any;
              
              let color = castShape.props.color || "#000000";
              const reverseColor = Object.entries(HEX_TO_TLDRAW_COLOR).find(([_, v]) => v === color);
              if (reverseColor) color = reverseColor[0];

              onMarkupDrawed({
                chapter: 0,
                x: castShape.x,
                y: castShape.y,
                width: castShape.props.w || 0,
                height: castShape.props.h || 0,
                rotation: castShape.rotation,
                color: color,
                type: castShape.type,
                props: JSON.stringify(castShape.props),
              });
              editor.deleteShapes([shape.id]);
            });
          }
        }
      }

      wasDraggingRef.current = !!(isActuallyDragging || isSelectionDragging);
    });

    return () => unsubscribe();
  }, [editor, onElementMove, onTokenMove, onMarkupMove, onMarkupDelete, onMarkupDrawed]);
}
