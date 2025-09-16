import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  truncate?: boolean;
};

export function TypographyH1({ children, truncate, ...props }: Props) {
  return (
    <h1
      {...props}
      className={cn([
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        truncate && "truncate",
      ])}
    >
      {children}
    </h1>
  );
}
