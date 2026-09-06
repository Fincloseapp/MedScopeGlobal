import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { buildLocalizedPageMetadata } from "@/lib/seo/metadata";
import { getServerLocale } from "@/lib/i18n/server-locale";
import { getLegalChromeCopy } from "@/lib/i18n/legal-chrome-copy";
import { getSurfaceCopy } from "@/lib/i18n/surface-copy";
import { localizePublicHref } from "@/lib/i18n/nav-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const copy = getLegalChromeCopy(locale);
  return await buildLocalizedPageMetadata({
    title: copy.helpMetaTitle,
    description: copy.helpMetaDescription,
    path: "/help",
    locale,
  });
}

export default async function HelpPage() {
  const locale = await getServerLocale();
  const copy = getLegalChromeCopy(locale);
  const footer = getSurfaceCopy(locale).footer;

  return (
    <ModulePageShell
      eyebrow={copy.helpEyebrow}
      title={copy.helpTitle}
      description={copy.helpLead}
      ctaHref={localizePublicHref("/kontakt", locale)}
      ctaLabel={copy.helpContactCta}
    >
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={localizePublicHref("/", locale)} className="hover:text-foreground">
          {footer.home}
        </Link>
        <span className="mx-2">/</span>
        <span>{copy.helpEyebrow}</span>
      </nav>

      <div className="grid gap-4 sm:grid-cols-2">
        {copy.faqs.map((item) => (
          <article
            key={item.q}
            className="rounded-2xl border border-[#dfeaf5] bg-white p-5 shadow-sm"
          >
            <h2 className="font-display text-lg font-semibold text-[#021d33]">{item.q}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
          </article>
        ))}
      </div>

      <section className="mt-10 rounded-xl border bg-[#f8fbff] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {copy.helpLinksTitle}
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2 text-sm">
          <li>
            <Link href={localizePublicHref("/predplatne", locale)} className="rounded-full border px-3 py-1 hover:bg-muted">
              {footer.subscribe}
            </Link>
          </li>
          <li>
            <Link href="/account" className="rounded-full border px-3 py-1 hover:bg-muted">
              {copy.helpAccount}
            </Link>
          </li>
          <li>
            <Link href={localizePublicHref("/privacy", locale)} className="rounded-full border px-3 py-1 hover:bg-muted">
              {copy.privacyTitle}
            </Link>
          </li>
          <li>
            <Link href={localizePublicHref("/terms", locale)} className="rounded-full border px-3 py-1 hover:bg-muted">
              {copy.termsTitle}
            </Link>
          </li>
        </ul>
      </section>
    </ModulePageShell>
  );
}
