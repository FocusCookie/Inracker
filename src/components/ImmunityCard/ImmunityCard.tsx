import { DBImmunity } from "@/types/immunitiy";
import Collapsible from "../Collapsible/Collapsible";
import {
  headingsPlugin,
  imagePlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  MDXEditor,
  thematicBreakPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import MarkdownEditor from "../MarkdownEditor/MarkdownEditor";

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
      <MarkdownEditor readonly={true} markdown={immunity.description} />
    </Collapsible>
  );
}

export default ImmunityCard;
