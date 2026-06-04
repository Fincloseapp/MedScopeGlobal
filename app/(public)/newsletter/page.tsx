import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Odborný newsletter 2× měsíčně — PDF text, reklamy a AI layout.",
};

export default function NewsletterPage() {
  return (
    <ModulePageShell
      eyebrow="Newsletter"
      title="MedScopeGlobal Newsletter"
      description="Automatické generování 2× měsíčně: články, studie, legislativa, DRG, digital health, novinky, léky a partnerské reklamy."
      ctaHref="/newsletter/posledni"
      ctaLabel="Poslední vydání"
    >
      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/newsletter/posledni" className="rounded-full bg-[#005B96] px-3 py-1 text-white">
          Poslední
        </Link>
        <Link href="/newsletter/ai" className="rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96]">
          AI newsletter
        </Link>
      </div>
    </ModulePageShell>
  );
}
