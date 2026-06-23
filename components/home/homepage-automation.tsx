import Link from "next/link";
import Image from "next/image";
import { getHomepageCurated } from "@/lib/queries/v4c/homepage";
import { getLatestArticles } from "@/lib/queries/articles";
import type { AccessLevelId } from "@/lib/config/access-levels";
import type { LocaleCode } from "@/lib/i18n/config";
import { getUpcomingCongresses } from "@/lib/queries/congresses";
import { getActiveAdsByPlacement } from "@/lib/queries/ads";
import { AdPlacement } from "@/components/ads/ad-placement";
import { ArticleCard } from "@/components/article/article-card";
import { V4cContentCard } from "@/components/v4c/content-card";

export async function HomepageAutomation({
  locale,
  isVip,
  accessLevel,
}: {
  locale: LocaleCode;
  isVip: boolean;
  accessLevel: AccessLevelId;
}) {
  const isCs = locale === "cs";
  const slider = await getHomepageCurated("slider");
  const slots = await Promise.all([
    getHomepageCurated("studie"),
    getHomepageCurated("leky"),
    getHomepageCurated("legislativa"),
    getHomepageCurated("digital_health"),
    getHomepageCurated("novinky"),
  ]);
  const [studie, leky, legislativa, digitalHealth, novinky] = slots;
  const articles = await getLatestArticles(3, 0, isVip, accessLevel, locale);
  const congresses = await getUpcomingCongresses(3);
  const sponsoredAds = isVip ? [] : await getActiveAdsByPlacement("homepage_sponsored", 2);

  const sections = [
    { title: isCs ? "Studie" : "Studies", href: "/studie", items: studie },
    { title: isCs ? "Léky" : "Drugs", href: "/leky/novinky", items: leky },
    { title: isCs ? "Legislativa" : "Legislation", href: "/legislativa", items: legislativa },
    { title: "Digital Health", href: "/digital-health", items: digitalHealth },
    { title: isCs ? "Novinky z univerzit" : "University news", href: "/novinky", items: novinky },
  ];

  return (
    <div className="border-t border-[#dfeaf5] bg-[#f6fbff]">
      {slider.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]">
            {isCs ? "Hlavní přehled" : "Featured"}
          </p>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2 snap-x">
            {slider.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="min-w-[280px] snap-start rounded-2xl border border-[#cfe1f3] bg-white overflow-hidden shadow-sm"
              >
                {item.image_url ? (
                  <div className="relative h-36 w-full bg-slate-100">
                    <Image src={item.image_url} alt="" fill className="object-cover" sizes="280px" />
                  </div>
                ) : null}
                <div className="p-4">
                  <p className="font-semibold text-[#021d33]">{item.title}</p>
                  {item.excerpt ? <p className="mt-1 text-xs text-slate-600 line-clamp-2">{item.excerpt}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {sections.map((sec) =>
        sec.items.length ? (
          <section key={sec.href} className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="flex justify-between items-end">
              <h2 className="font-display text-2xl font-semibold text-[#021d33]">{sec.title}</h2>
              <Link href={sec.href} className="text-sm text-[#005B96] font-medium">
                {isCs ? "Vše →" : "All →"}
              </Link>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {sec.items.map((item) => (
                <V4cContentCard
                  key={item.id}
                  href={item.href}
                  title={item.title}
                  summary={item.excerpt}
                />
              ))}
            </div>
          </section>
        ) : null
      )}

      {articles.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <h2 className="font-display text-2xl font-semibold text-[#021d33]">
            {isCs ? "Doporučené články" : "Recommended articles"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {articles.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      ) : null}

      {congresses.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex justify-between">
            <h2 className="font-display text-2xl font-semibold text-[#021d33]">
              {isCs ? "Kongresy" : "Congresses"}
            </h2>
            <Link href="/kongresy" className="text-sm text-[#005B96]">
              {isCs ? "Kalendář →" : "Calendar →"}
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {congresses.map((c) => (
              <V4cContentCard
                key={c.id}
                href={`/kongresy/${c.slug}`}
                title={c.title}
                meta={c.starts_at ? new Date(c.starts_at).toLocaleDateString("cs-CZ") : undefined}
                summary={c.summary}
              />
            ))}
          </div>
        </section>
      ) : null}

      {!isVip && sponsoredAds.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
          <AdPlacement ads={sponsoredAds} variant="inline" label="Sponzorováno" />
        </div>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <div className="rounded-2xl border border-[#cfe1f3] bg-white p-6">
          <p className="text-sm font-semibold text-[#021d33]">{isCs ? "Doporučené sekce" : "Recommended sections"}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {["/studie", "/leky/novinky", "/legislativa", "/digital-health", "/novinky", "/newsletter", "/kongresy"].map(
              (href) => (
                <Link key={href} href={href} className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
                  {href}
                </Link>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
