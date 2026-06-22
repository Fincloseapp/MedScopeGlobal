import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell, FeatureCard } from "@/components/b2b/module-page-shell";

export const metadata: Metadata = {
  title: "Inzerce a reklama",
  description: "Reklamní možnosti, typy reklam a sponzorovaný obsah na MedScopeGlobal.",
};

const AD_OFFERS = [
  { title: "Bannery", description: "Homepage, diagnózy, léky, články a kongresy.", href: "/inzerce/cenik" },
  { title: "Newsletter", description: "Hlavička, střední blok a patička odborného newsletteru.", href: "/inzerce/cenik" },
  { title: "Sponzorované články", description: "Označený partnerský obsah s citacemi.", href: "/inzerce/formular" },
  { title: "Sponzorované sekce", description: "Digital health, legislativa, studie.", href: "/inzerce/formular" },
  { title: "Sponzorované studie", description: "Viditelnost ve výzkumných přehledech.", href: "/studijni-spoluprace" },
  { title: "Sponzorované diagnózy", description: "Sidebar a inline v klinických přehledech.", href: "/inzerce/formular" },
];

export default function InzercePage() {
  return (
    <ModulePageShell
      eyebrow="Inzerce"
      title="Reklamní systém MedScopeGlobal"
      description="Eticky označená reklama pro farmu, medtech a vzdělávací partnery — s automatickým naceněním a workflow schválení."
      ctaHref="/inzerce/formular"
      ctaLabel="Objednat reklamu"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {AD_OFFERS.map((o) => (
          <FeatureCard key={o.title} title={o.title} description={o.description} href={o.href} />
        ))}
      </div>
      <p className="mt-8 text-sm text-slate-600">
        <Link href="/inzerce/cenik" className="font-semibold text-[#005B96] hover:underline">
          Kompletní ceník →
        </Link>
        {" · "}
        <Link href="/ai/reklamy" className="font-semibold text-[#005B96] hover:underline">
          AI Advertising Assistant (admin) →
        </Link>
      </p>
    </ModulePageShell>
  );
}
