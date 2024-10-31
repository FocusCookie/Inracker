type Props = {
  children: React.ReactNode;
};

export function TypographyBlockquote({ children, ...props }: Props) {
  return (
    <blockquote {...props} className="mt-6 border-l-2 pl-6 italic">
      {children}
    </blockquote>
  );
}
