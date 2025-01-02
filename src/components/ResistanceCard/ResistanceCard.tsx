import { DBResistance } from "@/types/resistances";
import {
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  MDXEditor,
  tablePlugin,
  thematicBreakPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import Collapsible from "../Collapsible/Collapsible";

type Props = {
  resistance: DBResistance;
  /**
   * react element rendered behind the chevron
   */
  actions?: React.ReactNode;
};

function ResistanceCard({ resistance, actions }: Props) {
  return (
    <Collapsible
      title={
        <div className="flex items-center gap-4">
          <span>{resistance.icon}</span>
          <span className="font-semibold">{resistance.name}</span>
        </div>
      }
      actions={actions}
    >
      <MDXEditor
        readOnly
        contentEditableClassName="prose"
        markdown={resistance.description}
        plugins={[
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin(),
          listsPlugin(),
          thematicBreakPlugin(),
          headingsPlugin(),
          tablePlugin(),
        ]}
      />
    </Collapsible>
  );
}

export default ResistanceCard;
