import Link from "next/link";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";

export type LekySubpage = "novinky" | "schvalene" | "pipeline";

const TABS: { id: LekySubpage | "hub"; href: string; label: string }[] = [
  { id: "hub", href: "/leky", label: "← Hub léky" },
  { id: "novinky", href: "/leky/novinky", label: "Novinky" },
  { id: "schvalene", href: "/leky/schvalene", label: "Schválené" },
  { id: "pipeline", href: "/leky/pipeline", label: "Pipeline" },
];

const CURRENT_LABEL: Record<LekySubpage, string> = {
  novinky: "Novinky",
  schvalene: "Schválené",
  pipeline: "Pipeline",
};

export function LekySubpageNav({ current }: { current: LekySubpage }) {
  const jsonLd = breadcrumbJsonLd([
    { name: "Léky", href: "/leky" },
    { name: CURRENT_LABEL[current], href: `/leky/${current}` },
  ]);

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex list-none flex-wrap gap-2 p-0 text-sm">
          {TABS.map((tab) => {
            const isCurrent = tab.id === current;
            const isHub = tab.id === "hub";

            return (
              <li key={tab.id}>
                {isCurrent ? (
                  <span
                    aria-current="page"
                    className="rounded-full bg-[#005B96] px-3 py-1 text-white"
                  >
                    {tab.label}
                  </span>
                ) : (
                  <Link
                    href={tab.href}
                    prefetch
                    className={
                      isHub
                        ? "rounded-full border border-primary/30 px-3 py-1 text-primary"
                        : "rounded-full border border-[#8dc4ea] px-3 py-1 text-[#005B96] hover:bg-[#005B96]/5"
                    }
                  >
                    {tab.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
