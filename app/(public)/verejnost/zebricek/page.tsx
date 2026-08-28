import type { Metadata } from "next";
import { PublicLeaderboard } from "@/components/verejnost/public-leaderboard";
import {
  MagazineHubSectionHeader,
  MagazineSectionHub,
} from "@/components/portal/magazine-section-hub";
import { ZEBRICEK_MAGAZINE_HUB } from "@/lib/portal/magazine-section-hub";
import { getPublicOsvetaLeaderboard } from "@/lib/verejnost/osveta/db";
import { buildLocalizedV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return await buildLocalizedV20PageMetadata({
    title: "Žebříček uživatelů | Veřejnost | MedScopeGlobal",
    description: ZEBRICEK_MAGAZINE_HUB.heroDeck,
    path: "/verejnost/zebricek",
  });
}

export default async function VerejnostZebricekPage() {
  const entries = await getPublicOsvetaLeaderboard(20);

  return (
    <MagazineSectionHub config={ZEBRICEK_MAGAZINE_HUB}>
      <section id="zebricek-grid" className="scroll-mt-24">
        <MagazineHubSectionHeader
          eyebrow="Top 20"
          title="Žebříček uživatelů"
          description="Nejaktivnější uživatelé ve veřejné osvětě — XP za poslech lekcí a kvízy."
        />
        <PublicLeaderboard entries={entries} />

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="font-display text-lg font-semibold text-[#021d33]">Odznaky</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>🏅 První lekce — dokončete první poslechovou lekci</li>
            <li>🧠 Kvízový mistr — dokončete mini-kvíz</li>
            <li>📅 Týden prevence — pravidelné sledování osvěty</li>
            <li>⭐ Osvětový nadšenec — 10+ dokončených lekcí</li>
          </ul>
          <p className="mt-4 text-xs leading-relaxed text-slate-400">
            +10 XP za poslech · +20 XP za kvíz. Body jsou volitelná hra — ne odemykají VIP ani
            předplatné.
          </p>
        </div>
      </section>
    </MagazineSectionHub>
  );
}
