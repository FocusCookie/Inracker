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
      <HTMLContainer
        style={{
          width: w,
          height: h,
          backgroundColor: color,
          opacity: 0.4,
          border: `2px solid ${color}`,
          borderRadius: "4px",
          pointerEvents: "none",
        }}
      />
    );
  }

  override indicator(shape: MarkupShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
