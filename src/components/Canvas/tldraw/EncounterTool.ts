import { BaseBoxShapeTool, type Editor } from "tldraw";
import { useEncounterStore } from "@/stores/useEncounterStore";
import { ENCOUNTER_TYPE } from "./shapes";

type EncounterCreateHandler = (editor: Editor, shape: any) => void;

let encounterCreateHandler: EncounterCreateHandler | null = null;

export function setEncounterCreateHandler(
  handler: EncounterCreateHandler | null,
) {
  encounterCreateHandler = handler;
}

export class EncounterTool extends BaseBoxShapeTool {
  static override id = "encounter";
  static override initial = "idle";
  override shapeType = ENCOUNTER_TYPE;

  override onCreate(shape: any) {
    if (!shape) return;

    const { currentColor, currentIcon, currentTitle } =
      useEncounterStore.getState();

    this.editor.updateShape({
      id: shape.id,
      type: ENCOUNTER_TYPE,
      props: {
        ...shape.props,
        color: currentColor,
        icon: currentIcon,
        name: currentTitle ?? "",
      },
    });

    const updatedShape = this.editor.getShape(shape.id) ?? shape;
    encounterCreateHandler?.(this.editor, updatedShape);

    if (!this.editor.getInstanceState().isToolLocked) {
      this.editor.setCurrentTool("select");
    }
  }
}
