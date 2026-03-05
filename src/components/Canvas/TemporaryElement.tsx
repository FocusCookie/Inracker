import React from "react";
import { InrackerCanvasElement } from "./types";

type TemporaryElementProps = {
  element: InrackerCanvasElement;
  currentColor: string;
  currentIcon: string;
  currentTitle: string;
  onDragStart: (e: React.MouseEvent<SVGRectElement>) => void;
};

export const TemporaryElement: React.FC<TemporaryElementProps> = ({
  element,
  currentColor,
  currentIcon,
  currentTitle,
  onDragStart,
}) => {
  return (
    <g className="hover:cursor-move">
      {/* Main rectangle */}
      <rect
        onMouseDown={onDragStart}
        id="temp-element"
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
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
        x={element.x}
        y={element.y}
        width={element.width}
        height={60}
        fill={currentColor}
        fillOpacity={0.8}
        stroke={currentColor}
        strokeWidth={4}
        rx={4}
        ry={4}
        onMouseDown={onDragStart}
      />

      {/* Icon */}
      <g
        id="temp-element-icon"
        transform={`translate(${element.x + 6}, ${element.y + 34})`}
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
        transform={`translate(${element.x + 60}, ${element.y + 30})`}
      >
        <text
          className="font-sans text-lg font-medium text-white select-none"
          dominantBaseline="middle"
        >
          {currentTitle}
        </text>
      </g>
    </g>
  );
};
