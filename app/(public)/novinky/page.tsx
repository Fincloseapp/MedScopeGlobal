import type { Metadata } from "next";
import Link from "next/link";
import { ModulePageShell } from "@/components/b2b/module-page-shell";
import { V4cContentCard } from "@/components/v4c/content-card";
import { getUniversityNewsList } from "@/lib/queries/v4c/university-news";
import { v21ImageForModule } from "@/lib/v21/images";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Novinky",
  description: "Novinky z univerzit a výzkumu — ČR, EU a svět.",
};

const TAGS = [
  { href: "/novinky/revmatologie", tag: "revmatologie", label: "Revmatologie" },
  { href: "/novinky/univerzity", tag: "univerzity", label: "Univerzity" },
  { href: "/novinky/vyzkum", tag: "vyzkum", label: "Výzkum" },
  { href: "/novinky/kalendar", tag: "kalendar", label: "Kalendář" },
];

function hrefForItem(tag: string, slug: string) {
  if (tag === "univerzity") return `/novinky/univerzity/${slug}`;
  const section = TAGS.find((x) => x.tag === tag)?.href;
  return section ?? `/novinky/univerzity/${slug}`;
}

export default async function NovinkyPage() {
  const news = await getUniversityNewsList();

  return (
    <ModulePageShell
      eyebrow="Novinky"
      title="Novinky z univerzit a výzkumu"
      description="České LF, evropské univerzity, vědecké časopisy a klinický kontext pro praxi."
      ctaHref="/novinky/ai"
      ctaLabel="AI novinky"
    >
      <div className="mb-6 flex flex-wrap gap-2">
        {TAGS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            prefetch
            className="rounded-full border border-[#8dc4ea] px-3 py-1 text-sm text-[#005B96]"
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {news.map((n) => (
          <V4cContentCard
            key={n.id}
            href={hrefForItem(n.tag, n.slug)}
            title={n.title}
            meta={n.university ?? n.region ?? undefined}
            summary={n.summary}
            badge={n.tag}
            imageUrl={n.image_url ?? v21ImageForModule("university", n.slug)}
            imageAlt={n.university ?? n.title}
          />
        ))}
      </div>
    </ModulePageShell>
  );
}
