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
  MARKUP_TYPE,
} from "./shapes";

type ShapeState = {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number;
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
  backgroundShapeId?: TLShapeId;
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
  backgroundShapeId,
}: Params) {
  const isSyncingRef = useRef(false);
  const elementByShapeIdRef = useRef<Map<TLShapeId, CanvasElementWithId>>(
    new Map(),
  );
  const tokenByShapeIdRef = useRef<Map<TLShapeId, Token>>(new Map());
  const markupByShapeIdRef = useRef<Map<TLShapeId, MarkupElement>>(new Map());
  const shapeStateRef = useRef<Map<TLShapeId, ShapeState>>(new Map());
  const pendingElementMovesRef = useRef<Map<TLShapeId, ShapeState>>(new Map());
  const pendingTokenMovesRef = useRef<Map<TLShapeId, ShapeState>>(new Map());
  const pendingMarkupMovesRef = useRef<Map<TLShapeId, ShapeState>>(new Map());
  const wasDraggingRef = useRef(false);
  const recentLocalMovesRef = useRef<
    Map<TLShapeId, { state: ShapeState; timestamp: number }>
  >(new Map());

  useEffect(() => {
    if (!editor) return;

    isSyncingRef.current = true;

    const nextElementMap = new Map<TLShapeId, CanvasElementWithId>();
    const nextTokenMap = new Map<TLShapeId, Token>();
    const nextMarkupMap = new Map<TLShapeId, MarkupElement>();

    const shapesToCreate: any[] = [];
    const shapesToUpdate: any[] = [];

    for (const element of elements) {
      const shapeId = createShapeId(`encounter-${element.id}`);
      nextElementMap.set(shapeId, element);

      const recentMove = recentLocalMovesRef.current.get(shapeId);
      const now = Date.now();
      const recentState =
        recentMove && now - recentMove.timestamp < 800
          ? recentMove.state
          : null;

      if (
        recentMove &&
        recentState &&
        element.x === recentState.x &&
        element.y === recentState.y &&
        element.width === recentState.w &&
        element.height === recentState.h &&
        (element.rotation ?? 0) === recentState.rotation
      ) {
        recentLocalMovesRef.current.delete(shapeId);
      }

      const shape = {
        id: shapeId,
        type: ENCOUNTER_TYPE,
        x: recentState ? recentState.x : element.x,
        y: recentState ? recentState.y : element.y,
        rotation: recentState ? recentState.rotation : (element.rotation ?? 0),
        props: {
          w: recentState ? recentState.w : element.width,
          h: recentState ? recentState.h : element.height,
          color: element.color,
          icon: element.icon,
          name: element.name ?? "",
          encounterId: element.id,
          completed: element.completed ?? false,
          isCombatActive: element.isCombatActive ?? false,
        },
      };

      if (editor.getShape(shapeId)) {
        shapesToUpdate.push(shape);
      } else {
        shapesToCreate.push(shape);
      }
    }

    for (const token of tokens) {
      const shapeId = createShapeId(`token-${token.id}`);
      nextTokenMap.set(shapeId, token);

      const recentMove = recentLocalMovesRef.current.get(shapeId);
      const now = Date.now();
      const recentState =
        recentMove && now - recentMove.timestamp < 800
          ? recentMove.state
          : null;

      if (
        recentMove &&
        recentState &&
        token.coordinates.x === recentState.x &&
        token.coordinates.y === recentState.y &&
        (token.coordinates.rotation ?? 0) === recentState.rotation
      ) {
        recentLocalMovesRef.current.delete(shapeId);
      }

      const shape = {
        id: shapeId,
        type: TOKEN_TYPE,
        x: recentState ? recentState.x : token.coordinates.x,
        y: recentState ? recentState.y : token.coordinates.y,
        rotation: recentState
          ? recentState.rotation
          : (token.coordinates.rotation ?? 0),
        props: {
          w: 100,
          h: 100,
          tokenId: token.id,
          entityId: token.entity,
          tokenType: token.type,
        },
      };

      if (editor.getShape(shapeId)) {
        shapesToUpdate.push(shape);
      } else {
        shapesToCreate.push(shape);
      }
    }

    for (const m of markup) {
      const shapeId = createShapeId(`markup-${m.id}`);
      nextMarkupMap.set(shapeId, m);

      const recentMove = recentLocalMovesRef.current.get(shapeId);
      const now = Date.now();
      const recentState =
        recentMove && now - recentMove.timestamp < 800
          ? recentMove.state
          : null;

      if (
        recentMove &&
        recentState &&
        m.x === recentState.x &&
        m.y === recentState.y &&
        m.width === recentState.w &&
        m.height === recentState.h &&
        m.rotation === recentState.rotation
      ) {
        recentLocalMovesRef.current.delete(shapeId);
      }

      const shape = {
        id: shapeId,
        type: MARKUP_TYPE,
        x: recentState ? recentState.x : m.x,
        y: recentState ? recentState.y : m.y,
        rotation: recentState ? recentState.rotation : m.rotation,
        props: {
          w: recentState ? recentState.w : m.width,
          h: recentState ? recentState.h : m.height,
          color: m.color,
          markupId: m.id,
        },
      };

      if (editor.getShape(shapeId)) {
        shapesToUpdate.push(shape);
      } else {
        shapesToCreate.push(shape);
      }
    }

    const temporaryShapeId = createShapeId("encounter-temporary");
    if (temporaryElement) {
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

      if (editor.getShape(temporaryShapeId)) {
        shapesToUpdate.push(temporaryShape);
      } else {
        shapesToCreate.push(temporaryShape);
      }
    }

    // Collect IDs to remove
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
            shape.type === MARKUP_TYPE) &&
          !idsToKeep.has(shape.id),
      )
      .map((shape) => shape.id);

    if (shapesToCreate.length > 0) {
      editor.createShapes(shapesToCreate);
    }

    if (shapesToUpdate.length > 0) {
      editor.updateShapes(shapesToUpdate);
    }

    // Use mergeRemoteChanges for deletions to bypass tldraw's undo stack
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
      if (
        shape.type === ENCOUNTER_TYPE ||
        shape.type === TOKEN_TYPE ||
        shape.type === MARKUP_TYPE
      ) {
        const castShape = shape as any;
        seededState.set(shape.id, {
          x: castShape.x,
          y: castShape.y,
          w: castShape.props.w,
          h: castShape.props.h,
          rotation: castShape.rotation,
        });
      }
    }
    shapeStateRef.current = seededState;

    setTimeout(() => {
      isSyncingRef.current = false;
    }, 0);
  }, [
    editor,
    elements,
    temporaryElement,
    tokens,
    markup,
    backgroundShapeId,
  ]);

  useEffect(() => {
    if (!editor) return;

    const unsubscribe = editor.store.listen(() => {
      if (isSyncingRef.current) return;

      const nextState = new Map<TLShapeId, ShapeState>();
      const shapes = editor.getCurrentPageShapes();

      const isDragging = editor.inputs.getIsDragging();

      for (const shape of shapes) {
        if (shape.type === ENCOUNTER_TYPE) {
          const castShape = shape as any;
          const prev = shapeStateRef.current.get(shape.id);
          const current = {
            x: castShape.x,
            y: castShape.y,
            w: castShape.props.w,
            h: castShape.props.h,
            rotation: castShape.rotation,
          };
          nextState.set(shape.id, current);

          if (
            !prev ||
            prev.x !== current.x ||
            prev.y !== current.y ||
            prev.w !== current.w ||
            prev.h !== current.h ||
            prev.rotation !== current.rotation
          ) {
            if (isDragging) {
              pendingElementMovesRef.current.set(shape.id, current);
            } else {
              const element = elementByShapeIdRef.current.get(shape.id);
              if (element) {
                onElementMove({
                  ...element,
                  x: current.x,
                  y: current.y,
                  width: current.w,
                  height: current.h,
                  rotation: current.rotation,
                });
              }
            }
          }
        }

        if (shape.type === TOKEN_TYPE) {
          const castShape = shape as any;
          const prev = shapeStateRef.current.get(shape.id);
          const current = {
            x: castShape.x,
            y: castShape.y,
            w: castShape.props.w,
            h: castShape.props.h,
            rotation: castShape.rotation,
          };
          nextState.set(shape.id, current);

          if (
            !prev ||
            prev.x !== current.x ||
            prev.y !== current.y ||
            prev.rotation !== current.rotation
          ) {
            if (isDragging) {
              pendingTokenMovesRef.current.set(shape.id, current);
            } else {
              const token = tokenByShapeIdRef.current.get(shape.id);
              if (token) {
                onTokenMove({
                  ...token,
                  coordinates: {
                    x: current.x,
                    y: current.y,
                    rotation: current.rotation,
                  },
                });
              }
            }
          }
        }

        if (shape.type === MARKUP_TYPE) {
          const castShape = shape as any;
          const prev = shapeStateRef.current.get(shape.id);
          const current = {
            x: castShape.x,
            y: castShape.y,
            w: castShape.props.w,
            h: castShape.props.h,
            rotation: castShape.rotation,
          };
          nextState.set(shape.id, current);

          if (
            !prev ||
            prev.x !== current.x ||
            prev.y !== current.y ||
            prev.w !== current.w ||
            prev.h !== current.h ||
            prev.rotation !== current.rotation
          ) {
            if (isDragging) {
              pendingMarkupMovesRef.current.set(shape.id, current);
            } else {
              const m = markupByShapeIdRef.current.get(shape.id);
              if (m) {
                onMarkupMove({
                  ...m,
                  x: current.x,
                  y: current.y,
                  width: current.w,
                  height: current.h,
                  rotation: current.rotation,
                });
              }
            }
          }
        }
      }

      if (!isDragging && wasDraggingRef.current) {
        pendingElementMovesRef.current.forEach((state, shapeId) => {
          const element = elementByShapeIdRef.current.get(shapeId);
          if (element) {
            onElementMove({
              ...element,
              x: state.x,
              y: state.y,
              width: state.w,
              height: state.h,
              rotation: state.rotation,
            });
            recentLocalMovesRef.current.set(shapeId, {
              state,
              timestamp: Date.now(),
            });
          }
        });
        pendingElementMovesRef.current.clear();

        pendingTokenMovesRef.current.forEach((state, shapeId) => {
          const token = tokenByShapeIdRef.current.get(shapeId);
          if (token) {
            onTokenMove({
              ...token,
              coordinates: {
                x: state.x,
                y: state.y,
                rotation: state.rotation,
              },
            });
            recentLocalMovesRef.current.set(shapeId, {
              state,
              timestamp: Date.now(),
            });
          }
        });
        pendingTokenMovesRef.current.clear();

        pendingMarkupMovesRef.current.forEach((state, shapeId) => {
          const m = markupByShapeIdRef.current.get(shapeId);
          if (m) {
            onMarkupMove({
              ...m,
              x: state.x,
              y: state.y,
              width: state.w,
              height: state.h,
              rotation: state.rotation,
            });
            recentLocalMovesRef.current.set(shapeId, {
              state,
              timestamp: Date.now(),
            });
          }
        });
        pendingMarkupMovesRef.current.clear();
      }

      wasDraggingRef.current = isDragging;

      shapeStateRef.current = nextState;

      if (backgroundShapeId) {
        editor.sendToBack([backgroundShapeId]);
        const foregroundIds = [
          ...elementByShapeIdRef.current.keys(),
          ...tokenByShapeIdRef.current.keys(),
          ...markupByShapeIdRef.current.keys(),
        ];
        if (foregroundIds.length > 0) {
          editor.bringToFront(foregroundIds);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [editor, onElementMove, onTokenMove, onMarkupMove, backgroundShapeId]);
}
