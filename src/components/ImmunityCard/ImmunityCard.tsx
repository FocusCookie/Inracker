import { DBImmunity } from "@/types/immunitiy";
import Collapsible from "../Collapsible/Collapsible";
import { Button } from "../ui/button";
import { PlusCircledIcon } from "@radix-ui/react-icons";
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
   * If functions is provided, the add button will appear next to the chevron
   */
  onAdd?: (id: DBImmunity["id"]) => void;
};

function ImmunityCard({ immunity, onAdd }: Props) {
  function handleAdd() {
    if (onAdd) {
      onAdd(immunity.id);
    }
  }

  return (
    <Collapsible
      title={
        <div className="flex items-center gap-4">
          <span>{immunity.icon}</span>
          <span className="font-semibold">{immunity.name}</span>
        </div>
      }
      actions={
        onAdd && (
          <Button onClick={handleAdd}>
            <PlusCircledIcon />
          </Button>
        )
      }
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
