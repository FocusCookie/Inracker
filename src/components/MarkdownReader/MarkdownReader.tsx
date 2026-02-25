import { cn } from "@/lib/utils";
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { TypographyH1 } from "../ui/typographyH1";
import { TypographyH3 } from "../ui/typographyH3";
import { TypographyH4 } from "../ui/typographyH4";
import "./styles.css";
import { Alert, AlertTitle } from "../ui/alert";
import { QuoteIcon } from "@radix-ui/react-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { TypographyH2 } from "../ui/typographyh2";
import { TypographyP } from "../ui/typographyP";

type Props = {
  className?: string;
  markdown: string;
  onChange?: (markdown: string) => void;
};

type MarkdownComponent = {
  children?: React.ReactNode;
};

export const markdownComponents: any = {
  p({ children, ...props }: MarkdownComponent) {
    return <TypographyP children={children} {...props} />;
  },
  h1({ children, ...props }: MarkdownComponent) {
    return <TypographyH1 children={children} {...props} />;
  },
  h2({ children, ...props }: MarkdownComponent) {
    return <TypographyH2 children={children} {...props} />;
  },
  h3({ children, ...props }: MarkdownComponent) {
    return <TypographyH3 children={children} {...props} />;
  },
  h4({ children, ...props }: MarkdownComponent) {
    return <TypographyH4 children={children} {...props} />;
  },
  blockquote({ children, ...props }: MarkdownComponent) {
    return (
      <Alert {...props}>
        <QuoteIcon />
        <AlertTitle>{children}</AlertTitle>
      </Alert>
    );
  },
  ul({ children }: MarkdownComponent) {
    return <ul className="flex flex-col gap-1">{children}</ul>;
  },
  ol({ children }: MarkdownComponent) {
    return <ol className="flex flex-col gap-1">{children}</ol>;
  },

  table({ children, ...props }: MarkdownComponent) {
    return (
      <Table children={children} {...props} />
    );
  },
  thead({ children, ...props }: MarkdownComponent) {
    return <TableHeader children={children} {...props} />;
  },
  th({ children, ...props }: MarkdownComponent) {
    return <TableHead children={children} {...props} />;
  },
  tbody({ children, ...props }: MarkdownComponent) {
    return <TableBody children={children} {...props} />;
  },
  tr({ children, ...props }: MarkdownComponent) {
    return <TableRow children={children} {...props} />;
  },
  td({ children, ...props }: MarkdownComponent) {
    return <TableCell children={children} {...props} />;
  },
  tfoot({ children, ...props }: MarkdownComponent) {
    return <TableFooter children={children} {...props} />;
  },
};

// Helper to toggle checkbox state in markdown string
export function toggleCheckbox(markdown: string, index: number) {
  let count = 0;
  return markdown.replace(/\[([ xX])\]/g, (match, p1) => {
    if (count === index) {
      count++;
      return p1 === " " ? "[x]" : "[ ]";
    }
    count++;
    return match;
  });
}

export function getCheckboxIndexAtPosition(
  markdown: string,
  line: number,
  column: number,
) {
  const lines = markdown.split("\n");
  let checkboxIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const currentLine = lines[i];
    // If we are before the target line, count all checkboxes in this line
    if (i < line - 1) {
      const matches = currentLine.match(/\[([ xX])\]/g);
      if (matches) checkboxIndex += matches.length;
    }
    // If we are on the target line, count checkboxes up to the target column
    else if (i === line - 1) {
      const textBefore = currentLine.substring(0, column);
      const matches = textBefore.match(/\[([ xX])\]/g);
      if (matches) checkboxIndex += matches.length;
      break;
    }
  }

  return checkboxIndex;
}

import { useMemo } from "react";

// ... existing imports ...

function MarkdownReader({ markdown, className, onChange }: Props) {
  // Use a WeakMap to track indices of checkbox nodes within a single render pass.
  // This is stable even if React renders the component multiple times (e.g. Strict Mode).
  const nodeIndices = useMemo(() => new WeakMap<any, number>(), [markdown]);
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
            // Force disabled to false so it's clickable and looks enabled
            disabled={false}
            readOnly={!onChange}
            onClick={(e) => {
              if (onChange) {
                e.stopPropagation();
                const newMarkdown = toggleCheckbox(markdown, index);
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
    <div data-color-mode="light" className={cn("markdown-reader", className)}>
      <MDEditor.Markdown
        source={(markdown || "").trim()}
        style={{
          whiteSpace: "normal",
          backgroundColor: "transparent",
          minHeight: "0px",
          height: "auto",
        }}
        components={components}
      />
    </div>
  );
}

export default MarkdownReader;
