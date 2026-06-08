import Link from "next/link";
import Image from "next/image";
import { getLatestArticles } from "@/lib/queries/articles";
import type { AccessLevelId } from "@/lib/config/access-levels";
import type { LocaleCode } from "@/lib/i18n/config";
import { getV21UpcomingCongresses } from "@/lib/v21/congresses";
import { getActiveAdsByPlacement } from "@/lib/queries/ads";
import { AdPlacement } from "@/components/ads/ad-placement";
import { ArticleCard } from "@/components/article/article-card";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getV22HomepageCurated } from "@/lib/v22/homepage";

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
  const [slider, leky, legislativa, digitalHealth, novinky, articles, congresses, sponsoredAds] =
    await Promise.all([
      getV22HomepageCurated("slider"),
      getV22HomepageCurated("leky"),
      getV22HomepageCurated("legislativa"),
      getV22HomepageCurated("digital_health"),
      getV22HomepageCurated("novinky"),
      getLatestArticles(3, 0, isVip, accessLevel, locale),
      getV21UpcomingCongresses(3),
      isVip ? Promise.resolve([]) : getActiveAdsByPlacement("homepage_sponsored", 2),
    ]);

  const sections = [
    { title: isCs ? "Léky" : "Drugs", href: "/leky/novinky", items: leky },
    { title: isCs ? "Legislativa" : "Legislation", href: "/legislativa", items: legislativa },
    { title: isCs ? "Digitální zdravotnictví" : "Digital Health", href: "/digital-health", items: digitalHealth },
    { title: isCs ? "Novinky z univerzit" : "University news", href: "/novinky", items: novinky },
  ];

  return (
    <div className="border-t border-[#dfeaf5] bg-[#f6fbff]">
      {slider.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-labelledby="hlavni-prehled">
          <p
            id="hlavni-prehled"
            className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#005B96]"
          >
            Hlavní přehled
          </p>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2 snap-x scroll-smooth">
            {slider.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                prefetch
                className="min-w-[280px] snap-start rounded-2xl border border-[#cfe1f3] bg-white overflow-hidden shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {item.image_url ? (
                  <div className="relative h-36 w-full bg-slate-100">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="280px"
                      loading="lazy"
                    />
                  </div>
                ) : null}
                <div className="p-4">
                  <p className="font-semibold text-[#021d33]">{item.title}</p>
                  {item.excerpt ? (
                    <p className="mt-1 text-xs text-slate-600 line-clamp-2">{item.excerpt}</p>
                  ) : null}
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
              <Link href={sec.href} prefetch className="text-sm text-[#005B96] font-medium">
                {isCs ? "Vše →" : "All →"}
              </Link>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {sec.items.map((item) => (
                <V4cContentCard key={item.id} href={item.href} title={item.title} summary={item.excerpt} />
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
            <Link href="/kongresy" prefetch className="text-sm text-[#005B96]">
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
    </div>
  );
}
