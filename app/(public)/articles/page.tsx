import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/article/article-card";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { getLatestArticles, getEditorsPickArticles } from "@/lib/queries/articles";
import { getMedicalArticles } from "@/lib/queries/medicina";
import { getReaderContext } from "@/lib/auth/reader-context";
import { getDictionary, t } from "@/lib/i18n/get-dictionary";
import { normalizeLocale, LOCALE_COOKIE } from "@/lib/i18n/config";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { cookies } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = await getDictionary(locale);
  return buildPageMetadata({
    title: t(dict, "nav.articles", "Články"),
    description: "Archiv odborných medicínských článků MedScopeGlobal — včetně Editor's pick zdarma.",
    path: "/articles",
  });
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ med_track?: string; rok?: string }>;
}) {
  const sp = await searchParams;
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const dict = await getDictionary(locale);
  const { isVip, accessLevel } = await getReaderContext();

  const medTrack = sp.med_track === "priprava" || sp.med_track === "studium" ? sp.med_track : null;
  const year = sp.rok ? Number(sp.rok) : undefined;

  const coreArticles = await getLatestArticles(24, 0, isVip, accessLevel, locale);
  const editorsPick = await getEditorsPickArticles(5, locale);
  const medArticles = medTrack
    ? await getMedicalArticles({
        medTrack,
        studyYear: Number.isFinite(year) ? year : undefined,
        limit: 12,
        isVip,
        accessLevel,
        locale,
      })
    : [];

  const articles = medTrack ? medArticles : coreArticles;

  return (
    <>
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Domů", href: "/" },
          { name: "Články", href: "/articles" },
        ])}
      />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-bold text-[#005B96]">
            {t(dict, "nav.articles", "Články")}
          </h1>
          <p className="mt-2 text-muted-foreground">{t(dict, "alerts.localeArticles")}</p>
        </div>
        <Link href="/medicina" className="text-sm font-medium text-primary hover:underline">
          Medicínská větev →
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/articles" className={`rounded-full border px-3 py-1.5 text-sm ${!medTrack ? "bg-[#005B96] text-white" : "bg-white text-foreground"}`}>Vše</Link>
        <Link href="/articles?med_track=priprava" className={`rounded-full border px-3 py-1.5 text-sm ${medTrack === "priprava" ? "bg-[#005B96] text-white" : "bg-white text-foreground"}`}>Příprava LF</Link>
        <Link href="/articles?med_track=studium" className={`rounded-full border px-3 py-1.5 text-sm ${medTrack === "studium" ? "bg-[#005B96] text-white" : "bg-white text-foreground"}`}>Studium medicíny</Link>
      </div>

      {editorsPick.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-2xl font-semibold text-[#021d33]">Editor&apos;s pick — zdarma</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Plně otevřené odborné články pro ukázku kvality obsahu.
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {editorsPick.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      ) : null}

      <section className={editorsPick.length > 0 ? "mt-12 border-t pt-10" : "mt-10"}>
        <h2 className="font-display text-2xl font-semibold text-[#021d33]">Archiv článků</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
        {articles.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">
            Žádné články v tomto jazyce. Zkuste přepnout jazyk v hlavičce stránky.
          </p>
        )}
      </section>
    </div>
    </>
  );
}
