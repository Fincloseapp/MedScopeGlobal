import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getDigitalHealthList } from "@/lib/queries/v4c/digital-health";
import { V21_CURATED_DIGITAL_HEALTH } from "@/lib/v21/curated/digital-health";
import { ensureCzechText } from "@/lib/v21/enrich";

export const metadata: Metadata = {
  title: "Digitální zdravotnictví",
  description: "eHealth, telemedicína, AI ve zdravotnictví a regulace — český odborný přehled.",
};

export default async function DigitalHealthPage() {
  const dbItems = await getDigitalHealthList(8);
  const curatedSlugs = new Set(V21_CURATED_DIGITAL_HEALTH.map((c) => c.slug));

  return (
    <ModulePageShell
      eyebrow="Digitální zdravotnictví"
      title="Digitální zdravotnictví"
      description="Telemedicína, wearables, AI diagnostika a legislativa eHealth dle WHO, OECD, EU a české strategie MZČR."
      ctaHref="/digital-health/ai-asistent"
      ctaLabel="AI asistent"
    >
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <Link href="/digital-health/novinky" className="rounded-full bg-primary px-3 py-1 text-white">
          Novinky
        </Link>
        <Link href="/digital-health/legislativa" className="rounded-full border border-primary/30 px-3 py-1 text-primary">
          Legislativa
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {V21_CURATED_DIGITAL_HEALTH.map((item) => (
          <Link
            key={item.id}
            href={`/digital-health/${item.slug}`}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5"
          >
            <div className="relative aspect-[16/10] bg-slate-100">
              <Image src={item.imageUrl} alt="" fill className="object-cover" sizes="50vw" />
            </div>
            <div className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{item.topic}</p>
              <h3 className="mt-1 font-semibold text-[#021d33] group-hover:text-primary">{item.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.summaryCs}</p>
            </div>
          </Link>
        ))}
        {dbItems
          .filter((item) => !curatedSlugs.has(item.slug))
          .map((item) => (
            <Link
              key={item.id}
              href={`/digital-health/${item.slug}`}
              className="group overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                {item.topic ?? "eHealth"}
              </p>
              <h3 className="mt-1 font-semibold text-[#021d33] group-hover:text-primary">
                {ensureCzechText(item.title, "Digitální zdravotnictví")}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.summary}</p>
            </Link>
          ))}
      </div>
    </ModulePageShell>
  );
}
