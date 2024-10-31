type Props = {
  children: React.ReactNode;
};

export function TypographyH4({ children, ...props }: Props) {
  return (
    <h4 {...props} className="scroll-m-20 text-xl font-semibold tracking-tight">
      {children}
    </h4>
  );
}
