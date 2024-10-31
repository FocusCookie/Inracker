type Props = {
  children: React.ReactNode;
};

export function TypographySmall({ children, ...props }: Props) {
  return (
    <small {...props} className="text-sm font-medium leading-none">
      {children}
    </small>
  );
}
