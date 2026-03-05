export type InrackerCanvasElement = {
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
  type?: string;
};

export type CanvasElement = InrackerCanvasElement;

export type ClickableCanvasElement = CanvasElement & {
  onClick?: (element: CanvasElement) => void;
  onEdit?: (element: CanvasElement) => void;
};
