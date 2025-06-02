import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ryhpeRawe from "rehype-raw";
import { TypographyH1 } from "../ui/typographyH1";
import { TypographyH2 } from "../ui/typographyh2";
import { TypographyH3 } from "../ui/typographyH3";
import { TypographyH4 } from "../ui/typographyH4";
import "./styles.css";
import { Alert, AlertTitle } from "../ui/alert";
import { DotFilledIcon, QuoteIcon } from "@radix-ui/react-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

type Props = {
  className?: string;
  markdown: string;
};

type MarkdownComponent = {
  children?: React.ReactNode;
};

function MarkdownReader({ markdown, className }: Props) {
  return (
    <Markdown
      className={cn("markdown-reader", className)}
      components={{
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
        details({ children, ...props }: MarkdownComponent) {
          return (
            <details className="group" {...props}>
              <summary className="cursor-pointer list-none">{children}</summary>
            </details>
          );
        },
      }}
      remarkPlugins={[remarkGfm]}
    >
      {markdown}
    </Markdown>
  );
}

export default MarkdownReader;
