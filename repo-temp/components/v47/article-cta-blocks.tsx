import Link from "next/link";
import { BookOpen, Download, FlaskConical, GraduationCap } from "lucide-react";

type Props = {
  articleSlug: string;
  articleTitle: string;
};

const blocks = [
  {
    label: "Vyzkoušej AI simulaci",
    href: "/academy/ai-simulations",
    icon: FlaskConical,
  },
  {
    label: "Otestuj se z tohoto tématu",
    href: (slug: string) => `/academy/tests?topic=${encodeURIComponent(slug)}`,
    icon: BookOpen,
  },
  {
    label: "Stáhni PDF shrnutí",
    href: (slug: string) => `/api/v47/pdf/generate?topic=${encodeURIComponent(slug)}`,
    icon: Download,
    external: true,
  },
  {
    label: "Přidej se do Academy",
    href: "/academy",
    icon: GraduationCap,
  },
] as const;

export function ArticleCtaBlocks({ articleSlug, articleTitle }: Props) {
  return (
    <section
      className="not-prose my-10 rounded-2xl border border-[#cfe1f3] bg-gradient-to-br from-[#f0f7ff] to-white p-6 shadow-sm"
      aria-label="Akce z článku"
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-[#005B96]">
        MedScope Academy
      </p>
      <h2 className="mt-1 font-display text-xl font-semibold text-medical-navy">
        Pokračuj ve studiu: {articleTitle}
      </h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {blocks.map((block) => {
          const Icon = block.icon;
          const href =
            typeof block.href === "function" ? block.href(articleSlug) : block.href;
          const className =
            "flex items-center gap-3 rounded-xl border border-[#b8d4ef] bg-white px-4 py-3 text-sm font-medium text-[#005B96] transition hover:border-[#005B96] hover:bg-[#e8f4fc]";

          if ("external" in block && block.external) {
            return (
              <a key={block.label} href={href} className={className} target="_blank" rel="noopener noreferrer">
                <Icon className="h-4 w-4 shrink-0" />
                {block.label}
              </a>
            );
          }

          return (
            <Link key={block.label} href={href} className={className}>
              <Icon className="h-4 w-4 shrink-0" />
              {block.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
