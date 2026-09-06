import Link from "next/link";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { getSurfaceCopy } from "@/lib/i18n/surface-copy";

export function LegalPageLayout({
  title,
  description,
  children,
  locale,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  locale?: string | null;
}) {
  const home = getSurfaceCopy(locale).footer.home;
  const homeHref = localizePublicHref("/", locale ?? "cs");
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <Link href={homeHref} className="hover:text-foreground">
          {home}
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
