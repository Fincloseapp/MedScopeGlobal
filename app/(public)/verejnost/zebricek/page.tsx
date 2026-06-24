import type { Metadata } from "next";
import Link from "next/link";
import { PublicLeaderboard } from "@/components/verejnost/public-leaderboard";
import { getPublicOsvetaLeaderboard } from "@/lib/verejnost/osveta/db";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Žebříček uživatelů | Veřejnost | MedScopeGlobal",
  description: "Top 20 uživatelů ve veřejné zdravotní osvětě — XP za sledování videí a kvízy.",
};

export default async function VerejnostZebricekPage() {
  const entries = await getPublicOsvetaLeaderboard(20);

  return (
    <div className="min-h-screen bg-[#f4f8fc]">
      <section className="bg-gradient-to-br from-[#021d33] to-[#005B96] px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/60">
            Veřejnost · Gamifikace
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold text-white">Žebříček uživatelů</h1>
          <p className="mt-3 text-white/80">
            Sledujte denní zdravotní videa, plňte mini-kvízy a sbírejte XP. Top 20 veřejných uživatelů.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <PublicLeaderboard entries={entries} />

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-lg font-semibold text-[#021d33]">Odznaky</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>🏅 První video — shlédněte první osvětové video</li>
            <li>🧠 Kvízový mistr — dokončete mini-kvíz</li>
            <li>📅 Týden prevence — pravidelné sledování</li>
            <li>⭐ Osvětový nadšenec — 10+ videí</li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/verejnost/osveta"
            className="rounded-full bg-[#005B96] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#004a7a]"
          >
            Dnešní video
          </Link>
          <Link
            href="/verejnost"
            className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#021d33] transition hover:border-[#005B96]/30"
          >
            Veřejné zdraví
          </Link>
        </div>
      </div>
    </div>
  );
}
