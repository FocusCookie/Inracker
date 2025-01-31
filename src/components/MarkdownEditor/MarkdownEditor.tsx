import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  headingsPlugin,
  imagePlugin,
  InsertImage,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import "@/styles/markdownEditor.css";

type Props = {
  readonly?: boolean;
  markdown: string;
};

function MarkdownEditor({ readonly, markdown, ...props }: Props) {
  return (
    <MDXEditor
      readOnly={readonly}
      {...props}
      contentEditableClassName="prose"
      markdown={markdown}
      plugins={
        readonly
          ? []
          : [
              linkPlugin(),
              linkDialogPlugin(),
              imagePlugin(),
              listsPlugin(),
              thematicBreakPlugin(),
              headingsPlugin(),
              toolbarPlugin({
                toolbarContents: () => (
                  <>
                    <UndoRedo />
                    <BlockTypeSelect />
                    <BoldItalicUnderlineToggles />
                    <CreateLink />
                    <InsertImage />
                    <ListsToggle />
                    <InsertThematicBreak />
                  </>
                ),
              }),
              markdownShortcutPlugin(),
            ]
      }
    />
  );
}

export default MarkdownEditor;
