import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function TypographySmall({ children, className, ...props }: Props) {
  return (
    <small
      {...props}
      className={cn("text-sm font-medium leading-none", className)}
    >
      {children}
    </small>
  );
}
