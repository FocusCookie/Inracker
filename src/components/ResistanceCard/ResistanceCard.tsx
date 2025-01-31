import { DBResistance } from "@/types/resistances";
import "@mdxeditor/editor/style.css";
import Collapsible from "../Collapsible/Collapsible";
import MarkdownEditor from "../MarkdownEditor/MarkdownEditor";

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
      <MarkdownEditor readonly markdown={resistance.description} />
    </Collapsible>
  );
}

export default ResistanceCard;
