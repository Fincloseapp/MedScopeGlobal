import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V20ArticleCard } from "@/components/v20/article-card";
import {
  getSection,
  MEDICAL_SECTIONS,
  type MedicalSectionSlug,
} from "@/lib/config/medical-sections";
import { sectionHubLinks } from "@/lib/config/section-article-map";
import { contentTypesForSection } from "@/lib/config/content-types";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getArticlesBySection } from "@/lib/queries/articles";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { normalizeLocale, LOCALE_COOKIE } from "@/lib/i18n/config";
import { buildV20PageMetadata } from "@/lib/v20/seo";
import { cookies } from "next/headers";

export const revalidate = 120;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ format?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const section = getSection(slug);
  if (!section) return { title: "Sekce" };
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = await getDictionary(locale);
  const title = t(dict, section.nameKey);
  const description = t(dict, section.descriptionKey);
  return buildV20PageMetadata({
    title: `${title} — MedScopeGlobal`,
    description,
    path: `/sections/${slug}`,
  });
}

export default async function SectionDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const section = getSection(slug);
  if (!section) notFound();

  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = await getDictionary(locale);
  const { isVip, accessLevel } = await getReaderContext();
  const queryAccessLevel = accessLevel === "physician" ? accessLevel : "physician";
  const format = sp.format ?? null;
  const contentTypes = contentTypesForSection(section.slug as MedicalSectionSlug);
  const hubLinks = sectionHubLinks(section.slug as MedicalSectionSlug);
  const articles = await getArticlesBySection(
    section.slug as MedicalSectionSlug,
    24,
    isVip,
    queryAccessLevel,
    locale,
    format
  );

  const sectionTitle = t(dict, section.nameKey);
  const sectionDescription = t(dict, section.descriptionKey);

  return (
    <ModulePageShell
      eyebrow={t(dict, "nav.sections", "Sekce")}
      title={sectionTitle}
      description={sectionDescription}
      ctaHref="/sections"
      ctaLabel={t(dict, "nav.sections", "Všechny sekce")}
    >
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t(dict, "nav.home")}
        </Link>
        <span className="mx-2">/</span>
        <Link href="/sections" className="hover:text-foreground">
          {t(dict, "nav.sections", "Sekce")}
        </Link>
        <span className="mx-2">/</span>
        <span>{sectionTitle}</span>
      </nav>

      <p className="mb-6 max-w-3xl text-sm text-muted-foreground">
        Odborný obsah pro lékaře a studenty medicíny — články, briefy a doporučené zdroje v
        této oblasti.
      </p>

      {contentTypes.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <Link
            href={`/sections/${slug}`}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
              !format ? "bg-[#005B96] text-white" : "hover:bg-muted"
            }`}
          >
            {t(dict, "nav.articles", "Články")}
          </Link>
          {contentTypes.map((ct) => (
            <Link
              key={ct.slug}
              href={`/sections/${slug}?format=${ct.slug}`}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                format === ct.slug ? "bg-[#005B96] text-white" : "hover:bg-muted"
              }`}
            >
              {t(dict, ct.nameKey)}
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <V20ArticleCard key={a.id} article={a} />
        ))}
      </div>

      {articles.length === 0 && (
        <p className="mt-8 text-sm text-muted-foreground">
          V této rubrice zatím nejsou publikované články. Prozkoumejte{" "}
          <Link href="/odborne/briefy" className="text-primary underline">
            odborné briefy
          </Link>{" "}
          nebo{" "}
          <Link href="/articles" className="text-primary underline">
            {t(dict, "nav.articles")}
          </Link>
          .
        </p>
      )}

      <section className="mt-10 rounded-xl border bg-white p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Související odborný obsah
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {hubLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 border-t pt-8">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">
          {t(dict, "sections.title")}
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {MEDICAL_SECTIONS.filter((s) => s.slug !== slug).map((s) => (
            <li key={s.slug}>
              <Link
                href={`/sections/${s.slug}`}
                className="rounded-full border px-3 py-1 text-sm hover:bg-muted"
              >
                {t(dict, s.nameKey)}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </ModulePageShell>
  );
}
