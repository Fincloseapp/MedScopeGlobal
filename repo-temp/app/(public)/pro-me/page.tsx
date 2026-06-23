import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { PERSONALIZATION_LABELS } from "@/lib/v6/personalization-config";
import type { PersonalizationAudience } from "@/lib/v6/personalization-config";

export const metadata: Metadata = {
  title: "Pro mě",
  description: "V6 personalizované feedy — lékař, pacient, výzkum, legislativa.",
};

const LINKS: { audience: PersonalizationAudience; href: string }[] = [
  { audience: "lekari", href: "/pro-me/lekari" },
  { audience: "pacienti", href: "/pro-me/pacienti" },
  { audience: "vyzkum", href: "/pro-me/vyzkum" },
  { audience: "legislativa", href: "/pro-me/legislativa" },
];

export default function ProMeHubPage() {
  return (
    <ModulePageShell
      eyebrow="V6"
      title="Pro mě"
      description="Personalizované články podle role — AI kategorizace, scoring a doporučení."
      ctaHref="/dashboard"
      ctaLabel="AI Dashboard"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map(({ audience, href }) => (
          <Link
            key={audience}
            href={href}
            className="rounded-xl border border-[#d9e8f4] bg-white p-6 shadow-sm hover:border-[#005B96] transition"
          >
            <h2 className="text-lg font-semibold text-[#005B96]">
              {PERSONALIZATION_LABELS[audience]}
            </h2>
            <p className="mt-2 text-sm text-slate-600">Otevřít personalizovaný feed →</p>
          </Link>
        ))}
      </div>
    </ModulePageShell>
  );
}
