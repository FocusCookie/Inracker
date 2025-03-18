import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TypographyH1 } from "../ui/typographyH1";
import { TypographyH2 } from "../ui/typographyh2";
import { TypographyH3 } from "../ui/typographyH3";
import { TypographyH4 } from "../ui/typographyH4";
import "./styles.css";

type Props = {
  className?: string;
  markdown: string;
};

type Headline = {
  children?: React.ReactNode;
};

function MarkdownReader({ markdown, className: classNames }: Props) {
  return (
    <Markdown
      className={cn("markdown-reader", classNames)}
      components={{
        h1({ children, ...props }: Headline) {
          return <TypographyH1 children={children} {...props} />;
        },
        h2({ children, ...props }: Headline) {
          return <TypographyH2 children={children} {...props} />;
        },
        h3({ children, ...props }: Headline) {
          return <TypographyH3 children={children} {...props} />;
        },
        h4({ children, ...props }: Headline) {
          return <TypographyH4 children={children} {...props} />;
        },
      }}
      remarkPlugins={[remarkGfm]}
    >
      {markdown}
    </Markdown>
  );
}

export default MarkdownReader;
