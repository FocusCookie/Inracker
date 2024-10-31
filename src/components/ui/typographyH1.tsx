type Props = {
  children: React.ReactNode;
};

export function TypographyH1({ children, ...props }: Props) {
  return (
    <h1
      {...props}
      className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
      {children}
    </h1>
  );
}
