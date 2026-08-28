import type { Metadata } from "next";
import Link from "next/link";
import { PublicHealthVideoCard } from "@/components/verejnost/public-health-video-card";
import { PublicLeaderboard, PublicLeaderboardCta } from "@/components/verejnost/public-leaderboard";
import { VerejnostArticleCard } from "@/components/verejnost/verejnost-article-card";
import {
  MagazineHubSectionHeader,
  MagazineSectionHub,
} from "@/components/portal/magazine-section-hub";
import { OSVETA_MAGAZINE_HUB } from "@/lib/portal/magazine-section-hub";
import { listPublicArticles } from "@/lib/queries/verejnost";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";
import {
  getPublicOsvetaLeaderboard,
  getTodayPublicHealthVideo,
  listPublicHealthTopics,
  listPublicHealthVideos,
} from "@/lib/verejnost/osveta/db";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
    title: "Zdravotní osvěta | Veřejnost | MedScopeGlobal",
    description: OSVETA_MAGAZINE_HUB.heroDeck,
    path: "/verejnost/osveta",
  });
}

const CATEGORY_LABELS: Record<string, string> = {
  prevence: "Prevence",
  nemoc: "Nemoci",
  dlouhovekost: "Dlouhověkost",
  "zivotni-styl": "Životní styl",
};

export default async function OsvetaHubPage() {
  const [today, videos, topics, leaderboard, articles] = await Promise.all([
    getTodayPublicHealthVideo(),
    listPublicHealthVideos({ limit: 20 }),
    listPublicHealthTopics(),
    getPublicOsvetaLeaderboard(5),
    listPublicArticles({ limit: 3, ensureContent: true, mode: "card" }),
  ]);

  const archive = videos.filter((v) => v.id !== today?.id);
  const primaryCtaHref = today ? `/verejnost/osveta/${today.slug}` : "#dnesni-lekce";
  const nav = OSVETA_MAGAZINE_HUB.articlesNav;

  return (
    <MagazineSectionHub config={OSVETA_MAGAZINE_HUB} primaryCtaHref={primaryCtaHref}>
      {today ? (
        <section id="dnesni-lekce" className="mb-12 scroll-mt-24">
          <MagazineHubSectionHeader
            eyebrow="Poslech dne"
            title="Dnešní lekce"
            description="Krátká poslechová lekce s textem k čtení a volitelným kvízem — není to VIP obsah ani placený tip."
          />
          <PublicHealthVideoCard video={today} featured />
        </section>
      ) : (
        <section id="dnesni-lekce" className="mb-12 scroll-mt-24">
          <MagazineHubSectionHeader eyebrow="Poslech" title="Dnešní lekce" />
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            Nová lekce se publikuje každý den — vraťte se brzy nebo prohlédněte archiv níže.
          </p>
        </section>
      )}

      {articles.length ? (
        <section className="mb-12">
          <MagazineHubSectionHeader
            eyebrow={nav.eyebrow}
            title={nav.title}
            description={nav.description}
            href={nav.href}
            ctaLabel={nav.ctaLabel}
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((item) => (
              <VerejnostArticleCard key={item.id} article={item} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mb-10">
        <MagazineHubSectionHeader
          eyebrow="Rubriky poslechu"
          title="Témata v archivu lekcí"
        />
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <span
              key={t.id}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              {CATEGORY_LABELS[t.category] ?? t.category} · {t.title}
            </span>
          ))}
        </div>
      </section>

      <div className="grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <MagazineHubSectionHeader eyebrow="Archiv" title="Poslechové lekce" />
          {archive.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {archive.map((v) => (
                <PublicHealthVideoCard key={v.id} video={v} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Archiv se plní každý den novou lekcí. Mezitím si přečtěte{" "}
              <Link href="/articles" className="font-medium text-[#005B96] hover:underline">
                články magazínu
              </Link>
              .
            </p>
          )}
        </section>

        <aside>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="font-display text-xl font-bold text-[#021d33]">Top 5 XP</h2>
            <PublicLeaderboardCta />
          </div>
          <PublicLeaderboard entries={leaderboard} />
          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            +10 XP za poslech · +20 XP za kvíz · odznaky: První lekce, Týden prevence. Body jsou
            volitelná hra — ne odemykají VIP ani předplatné.
          </p>
        </aside>
      </div>
    </MagazineSectionHub>
  );
}
