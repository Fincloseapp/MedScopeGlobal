import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getUniversityNewsList } from "@/lib/queries/v4c/university-news";

export const metadata: Metadata = { title: "Novinky", description: "Novinky z univerzit a výzkumu (CZ, EU, svět)." };

const TAGS = [
  { href: "/novinky/revmatologie", tag: "revmatologie", label: "Revmatologie" },
  { href: "/novinky/univerzity", tag: "univerzity", label: "Univerzity" },
  { href: "/novinky/vyzkum", tag: "vyzkum", label: "Výzkum" },
  { href: "/novinky/kalendar", tag: "kalendar", label: "Kalendář" },
];

function hrefForTag(tag: string) {
  return TAGS.find((x) => x.tag === tag)?.href ?? "/novinky";
}

export default async function NovinkyPage() {
  const news = await getUniversityNewsList();

  return (
    <ModulePageShell
      eyebrow="Novinky"
      title="Novinky z univerzit"
      description="České LF, evropské a světové univerzity, vědecké časopisy, SÚKL kontext u lékových témat."
      ctaHref="/novinky/ai"
      ctaLabel="AI novinky"
    >
      <div className="flex flex-wrap gap-2 mb-6">
        {TAGS.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-full border border-[#8dc4ea] px-3 py-1 text-sm text-[#005B96]">
            {t.label}
          </Link>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {news.map((n) => (
          <V4cContentCard
            key={n.id}
            href={hrefForTag(n.tag)}
            title={n.title}
            meta={n.university ?? n.region ?? undefined}
            summary={n.summary}
            badge={n.tag}
          />
        ))}
      </div>
    </ModulePageShell>
  );
}
