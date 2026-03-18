import { BaseBoxShapeTool } from "tldraw";
import { MARKUP_TYPE } from "./shapes";

export class MarkupTool extends BaseBoxShapeTool {
  static override id = "markup";
  static override initial = "idle";
  override shapeType = MARKUP_TYPE;

  override onCreate(shape: any) {
    if (!shape) return;

    const bounds = this.editor.getShapePageBounds(shape.id);
    const draftMarkup = {
      x: bounds?.x ?? shape.x,
      y: bounds?.y ?? shape.y,
      width: bounds?.w ?? shape.props.w,
      height: bounds?.h ?? shape.props.h,
      rotation: shape.rotation,
      color: "#ffffff",
    };

    // Delete the tldraw shape — we manage the element ourselves
    this.editor.deleteShapes([shape.id]);

    requestAnimationFrame(() => {
      // Dispatch cancel to properly exit the stuck select.resizing state
      this.editor.cancel();

      if ((window as any)._onDrawedMarkup) {
        (window as any)._onDrawedMarkup(draftMarkup);
      }
    });
  }
}
