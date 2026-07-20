import type { Metadata } from "next";
import Link from "next/link";
import { PublicHealthVideoCard } from "@/components/verejnost/public-health-video-card";
import { PublicLeaderboard, PublicLeaderboardCta } from "@/components/verejnost/public-leaderboard";
import {
  getPublicOsvetaLeaderboard,
  getTodayPublicHealthVideo,
  listPublicHealthTopics,
  listPublicHealthVideos,
} from "@/lib/verejnost/osveta/db";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Denní zdravotní osvěta | Veřejnost | MedScopeGlobal",
  description:
    "Krátké poslechové lekce o prevenci, nemocech, dlouhověkosti a životním stylu — srozumitelně, v češtině, s textem k čtení.",
};

const CATEGORY_LABELS: Record<string, string> = {
  prevence: "Prevence",
  nemoc: "Nemoci",
  dlouhovekost: "Dlouhověkost",
  "zivotni-styl": "Životní styl",
};

export default async function OsvetaHubPage() {
  const [today, videos, topics, leaderboard] = await Promise.all([
    getTodayPublicHealthVideo(),
    listPublicHealthVideos({ limit: 20 }),
    listPublicHealthTopics(),
    getPublicOsvetaLeaderboard(5),
  ]);

  const archive = videos.filter((v) => v.id !== today?.id);

  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#021d33] via-[#003d6b] to-[#005B96] px-4 py-14 sm:px-6 sm:py-16">
        <div className="relative mx-auto max-w-4xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
            Veřejnost · Osvěta · medscopeglobal.com
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Denní zdravotní osvěta
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/85">
            Krátké poslechové lekce o prevenci, nemocech, dlouhověkosti a životním stylu —
            srozumitelně v češtině, s textem k souběžnému čtení.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/verejnost/zebricek"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#005B96] shadow-sm transition hover:bg-white/90"
            >
              Žebříček uživatelů
            </Link>
            <Link
              href="/verejnost"
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              ← Veřejné zdraví
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {today ? (
          <section className="mb-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">
              Dnešní lekce
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-[#021d33]">Tip dne</h2>
            <div className="mt-4">
              <PublicHealthVideoCard video={today} featured />
            </div>
          </section>
        ) : null}

        <section className="mb-12">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Kategorie</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topics.map((t) => (
              <span
                key={t.id}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                {CATEGORY_LABELS[t.category] ?? t.category} · {t.title}
              </span>
            ))}
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="font-display text-2xl font-bold text-[#021d33]">Archiv lekcí</h2>
            </div>
            {archive.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {archive.map((v) => (
                  <PublicHealthVideoCard key={v.id} video={v} />
                ))}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                Archiv se plní každý den novou lekcí.
              </p>
            )}
          </section>

          <aside>
            <div className="mb-4 flex items-end justify-between">
              <h2 className="font-display text-xl font-bold text-[#021d33]">Top 5 XP</h2>
              <PublicLeaderboardCta />
            </div>
            <PublicLeaderboard entries={leaderboard} />
            <p className="mt-4 text-xs text-slate-400">
              +10 XP za video · +20 XP za kvíz · odznaky: První video, Týden prevence
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}
