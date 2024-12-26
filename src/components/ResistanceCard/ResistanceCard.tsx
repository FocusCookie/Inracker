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
import { Badge } from "../ui/badge";
import { useTranslation } from "react-i18next";

type Props = {
  resistances: DBResistance[];
};

function ResistanceCard({ resistances }: Props) {
  const { t } = useTranslation("ComponentResistanceCard");

  return (
    <div className="rounded-md border border-border p-2">
      <Collapsible
        title={
          <div className="flex items-center gap-2">
            <Badge>{resistances.length}</Badge>
            <span className="text-lg font-bold">{t("resistances")}</span>
          </div>
        }
      >
        {resistances.map((resistance) => (
          <Collapsible
            title={
              <div className="flex items-center gap-2">
                <span>{resistance.icon}</span>
                <span className="font-semibold">{resistance.name}</span>
              </div>
            }
            key={resistance.id}
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
                // toolbarPlugin({
                //   toolbarContents: () => (
                //     <>
                //       <UndoRedo />
                //       <BlockTypeSelect />
                //       <BoldItalicUnderlineToggles />
                //       <CreateLink />
                //       <InsertImage />
                //       <ListsToggle />
                //       <InsertThematicBreak />
                //       <InsertTable />
                //     </>
                //   ),
                // }),
              ]}
            />
          </Collapsible>
        ))}
      </Collapsible>
    </div>
  );
}

export default ResistanceCard;
