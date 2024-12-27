import { DBImmunity } from "@/types/immunitiy";
import Collapsible from "../Collapsible/Collapsible";
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

type Props = {
  immunity: DBImmunity;
  /**
   * react element rendered behind the chevron
   */
  actions?: React.ReactNode;
};

function ImmunityCard({ immunity, actions }: Props) {
  return (
    <Collapsible
      title={
        <div className="flex items-center gap-4">
          <span>{immunity.icon}</span>
          <span className="font-semibold">{immunity.name}</span>
        </div>
      }
      actions={actions}
    >
      <MDXEditor
        readOnly
        contentEditableClassName="prose"
        markdown={immunity.description}
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

export default ImmunityCard;
