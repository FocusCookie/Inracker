type Props = {
  children: React.ReactNode;
};

export function TypographyH3({ children, ...props }: Props) {
  return (
    <h3
      {...props}
      className="scroll-m-20 text-2xl font-semibold tracking-tight">
      {children}
    </h3>
  );
}
