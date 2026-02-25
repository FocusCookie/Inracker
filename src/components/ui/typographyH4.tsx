import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  truncate?: boolean;
  className?: string;
};

export function TypographyH4({
  children,
  truncate,
  className,
  ...props
}: Props) {
  return (
    <h4
      {...props}
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        truncate && "truncate",
        className,
      )}
    >
      {children}
    </h4>
  );
}
