type Props = {
  children: React.ReactNode;
};

export function TypographyH3({ children, ...props }: Props) {
  return (
    <p {...props} className="text-xl text-muted-foreground">
      {children}
    </p>
  );
}
