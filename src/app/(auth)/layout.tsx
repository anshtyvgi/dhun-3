export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-[430px] mx-auto">
      {children}
    </div>
  );
}
