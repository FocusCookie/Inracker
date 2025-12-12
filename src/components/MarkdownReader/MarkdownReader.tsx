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
import { TypographyH2 } from "../ui/typographyH2";

type Props = {
  className?: string;
  markdown: string;
};

type MarkdownComponent = {
  children?: React.ReactNode;
};

export const markdownComponents: any = {
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
      <div className="py-2">
        <Alert {...props}>
          <QuoteIcon />
          <AlertTitle>{children}</AlertTitle>
        </Alert>
      </div>
    );
  },
  ul({ children, ...props }: MarkdownComponent) {
    return <ul className="flex flex-col gap-1 py-2">{children}</ul>;
  },
  ol({ children, ...props }: MarkdownComponent) {
    return <ol className="flex flex-col gap-1 py-2">{children}</ol>;
  },

  table({ children, ...props }: MarkdownComponent) {
    return (
      <div className="py-2">
        <Table children={children} {...props} />
      </div>
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

function MarkdownReader({ markdown, className }: Props) {
  return (
    <div data-color-mode="light" className={cn("markdown-reader", className)}>
      <MDEditor.Markdown
        source={markdown || ""}
        style={{
          whiteSpace: "normal",
          backgroundColor: "transparent",
          minHeight: "0px",
          height: "auto",
        }}
        components={markdownComponents}
      />
    </div>
  );
}

export default MarkdownReader;
