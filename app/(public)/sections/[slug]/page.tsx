import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article/article-card";
import {
  getSection,
  MEDICAL_SECTIONS,
  type MedicalSectionSlug,
} from "@/lib/config/medical-sections";
import { contentTypesForSection } from "@/lib/config/content-types";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getArticlesBySection } from "@/lib/queries/articles";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { normalizeLocale, LOCALE_COOKIE } from "@/lib/i18n/config";
import { cookies } from "next/headers";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ format?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const section = getSection(slug);
  if (!section) return { title: "Section" };
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = await getDictionary(locale);
  return {
    title: t(dict, section.nameKey),
    description: t(dict, section.descriptionKey),
  };
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
  const format = sp.format ?? null;
  const contentTypes = contentTypesForSection(section.slug as MedicalSectionSlug);
  const articles = await getArticlesBySection(
    section.slug as MedicalSectionSlug,
    24,
    isVip,
    accessLevel,
    locale,
    format
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/sections" className="hover:text-foreground">
          {t(dict, "nav.sections", "Sekce")}
        </Link>
        <span className="mx-2">/</span>
        <span>{t(dict, section.nameKey)}</span>
      </nav>
      <h1 className="mt-4 font-display text-4xl font-bold text-[#005B96]">
        {t(dict, section.nameKey)}
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {t(dict, section.descriptionKey)}
      </p>

      {contentTypes.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`/sections/${slug}`}
            className={`rounded-full border px-3 py-1 text-sm ${
              !format ? "bg-[#005B96] text-white" : "hover:bg-muted"
            }`}
          >
            {t(dict, "nav.articles", "Články")}
          </Link>
          {contentTypes.map((ct) => (
            <Link
              key={ct.slug}
              href={`/sections/${slug}?format=${ct.slug}`}
              className={`rounded-full border px-3 py-1 text-sm ${
                format === ct.slug ? "bg-[#005B96] text-white" : "hover:bg-muted"
              }`}
            >
              {t(dict, ct.nameKey)}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
      {articles.length === 0 && (
        <p className="mt-8 text-muted-foreground">
          {t(dict, "alerts.localeArticles")}{" "}
          <Link href="/articles" className="text-primary underline">
            {t(dict, "nav.articles")}
          </Link>
        </p>
      )}

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
    </div>
  );
}
