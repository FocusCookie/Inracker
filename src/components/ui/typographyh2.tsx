import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  truncate?: boolean;
};

export function TypographyH2({ children, truncate, ...props }: Props) {
  return (
    <h2
      {...props}
      className={cn([
        "scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0",
        truncate && "truncate",
      ])}
    >
      {children}
    </h2>
  );
}
