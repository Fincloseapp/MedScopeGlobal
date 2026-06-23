import type { Metadata } from "next";
import { V19ArticleBriefFeedLazy } from "@/components/v19/article-brief-feed";
import { buildV20PageMetadata } from "@/lib/v20/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  return buildV20PageMetadata({
    title: "Odborné medicínské briefy",
    description:
      "Krátká odborná shrnutí v češtině — prioritně revmatologie, NZIP deep linking, max 45 dní.",
    path: "/odborne/briefy",
  });
}

export default async function OdborneBriefyPage() {
  return (
    <div className="v20-briefy">
      <section className="border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/80">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
            Odborné briefy
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-[#021d33] sm:text-4xl">
            Odborné medicínské briefy
          </h1>
          <p className="mt-3 text-slate-600">
            Aktuální odborná shrnutí (max 45 dní), prioritně revmatologie. Obsah je výhradně v
            češtině, s NZIP metadata a profesionálním formátem.
          </p>
        </div>
      </section>
      <V19ArticleBriefFeedLazy title="Nejnovější briefy" limit={8} locale="cs" />
    </div>
  );
}
