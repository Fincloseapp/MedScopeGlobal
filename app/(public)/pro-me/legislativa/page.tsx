import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ProMeFeed } from "@/components/v6/pro-me-feed";
import { getPersonalizedFeed } from "@/lib/queries/v6/personalization";

export const metadata: Metadata = {
  title: "Pro mě — legislativa",
};

export default async function ProMeLegislativaPage() {
  const items = await getPersonalizedFeed("legislativa");
  return (
    <ModulePageShell
      eyebrow="Personalizace"
      title="Feed — legislativa"
      description="MZČR, SÚKL, EMA, FDA — legislativní monitoring a alerty."
    >
      <ProMeFeed items={items} audience="legislativa" />
    </ModulePageShell>
  );
}
