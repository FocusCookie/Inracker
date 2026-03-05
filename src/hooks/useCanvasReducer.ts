import { ClickableCanvasElement } from "@/types/canvas";
import { useReducer, useCallback, useMemo } from "react";

export type InteractionMode = "idle" | "panning" | "drawing";

export type ViewBox = { x: number; y: number; width: number; height: number };

export type InrackerCanvasState = {
  viewBox: ViewBox;
  initialViewBox: ViewBox;
  zoom: number;
  interactionMode: InteractionMode;
  selectedElementId: string | number | null;
  isPlayersPanelOpen: boolean;
  isOpponentsPanelOpen: boolean;
  tokenVisibility: Record<string, boolean>;
  tempResizedElement: (ClickableCanvasElement & { id: any }) | null;
};

export type CanvasAction =
  | { type: "SET_INTERACTION_MODE"; mode: InteractionMode }
  | { type: "SET_VIEWBOX"; viewBox: ViewBox }
  | { type: "INITIALIZE_VIEWBOX"; viewBox: ViewBox }
  | {
      type: "APPLY_ZOOM";
      scaleFactor: number;
      anchor?: { x: number; y: number };
    }
  | { type: "RESET_ZOOM" }
  | { type: "SELECT_ELEMENT"; id: string | number | null }
  | { type: "TOGGLE_PLAYERS_PANEL" }
  | { type: "TOGGLE_ENCOUNTER_OPPONENTS_PANEL" }
  | { type: "SET_TOKEN_VISIBILITY"; tokenId: string | number; visible: boolean }
  | { type: "HIDE_COMPLETED_ENCOUNTER_OPPONENT_TOKENS"; tokenIds: (string | number)[] }
  | { type: "SET_TEMP_RESIZED_ELEMENT"; element: (ClickableCanvasElement & { id: any }) | null }
  | { type: "CLEAR_TEMP_RESIZED_IF_SYNCED"; elements: (ClickableCanvasElement & { id: any })[] };

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5;

function reducer(state: InrackerCanvasState, action: CanvasAction): InrackerCanvasState {
  switch (action.type) {
    case "SET_INTERACTION_MODE":
      return { ...state, interactionMode: action.mode };

    case "SET_VIEWBOX":
      return { ...state, viewBox: action.viewBox };

    case "INITIALIZE_VIEWBOX":
      return {
        ...state,
        viewBox: action.viewBox,
        initialViewBox: action.viewBox,
        zoom: 1,
      };

    case "APPLY_ZOOM": {
      const { scaleFactor, anchor } = action;
      const currentZoom = state.zoom;
      let newZoom = currentZoom * scaleFactor;

      // Clamp zoom
      newZoom = Math.max(MIN_ZOOM, Math.min(newZoom, MAX_ZOOM));

      // Actual scale factor used (after clamping)
      const actualFactor = newZoom / currentZoom;
      if (Math.abs(actualFactor - 1) < 0.0001) return state;

      const { x, y, width, height } = state.viewBox;

      // Default to center if no anchor provided
      const px = anchor ? anchor.x : x + width / 2;
      const py = anchor ? anchor.y : y + height / 2;

      const newWidth = width / actualFactor;
      const newHeight = height / actualFactor;
      const newX = px - (px - x) / actualFactor;
      const newY = py - (py - y) / actualFactor;

      return {
        ...state,
        zoom: newZoom,
        viewBox: {
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight,
        },
      };
    }

    case "RESET_ZOOM":
      return {
        ...state,
        zoom: 1,
        viewBox: state.initialViewBox,
      };

    case "SELECT_ELEMENT":
      return { ...state, selectedElementId: action.id };

    case "TOGGLE_PLAYERS_PANEL":
      return { ...state, isPlayersPanelOpen: !state.isPlayersPanelOpen };

    case "TOGGLE_ENCOUNTER_OPPONENTS_PANEL":
      return { ...state, isOpponentsPanelOpen: !state.isOpponentsPanelOpen };

    case "SET_TOKEN_VISIBILITY":
      return {
        ...state,
        tokenVisibility: {
          ...state.tokenVisibility,
          [action.tokenId.toString()]: action.visible,
        },
      };

    case "HIDE_COMPLETED_ENCOUNTER_OPPONENT_TOKENS": {
      const newVisibility = { ...state.tokenVisibility };
      action.tokenIds.forEach((id) => {
        newVisibility[id.toString()] = false;
      });
      return { ...state, tokenVisibility: newVisibility };
    }

    case "SET_TEMP_RESIZED_ELEMENT":
      return { ...state, tempResizedElement: action.element };

    case "CLEAR_TEMP_RESIZED_IF_SYNCED": {
      if (!state.tempResizedElement) return state;
      const exists = action.elements.some(
        (e) =>
          e.id === state.tempResizedElement?.id &&
          e.x === state.tempResizedElement?.x &&
          e.y === state.tempResizedElement?.y &&
          e.width === state.tempResizedElement?.width &&
          e.height === state.tempResizedElement?.height,
      );
      return exists ? { ...state, tempResizedElement: null } : state;
    }

    default:
      return state;
  }
}

export const initialState: InrackerCanvasState = {
  viewBox: { x: 0, y: 0, width: 1000, height: 1000 },
  initialViewBox: { x: 0, y: 0, width: 1000, height: 1000 },
  zoom: 1,
  interactionMode: "idle",
  selectedElementId: null,
  isPlayersPanelOpen: false,
  isOpponentsPanelOpen: false,
  tokenVisibility: {},
  tempResizedElement: null,
};

export function useCanvasReducer() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setInteractionMode = useCallback((mode: InteractionMode) => {
    dispatch({ type: "SET_INTERACTION_MODE", mode });
  }, []);

  const setViewBox = useCallback((viewBox: ViewBox) => {
    dispatch({ type: "SET_VIEWBOX", viewBox });
  }, []);

  const initializeViewBox = useCallback((viewBox: ViewBox) => {
    dispatch({ type: "INITIALIZE_VIEWBOX", viewBox });
  }, []);

  const applyZoom = useCallback((scaleFactor: number, anchor?: { x: number; y: number }) => {
    dispatch({ type: "APPLY_ZOOM", scaleFactor, anchor });
  }, []);

  const resetZoom = useCallback(() => {
    dispatch({ type: "RESET_ZOOM" });
  }, []);

  const selectElement = useCallback((id: string | number | null) => {
    dispatch({ type: "SELECT_ELEMENT", id });
  }, []);

  const togglePlayersPanel = useCallback(() => {
    dispatch({ type: "TOGGLE_PLAYERS_PANEL" });
  }, []);

  const toggleOpponentsPanel = useCallback(() => {
    dispatch({ type: "TOGGLE_ENCOUNTER_OPPONENTS_PANEL" });
  }, []);

  const setTokenVisibility = useCallback((tokenId: string | number, visible: boolean) => {
    dispatch({ type: "SET_TOKEN_VISIBILITY", tokenId, visible });
  }, []);

  const hideCompletedTokens = useCallback((tokenIds: (string | number)[]) => {
    dispatch({ type: "HIDE_COMPLETED_ENCOUNTER_OPPONENT_TOKENS", tokenIds });
  }, []);

  const setTempResizedElement = useCallback((element: (ClickableCanvasElement & { id: any }) | null) => {
    dispatch({ type: "SET_TEMP_RESIZED_ELEMENT", element });
  }, []);

  const clearTempResizedIfSynced = useCallback((elements: (ClickableCanvasElement & { id: any })[]) => {
    dispatch({ type: "CLEAR_TEMP_RESIZED_IF_SYNCED", elements });
  }, []);

  return useMemo(
    () => ({
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
      hideCompletedTokens,
      setTempResizedElement,
      clearTempResizedIfSynced,
    }),
    [
      state,
      setInteractionMode,
      setViewBox,
      initializeViewBox,
      applyZoom,
      resetZoom,
      selectElement,
      togglePlayersPanel,
      toggleOpponentsPanel,
      setTokenVisibility,
      hideCompletedTokens,
      setTempResizedElement,
      clearTempResizedIfSynced,
    ],
  );
}
