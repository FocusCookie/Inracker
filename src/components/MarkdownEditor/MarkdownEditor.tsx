import MDEditor from "@uiw/react-md-editor";
import { cn } from "@/lib/utils";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { markdownComponents } from "../MarkdownReader/MarkdownReader";

type Props = {
  value?: string;
  onChange: (value?: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  onBlur?: () => void;
};

export function MarkdownEditor({
  value,
  onChange,
  disabled,
  placeholder,
  className,
  id,
  name,
  onBlur,
}: Props) {
  return (
    <div data-color-mode="light" className={cn("markdown-editor", className)}>
      <MDEditor
        value={value || ""}
        onChange={onChange}
        id={id}
        preview={disabled ? "preview" : "edit"}
        textareaProps={{
          placeholder: placeholder,
          disabled: disabled,
          name: name,
          onBlur: onBlur,
        }}
        height={200}
        visibleDragbar={!disabled}
        hideToolbar={disabled}
        previewOptions={{
          components: markdownComponents,
          style: {
            backgroundColor: "transparent",
            color: "inherit",
          },
        }}
      />
    </div>
  );
}
