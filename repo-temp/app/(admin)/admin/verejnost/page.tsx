import type { Metadata } from "next";
import Link from "next/link";
import { MedScopeLogo } from "@/components/brand/medscope-logo";
import { VerejnostArticleCard } from "@/components/verejnost/verejnost-article-card";
import { BACKEND_PUBLIC_TOPICS } from "@/lib/config/verejnost-topics";
import {
  countPublicArticlesByTopic,
  listPublicAdCampaigns,
  listPublicArticles,
} from "@/lib/queries/verejnost";
import { computePublicAdStats } from "@/lib/verejnost/helpers";

export const metadata: Metadata = {
  title: "Veřejnost — Observabilita | Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminVerejnostPage() {
  const [latest, counts, campaigns] = await Promise.all([
    listPublicArticles({ limit: 8 }),
    countPublicArticlesByTopic(),
    listPublicAdCampaigns({ activeOnly: false }),
  ]);

  const adStats = computePublicAdStats(campaigns);
  const articleCount = Object.values(counts).reduce((a, b) => a + b, 0);
  const interviewCount = counts["rozhovory"] ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <MedScopeLogo href="/admin/verejnost" width={160} height={40} className="mb-3" />
        <h1 className="font-display text-2xl font-bold text-[#021d33]">Veřejné zdraví — observabilita</h1>
        <p className="mt-1 text-sm text-slate-600">
          Přehled článků a statistik reklam pro sekci /verejnost.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <Link href="/admin/ads-public" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Správa reklam
          </Link>
          <Link href="/verejnost" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Veřejná sekce
          </Link>
          <Link href="/admin/system" className="rounded-lg border px-3 py-1.5 hover:bg-muted">
            Stav systému
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Veřejné články celkem", value: articleCount },
          { label: "Rozhovory", value: interviewCount },
          { label: "Aktivní kampaně", value: adStats.active },
          { label: "CTR kampaní", value: `${adStats.ctr.toFixed(2)} %` },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-[#021d33]">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Imprese</p>
          <p className="font-semibold tabular-nums">{adStats.impressions.toLocaleString("cs-CZ")}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Kliky</p>
          <p className="font-semibold tabular-nums">{adStats.clicks.toLocaleString("cs-CZ")}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Kampaní celkem</p>
          <p className="font-semibold tabular-nums">{adStats.total}</p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-[#021d33]">Články podle tématu</h2>
        <div className="grid gap-2 sm:grid-cols-4">
          {BACKEND_PUBLIC_TOPICS.map((t) => (
            <div key={t.slug} className="rounded-lg border bg-white p-3">
              <p className="text-xs text-muted-foreground">{t.label}</p>
              <p className="font-semibold tabular-nums">{counts[t.slug] ?? 0}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-[#021d33]">Nejnovější veřejné články</h2>
        {latest.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {latest.map((a) => (
              <VerejnostArticleCard key={a.id} article={a} variant="compact" />
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Zatím žádné publikované články s <code>audience=public</code> — AI writery je doplní.
          </p>
        )}
      </section>
    </div>
  );
}
