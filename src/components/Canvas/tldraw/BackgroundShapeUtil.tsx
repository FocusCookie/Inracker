import { BaseBoxShapeUtil, HTMLContainer } from "tldraw";

import { BackgroundShape } from "./shapes";

export class BackgroundShapeUtil extends BaseBoxShapeUtil<BackgroundShape> {
  static override type = "battlemap" as const;

  override getDefaultProps(): BackgroundShape["props"] {
    return {
      w: 100,
      h: 100,
      url: "",
    };
  }

  override component(shape: BackgroundShape) {
    const { w, h, url } = shape.props;

    return (
      <HTMLContainer
        style={{ width: w, height: h, pointerEvents: "none", zIndex: 0 }}
      >
        <div style={{ width: w, height: h, pointerEvents: "none" }}>
          <img
            src={url}
            alt="Battlemap"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      </HTMLContainer>
    );
  }

  override indicator(shape: BackgroundShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
