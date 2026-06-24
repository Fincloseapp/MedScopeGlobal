import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Pro firmy a partnery",
  description:
    "B2B spolupráce pro pharma, nemocnice a univerzity — reklama, sponzorovaný obsah a enterprise licence na MedScopeGlobal.",
  path: "/firmy",
});

export default function FirmyPage() {
  return (
    <ModulePageShell
      eyebrow="Pro firmy"
      title="Partnerství a B2B spolupráce"
      description="MedScopeGlobal propojuje pharma, kliniky a výzkumné instituce s cílenou lékařskou a studentskou audience."
      ctaHref="/inzerce/formular"
      ctaLabel="Kontaktovat obchod"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/firmy/cenik"
          className="group rounded-2xl border border-[#cfe1f3] bg-white p-6 transition hover:border-[#005B96] hover:shadow-sm"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">Ceník</p>
          <h2 className="mt-2 font-display text-xl font-semibold text-[#021d33]">Transparentní B2B ceník</h2>
          <p className="mt-2 text-sm text-slate-600">
            Banner od 5 000 Kč/měs., sponzorovaný článek 15 000 Kč, enterprise na míru.
          </p>
          <span className="mt-4 inline-flex items-center text-sm font-medium text-[#005B96] group-hover:underline">
            Zobrazit ceník <ArrowRight className="ml-1 h-4 w-4" />
          </span>
        </Link>

        <Link
          href="/b2b"
          className="group rounded-2xl border border-[#cfe1f3] bg-white p-6 transition hover:border-[#005B96] hover:shadow-sm"
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#005B96]">B2B</p>
          <h2 className="mt-2 font-display text-xl font-semibold text-[#021d33]">Pharma a odborní partneři</h2>
          <p className="mt-2 text-sm text-slate-600">
            Kampaně, lead generation a měřitelná viditelnost u lékařů a studentů.
          </p>
          <span className="mt-4 inline-flex items-center text-sm font-medium text-[#005B96] group-hover:underline">
            Více o B2B <ArrowRight className="ml-1 h-4 w-4" />
          </span>
        </Link>
      </div>

      <div className="mt-8">
        <Button asChild className="rounded-full bg-[#005B96]">
          <Link href="/organizace/partnerstvi">Institucionální partnerství</Link>
        </Button>
      </div>
    </ModulePageShell>
  );
}
