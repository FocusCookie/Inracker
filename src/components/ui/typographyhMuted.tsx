type Props = {
  children: React.ReactNode;
};

export function TypographyMuted({ children, ...props }: Props) {
  return (
    <p {...props} className="text-sm text-muted-foreground">
      {children}
    </p>
  );
}
