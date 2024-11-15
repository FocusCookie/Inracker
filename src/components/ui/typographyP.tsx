type Props = {
  children: React.ReactNode;
};

export function TypographyP({ children, ...props }: Props) {
  return (
    <p {...props} className="leading-7">
      {children}
    </p>
  );
}
