export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-medical-light">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mb-10 text-center">
          <p className="font-display text-2xl font-semibold text-medical-navy">
            ViaLongeVita
          </p>
          <p className="text-sm text-muted-foreground">
            Přihlášení k magazínu a aplikacím MedScopeGlobal
          </p>
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
