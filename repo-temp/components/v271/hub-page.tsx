import Link from "next/link";
import { ModulePageShell, FeatureCard } from "@/components/b2b/module-page-shell";
import type { V271HubPage } from "@/lib/v271/routes";

export function V271HubPageView({
  page,
  sectionLabel,
  homeHref,
  afterLinks,
}: {
  page: V271HubPage;
  sectionLabel: string;
  homeHref: string;
  afterLinks?: React.ReactNode;
}) {
  return (
    <ModulePageShell
      eyebrow={sectionLabel}
      title={page.title}
      description={page.description}
      ctaHref={page.ctaHref}
      ctaLabel={page.ctaLabel}
    >
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          Domů
        </Link>
        <span className="mx-2">/</span>
        <Link href={homeHref} className="hover:text-foreground">
          {sectionLabel}
        </Link>
        {page.slug ? (
          <>
            <span className="mx-2">/</span>
            <span>{page.title}</span>
          </>
        ) : null}
      </nav>

      <div className="grid gap-4 sm:grid-cols-2">
        {page.links.map((link) => (
          <FeatureCard
            key={link.href}
            title={link.label}
            description={link.description ?? ""}
            href={link.href}
          />
        ))}
      </div>

      {afterLinks}
    </ModulePageShell>
  );
}
