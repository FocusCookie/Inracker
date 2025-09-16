import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  truncate?: boolean;
};

export function TypographyH3({ children, truncate, ...props }: Props) {
  return (
    <h3
      {...props}
      className={cn([
        "scroll-m-20 truncate text-2xl font-semibold tracking-tight",
        truncate && "truncate",
      ])}
    >
      {children}
    </h3>
  );
}
