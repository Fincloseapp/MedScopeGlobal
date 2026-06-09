import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { getV22DigitalHealthList } from "@/lib/v22/digital-health/query";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Novinky — Digitální zdravotnictví",
  description: "Aktuální odborné novinky z digitálního zdravotnictví.",
};

export default async function DhNovinkyPage() {
  const items = await getV22DigitalHealthList(24);
  return (
    <ModulePageShell
      eyebrow="Digitální zdravotnictví"
      title="Novinky"
      description="Telemedicína, wearables, AI diagnostika a eHealth — kurátorský výběr z ověřených zdrojů."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((i) => (
          <Link
            key={i.id}
            href={`/digital-health/${i.slug}`}
            prefetch
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-primary/30 hover:shadow-md"
          >
            <div className="relative aspect-[16/9] bg-slate-100">
              <Image
                src={i.imageUrl}
                alt={i.title}
                fill
                className="object-cover transition group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, 50vw"
                loading="lazy"
              />
            </div>
            <div className="p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{i.topic}</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-[#021d33] group-hover:text-primary">
                {i.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{i.summaryCs}</p>
              <p className="mt-2 text-xs text-slate-400">{i.publishedDateLabel}</p>
            </div>
          </Link>
        ))}
      </div>
    </ModulePageShell>
  );
}
