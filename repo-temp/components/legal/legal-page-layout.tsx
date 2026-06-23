import Link from "next/link";

export function LegalPageLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Domů
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{title}</span>
      </nav>
      <header className="mb-10">
        <h1 className="font-display text-3xl font-bold text-medical-navy sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-lg text-muted-foreground">{description}</p>
        )}
      </header>
      <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:text-medical-navy">
        {children}
      </div>
    </article>
  );
}
