import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  truncate?: boolean;
};

export function TypographyH4({ children, truncate, ...props }: Props) {
  return (
    <h4
      {...props}
      className={cn([
        "scroll-m-20 text-xl font-semibold tracking-tight",
        truncate && "truncate",
      ])}
    >
      {children}
    </h4>
  );
}
