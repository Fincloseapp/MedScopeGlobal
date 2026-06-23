import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V19ArticleBriefFeedLazy } from "@/components/v19/article-brief-feed";
import { resolveV19LocaleFromRequest } from "@/lib/v19/localize";

export const metadata: Metadata = {
  title: "Odborné medicínské briefy v19",
  description:
    "Krátké, mobilně čitelné odborné shrnutí — prioritně revmatologie, automatická lokalizace, bez kopírování zdrojů.",
};

export default async function OdborneBriefyPage() {
  const locale = await resolveV19LocaleFromRequest();
  const isCs = locale === "cs";

  return (
    <ModulePageShell
      eyebrow="Content Engine v19"
      title={isCs ? "Odborné medicínské briefy" : "Medical expert briefs"}
      description={
        isCs
          ? "Aktuální odborná shrnutí (max 30 dní), prioritně revmatologie. Jazyk se přizpůsobí vašemu zařízení."
          : "Current expert summaries (max 30 days), rheumatology priority. Language follows your device."
      }
      ctaHref="/odborne"
      ctaLabel={isCs ? "Všechny odborné texty" : "All expert content"}
    >
      <V19ArticleBriefFeedLazy
        title={isCs ? "Nejnovější briefy" : "Latest briefs"}
        limit={6}
        locale="auto"
      />
    </ModulePageShell>
  );
}
