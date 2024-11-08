type Props = {
  children: React.ReactNode;
};

export function TypographyH2({ children, ...props }: Props) {
  return (
    <h2
      {...props}
      className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0"
    >
      {children}
    </h2>
  );
}
