import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ProMeFeed } from "@/components/v6/pro-me-feed";
import { getPersonalizedFeed } from "@/lib/queries/v6/personalization";

export const metadata: Metadata = {
  title: "Pro mě — lékaři",
};

export default async function ProMeLekariPage() {
  const items = await getPersonalizedFeed("lekari");
  return (
    <ModulePageShell
      eyebrow="Personalizace"
      title="Feed pro lékaře"
      description="AI kategorizace, evidence scoring a doporučení pro klinickou praxi."
    >
      <ProMeFeed items={items} audience="lekari" />
    </ModulePageShell>
  );
}
