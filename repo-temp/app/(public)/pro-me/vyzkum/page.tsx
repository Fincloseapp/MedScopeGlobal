import type { Metadata } from "next";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { ProMeFeed } from "@/components/v6/pro-me-feed";
import { getPersonalizedFeed } from "@/lib/queries/v6/personalization";

export const metadata: Metadata = {
  title: "Pro mě — výzkum",
};

export default async function ProMeVyzkumPage() {
  const items = await getPersonalizedFeed("vyzkum");
  return (
    <ModulePageShell
      eyebrow="V6 · Personalizace"
      title="Feed pro výzkum"
      description="RCT, meta-analýzy a metodologie s AI doporučeními."
    >
      <ProMeFeed items={items} audience="vyzkum" />
    </ModulePageShell>
  );
}
