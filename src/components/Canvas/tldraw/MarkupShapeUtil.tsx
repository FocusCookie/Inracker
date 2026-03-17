import { BaseBoxShapeUtil, HTMLContainer } from "tldraw";
import { MarkupShape } from "./shapes";

export class MarkupShapeUtil extends BaseBoxShapeUtil<MarkupShape> {
  static override type = "markup" as const;

  override getDefaultProps(): MarkupShape["props"] {
    return {
      w: 100,
      h: 100,
      color: "#FFFFFF",
      markupId: 0,
    };
  }

  override component(shape: MarkupShape) {
    const { w, h, color } = shape.props;

    return (
      <div className="h-full w-full pointer-events-none">
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          style={{ overflow: "visible" }}
        >
          <rect
            x={0}
            y={0}
            width={w}
            height={h}
            fill={color}
            fillOpacity={0.4}
            stroke={color}
            strokeWidth={2}
            rx={4}
            ry={4}
          />
        </svg>
      </div>
    );
  }

  override indicator(shape: MarkupShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
