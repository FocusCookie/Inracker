type Props = {
  children: React.ReactNode;
};

export function TypographyMuted({ children, ...props }: Props) {
  return (
    <p {...props} className="text-muted-default text-sm">
      {children}
    </p>
  );
}
