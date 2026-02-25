import { useMemo } from "react";
import MDEditor from "@uiw/react-md-editor";
import { cn } from "@/lib/utils";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import "../MarkdownReader/styles.css";
import {
  markdownComponents,
  toggleCheckbox,
} from "../MarkdownReader/MarkdownReader";

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
  const nodeIndices = useMemo(() => new WeakMap<any, number>(), [value]);
  let currentCount = 0;

  const components = {
    ...markdownComponents,
    input: ({ node, ...props }: any) => {
      if (props.type === "checkbox") {
        if (!nodeIndices.has(node)) {
          nodeIndices.set(node, currentCount++);
        }
        const index = nodeIndices.get(node)!;

        return (
          <input
            {...props}
            onChange={() => {}}
            // If the whole editor is disabled, the checkbox is too.
            // Otherwise, we force it enabled so it's clickable in the preview.
            disabled={disabled}
            onClick={(e) => {
              if (!disabled) {
                e.stopPropagation();
                const newMarkdown = toggleCheckbox(value || "", index);
                onChange(newMarkdown);
              }
            }}
          />
        );
      }
      return <input {...props} />;
    },
  };

  return (
    <div
      data-color-mode="light"
      className={cn(
        "markdown-editor overflow-hidden rounded-md border border-input shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
        className,
      )}
    >
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
        style={{
          border: "none",
          background: "transparent",
        }}
        previewOptions={{
          components: components,
          style: {
            backgroundColor: "transparent",
            color: "inherit",
          },
        }}
      />
    </div>
  );
}
