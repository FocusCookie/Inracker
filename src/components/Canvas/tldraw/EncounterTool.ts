import { BaseBoxShapeTool } from "tldraw";
import { ENCOUNTER_TYPE } from "./shapes";

export class EncounterTool extends BaseBoxShapeTool {
  static override id = "encounter";
  static override initial = "idle";
  override shapeType = ENCOUNTER_TYPE;

  override onCreate(shape: any) {
    if (!shape) return;

    const bounds = this.editor.getShapePageBounds(shape.id);
    const draftElement = {
      x: bounds?.x ?? shape.x,
      y: bounds?.y ?? shape.y,
      width: bounds?.w ?? shape.props.w,
      height: bounds?.h ?? shape.props.h,
      color: "#ffffff",
      icon: "",
      name: "",
      completed: false,
      isCombatActive: false,
    };

    // Delete the tldraw shape — we manage the temporary element ourselves
    this.editor.deleteShapes([shape.id]);

    requestAnimationFrame(() => {
      // Dispatch cancel to properly exit the stuck select.resizing state
      this.editor.cancel();

      if ((window as any)._onDrawedEncounter) {
        (window as any)._onDrawedEncounter(draftElement);
      }
    });
  }
}
