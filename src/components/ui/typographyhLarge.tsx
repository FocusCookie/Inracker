type Props = {
  children: React.ReactNode;
};

export function TypographyLarge({ children, ...props }: Props) {
  return (
    <div {...props} className="text-lg font-semibold">
      {children}
    </div>
  );
}
