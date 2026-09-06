import Link from "next/link";
import { ModulePageShell, FeatureCard } from "@/components/b2b/module-page-shell";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { localizePublicHref } from "@/lib/i18n/nav-copy";
import { localizeV271Page, type HubSection } from "@/lib/i18n/hub-copy";
import type { V271HubPage } from "@/lib/v271/routes";

export async function V271HubPageView({
  page,
  section,
  afterLinks,
}: {
  page: V271HubPage;
  section: HubSection;
  afterLinks?: React.ReactNode;
}) {
  const locale = await getServerLocale();
  const localized = localizeV271Page(page, section, locale);

  return (
    <ModulePageShell
      eyebrow={localized.sectionLabel}
      title={localized.page.title}
      description={localized.page.description}
      ctaHref={localized.page.ctaHref}
      ctaLabel={localized.page.ctaLabel}
      homeHref={localizePublicHref("/", locale)}
    >
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={localizePublicHref("/", locale)} className="hover:text-foreground">
          {localized.home}
        </Link>
        <span className="mx-2">/</span>
        <Link href={localized.homeHref} className="hover:text-foreground">
          {localized.sectionLabel}
        </Link>
        {page.slug ? (
          <>
            <span className="mx-2">/</span>
            <span>{localized.page.title}</span>
          </>
        ) : null}
      </nav>

      <div className="grid gap-4 sm:grid-cols-2">
        {localized.page.links.map((link) => (
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
