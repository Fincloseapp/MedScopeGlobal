import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ProMeFeed } from "@/components/v6/pro-me-feed";
import { getPersonalizedFeed } from "@/lib/queries/v6/personalization";

export const metadata: Metadata = {
  title: "Pro mě — pacienti",
};

export default async function ProMePacientiPage() {
  const items = await getPersonalizedFeed("pacienti");
  return (
    <ModulePageShell
      eyebrow="V6 · Personalizace"
      title="Feed pro pacienty"
      description="Srozumitelná shrnutí a doporučení s AI scoringem."
    >
      <ProMeFeed items={items} audience="pacienti" />
    </ModulePageShell>
  );
}
